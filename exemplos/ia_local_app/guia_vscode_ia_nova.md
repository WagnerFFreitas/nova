# Guia Passo a Passo para Desenvolvimento da IA NOVA no VSCode

Este guia detalhado irá orientá-lo na criação da IA NOVA, uma aplicação de inteligência artificial local com interface facial animada, sistema de atualização automática de dados e capacidade de interação com outras IAs.

## Índice
1. [Configuração do Ambiente](#1-configuração-do-ambiente)
2. [Instalação do Modelo de IA Local](#2-instalação-do-modelo-de-ia-local)
3. [Configuração do VSCode](#3-configuração-do-vscode)
4. [Desenvolvimento da Interface Gráfica com Expressões Faciais](#4-desenvolvimento-da-interface-gráfica-com-expressões-faciais)
5. [Implementação do Sistema de Atualização Automática](#5-implementação-do-sistema-de-atualização-automática)
6. [Implementação da Comunicação com Outras IAs](#6-implementação-da-comunicação-com-outras-ias)
7. [Integração Completa e Testes](#7-integração-completa-e-testes)

## 1. Configuração do Ambiente

### 1.1 Instalação do Python
```bash
# Para Windows: Baixe o instalador do site oficial do Python
# Para macOS:
brew install python

# Para Linux:
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### 1.2 Criação do Ambiente Virtual
```bash
# Crie uma pasta para o projeto
mkdir ia_nova
cd ia_nova

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# No Windows:
venv\Scripts\activate
# No macOS/Linux:
source venv/bin/activate
```

### 1.3 Instalação das Dependências Básicas
```bash
pip install numpy pandas matplotlib flask requests
```

## 2. Instalação do Modelo de IA Local

### 2.1 Instalação do Ollama
Ollama é uma ferramenta que permite executar modelos de linguagem grandes (LLMs) localmente.

#### Para Windows:
1. Baixe o instalador do [site oficial do Ollama](https://ollama.ai/download)
2. Execute o instalador e siga as instruções

#### Para macOS:
```bash
brew install ollama
```

#### Para Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2.2 Download e Execução do Modelo Llama 3
```bash
# Inicie o serviço Ollama
ollama serve

# Em outro terminal, baixe e execute o modelo Llama 3
ollama run llama3
```

### 2.3 Verificação da Instalação
```bash
# Teste o modelo com uma pergunta simples
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Olá, você é a IA NOVA?"
}'
```

## 3. Configuração do VSCode

### 3.1 Instalação do VSCode
1. Baixe e instale o VSCode do [site oficial](https://code.visualstudio.com/)

### 3.2 Instalação das Extensões Necessárias
No VSCode, instale as seguintes extensões:
1. Python (Microsoft)
2. CodeGPT (para integração com modelos de IA)
3. Live Server (para desenvolvimento web)
4. Jupyter (para notebooks interativos)

### 3.3 Configuração da Extensão CodeGPT para Ollama
1. Abra o VSCode
2. Vá para Extensões (Ctrl+Shift+X)
3. Procure e instale "CodeGPT"
4. Clique no ícone de configurações da extensão
5. Selecione "Ollama" como provedor
6. Defina o modelo como "llama3"
7. Não é necessário fornecer uma chave de API, pois estamos usando localmente

## 4. Desenvolvimento da Interface Gráfica com Expressões Faciais

### 4.1 Instalação das Bibliotecas para Animação Facial
```bash
pip install mediapipe opencv-python pygame PyQt5
```

### 4.2 Estrutura de Arquivos do Projeto
Crie a seguinte estrutura de arquivos:
```
ia_nova/
├── venv/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── avatar.py
│   ├── ia_engine.py
│   ├── database.py
│   ├── updater.py
│   └── communication.py
├── static/
│   ├── models/
│   │   └── face_model.glb
│   ├── images/
│   └── css/
└── templates/
    └── index.html
```

### 4.3 Implementação do Avatar com MediaPipe
Crie o arquivo `app/avatar.py` com o seguinte código:

```python
import cv2
import mediapipe as mp
import numpy as np
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel
from PyQt5.QtGui import QPixmap, QImage
from PyQt5.QtCore import QTimer, Qt

class FacialAvatar:
    def __init__(self):
        # Inicializa o MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Inicializa o detector de expressões faciais
        self.mp_face_landmarker = mp.solutions.face_landmarker
        self.face_landmarker = self.mp_face_landmarker.FaceLandmarker(
            model_path="mediapipe/modules/face_landmarker/face_landmarker.task"
        )
        
        # Carrega a imagem do avatar
        self.avatar_image = cv2.imread("static/images/avatar.png")
        
        # Dicionário de expressões faciais
        self.expressions = {
            "neutral": self._neutral_expression,
            "happy": self._happy_expression,
            "sad": self._sad_expression,
            "surprised": self._surprised_expression,
            "angry": self._angry_expression
        }
        
        self.current_expression = "neutral"
    
    def _neutral_expression(self):
        # Implementação da expressão neutra
        pass
    
    def _happy_expression(self):
        # Implementação da expressão feliz
        pass
    
    def _sad_expression(self):
        # Implementação da expressão triste
        pass
    
    def _surprised_expression(self):
        # Implementação da expressão surpresa
        pass
    
    def _angry_expression(self):
        # Implementação da expressão de raiva
        pass
    
    def set_expression(self, expression):
        if expression in self.expressions:
            self.current_expression = expression
            self.expressions[expression]()
    
    def get_avatar_frame(self):
        # Retorna o frame atual do avatar com a expressão aplicada
        return self.avatar_image

class AvatarWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        
        self.setWindowTitle("IA NOVA")
        self.setGeometry(100, 100, 800, 600)
        
        self.avatar = FacialAvatar()
        
        self.image_label = QLabel(self)
        self.image_label.setAlignment(Qt.AlignCenter)
        self.setCentralWidget(self.image_label)
        
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_avatar)
        self.timer.start(33)  # ~30 FPS
    
    def update_avatar(self):
        frame = self.avatar.get_avatar_frame()
        
        # Converte o frame OpenCV para QImage
        height, width, channel = frame.shape
        bytes_per_line = 3 * width
        q_img = QImage(frame.data, width, height, bytes_per_line, QImage.Format_RGB888).rgbSwapped()
        
        # Exibe a imagem
        self.image_label.setPixmap(QPixmap.fromImage(q_img))
```

## 5. Implementação do Sistema de Atualização Automática

### 5.1 Criação do Banco de Dados
Crie o arquivo `app/database.py`:

```python
import sqlite3
import json
import os
from datetime import datetime

class Database:
    def __init__(self, db_path="data/nova.db"):
        # Garante que o diretório existe
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.initialize_db()
    
    def initialize_db(self):
        # Cria tabelas se não existirem
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS knowledge (
            id INTEGER PRIMARY KEY,
            topic TEXT,
            content TEXT,
            source TEXT,
            timestamp DATETIME
        )
        ''')
        
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS updates (
            id INTEGER PRIMARY KEY,
            update_type TEXT,
            content TEXT,
            applied BOOLEAN,
            timestamp DATETIME
        )
        ''')
        
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY,
            user_input TEXT,
            ai_response TEXT,
            timestamp DATETIME
        )
        ''')
        
        self.conn.commit()
    
    def add_knowledge(self, topic, content, source):
        self.cursor.execute(
            "INSERT INTO knowledge (topic, content, source, timestamp) VALUES (?, ?, ?, ?)",
            (topic, content, source, datetime.now())
        )
        self.conn.commit()
    
    def get_knowledge(self, topic=None):
        if topic:
            self.cursor.execute("SELECT * FROM knowledge WHERE topic LIKE ?", (f"%{topic}%",))
        else:
            self.cursor.execute("SELECT * FROM knowledge")
        return self.cursor.fetchall()
    
    def add_update(self, update_type, content):
        self.cursor.execute(
            "INSERT INTO updates (update_type, content, applied, timestamp) VALUES (?, ?, ?, ?)",
            (update_type, content, False, datetime.now())
        )
        self.conn.commit()
    
    def get_pending_updates(self):
        self.cursor.execute("SELECT * FROM updates WHERE applied = 0")
        return self.cursor.fetchall()
    
    def mark_update_applied(self, update_id):
        self.cursor.execute("UPDATE updates SET applied = 1 WHERE id = ?", (update_id,))
        self.conn.commit()
    
    def log_interaction(self, user_input, ai_response):
        self.cursor.execute(
            "INSERT INTO interactions (user_input, ai_response, timestamp) VALUES (?, ?, ?)",
            (user_input, ai_response, datetime.now())
        )
        self.conn.commit()
    
    def close(self):
        self.conn.close()
```

### 5.2 Implementação do Sistema de Atualização
Crie o arquivo `app/updater.py`:

```python
import requests
import json
import time
import threading
from datetime import datetime

class Updater:
    def __init__(self, database, update_interval=3600):
        self.database = database
        self.update_interval = update_interval  # em segundos
        self.update_sources = [
            {"name": "knowledge_base", "url": "https://api.example.com/knowledge"},
            {"name": "model_updates", "url": "https://api.example.com/model_updates"}
        ]
        self.running = False
        self.update_thread = None
    
    def start(self):
        self.running = True
        self.update_thread = threading.Thread(target=self._update_loop)
        self.update_thread.daemon = True
        self.update_thread.start()
    
    def stop(self):
        self.running = False
        if self.update_thread:
            self.update_thread.join(timeout=1.0)
    
    def _update_loop(self):
        while self.running:
            try:
                self._check_for_updates()
            except Exception as e:
                print(f"Erro ao verificar atualizações: {e}")
            
            # Aguarda o intervalo definido
            time.sleep(self.update_interval)
    
    def _check_for_updates(self):
        for source in self.update_sources:
            try:
                response = requests.get(source["url"], timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self._process_updates(source["name"], data)
            except requests.RequestException as e:
                print(f"Erro ao acessar {source['name']}: {e}")
    
    def _process_updates(self, source_name, data):
        if source_name == "knowledge_base":
            for item in data:
                self.database.add_knowledge(
                    topic=item.get("topic", ""),
                    content=item.get("content", ""),
                    source=item.get("source", "auto_update")
                )
        elif source_name == "model_updates":
            for update in data:
                self.database.add_update(
                    update_type=update.get("type", ""),
                    content=json.dumps(update)
                )
    
    def apply_pending_updates(self):
        updates = self.database.get_pending_updates()
        for update in updates:
            update_id, update_type, content, _, _ = update
            try:
                update_data = json.loads(content)
                self._apply_update(update_type, update_data)
                self.database.mark_update_applied(update_id)
            except Exception as e:
                print(f"Erro ao aplicar atualização {update_id}: {e}")
    
    def _apply_update(self, update_type, update_data):
        # Implementação específica para cada tipo de atualização
        if update_type == "model_weights":
            # Atualiza os pesos do modelo
            pass
        elif update_type == "knowledge_base":
            # Atualiza a base de conhecimento
            pass
        elif update_type == "system_config":
            # Atualiza configurações do sistema
            pass
```

## 6. Implementação da Comunicação com Outras IAs

### 6.1 Criação do Módulo de Comunicação
Crie o arquivo `app/communication.py`:

```python
import requests
import json
import time
from datetime import datetime

class IAComm:
    def __init__(self, database):
        self.database = database
        self.api_endpoints = {
            "openai": "https://api.openai.com/v1/chat/completions",
            "huggingface": "https://api-inference.huggingface.co/models/",
            "custom_ia": "https://api.example.com/custom_ia"
        }
        self.api_keys = {
            "openai": "",
            "huggingface": "",
            "custom_ia": ""
        }
    
    def set_api_key(self, service, key):
        if service in self.api_keys:
            self.api_keys[service] = key
    
    def query_external_ia(self, service, prompt, model=None):
        if service not in self.api_endpoints:
            raise ValueError(f"Serviço não suportado: {service}")
        
        if not self.api_keys[service]:
            raise ValueError(f"Chave de API não configurada para {service}")
        
        headers = {"Authorization": f"Bearer {self.api_keys[service]}"}
        
        if service == "openai":
            payload = {
                "model": model or "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}]
            }
            response = requests.post(self.api_endpoints[service], headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
        
        elif service == "huggingface":
            if not model:
                raise ValueError("Modelo não especificado para Hugging Face")
            
            endpoint = f"{self.api_endpoints[service]}{model}"
            payload = {"inputs": prompt}
            response = requests.post(endpoint, headers=headers, json=payload)
            
            if response.status_code == 200:
                return response.json()[0]["generated_text"]
        
        elif service == "custom_ia":
            payload = {"prompt": prompt}
            response = requests.post(self.api_endpoints[service], headers=headers, json=payload)
            
            if response.status_code == 200:
                return response.json()["response"]
        
        # Se chegou aqui, houve um erro
        raise Exception(f"Erro ao consultar {service}: {response.status_code} - {response.text}")
    
    def collaborate_with_external_ia(self, prompt, services=None):
        """
        Consulta múltiplas IAs e combina os resultados
        """
        if not services:
            services = list(self.api_endpoints.keys())
        
        results = {}
        for service in services:
            try:
                results[service] = self.query_external_ia(service, prompt)
            except Exception as e:
                print(f"Erro ao consultar {service}: {e}")
                results[service] = None
        
        # Armazena os resultados no banco de dados para aprendizado
        for service, result in results.items():
            if result:
                self.database.add_knowledge(
                    topic=f"collaboration_{service}",
                    content=result,
                    source=service
                )
        
        # Retorna os resultados combinados ou o melhor resultado
        return results
```

### 6.2 Integração com o Motor de IA
Crie o arquivo `app/ia_engine.py`:

```python
import os
import json
import requests
from datetime import datetime

class IAEngine:
    def __init__(self, database, updater, comm):
        self.database = database
        self.updater = updater
        self.comm = comm
        self.model_name = "llama3"
        self.ollama_api = "http://localhost:11434/api"
    
    def initialize(self):
        # Verifica se há atualizações pendentes
        self.updater.apply_pending_updates()
        
        # Inicia o sistema de atualização automática
        self.updater.start()
    
    def process_query(self, query):
        # Registra a consulta
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Consulta o modelo local
        response = self._query_local_model(query)
        
        # Se necessário, consulta IAs externas para complementar
        if self._should_consult_external(query, response):
            external_responses = self.comm.collaborate_with_external_ia(query)
            # Combina as respostas
            response = self._combine_responses(response, external_responses)
        
        # Registra a interação
        self.database.log_interaction(query, response)
        
        return response
    
    def _query_local_model(self, query):
        try:
            payload = {
                "model": self.model_name,
                "prompt": query,
                "stream": False
            }
            response = requests.post(f"{self.ollama_api}/generate", json=payload)
            
            if response.status_code == 200:
                return response.json()["response"]
            else:
                return f"Erro ao consultar modelo local: {response.status_code}"
        except Exception as e:
            return f"Erro ao processar consulta: {str(e)}"
    
    def _should_consult_external(self, query, response):
        # Lógica para decidir se deve consultar IAs externas
        # Por exemplo, se a resposta local não for confiante o suficiente
        if "não sei" in response.lower() or "não tenho informações" in response.lower():
            return True
        return False
    
    def _combine_responses(self, local_response, external_responses):
        # Lógica para combinar respostas de diferentes fontes
        combined = f"Resposta local: {local_response}\n\n"
        
        for service, response in external_responses.items():
            if response:
                combined += f"Resposta de {service}: {response}\n\n"
        
        # Aqui poderia haver uma lógica mais sofisticada para combinar as respostas
        return combined
    
    def update_expression(self, text):
        # Análise simples de sentimento para determinar a expressão facial
        text = text.lower()
        
        if any(word in text for word in ["feliz", "alegre", "bom", "ótimo", "excelente"]):
            return "happy"
        elif any(word in text for word in ["triste", "infeliz", "ruim", "péssimo"]):
            return "sad"
        elif any(word in text for word in ["surpreso", "uau", "incrível", "surpreendente"]):
            return "surprised"
        elif any(word in text for word in ["irritado", "raiva", "bravo", "furioso"]):
            return "angry"
        else:
            return "neutral"
```

## 7. Integração Completa e Testes

### 7.1 Criação do Arquivo Principal
Crie o arquivo `app/main.py`:

```python
import sys
import os
from PyQt5.QtWidgets import QApplication
from PyQt5.QtCore import QThread, pyqtSignal

from avatar import AvatarWindow
from database import Database
from updater import Updater
from communication import IAComm
from ia_engine import IAEngine

class IANovaApp:
    def __init__(self):
        # Inicializa os componentes
        self.database = Database()
        self.updater = Updater(self.database)
        self.comm = IAComm(self.database)
        self.engine = IAEngine(self.database, self.updater, self.comm)
        
        # Inicializa a interface gráfica
        self.app = QApplication(sys.argv)
        self.window = AvatarWindow()
        
        # Conecta os componentes
        self.engine.initialize()
    
    def run(self):
        self.window.show()
        return self.app.exec_()
    
    def process_query(self, query):
        # Processa a consulta e atualiza a expressão facial
        response = self.engine.process_query(query)
        expression = self.engine.update_expression(response)
        self.window.avatar.set_expression(expression)
        return response

if __name__ == "__main__":
    app = IANovaApp()
    sys.exit(app.run())
```

### 7.2 Criação do Arquivo de Inicialização
Crie um arquivo `run.py` na raiz do projeto:

```python
import os
import sys

# Adiciona o diretório do projeto ao PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import IANovaApp

if __name__ == "__main__":
    app = IANovaApp()
    sys.exit(app.run())
```

### 7.3 Execução e Testes
Para executar a IA NOVA:

1. Certifique-se de que o Ollama está em execução:
```bash
ollama serve
```

2. Em outro terminal, ative o ambiente virtual e execute a aplicação:
```bash
# Ative o ambiente virtual
source venv/bin/activate  # ou venv\Scripts\activate no Windows

# Execute a aplicação
python run.py
```

## Próximos Passos e Personalização

1. **Personalização do Avatar**: Substitua a imagem padrão do avatar pelo modelo fornecido
2. **Configuração de APIs Externas**: Configure as chaves de API para comunicação com outras IAs
3. **Expansão da Base de Conhecimento**: Adicione mais dados ao banco de conhecimento
4. **Melhoria das Expressões Faciais**: Implemente expressões faciais mais complexas e realistas
5. **Integração com Mais Serviços**: Adicione mais fontes de dados para atualização automática

---

Este guia fornece uma base sólida para o desenvolvimento da IA NOVA no VSCode. Você pode expandir e personalizar cada componente de acordo com suas necessidades específicas.
