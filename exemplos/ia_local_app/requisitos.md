# Requisitos para a IA NOVA

## Requisitos de Hardware

Com base nas pesquisas realizadas, estes são os requisitos de hardware recomendados para executar modelos de IA local como Llama 3:

### Requisitos Mínimos
- **CPU**: 8 núcleos
- **RAM**: 16 GB (para modelos menores como Llama 3 8B)
- **Armazenamento**: 20 GB de espaço livre
- **GPU**: Opcional, mas recomendado para melhor desempenho (NVIDIA série 1000 ou superior)

### Requisitos Recomendados
- **CPU**: 12+ núcleos
- **RAM**: 32 GB ou mais
- **Armazenamento**: 100 GB de espaço livre
- **GPU**: NVIDIA série 3000 ou superior com pelo menos 8 GB de VRAM

### Requisitos por Tamanho de Modelo
- Modelo de 1B parâmetros: ~2GB de memória
- Modelo de 3B parâmetros: ~6GB de memória
- Modelo de 7B parâmetros: ~14GB de memória
- Modelo de 70B parâmetros: ~140GB de memória

## Requisitos de Software

### Sistema Operacional
- Windows 10/11
- macOS 11 ou superior
- Linux (Ubuntu 20.04 ou superior recomendado)

### Software Necessário
- Python 3.8 ou superior
- Visual Studio Code
- Git

### Bibliotecas e Frameworks
- Ollama ou GPT4ALL para execução de modelos de IA local
- MediaPipe para detecção e animação facial
- Flask ou FastAPI para criar servidor web local
- SQLite ou outro banco de dados para armazenamento local
- Bibliotecas Python para interface gráfica (PyQt, Tkinter ou web-based)

## Requisitos Funcionais da IA NOVA

1. **Execução Local de IA**: Capacidade de executar modelos de linguagem grandes (LLMs) localmente
2. **Interface Gráfica com Avatar**: Interface com avatar digital que exibe expressões faciais
3. **Atualização Automática de Dados**: Sistema para atualizar o banco de dados automaticamente via internet
4. **Comunicação com Outras IAs**: Capacidade de interagir com outras IAs
5. **Comunicação com Desenvolvedor**: Sistema para enviar e receber atualizações do desenvolvedor
6. **Integração com VSCode**: Funcionamento completo dentro do ambiente VSCode
