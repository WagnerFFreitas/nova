"""
Módulo de Atualização Automática para IA NOVA
Este módulo implementa o sistema de atualização automática de dados para a IA NOVA,
permitindo que ela atualize seu banco de conhecimento através da internet.
"""

import requests
import json
import time
import threading
import os
import sqlite3
from datetime import datetime
import logging

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("nova_updater.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("NOVA_Updater")

class Database:
    """Gerencia o banco de dados da IA NOVA"""
    
    def __init__(self, db_path="data/nova.db"):
        """
        Inicializa o banco de dados
        
        Args:
            db_path: Caminho para o arquivo do banco de dados
        """
        # Garante que o diretório existe
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.initialize_db()
    
    def initialize_db(self):
        """Inicializa as tabelas do banco de dados"""
        # Tabela de conhecimento
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS knowledge (
            id INTEGER PRIMARY KEY,
            topic TEXT,
            content TEXT,
            source TEXT,
            timestamp DATETIME,
            confidence REAL DEFAULT 1.0
        )
        ''')
        
        # Tabela de atualizações
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS updates (
            id INTEGER PRIMARY KEY,
            update_type TEXT,
            content TEXT,
            applied BOOLEAN,
            timestamp DATETIME
        )
        ''')
        
        # Tabela de interações
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY,
            user_input TEXT,
            ai_response TEXT,
            timestamp DATETIME,
            feedback INTEGER DEFAULT 0
        )
        ''')
        
        # Tabela de configurações
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME
        )
        ''')
        
        # Tabela de fontes de dados
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS data_sources (
            id INTEGER PRIMARY KEY,
            name TEXT,
            url TEXT,
            api_key TEXT,
            last_updated DATETIME,
            update_frequency INTEGER DEFAULT 3600,
            enabled BOOLEAN DEFAULT 1
        )
        ''')
        
        # Tabela de comunicação com outras IAs
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_communications (
            id INTEGER PRIMARY KEY,
            ai_name TEXT,
            api_endpoint TEXT,
            api_key TEXT,
            last_communication DATETIME,
            enabled BOOLEAN DEFAULT 1
        )
        ''')
        
        self.conn.commit()
        logger.info("Banco de dados inicializado com sucesso")
    
    def add_knowledge(self, topic, content, source, confidence=1.0):
        """
        Adiciona um novo item de conhecimento ao banco de dados
        
        Args:
            topic: Tópico do conhecimento
            content: Conteúdo do conhecimento
            source: Fonte do conhecimento
            confidence: Nível de confiança (0.0 a 1.0)
        """
        self.cursor.execute(
            "INSERT INTO knowledge (topic, content, source, timestamp, confidence) VALUES (?, ?, ?, ?, ?)",
            (topic, content, source, datetime.now(), confidence)
        )
        self.conn.commit()
        logger.debug(f"Conhecimento adicionado: {topic}")
    
    def get_knowledge(self, topic=None, min_confidence=0.0):
        """
        Recupera conhecimento do banco de dados
        
        Args:
            topic: Tópico a ser pesquisado (opcional)
            min_confidence: Confiança mínima (0.0 a 1.0)
            
        Returns:
            Lista de itens de conhecimento
        """
        if topic:
            self.cursor.execute(
                "SELECT * FROM knowledge WHERE topic LIKE ? AND confidence >= ? ORDER BY confidence DESC",
                (f"%{topic}%", min_confidence)
            )
        else:
            self.cursor.execute(
                "SELECT * FROM knowledge WHERE confidence >= ? ORDER BY confidence DESC",
                (min_confidence,)
            )
        return self.cursor.fetchall()
    
    def add_update(self, update_type, content):
        """
        Adiciona uma nova atualização ao banco de dados
        
        Args:
            update_type: Tipo de atualização
            content: Conteúdo da atualização
        """
        self.cursor.execute(
            "INSERT INTO updates (update_type, content, applied, timestamp) VALUES (?, ?, ?, ?)",
            (update_type, content, False, datetime.now())
        )
        self.conn.commit()
        logger.info(f"Nova atualização adicionada: {update_type}")
    
    def get_pending_updates(self):
        """
        Recupera atualizações pendentes
        
        Returns:
            Lista de atualizações pendentes
        """
        self.cursor.execute("SELECT * FROM updates WHERE applied = 0")
        return self.cursor.fetchall()
    
    def mark_update_applied(self, update_id):
        """
        Marca uma atualização como aplicada
        
        Args:
            update_id: ID da atualização
        """
        self.cursor.execute("UPDATE updates SET applied = 1 WHERE id = ?", (update_id,))
        self.conn.commit()
        logger.debug(f"Atualização {update_id} marcada como aplicada")
    
    def log_interaction(self, user_input, ai_response):
        """
        Registra uma interação com o usuário
        
        Args:
            user_input: Entrada do usuário
            ai_response: Resposta da IA
        """
        self.cursor.execute(
            "INSERT INTO interactions (user_input, ai_response, timestamp) VALUES (?, ?, ?)",
            (user_input, ai_response, datetime.now())
        )
        self.conn.commit()
    
    def add_data_source(self, name, url, api_key="", update_frequency=3600):
        """
        Adiciona uma nova fonte de dados
        
        Args:
            name: Nome da fonte de dados
            url: URL da fonte de dados
            api_key: Chave de API (opcional)
            update_frequency: Frequência de atualização em segundos
        """
        self.cursor.execute(
            "INSERT INTO data_sources (name, url, api_key, last_updated, update_frequency) VALUES (?, ?, ?, ?, ?)",
            (name, url, api_key, datetime.now(), update_frequency)
        )
        self.conn.commit()
        logger.info(f"Nova fonte de dados adicionada: {name}")
    
    def get_data_sources(self, enabled_only=True):
        """
        Recupera fontes de dados
        
        Args:
            enabled_only: Se True, retorna apenas fontes habilitadas
            
        Returns:
            Lista de fontes de dados
        """
        if enabled_only:
            self.cursor.execute("SELECT * FROM data_sources WHERE enabled = 1")
        else:
            self.cursor.execute("SELECT * FROM data_sources")
        return self.cursor.fetchall()
    
    def update_data_source_timestamp(self, source_id):
        """
        Atualiza o timestamp da última atualização de uma fonte de dados
        
        Args:
            source_id: ID da fonte de dados
        """
        self.cursor.execute(
            "UPDATE data_sources SET last_updated = ? WHERE id = ?",
            (datetime.now(), source_id)
        )
        self.conn.commit()
    
    def add_ai_communication(self, ai_name, api_endpoint, api_key=""):
        """
        Adiciona uma nova comunicação com IA
        
        Args:
            ai_name: Nome da IA
            api_endpoint: Endpoint da API
            api_key: Chave de API (opcional)
        """
        self.cursor.execute(
            "INSERT INTO ai_communications (ai_name, api_endpoint, api_key, last_communication) VALUES (?, ?, ?, ?)",
            (ai_name, api_endpoint, api_key, datetime.now())
        )
        self.conn.commit()
        logger.info(f"Nova comunicação com IA adicionada: {ai_name}")
    
    def get_ai_communications(self, enabled_only=True):
        """
        Recupera comunicações com IAs
        
        Args:
            enabled_only: Se True, retorna apenas comunicações habilitadas
            
        Returns:
            Lista de comunicações com IAs
        """
        if enabled_only:
            self.cursor.execute("SELECT * FROM ai_communications WHERE enabled = 1")
        else:
            self.cursor.execute("SELECT * FROM ai_communications")
        return self.cursor.fetchall()
    
    def update_ai_communication_timestamp(self, comm_id):
        """
        Atualiza o timestamp da última comunicação com uma IA
        
        Args:
            comm_id: ID da comunicação
        """
        self.cursor.execute(
            "UPDATE ai_communications SET last_communication = ? WHERE id = ?",
            (datetime.now(), comm_id)
        )
        self.conn.commit()
    
    def get_setting(self, key, default=None):
        """
        Recupera uma configuração
        
        Args:
            key: Chave da configuração
            default: Valor padrão se a configuração não existir
            
        Returns:
            Valor da configuração
        """
        self.cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
        result = self.cursor.fetchone()
        return result[0] if result else default
    
    def set_setting(self, key, value):
        """
        Define uma configuração
        
        Args:
            key: Chave da configuração
            value: Valor da configuração
        """
        self.cursor.execute(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
            (key, value, datetime.now())
        )
        self.conn.commit()
    
    def close(self):
        """Fecha a conexão com o banco de dados"""
        if self.conn:
            self.conn.close()
            logger.debug("Conexão com o banco de dados fechada")


