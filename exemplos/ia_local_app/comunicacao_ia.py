"""
Módulo de Comunicação com Outras IAs para IA NOVA
Este módulo implementa o sistema de comunicação com outras IAs para a IA NOVA,
permitindo que ela interaja com diferentes modelos de IA e serviços externos.
"""

import requests
import json
import time
import os
import logging
from datetime import datetime

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("nova_ai_comm.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("NOVA_AI_Communication")

class AIComm:
    """Sistema de comunicação com outras IAs"""
    
    def __init__(self, database):
        """
        Inicializa o sistema de comunicação com outras IAs
        
        Args:
            database: Instância do banco de dados
        """
        self.database = database
        self.api_endpoints = {
            "openai": "https://api.openai.com/v1/chat/completions",
            "huggingface": "https://api-inference.huggingface.co/models/",
            "anthropic": "https://api.anthropic.com/v1/messages",
            "gemini": "https://generativelanguage.googleapis.com/v1beta/models/",
            "ollama_local": "http://localhost:11434/api/chat",
            "custom_ia": "https://api.example.com/custom_ia"
        }
        
        # Carrega as chaves de API do banco de dados
        self.api_keys = {}
        self._load_api_keys()
    
    def _load_api_keys(self):
        """Carrega as chaves de API do banco de dados"""
        for service in self.api_endpoints.keys():
            key = self.database.get_setting(f"api_key_{service}")
            if key:
                self.api_keys[service] = key
            else:
                self.api_keys[service] = ""
        
        logger.debug("Chaves de API carregadas")
    
    def set_api_key(self, service, key):
        """
        Define uma chave de API
        
        Args:
            service: Nome do serviço
            key: Chave de API
        """
        if service in self.api_endpoints:
            self.api_keys[service] = key
            self.database.set_setting(f"api_key_{service}", key)
            logger.info(f"Chave de API definida para {service}")
        else:
            logger.warning(f"Serviço desconhecido: {service}")
    
    def query_external_ia(self, service, prompt, model=None, max_retries=3, retry_delay=2):
        """
        Consulta uma IA externa
        
        Args:
            service: Nome do serviço
            prompt: Prompt para a IA
            model: Nome do modelo (opcional)
            max_retries: Número máximo de tentativas
            retry_delay: Atraso entre tentativas em segundos
            
        Returns:
            Resposta da IA ou None se houver erro
        """
        if service not in self.api_endpoints:
            logger.error(f"Serviço não suportado: {service}")
            return None
        
        if not self.api_keys.get(service) and service != "ollama_local":
            logger.error(f"Chave de API não configurada para {service}")
            return None
        
        # Configuração específica para cada serviço
        for attempt in range(max_retries):
            try:
                if service == "openai":
                    return self._query_openai(prompt, model)
                elif service == "huggingface":
                    return self._query_huggingface(prompt, model)
                elif service == "anthropic":
                    return self._query_anthropic(prompt, model)
                elif service == "gemini":
                    return self._query_gemini(prompt, model)
                elif service == "ollama_local":
                    return self._query_ollama_local(prompt, model)
                elif service == "custom_ia":
                    return self._query_custom_ia(prompt)
                else:
                    logger.error(f"Serviço não implementado: {service}")
                    return None
            except Exception as e:
                logger.error(f"Erro ao consultar {service} (tentativa {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    return None
    
    def _query_openai(self, prompt, model=None):
        """
        Consulta a API da OpenAI
        
        Args:
            prompt: Prompt para a IA
            model: Nome do modelo
            
        Returns:
            Resposta da IA
        """
        headers = {
            "Authorization": f"Bearer {self.api_keys['openai']}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model or "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
        
        response = requests.post(self.api_endpoints["openai"], headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            logger.error(f"Erro na API OpenAI: {response.status_code} - {response.text}")
            raise Exception(f"Erro na API OpenAI: {response.status_code}")
    
    def _query_huggingface(self, prompt, model=None):
        """
        Consulta a API da Hugging Face
        
        Args:
            prompt: Prompt para a IA
            model: Nome do modelo
            
        Returns:
            Resposta da IA
        """
        if not model:
            model = "mistralai/Mistral-7B-Instruct-v0.2"
        
        headers = {
            "Authorization": f"Bearer {self.api_keys['huggingface']}",
            "Content-Type": "application/json"
        }
        
        endpoint = f"{self.api_endpoints['huggingface']}{model}"
        payload = {"inputs": prompt}
        
        response = requests.post(endpoint, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0]["generated_text"]
            else:
                return str(result)
        else:
            logger.error(f"Erro na API Hugging Face: {response.status_code} - {response.text}")
            raise Exception(f"Erro na API Hugging Face: {response.status_code}")
    
    def _query_anthropic(self, prompt, model=None):
        """
        Consulta a API da Anthropic
        
        Args:
            prompt: Prompt para a IA
            model: Nome do modelo
            
        Returns:
            Resposta da IA
        """
        headers = {
            "x-api-key": self.api_keys['anthropic'],
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model or "claude-3-sonnet-20240229",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1000
        }
        
        response = requests.post(self.api_endpoints["anthropic"], headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result["content"][0]["text"]
        else:
            logger.error(f"Erro na API Anthropic: {response.status_code} - {response.text}")
            raise Exception(f"Erro na API Anthropic: {response.status_code}")
    
    def _query_gemini(self, prompt, model=None):
        """
        Consulta a API do Google Gemini
        
        Args:
            prompt: Prompt para a IA
            model: Nome do modelo
            
        Returns:
            Resposta da IA
        """
        model_name = model or "gemini-pro"
        api_key = self.api_keys['gemini']
        
        endpoint = f"{self.api_endpoints['gemini']}{model_name}:generateContent?key={api_key}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000
            }
        }
        
        response = requests.post(endpoint, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result["candidates"][0]["content"]["parts"][0]["text"]
        else:
            logger.error(f"Erro na API Gemini: {response.status_code} - {response.text}")
            raise Exception(f"Erro na API Gemini: {response.status_code}")
    
    def _query_ollama_local(self, prompt, model=None):
        """
        Consulta a API local do Ollama
        
        Args:
            prompt: Prompt para a IA
            model: Nome do modelo
            
        Returns:
            Resposta da IA
        """
        payload = {
            "model": model or "llama3",
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        }
        
        response = requests.post(self.api_endpoints["ollama_local"], json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            return result["message"]["content"]
        else:
            logger.error(f"Erro na API Ollama local: {response.status_code} - {response.text}")
            raise Exception(f"Erro na API Ollama local: {response.status_code}")
    
    def _query_custom_ia(self, prompt):
        """
        Consulta uma API personalizada
        
        Args:
            prompt: Prompt para a IA
            
        Returns:
            Resposta da IA
        """
        headers = {}
        if self.api_keys.get('custom_ia'):
            headers["Authorization"] = f"Bearer {self.api_keys['custom_ia']}"
        
        payload = {"prompt": prompt}
        
        response = requests.post(self.api_endpoints["custom_ia"], headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", str(result))
        else:
            logger.error(f"Erro na API personalizada: {response.status_code} - {response.text}")
            raise Exception(f"Erro na API personalizada: {response.status_code}")
    
    def collaborate_with_external_ia(self, prompt, services=None):
        """
        Consulta múltiplas IAs e combina os resultados
        
        Args:
            prompt: Prompt para as IAs
            services: Lista de serviços a consultar (opcional)
            
        Returns:
            Dicionário com as respostas de cada serviço
        """
        if not services:
            # Usa serviços com chaves configuradas ou Ollama local
            services = [s for s in self.api_endpoints.keys() if self.api_keys.get(s) or s == "ollama_local"]
        
        results = {}
        for service in services:
            try:
                results[service] = self.query_external_ia(service, prompt)
            except Exception as e:
                logger.error(f"Erro ao consultar {service}: {e}")
                results[service] = None
        
        # Armazena os resultados no banco de dados para aprendizado
        for service, result in results.items():
            if result:
                self.database.add_knowledge(
                    topic=f"collaboration_{service}",
                    content=result,
                    source=service,
                    confidence=0.8  # Confiança um pouco menor para conhecimento externo
                )
        
        return results
    
    def get_best_response(self, prompt, services=None, strategy="first_valid"):
        """
        Obtém a melhor resposta entre várias IAs
        
        Args:
            prompt: Prompt para as IAs
            services: Lista de serviços a consultar (opcional)
            strategy: Estratégia para escolher a melhor resposta
                      "first_valid": Primeira resposta válida
                      "longest": Resposta mais longa
                      "all": Retorna todas as respostas
            
        Returns:
            Melhor resposta ou dicionário com todas as respostas
        """
        responses = self.collaborate_with_external_ia(prompt, services)
        
        if strategy == "all":
            return responses
        
        # Filtra respostas válidas
        valid_responses = {k: v for k, v in responses.items() if v}
        
        if not valid_responses:
            logger.warning("Nenhuma resposta válida obtida")
            return None
        
        if strategy == "first_valid":
            # Retorna a primeira resposta válida
            service = next(iter(valid_responses))
            return valid_responses[service]
        
        elif strategy == "longest":
            # Retorna a resposta mais longa
            return max(valid_responses.values(), key=len)
        
        else:
            logger.warning(f"Estratégia desconhecida: {strategy}")
            return next(iter(valid_responses.values()))
    
    def translate_with_ai(self, text, source_lang, target_lang, service="openai"):
        """
        Traduz texto usando IA
        
        Args:
            text: Texto a ser traduzido
            source_lang: Idioma de origem
            target_lang: Idioma de destino
            service: Serviço a ser usado
            
        Returns:
            Texto traduzido
        """
        prompt = f"Traduza o seguinte texto de {source_lang} para {target_lang}:\n\n{text}"
        return self.query_external_ia(service, prompt)
    
    def summarize_with_ai(self, text, max_length=200, service="openai"):
        """
        Resume texto usando IA
        
        Args:
            text: Texto a ser resumido
            max_length: Comprimento máximo do resumo
            service: Serviço a ser usado
            
        Returns:
            Texto resumido
        """
        prompt = f"Resume o seguinte texto em no máximo {max_length} caracteres:\n\n{text}"
        return self.query_external_ia(service, prompt)
    
    def analyze_sentiment(self, text, service="openai"):
        """
        Analisa o sentimento de um texto
        
        Args:
            text: Texto a ser analisado
            service: Serviço a ser usado
            
        Returns:
            Análise de sentimento (positivo, negativo, neutro)
        """
        prompt = f"Analise o sentimento do seguinte texto e responda apenas com 'positivo', 'negativo' ou 'neutro':\n\n{text}"
        return self.query_external_ia(service, prompt)
    
    def extract_keywords(self, text, service="openai"):
        """
        Extrai palavras-chave de um texto
        
        Args:
            text: Texto para extração
            service: Serviço a ser usado
            
        Returns:
            Lista de palavras-chave
        """
        prompt = f"Extraia as 5 principais palavras-chave do seguinte texto, separadas por vírgula:\n\n{text}"
        response = self.query_external_ia(service, prompt)
        
        if response:
            # Tenta extrair as palavras-chave da resposta
            keywords = [kw.strip() for kw in response.split(',')]
            return keywords
        
        return []
    
    def answer_question(self, question, context=None, service="ollama_local"):
        """
        Responde a uma pergunta com base em um contexto opcional
        
        Args:
            question: Pergunta a ser respondida
            context: Contexto para a pergunta (opcional)
            service: Serviço a ser usado
            
        Returns:
            Resposta à pergunta
        """
        if context:
            prompt = f"Com base no seguinte contexto, responda à pergunta:\n\nContexto: {context}\n\nPergunta: {question}"
        else:
            prompt = f"Responda à seguinte pergunta: {question}"
        
        return self.query_external_ia(service, prompt)
    
    def generate_image_prompt(self, description, service="openai"):
        """
        Gera um prompt otimizado para geração de imagens
        
        Args:
            description: Descrição da imagem desejada
            service: Serviço a ser usado
            
        Returns:
            Prompt otimizado para geração de imagens
        """
        prompt = f"""
        Crie um prompt detalhado para geração de imagem com base na seguinte descrição:
        
        {description}
        
        O prompt deve incluir detalhes sobre estilo, iluminação, composição e elementos visuais.
        """
        
        return self.query_external_ia(service, prompt)


class AIIntegrationManager:
    """Gerenciador de integração com outras IAs"""
    
    def __init__(self, database, ai_comm):
        """
        Inicializa o gerenciador de integração
        
        Args:
            database: Instância do banco de dados
            ai_comm: Instância do sistema de comunicação com outras IAs
        """
        self.database = database
        self.ai_comm = ai_comm
        self.active_integrations = {}
        
        # Carrega integrações ativas
        self._load_active_integrations()
    
    def _load_active_integrations(self):
        """Carrega integrações ativas do banco de dados"""
        integrations = self.database.get_ai_communications()
        
        for integration in integrations:
            comm_id, ai_name, api_endpoint, api_key, last_comm, enabled = integration
            if enabled:
                self.active_integrations[ai_name] = {
                    "id": comm_id,
                    "endpoint": api_endpoint,
                    "key": api_key,
                    "last_comm": last_comm
                }
        
        logger.info(f"Carregadas {len(self.active_integrations)} integrações ativas")
    
    def add_integration(self, ai_name, api_endpoint, api_key=""):
        """
        Adiciona uma nova integração
        
        Args:
            ai_name: Nome da IA
            api_endpoint: Endpoint da API
            api_key: Chave de API (opcional)
            
        Returns:
            ID da integração
        """
        # Adiciona ao banco de dados
        self.database.add_ai_communication(ai_name, api_endpoint, api_key)
        
        # Recarrega integrações ativas
        self._load_active_integrations()
        
        logger.info(f"Nova integração adicionada: {ai_name}")
        return self.active_integrations.get(ai_name, {}).get("id")
    
    def remove_integration(self, ai_name):
        """
        Remove uma integração
        
        Args:
            ai_name: Nome da IA
            
        Returns:
            True se removida com sucesso, False caso contrário
        """
        if ai_name not in self.active_integrations:
            logger.warning(f"Integração não encontrada: {ai_name}")
            return False
        
        integration_id = self.active_integrations[ai_name]["id"]
        
        # Desativa no banco de dados
        self.database.cursor.execute(
            "UPDATE ai_communications SET enabled = 0 WHERE id = ?",
            (integration_id,)
        )
        self.database.conn.commit()
        
        # Remove da lista de integrações ativas
        del self.active_integrations[ai_name]
        
        logger.info(f"Integração removida: {ai_name}")
        return True
    
    def send_message_to_ai(self, ai_name, message):
        """
        Envia uma mensagem para outra IA
        
        Args:
            ai_name: Nome da IA
            message: Mensagem a ser enviada
            
        Returns:
            Resposta da IA ou None se houver erro
        """
        if ai_name not in self.active_integrations:
            logger.warning(f"Integração não encontrada: {ai_name}")
            return None
        
        integration = self.active_integrations[ai_name]
        
        headers = {"Content-Type": "application/json"}
        if integration["key"]:
            headers["Authorization"] = f"Bearer {integration['key']}"
        
        payload = {
            "message": message,
            "sender": "NOVA",
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(integration["endpoint"], headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                # Atualiza timestamp da última comunicação
                self.database.update_ai_communication_timestamp(integration["id"])
                
                # Processa a resposta
                result = response.json()
                logger.info(f"Mensagem enviada com sucesso para {ai_name}")
                return result
            else:
                logger.error(f"Erro ao enviar mensagem para {ai_name}: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Erro ao comunicar com {ai_name}: {e}")
            return None
    
    def broadcast_message(self, message):
        """
        Envia uma mensagem para todas as IAs integradas
        
        Args:
            message: Mensagem a ser enviada
            
        Returns:
            Dicionário com as respostas de cada IA
        """
        results = {}
        
        for ai_name in self.active_integrations:
            results[ai_name] = self.send_message_to_ai(ai_name, message)
        
        return results
    
    def get_capabilities(self, ai_name):
        """
        Obtém as capacidades de uma IA integrada
        
        Args:
            ai_name: Nome da IA
            
        Returns:
            Lista de capacidades ou None se houver erro
        """
        response = self.send_message_to_ai(ai_name, {"action": "get_capabilities"})
        
        if response and "capabilities" in response:
            return response["capabilities"]
        
        return None
    
    def request_knowledge_sharing(self, ai_name, topic):
        """
        Solicita compartilhamento de conhecimento de uma IA integrada
        
        Args:
            ai_name: Nome da IA
            topic: Tópico de interesse
            
        Returns:
            Conhecimento compartilhado ou None se houver erro
        """
        response = self.send_message_to_ai(ai_name, {
            "action": "share_knowledge",
            "topic": topic
        })
        
        if response and "knowledge" in response:
            # Armazena o conhecimento compartilhado
            knowledge = response["knowledge"]
            if isinstance(knowledge, list):
                for item in knowledge:
                    if isinstance(item, dict) and "topic" in item and "content" in item:
                        self.database.add_knowledge(
                            topic=item.get("topic", topic),
                            content=item.get("content", ""),
                            source=f"ai_{ai_name}",
                            confidence=item.get("confidence", 0.8)
                        )
            
            return knowledge
        
        return None


def main():
    """Função principal para testar o sistema de comunicação com outras IAs"""
    # Importa o módulo de banco de dados
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from atualizacao_automatica import Database
    
    # Inicializa o banco de dados
    db = Database("data/nova_test.db")
    
    # Inicializa o sistema de comunicação com outras IAs
    ai_comm = AIComm(db)
    
    # Inicializa o gerenciador de integração
    integration_manager = AIIntegrationManager(db, ai_comm)
    
    # Testa a comunicação com Ollama local
    try:
        response = ai_comm.query_external_ia("ollama_local", "Olá, quem é você?")
        print(f"Resposta do Ollama local: {response}")
    except Exception as e:
        print(f"Erro ao comunicar com Ollama local: {e}")
    
    # Fecha o banco de dados
    db.close()


if __name__ == "__main__":
    main()
