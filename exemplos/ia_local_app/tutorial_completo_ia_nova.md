# Tutorial Completo para Desenvolvimento da IA NOVA no VSCode

## Introdução

Este tutorial completo irá guiá-lo no desenvolvimento da IA NOVA, uma aplicação de inteligência artificial local com interface facial animada, sistema de atualização automática de dados e capacidade de interação com outras IAs. A IA NOVA é projetada para ser executada localmente em seu computador, oferecendo privacidade e controle total sobre seus dados.

## Índice

1. [Visão Geral da IA NOVA](#1-visão-geral-da-ia-nova)
2. [Requisitos de Sistema](#2-requisitos-de-sistema)
3. [Configuração do Ambiente de Desenvolvimento](#3-configuração-do-ambiente-de-desenvolvimento)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Implementação da Interface Gráfica com Expressões Faciais](#5-implementação-da-interface-gráfica-com-expressões-faciais)
6. [Implementação do Sistema de Atualização Automática](#6-implementação-do-sistema-de-atualização-automática)
7. [Implementação do Sistema de Comunicação com Outras IAs](#7-implementação-do-sistema-de-comunicação-com-outras-ias)
8. [Integração dos Componentes](#8-integração-dos-componentes)
9. [Testes e Depuração](#9-testes-e-depuração)
10. [Implantação e Uso](#10-implantação-e-uso)
11. [Personalização e Extensão](#11-personalização-e-extensão)
12. [Solução de Problemas Comuns](#12-solução-de-problemas-comuns)

## 1. Visão Geral da IA NOVA

A IA NOVA é uma aplicação de inteligência artificial local com as seguintes características:

- **Interface Gráfica com Avatar**: Interface visual com um avatar digital que exibe expressões faciais baseadas no contexto da interação.
- **Execução Local de IA**: Utiliza modelos de linguagem grandes (LLMs) como Llama 3 através do Ollama para processamento local.
- **Atualização Automática de Dados**: Sistema para atualizar o banco de dados automaticamente via internet.
- **Comunicação com Outras IAs**: Capacidade de interagir com outras IAs como OpenAI, Hugging Face, Anthropic, Google Gemini, etc.
- **Comunicação com Desenvolvedor**: Sistema para enviar e receber atualizações do desenvolvedor.
- **Integração com VSCode**: Desenvolvimento completo dentro do ambiente VSCode.

## 2. Requisitos de Sistema

### Requisitos de Hardware

#### Requisitos Mínimos
- **CPU**: 8 núcleos
- **RAM**: 16 GB (para modelos menores como Llama 3 8B)
- **Armazenamento**: 20 GB de espaço livre
- **GPU**: Opcional, mas recomendado para melhor desempenho (NVIDIA série 1000 ou superior)

#### Requisitos Recomendados
- **CPU**: 12+ núcleos
- **RAM**: 32 GB ou mais
- **Armazenamento**: 100 GB de espaço livre
- **GPU**: NVIDIA série 3000 ou superior com pelo menos 8 GB de VRAM

### Requisitos de Software

- **Sistema Operacional**: Windows 10/11, macOS 11 ou superior, ou Linux (Ubuntu 20.04 ou superior recomendado)
- **Python**: Versão 3.8 ou superior
- **Visual Studio Code**: Última versão estável
- **Git**: Para controle de versão e download de dependências

## 3. Configuração do Ambiente de Desenvolvimento

### 3.1 Instalação do Python

#### Windows
1. Baixe o instalador do [site oficial do Python](https://www.python.org/downloads/)
2. Execute o instalador e marque a opção "Add Python to PATH"
3. Clique em "Install Now"

#### macOS
```bash
brew install python
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### 3.2 Instalação do Visual Studio Code

1. Baixe o instalador do [site oficial do VSCode](https://code.visualstudio.com/)
2. Execute o instalador e siga as instruções

### 3.3 Instalação do Git

#### Windows
1. Baixe o instalador do [site oficial do Git](https://git-scm.com/download/win)
2. Execute o instalador e siga as instruções

#### macOS
```bash
brew install git
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install git
```

### 3.4 Instalação do Ollama

#### Windows
1. Baixe o instalador do [site oficial do Ollama](https://ollama.ai/download)
2. Execute o instalador e siga as instruções

#### macOS
```bash
brew install ollama
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 3.5 Configuração do VSCode

1. Abra o VSCode
2. Instale as seguintes extensões:
   - Python (Microsoft)
   - Python Extension Pack
   - Pylance
   - SQLite Viewer
   - Live Server (para desenvolvimento web)
   - Jupyter (para notebooks interativos)

## 4. Estrutura do Projeto

### 4.1 Criação do Projeto

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

# Instale as dependências básicas
pip install numpy pandas matplotlib flask requests PyQt5 mediapipe opencv-python
```

### 4.2 Estrutura de Diretórios

Crie a seguinte estrutura de diretórios:

```
ia_nova/
├── venv/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── interface_facial.py
│   ├── atualizacao_automatica.py
│   ├── comunicacao_ia.py
│   └── config.py
├── data/
│   └── nova.db
├── models/
│   └── face_model/
├── static/
│   ├── images/
│   │   └── avatar.png
│   └── css/
├── tests/
│   ├── __init__.py
│   ├── test_interface.py
│   ├── test_atualizacao.py
│   └── test_comunicacao.py
└── README.md
```

### 4.3 Arquivo de Configuração

Crie o arquivo `app/config.py`:

```python
"""
Configurações para a IA NOVA
"""

import os

# Diretórios
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
STATIC_DIR = os.path.join(BASE_DIR, "static")
IMAGES_DIR = os.path.join(STATIC_DIR, "images")

# Banco de dados
DATABASE_PATH = os.path.join(DATA_DIR, "nova.db")

# Avatar
AVATAR_IMAGE_PATH = os.path.join(IMAGES_DIR, "avatar.png")

# Ollama
OLLAMA_API_URL = "http://localhost:11434/api"
DEFAULT_MODEL = "llama3"

# Atualizações
DEFAULT_UPDATE_INTERVAL = 3600  # 1 hora em segundos

# Comunicação com desenvolvedor
DEVELOPER_ENDPOINT = "https://api.example.com/developer"

# Versão
VERSION = "1.0.0"
```

## 5. Implementação da Interface Gráfica com Expressões Faciais

### 5.1 Instalação das Dependências

```bash
pip install mediapipe opencv-python PyQt5
```

### 5.2 Implementação do Módulo de Interface Facial

Crie o arquivo `app/interface_facial.py` com o código fornecido anteriormente. Este módulo implementa:

- `FacialExpressionEngine`: Motor de expressões faciais que gerencia as animações do avatar
- `InputThread`: Thread para processar entrada do usuário sem bloquear a interface
- `IANovaInterface`: Interface principal da IA NOVA

### 5.3 Personalização do Avatar

Para usar o avatar fornecido:

1. Copie a imagem do avatar para o diretório `static/images/`
2. Renomeie-a para `avatar.png` ou atualize o caminho no código

### 5.4 Teste da Interface Facial

Crie um arquivo `tests/test_interface.py`:

```python
"""
Testes para o módulo de interface facial
"""

import sys
import os
import unittest
from PyQt5.QtWidgets import QApplication

# Adiciona o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.interface_facial import FacialExpressionEngine, IANovaInterface

class TestInterfaceFacial(unittest.TestCase):
    """Testes para o módulo de interface facial"""
    
    def setUp(self):
        """Configuração para os testes"""
        self.app = QApplication([])
        self.engine = FacialExpressionEngine()
    
    def test_facial_engine_initialization(self):
        """Testa a inicialização do motor de expressões faciais"""
        self.assertIsNotNone(self.engine)
        self.assertEqual(self.engine.current_expression, "neutral")
    
    def test_set_expression(self):
        """Testa a definição de expressões faciais"""
        self.engine.set_expression("happy")
        self.assertEqual(self.engine.target_expression, "happy")
        
        self.engine.set_expression("sad")
        self.assertEqual(self.engine.target_expression, "sad")
        
        # Expressão inválida não deve alterar o alvo
        self.engine.set_expression("invalid_expression")
        self.assertEqual(self.engine.target_expression, "sad")
    
    def test_get_avatar_frame(self):
        """Testa a obtenção do frame do avatar"""
        frame = self.engine.get_avatar_frame()
        self.assertIsNotNone(frame)
        self.assertTrue(frame.shape[0] > 0)  # Altura
        self.assertTrue(frame.shape[1] > 0)  # Largura
        self.assertTrue(frame.shape[2] == 3)  # Canais (RGB)

if __name__ == "__main__":
    unittest.main()
```

## 6. Implementação do Sistema de Atualização Automática

### 6.1 Instalação das Dependências

```bash
pip install requests sqlite3
```

### 6.2 Implementação do Módulo de Atualização Automática

Crie o arquivo `app/atualizacao_automatica.py` com o código fornecido anteriormente. Este módulo implementa:

- `Database`: Gerencia o banco de dados da IA NOVA
- `Updater`: Sistema de atualização automática para a IA NOVA
- `DeveloperCommunication`: Sistema de comunicação com o desenvolvedor

### 6.3 Inicialização do Banco de Dados

Crie o diretório `data` e inicialize o banco de dados:

```bash
mkdir -p data
```

### 6.4 Teste do Sistema de Atualização Automática

Crie um arquivo `tests/test_atualizacao.py`:

```python
"""
Testes para o módulo de atualização automática
"""

import sys
import os
import unittest
import tempfile
import shutil

# Adiciona o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.atualizacao_automatica import Database, Updater, DeveloperCommunication

class TestAtualizacaoAutomatica(unittest.TestCase):
    """Testes para o módulo de atualização automática"""
    
    def setUp(self):
        """Configuração para os testes"""
        # Cria um diretório temporário para os testes
        self.test_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.test_dir, "test.db")
        self.db = Database(self.db_path)
    
    def tearDown(self):
        """Limpeza após os testes"""
        self.db.close()
        shutil.rmtree(self.test_dir)
    
    def test_database_initialization(self):
        """Testa a inicialização do banco de dados"""
        # Verifica se as tabelas foram criadas
        self.db.cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in self.db.cursor.fetchall()]
        
        expected_tables = [
            "knowledge", "updates", "interactions", 
            "settings", "data_sources", "ai_communications"
        ]
        
        for table in expected_tables:
            self.assertIn(table, tables)
    
    def test_add_knowledge(self):
        """Testa a adição de conhecimento"""
        self.db.add_knowledge("test_topic", "test_content", "test_source")
        
        self.db.cursor.execute("SELECT * FROM knowledge WHERE topic = ?", ("test_topic",))
        result = self.db.cursor.fetchone()
        
        self.assertIsNotNone(result)
        self.assertEqual(result[1], "test_topic")
        self.assertEqual(result[2], "test_content")
        self.assertEqual(result[3], "test_source")
    
    def test_updater_initialization(self):
        """Testa a inicialização do sistema de atualização"""
        updater = Updater(self.db)
        
        # Verifica se as fontes de dados padrão foram adicionadas
        self.db.cursor.execute("SELECT COUNT(*) FROM data_sources")
        count = self.db.cursor.fetchone()[0]
        
        self.assertTrue(count >= 3)  # Pelo menos 3 fontes padrão

if __name__ == "__main__":
    unittest.main()
```

## 7. Implementação do Sistema de Comunicação com Outras IAs

### 7.1 Instalação das Dependências

```bash
pip install requests
```

### 7.2 Implementação do Módulo de Comunicação com Outras IAs

Crie o arquivo `app/comunicacao_ia.py` com o código fornecido anteriormente. Este módulo implementa:

- `AIComm`: Sistema de comunicação com outras IAs
- `AIIntegrationManager`: Gerenciador de integração com outras IAs

### 7.3 Configuração das Chaves de API

Para usar serviços externos, você precisará configurar as chaves de API:

1. Obtenha chaves de API dos serviços desejados (OpenAI, Hugging Face, etc.)
2. Adicione-as ao banco de dados usando o método `set_api_key`

### 7.4 Teste do Sistema de Comunicação com Outras IAs

Crie um arquivo `tests/test_comunicacao.py`:

```python
"""
Testes para o módulo de comunicação com outras IAs
"""

import sys
import os
import unittest
import tempfile
import shutil

# Adiciona o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.atualizacao_automatica import Database
from app.comunicacao_ia import AIComm, AIIntegrationManager

class TestComunicacaoIA(unittest.TestCase):
    """Testes para o módulo de comunicação com outras IAs"""
    
    def setUp(self):
        """Configuração para os testes"""
        # Cria um diretório temporário para os testes
        self.test_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.test_dir, "test.db")
        self.db = Database(self.db_path)
        self.ai_comm = AIComm(self.db)
    
    def tearDown(self):
        """Limpeza após os testes"""
        self.db.close()
        shutil.rmtree(self.test_dir)
    
    def test_ai_comm_initialization(self):
        """Testa a inicialização do sistema de comunicação com outras IAs"""
        self.assertIsNotNone(self.ai_comm)
        
        # Verifica se os endpoints padrão foram configurados
        expected_endpoints = [
            "openai", "huggingface", "anthropic", 
            "gemini", "ollama_local", "custom_ia"
        ]
        
        for endpoint in expected_endpoints:
            self.assertIn(endpoint, self.ai_comm.api_endpoints)
    
    def test_set_api_key(self):
        """Testa a definição de chaves de API"""
        self.ai_comm.set_api_key("openai", "test_key")
        
        # Verifica se a chave foi armazenada
        self.assertEqual(self.ai_comm.api_keys["openai"], "test_key")
        
        # Verifica se a chave foi salva no banco de dados
        self.db.cursor.execute("SELECT value FROM settings WHERE key = ?", ("api_key_openai",))
        result = self.db.cursor.fetchone()
        
        self.assertIsNotNone(result)
        self.assertEqual(result[0], "test_key")
    
    def test_integration_manager(self):
        """Testa o gerenciador de integração"""
        integration_manager = AIIntegrationManager(self.db, self.ai_comm)
        
        # Adiciona uma integração de teste
        integration_id = integration_manager.add_integration(
            "test_ai", "https://api.example.com/test_ai", "test_key"
        )
        
        # Verifica se a integração foi adicionada
        self.assertIsNotNone(integration_id)
        self.assertIn("test_ai", integration_manager.active_integrations)

if __name__ == "__main__":
    unittest.main()
```

## 8. Integração dos Componentes

### 8.1 Implementação do Módulo Principal

Crie o arquivo `app/main.py`:

```python
"""
Módulo principal da IA NOVA
"""

import sys
import os
import logging
from PyQt5.QtWidgets import QApplication

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("nova.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("NOVA_Main")

# Importa os módulos da aplicação
from interface_facial import IANovaInterface, FacialExpressionEngine
from atualizacao_automatica import Database, Updater, DeveloperCommunication
from comunicacao_ia import AIComm, AIIntegrationManager
import config

class IANova:
    """Classe principal da IA NOVA"""
    
    def __init__(self):
        """Inicializa a IA NOVA"""
        logger.info("Inicializando IA NOVA...")
        
        # Garante que os diretórios necessários existem
        os.makedirs(config.DATA_DIR, exist_ok=True)
        os.makedirs(config.MODELS_DIR, exist_ok=True)
        os.makedirs(config.IMAGES_DIR, exist_ok=True)
        
        # Inicializa o banco de dados
        self.database = Database(config.DATABASE_PATH)
        
        # Inicializa o sistema de atualização
        self.updater = Updater(self.database, config.DEFAULT_UPDATE_INTERVAL)
        
        # Inicializa o sistema de comunicação com o desenvolvedor
        self.dev_comm = DeveloperCommunication(self.database, config.DEVELOPER_ENDPOINT)
        
        # Inicializa o sistema de comunicação com outras IAs
        self.ai_comm = AIComm(self.database)
        
        # Inicializa o gerenciador de integração
        self.integration_manager = AIIntegrationManager(self.database, self.ai_comm)
        
        # Inicializa a aplicação Qt
        self.app = QApplication(sys.argv)
        
        # Inicializa a interface gráfica
        self.interface = IANovaInterface(config.AVATAR_IMAGE_PATH)
        
        # Conecta os sinais
        self._connect_signals()
        
        logger.info("IA NOVA inicializada com sucesso")
    
    def _connect_signals(self):
        """Conecta os sinais entre os componentes"""
        # Implementar conexões entre componentes aqui
        pass
    
    def start(self):
        """Inicia a IA NOVA"""
        logger.info("Iniciando IA NOVA...")
        
        # Inicia o sistema de atualização
        self.updater.start()
        
        # Exibe a interface gráfica
        self.interface.show()
        
        # Envia estatísticas de uso para o desenvolvedor
        self.dev_comm.send_usage_statistics({
            "event": "startup",
            "version": config.VERSION
        })
        
        # Executa a aplicação Qt
        return self.app.exec_()
    
    def stop(self):
        """Para a IA NOVA"""
        logger.info("Parando IA NOVA...")
        
        # Para o sistema de atualização
        self.updater.stop()
        
        # Fecha o banco de dados
        self.database.close()
        
        # Envia estatísticas de uso para o desenvolvedor
        self.dev_comm.send_usage_statistics({
            "event": "shutdown",
            "version": config.VERSION
        })
        
        logger.info("IA NOVA parada com sucesso")


def main():
    """Função principal"""
    try:
        # Inicializa a IA NOVA
        nova = IANova()
        
        # Inicia a IA NOVA
        sys.exit(nova.start())
    except Exception as e:
        logger.error(f"Erro ao iniciar IA NOVA: {e}")
        sys.exit(1)
    finally:
        # Garante que a IA NOVA é parada corretamente
        if 'nova' in locals():
            nova.stop()


if __name__ == "__main__":
    main()
```

### 8.2 Arquivo de Inicialização

Crie um arquivo `run.py` na raiz do projeto:

```python
"""
Script de inicialização da IA NOVA
"""

import os
import sys

# Adiciona o diretório do projeto ao PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import main

if __name__ == "__main__":
    main()
```

## 9. Testes e Depuração

### 9.1 Execução dos Testes

```bash
# Ative o ambiente virtual
source venv/bin/activate  # ou venv\Scripts\activate no Windows

# Execute os testes
python -m unittest discover tests
```

### 9.2 Depuração no VSCode

1. Abra o projeto no VSCode
2. Crie um arquivo `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: IA NOVA",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/run.py",
            "console": "integratedTerminal",
            "justMyCode": false
        },
        {
            "name": "Python: Testes",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/tests",
            "args": [
                "-m",
                "unittest",
                "discover"
            ],
            "console": "integratedTerminal",
            "justMyCode": false
        }
    ]
}
```

3. Use o menu de depuração do VSCode para iniciar a aplicação ou executar os testes

## 10. Implantação e Uso

### 10.1 Preparação para Implantação

```bash
# Crie um arquivo requirements.txt
pip freeze > requirements.txt
```

### 10.2 Execução da IA NOVA

```bash
# Ative o ambiente virtual
source venv/bin/activate  # ou venv\Scripts\activate no Windows

# Inicie o serviço Ollama
ollama serve

# Em outro terminal, execute a IA NOVA
python run.py
```

### 10.3 Criação de um Executável

Para criar um executável para distribuição:

```bash
# Instale o PyInstaller
pip install pyinstaller

# Crie o executável
pyinstaller --onefile --windowed --add-data "static;static" --add-data "models;models" run.py
```

O executável será criado no diretório `dist/`.

## 11. Personalização e Extensão

### 11.1 Personalização do Avatar

Para personalizar o avatar:

1. Substitua o arquivo `static/images/avatar.png` pela imagem desejada
2. Ajuste os pontos de referência no código `interface_facial.py` para corresponder à nova imagem

### 11.2 Adição de Novas Expressões Faciais

Para adicionar novas expressões faciais:

1. Adicione um novo método na classe `FacialExpressionEngine` em `interface_facial.py`
2. Adicione a nova expressão ao dicionário `expressions`
3. Implemente a lógica para detectar quando usar a nova expressão

### 11.3 Integração com Novos Serviços de IA

Para integrar com novos serviços de IA:

1. Adicione o novo endpoint ao dicionário `api_endpoints` na classe `AIComm` em `comunicacao_ia.py`
2. Implemente um método `_query_new_service` para fazer a chamada à API
3. Atualize o método `query_external_ia` para usar o novo método

## 12. Solução de Problemas Comuns

### 12.1 Problemas de Instalação

#### Erro ao instalar dependências

```
Problema: Erro ao instalar pacotes como mediapipe ou opencv-python
Solução: Verifique se você tem as ferramentas de compilação necessárias instaladas:
- Windows: Visual C++ Build Tools
- Linux: build-essential, python3-dev
- macOS: Xcode Command Line Tools
```

#### Erro ao iniciar o Ollama

```
Problema: Erro "Failed to connect to Ollama server"
Solução: 
1. Verifique se o serviço Ollama está em execução: ollama serve
2. Verifique se o endpoint está correto em config.py
3. Verifique se não há firewall bloqueando a conexão
```

### 12.2 Problemas de Execução

#### Interface gráfica não exibe o avatar

```
Problema: A interface abre, mas o avatar não é exibido
Solução:
1. Verifique se o arquivo do avatar existe em static/images/avatar.png
2. Verifique se o caminho está correto em config.py
3. Verifique os logs para erros relacionados ao carregamento da imagem
```

#### Erro de comunicação com outras IAs

```
Problema: Erro ao comunicar com serviços externos de IA
Solução:
1. Verifique se as chaves de API estão configuradas corretamente
2. Verifique sua conexão com a internet
3. Verifique se os endpoints estão corretos e acessíveis
```

### 12.3 Problemas de Desempenho

#### Alto uso de memória

```
Problema: A aplicação consome muita memória
Solução:
1. Use um modelo de IA menor (ex: llama3:8b em vez de llama3)
2. Ajuste os parâmetros de geração para limitar o uso de tokens
3. Implemente liberação de memória quando a interface estiver inativa
```

#### Lentidão na interface

```
Problema: A interface gráfica está lenta ou travando
Solução:
1. Reduza a resolução do avatar
2. Diminua a taxa de atualização da interface (FPS)
3. Execute operações pesadas em threads separadas
```

## Conclusão

Parabéns! Você agora tem uma IA NOVA completa e funcional, com interface facial animada, sistema de atualização automática e capacidade de comunicação com outras IAs. Este tutorial forneceu um guia abrangente para o desenvolvimento da aplicação no VSCode, desde a configuração do ambiente até a implementação de todos os componentes principais.

A IA NOVA é altamente personalizável e extensível, permitindo que você adapte suas funcionalidades de acordo com suas necessidades específicas. Você pode adicionar novas expressões faciais, integrar com mais serviços de IA, ou expandir o sistema de atualização automática para incluir mais fontes de dados.

Lembre-se de manter suas chaves de API seguras e de respeitar os termos de serviço dos provedores de IA externos. Divirta-se explorando as possibilidades da sua nova assistente de IA local!