class Updater:
    """Sistema de atualização automática para a IA NOVA"""
    
    def __init__(self, database, default_update_interval=3600):
        """
        Inicializa o sistema de atualização
        
        Args:
            database: Instância do banco de dados
            default_update_interval: Intervalo padrão de atualização em segundos
        """
        self.database = database
        self.default_update_interval = default_update_interval
        self.running = False
        self.update_thread = None
        
        # Adiciona algumas fontes de dados padrão se não existirem
        self._initialize_default_sources()
    
    def _initialize_default_sources(self):
        """Inicializa fontes de dados padrão"""
        # Verifica se já existem fontes de dados
        sources = self.database.get_data_sources(enabled_only=False)
        if not sources:
            # Adiciona fontes padrão
            default_sources = [
                {
                    "name": "knowledge_base",
                    "url": "https://api.example.com/knowledge",
                    "update_frequency": 86400  # 24 horas
                },
                {
                    "name": "model_updates",
                    "url": "https://api.example.com/model_updates",
                    "update_frequency": 604800  # 7 dias
                },
                {
                    "name": "news_feed",
                    "url": "https://api.example.com/news",
                    "update_frequency": 3600  # 1 hora
                }
            ]
            
            for source in default_sources:
                self.database.add_data_source(
                    name=source["name"],
                    url=source["url"],
                    update_frequency=source["update_frequency"]
                )
            
            logger.info("Fontes de dados padrão inicializadas")
    
    def start(self):
        """Inicia o sistema de atualização automática"""
        if self.running:
            logger.warning("Sistema de atualização já está em execução")
            return
        
        self.running = True
        self.update_thread = threading.Thread(target=self._update_loop)
        self.update_thread.daemon = True
        self.update_thread.start()
        logger.info("Sistema de atualização iniciado")
    
    def stop(self):
        """Para o sistema de atualização automática"""
        if not self.running:
            logger.warning("Sistema de atualização não está em execução")
            return
        
        self.running = False
        if self.update_thread:
            self.update_thread.join(timeout=1.0)
            logger.info("Sistema de atualização parado")
    
    def _update_loop(self):
        """Loop principal de atualização"""
        while self.running:
            try:
                # Verifica fontes de dados que precisam ser atualizadas
                self._check_data_sources()
                
                # Verifica comunicações com outras IAs
                self._check_ai_communications()
                
                # Aplica atualizações pendentes
                self.apply_pending_updates()
            except Exception as e:
                logger.error(f"Erro no loop de atualização: {e}")
            
            # Aguarda um minuto antes da próxima verificação
            for _ in range(60):
                if not self.running:
                    break
                time.sleep(1)
    
    def _check_data_sources(self):
        """Verifica fontes de dados que precisam ser atualizadas"""
        sources = self.database.get_data_sources()
        current_time = datetime.now()
        
        for source in sources:
            source_id, name, url, api_key, last_updated_str, update_frequency, enabled = source
            
            # Converte string para datetime
            last_updated = datetime.fromisoformat(last_updated_str) if isinstance(last_updated_str, str) else last_updated_str
            
            # Verifica se é hora de atualizar
            time_diff = (current_time - last_updated).total_seconds()
            if time_diff >= update_frequency:
                logger.info(f"Atualizando fonte de dados: {name}")
                try:
                    self._update_from_source(source)
                    self.database.update_data_source_timestamp(source_id)
                except Exception as e:
                    logger.error(f"Erro ao atualizar fonte {name}: {e}")
    
    def _update_from_source(self, source):
        """
        Atualiza a partir de uma fonte de dados
        
        Args:
            source: Informações da fonte de dados
        """
        source_id, name, url, api_key, _, _, _ = source
        
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                data = response.json()
                self._process_source_data(name, data)
            else:
                logger.warning(f"Erro ao acessar {name}: {response.status_code}")
        except requests.RequestException as e:
            logger.error(f"Erro de requisição para {name}: {e}")
    
    def _process_source_data(self, source_name, data):
        """
        Processa dados de uma fonte
        
        Args:
            source_name: Nome da fonte
            data: Dados recebidos
        """
        if source_name == "knowledge_base":
            # Processa atualizações de conhecimento
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "topic" in item and "content" in item:
                        self.database.add_knowledge(
                            topic=item.get("topic", ""),
                            content=item.get("content", ""),
                            source=item.get("source", source_name),
                            confidence=item.get("confidence", 1.0)
                        )
            logger.info(f"Processados {len(data) if isinstance(data, list) else 0} itens de conhecimento")
        
        elif source_name == "model_updates":
            # Processa atualizações de modelo
            if isinstance(data, list):
                for update in data:
                    if isinstance(update, dict) and "type" in update:
                        self.database.add_update(
                            update_type=update.get("type", ""),
                            content=json.dumps(update)
                        )
            logger.info(f"Processadas {len(data) if isinstance(data, list) else 0} atualizações de modelo")
        
        elif source_name == "news_feed":
            # Processa notícias
            if isinstance(data, list):
                for news in data:
                    if isinstance(news, dict) and "title" in news and "content" in news:
                        self.database.add_knowledge(
                            topic=f"news_{news.get('category', 'general')}",
                            content=f"{news.get('title')}: {news.get('content')}",
                            source=news.get("source", source_name),
                            confidence=0.9  # Notícias têm confiança alta, mas não máxima
                        )
            logger.info(f"Processadas {len(data) if isinstance(data, list) else 0} notícias")
    
    def _check_ai_communications(self):
        """Verifica comunicações com outras IAs"""
        communications = self.database.get_ai_communications()
        
        for comm in communications:
            comm_id, ai_name, api_endpoint, api_key, last_comm_str, enabled = comm
            
            try:
                # Realiza uma comunicação simples para verificar status
                self._communicate_with_ai(comm)
                self.database.update_ai_communication_timestamp(comm_id)
            except Exception as e:
                logger.error(f"Erro ao comunicar com {ai_name}: {e}")
    
    def _communicate_with_ai(self, comm):
        """
        Comunica com outra IA
        
        Args:
            comm: Informações da comunicação
        """
        comm_id, ai_name, api_endpoint, api_key, _, _ = comm
        
        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        
        # Prepara uma mensagem simples de status
        payload = {
            "message": "status_check",
            "sender": "NOVA",
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(api_endpoint, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Armazena informações úteis da resposta
                if isinstance(data, dict) and "status" in data:
                    logger.info(f"Comunicação com {ai_name}: {data.get('status')}")
                    
                    # Se houver conhecimento compartilhado, armazena
                    if "shared_knowledge" in data and isinstance(data["shared_knowledge"], list):
                        for item in data["shared_knowledge"]:
                            if isinstance(item, dict) and "topic" in item and "content" in item:
                                self.database.add_knowledge(
                                    topic=item.get("topic", ""),
                                    content=item.get("content", ""),
                                    source=f"ai_{ai_name}",
                                    confidence=item.get("confidence", 0.8)  # Confiança um pouco menor para conhecimento externo
                                )
            else:
                logger.warning(f"Erro ao comunicar com {ai_name}: {response.status_code}")
        except requests.RequestException as e:
            logger.error(f"Erro de requisição para {ai_name}: {e}")
    
    def apply_pending_updates(self):
        """Aplica atualizações pendentes"""
        updates = self.database.get_pending_updates()
        
        for update in updates:
            update_id, update_type, content, _, _ = update
            try:
                update_data = json.loads(content)
                self._apply_update(update_type, update_data)
                self.database.mark_update_applied(update_id)
                logger.info(f"Atualização {update_id} ({update_type}) aplicada com sucesso")
            except Exception as e:
                logger.error(f"Erro ao aplicar atualização {update_id}: {e}")
    
    def _apply_update(self, update_type, update_data):
        """
        Aplica uma atualização específica
        
        Args:
            update_type: Tipo de atualização
            update_data: Dados da atualização
        """
        if update_type == "model_weights":
            # Atualiza os pesos do modelo
            # Implementação depende do modelo específico usado
            logger.info("Atualização de pesos do modelo")
            
            # Exemplo: salva os novos pesos em um arquivo
            if "weights_url" in update_data:
                weights_url = update_data["weights_url"]
                weights_path = update_data.get("local_path", "models/weights.bin")
                
                # Garante que o diretório existe
                os.makedirs(os.path.dirname(weights_path), exist_ok=True)
                
                # Baixa os novos pesos
                try:
                    response = requests.get(weights_url, stream=True)
                    if response.status_code == 200:
                        with open(weights_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                f.write(chunk)
                        logger.info(f"Novos pesos baixados para {weights_path}")
                    else:
                        logger.error(f"Erro ao baixar pesos: {response.status_code}")
                except Exception as e:
                    logger.error(f"Erro ao baixar pesos: {e}")
        
        elif update_type == "knowledge_base":
            # Atualiza a base de conhecimento
            logger.info("Atualização da base de conhecimento")
            
            if "items" in update_data and isinstance(update_data["items"], list):
                for item in update_data["items"]:
                    if isinstance(item, dict) and "topic" in item and "content" in item:
                        self.database.add_knowledge(
                            topic=item.get("topic", ""),
                            content=item.get("content", ""),
                            source=item.get("source", "update"),
                            confidence=item.get("confidence", 1.0)
                        )
        
        elif update_type == "system_config":
            # Atualiza configurações do sistema
            logger.info("Atualização de configurações do sistema")
            
            if "settings" in update_data and isinstance(update_data["settings"], dict):
                for key, value in update_data["settings"].items():
                    self.database.set_setting(key, str(value))
        
        elif update_type == "data_sources":
            # Atualiza fontes de dados
            logger.info("Atualização de fontes de dados")
            
            if "sources" in update_data and isinstance(update_data["sources"], list):
                for source in update_data["sources"]:
                    if isinstance(source, dict) and "name" in source and "url" in source:
                        self.database.add_data_source(
                            name=source.get("name", ""),
                            url=source.get("url", ""),
                            api_key=source.get("api_key", ""),
                            update_frequency=source.get("update_frequency", self.default_update_interval)
                        )
        
        elif update_type == "ai_communications":
            # Atualiza comunicações com outras IAs
            logger.info("Atualização de comunicações com outras IAs")
            
            if "communications" in update_data and isinstance(update_data["communications"], list):
                for comm in update_data["communications"]:
                    if isinstance(comm, dict) and "ai_name" in comm and "api_endpoint" in comm:
                        self.database.add_ai_communication(
                            ai_name=comm.get("ai_name", ""),
                            api_endpoint=comm.get("api_endpoint", ""),
                            api_key=comm.get("api_key", "")
                        )
        
        else:
            logger.warning(f"Tipo de atualização desconhecido: {update_type}")


class DeveloperCommunication:
    """Sistema de comunicação com o desenvolvedor"""
    
    def __init__(self, database, developer_endpoint=None):
        """
        Inicializa o sistema de comunicação com o desenvolvedor
        
        Args:
            database: Instância do banco de dados
            developer_endpoint: Endpoint para comunicação com o desenvolvedor
        """
        self.database = database
        self.developer_endpoint = developer_endpoint or self.database.get_setting(
            "developer_endpoint", 
            "https://api.example.com/developer"
        )
    
    def send_feedback(self, message_type, content):
        """
        Envia feedback para o desenvolvedor
        
        Args:
            message_type: Tipo de mensagem
            content: Conteúdo da mensagem
            
        Returns:
            True se o envio foi bem-sucedido, False caso contrário
        """
        if not self.developer_endpoint:
            logger.warning("Endpoint do desenvolvedor não configurado")
            return False
        
        payload = {
            "type": message_type,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "version": self.database.get_setting("version", "1.0.0"),
            "instance_id": self.database.get_setting("instance_id", "unknown")
        }
        
        try:
            response = requests.post(self.developer_endpoint, json=payload, timeout=10)
            if response.status_code == 200:
                logger.info(f"Feedback enviado com sucesso: {message_type}")
                return True
            else:
                logger.warning(f"Erro ao enviar feedback: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Erro ao enviar feedback: {e}")
            return False
    
    def send_error_report(self, error_type, error_message, stack_trace=None):
        """
        Envia relatório de erro para o desenvolvedor
        
        Args:
            error_type: Tipo de erro
            error_message: Mensagem de erro
            stack_trace: Stack trace do erro (opcional)
            
        Returns:
            True se o envio foi bem-sucedido, False caso contrário
        """
        content = {
            "error_type": error_type,
            "error_message": error_message,
            "stack_trace": stack_trace
        }
        return self.send_feedback("error_report", content)
    
    def send_usage_statistics(self, stats):
        """
        Envia estatísticas de uso para o desenvolvedor
        
        Args:
            stats: Estatísticas de uso
            
        Returns:
            True se o envio foi bem-sucedido, False caso contrário
        """
        return self.send_feedback("usage_statistics", stats)
    
    def check_for_updates(self):
        """
        Verifica se há atualizações disponíveis
        
        Returns:
            Informações sobre atualizações disponíveis ou None se não houver
        """
        if not self.developer_endpoint:
            logger.warning("Endpoint do desenvolvedor não configurado")
            return None
        
        current_version = self.database.get_setting("version", "1.0.0")
        
        payload = {
            "action": "check_updates",
            "current_version": current_version,
            "instance_id": self.database.get_setting("instance_id", "unknown")
        }
        
        try:
            response = requests.post(f"{self.developer_endpoint}/updates", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("has_updates", False):
                    logger.info(f"Atualizações disponíveis: {data.get('latest_version')}")
                    return data
                else:
                    logger.info("Não há atualizações disponíveis")
                    return None
            else:
                logger.warning(f"Erro ao verificar atualizações: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Erro ao verificar atualizações: {e}")
            return None


def main():
    """Função principal para testar o sistema de atualização"""
    # Inicializa o banco de dados
    db = Database("data/nova_test.db")
    
    # Inicializa o sistema de atualização
    updater = Updater(db)
    
    # Inicializa o sistema de comunicação com o desenvolvedor
    dev_comm = DeveloperCommunication(db)
    
    # Adiciona algumas fontes de dados de teste
    db.add_data_source(
        name="test_source",
        url="https://api.example.com/test",
        update_frequency=60  # 1 minuto para teste
    )
    
    # Adiciona algumas comunicações com IAs de teste
    db.add_ai_communication(
        ai_name="test_ai",
        api_endpoint="https://api.example.com/test_ai"
    )
    
    # Inicia o sistema de atualização
    updater.start()
    
    try:
        # Mantém o programa em execução por um tempo
        logger.info("Sistema de atualização em execução. Pressione Ctrl+C para sair.")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Encerrando...")
    finally:
        # Para o sistema de atualização
        updater.stop()
        
        # Fecha o banco de dados
        db.close()


if __name__ == "__main__":
    main()
