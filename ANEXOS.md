# 📎 Sistema de Anexos NOVA

## 🎯 Visão Geral

O sistema de anexos da NOVA permite upload, análise e processamento inteligente de diferentes tipos de arquivo, incluindo imagens, documentos, áudio e vídeo.

## 🚀 Funcionalidades

### 📤 Upload de Arquivos
- **Drag & Drop**: Arraste arquivos diretamente para a interface
- **Seleção Manual**: Botão para escolher arquivos do dispositivo
- **Captura de Câmera**: Tire fotos instantâneas usando a webcam
- **Gravação de Áudio**: Grave áudio diretamente no navegador
- **Validação Automática**: Verificação de tipo e tamanho de arquivo

### 🔍 Análise Inteligente

#### 📷 Imagens
- **GPT-4 Vision**: Análise detalhada do conteúdo visual
- **Descrição Completa**: Objetos, pessoas, cores, ambiente, emoções
- **Texto OCR**: Extração de texto visível na imagem
- **Contexto**: Interpretação do significado e contexto da imagem

#### 📄 Documentos
- **PDF**: Extração completa de texto usando PDF.js
- **Word**: Suporte básico para documentos .doc/.docx
- **Texto**: Processamento direto de arquivos .txt
- **Análise de Conteúdo**: Resumo automático e identificação de tópicos
- **Estatísticas**: Contagem de palavras, caracteres e páginas

#### 🎵 Áudio
- **Whisper AI**: Transcrição precisa usando OpenAI Whisper
- **Múltiplos Idiomas**: Suporte para português e outros idiomas
- **Segmentação**: Divisão por timestamps para navegação
- **Análise de Conteúdo**: Resumo e análise do conteúdo transcrito
- **Metadados**: Duração, formato e qualidade do áudio

### 🎨 Interface do Usuário

#### 📱 Responsiva
- **Mobile First**: Otimizada para dispositivos móveis
- **Desktop**: Interface expandida para telas maiores
- **Touch Friendly**: Botões e controles otimizados para touch

#### 🎭 Visual
- **Preview**: Visualização prévia de imagens
- **Ícones Coloridos**: Identificação visual por tipo de arquivo
- **Progresso Animado**: Barras de progresso em tempo real
- **Status Inteligente**: Estados visuais claros (enviando, analisando, completo)

## 📋 Tipos de Arquivo Suportados

### 📷 Imagens
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

### 📄 Documentos
- **PDF** (.pdf)
- **Word** (.doc, .docx)
- **Texto** (.txt)

### 🎵 Áudio
- **MP3** (.mp3)
- **WAV** (.wav)
- **M4A** (.m4a)
- **OGG** (.ogg)
- **WebM Audio** (.webm)

### 🎥 Vídeo
- **MP4** (.mp4)
- **AVI** (.avi)
- **MOV** (.mov)
- **WebM** (.webm)

## ⚙️ Configuração

### 🔑 Variáveis de Ambiente
\`\`\`env
# Obrigatório para análise completa
OPENAI_API_KEY=sk-proj-xxx

# Opcional para voz premium
ELEVENLABS_API_KEY=xxx
AZURE_SPEECH_KEY=xxx
AZURE_SPEECH_REGION=xxx
\`\`\`

### 📏 Limites
- **Tamanho Máximo**: 25MB por arquivo
- **Arquivos Simultâneos**: 5 arquivos por vez
- **Tipos Aceitos**: Apenas tipos suportados listados acima

## 🔧 APIs Internas

### 📷 `/api/analyze/image`
- **Método**: POST
- **Input**: FormData com arquivo de imagem
- **Output**: Análise detalhada via GPT-4 Vision
- **Recursos**: Descrição, objetos, texto, contexto

### 📄 `/api/analyze/document`
- **Método**: POST
- **Input**: FormData com documento
- **Output**: Texto extraído e análise de conteúdo
- **Recursos**: PDF parsing, resumo automático, estatísticas

### 🎵 `/api/analyze/audio`
- **Método**: POST
- **Input**: FormData com arquivo de áudio
- **Output**: Transcrição e análise de conteúdo
- **Recursos**: Whisper AI, segmentação, análise semântica

## 🎯 Fluxo de Uso

1. **Upload**: Usuário seleciona ou arrasta arquivos
2. **Validação**: Sistema verifica tipo e tamanho
3. **Processamento**: Upload com barra de progresso
4. **Análise**: IA analisa o conteúdo automaticamente
5. **Resultado**: Análise disponível para o chat
6. **Integração**: Contexto incluído nas conversas

## 🔒 Segurança

- **Validação de Tipo**: Apenas tipos permitidos
- **Limite de Tamanho**: Proteção contra uploads grandes
- **Sanitização**: Limpeza de nomes de arquivo
- **Rate Limiting**: Controle de frequência de uploads
- **Temporary Storage**: Arquivos não são armazenados permanentemente

## 🚀 Performance

- **Processamento Assíncrono**: Upload e análise em paralelo
- **Otimização de Imagem**: Compressão automática quando necessário
- **Cache**: Resultados de análise podem ser cacheados
- **Streaming**: Processamento em chunks para arquivos grandes

## 🐛 Tratamento de Erros

- **Tipo Inválido**: Mensagem clara sobre tipos aceitos
- **Tamanho Excedido**: Aviso sobre limite de tamanho
- **Falha na Análise**: Fallback para informações básicas
- **Timeout**: Retry automático com backoff exponencial
- **API Indisponível**: Mensagem de erro amigável

## 📊 Monitoramento

- **Logs Detalhados**: Registro de uploads e análises
- **Métricas**: Tempo de processamento e taxa de sucesso
- **Alertas**: Notificação de falhas críticas
- **Analytics**: Tipos de arquivo mais utilizados

## 🔄 Atualizações Futuras

- **Mais Formatos**: Suporte para PowerPoint, Excel
- **OCR Avançado**: Reconhecimento de texto em imagens
- **Análise de Vídeo**: Transcrição e análise de conteúdo visual
- **Batch Processing**: Upload múltiplo otimizado
- **Cloud Storage**: Integração com serviços de armazenamento
