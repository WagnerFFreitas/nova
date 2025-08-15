# 🤖 NOVA - Assistente Virtual Inteligente

**NOVA** é uma assistente virtual brasileira avançada com sistema de aprendizado contínuo, múltiplos modelos de IA e voz natural feminina. Ela combina o melhor da tecnologia atual com uma interface moderna e intuitiva.

## ✨ Características Principais

- 🧠 **Sistema de Conhecimento Dinâmico** - Aprende continuamente e se atualiza
- 🌐 **16+ Modelos de IA** - GPT-4o, Claude, Gemini, Grok, DeepSeek, Qwen, Kimi e mais
- 🎭 **5 Personalidades** - Amigável, Profissional, Criativa, Analítica, Empática
- 🗣️ **Voz Feminina Natural** - Síntese de voz avançada não-robótica
- 🎨 **Interface Moderna** - Design responsivo com tema escuro/claro
- 📚 **Base de Conhecimento** - RAG, busca semântica e aprendizado web
- 🔄 **Modo Aleatório** - Usa diferentes IAs para respostas variadas
- 💾 **Memória Persistente** - Lembra conversas e conhecimento adquirido

## 🚀 Instalação Rápida

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Visual Studio Code** ([Download](https://code.visualstudio.com/))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone o Repositório

\`\`\`bash
git clone https://github.com/seu-usuario/nova-ai.git
cd nova-ai
\`\`\`

### 2. Instale as Dependências

\`\`\`bash
npm install
# ou
yarn install
# ou
pnpm install
\`\`\`

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
# OpenAI (Obrigatório para GPT-4o, o1-mini)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Anthropic (Opcional para Claude)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google AI (Opcional para Gemini)
GOOGLE_AI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# xAI Grok (Opcional)
XAI_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DeepSeek (Opcional)
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configurações Opcionais
OLLAMA_ENABLED=true  # Para modelos locais
NODE_ENV=development
\`\`\`

### 4. Execute o Projeto

\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

Acesse: **http://localhost:3000**

## 🛠️ Configuração no VS Code

### Extensões Recomendadas

Instale estas extensões para melhor experiência:

\`\`\`json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "yzhang.markdown-all-in-one"
  ]
}
\`\`\`

### Configurações do Workspace

Crie `.vscode/settings.json`:

\`\`\`json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\$$([^)]*)\$$", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\$$([^)]*)\$$", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
\`\`\`

### Snippets Personalizados

Crie `.vscode/nova.code-snippets`:

\`\`\`json
{
  "Nova Component": {
    "prefix": "nova-component",
    "body": [
      "\"use client\"",
      "",
      "import { useState } from \"react\"",
      "import { Button } from \"@/components/ui/button\"",
      "",
      "interface ${1:ComponentName}Props {",
      "  ${2:prop}: ${3:string}",
      "}",
      "",
      "export default function ${1:ComponentName}({ ${2:prop} }: ${1:ComponentName}Props) {",
      "  const [${4:state}, set${4/(.*)/${1:/capitalize}/}] = useState(${5:initialValue})",
      "",
      "  return (",
      "    <div className=\"${6:classes}\">",
      "      $0",
      "    </div>",
      "  )",
      "}"
    ],
    "description": "Cria um componente NOVA básico"
  }
}
\`\`\`

## 🎯 Configuração Inicial

### 1. Primeiro Acesso

1. Abra **http://localhost:3000**
2. Clique no ícone **⚙️** (Configurações)
3. Configure sua personalidade preferida
4. Ative o sistema de conhecimento
5. Teste a voz clicando em **🔊**

### 2. Configurar Voz Natural

A NOVA usa síntese de voz avançada. Para melhor experiência:

#### Opção 1: Voz do Sistema (Padrão)
\`\`\`javascript
// Já configurado automaticamente
// Busca vozes femininas em português
// Ajusta pitch e velocidade para naturalidade
\`\`\`

#### Opção 2: Voz Premium (ElevenLabs)
\`\`\`env
# Adicione ao .env.local
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel (voz feminina natural)
\`\`\`

#### Opção 3: Voz Azure (Microsoft)
\`\`\`env
# Adicione ao .env.local
AZURE_SPEECH_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_SPEECH_REGION=brazilsouth
AZURE_VOICE_NAME=pt-BR-FranciscaNeural  # Voz feminina brasileira
\`\`\`

### 3. Configurar Modelos de IA

#### Modelos Gratuitos (Limitados)
- **GPT-4o Mini** - Versão gratuita do OpenAI
- **Claude Haiku** - Versão gratuita do Anthropic
- **Gemini Flash** - Versão gratuita do Google

#### Modelos Premium (Recomendados)
- **GPT-4o** - Melhor modelo geral
- **Claude 3.5 Sonnet** - Excelente para análise
- **o1-mini** - Especialista em raciocínio
- **Grok-2** - Personalidade única

#### Modelos Locais (Ollama)
\`\`\`bash
# Instalar Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar modelos
ollama pull llama2
ollama pull mistral
ollama pull codellama
ollama pull gemma

# Iniciar servidor
ollama serve
\`\`\`

## 📚 Como Usar

### 1. Conversação Básica

1. **Digite sua mensagem** na caixa de texto
2. **Pressione Enter** ou clique em **Enviar**
3. **NOVA responderá** com texto e voz
4. **Continue a conversa** naturalmente

### 2. Comandos de Voz

- **Clique no 🎤** para ativar reconhecimento de voz
- **Fale naturalmente** em português
- **NOVA transcreverá** automaticamente
- **Clique novamente** para parar

### 3. Sistema de Conhecimento

#### Ensinar NOVA:
\`\`\`
"Ensine sobre inteligência artificial"
"Aprenda sobre desenvolvimento web"
"Pesquise informações sobre Python"
\`\`\`

#### Usar Conhecimento:
1. Ative **"Usar base de conhecimento"** nas configurações
2. NOVA usará conhecimento armazenado nas respostas
3. Veja quais conhecimentos foram utilizados

#### Gerenciar Conhecimento:
1. Clique no ícone **🧠** no header
2. **Busque** conhecimento existente
3. **Adicione** conhecimento manual
4. **Exporte** sua base de dados

### 4. Personalidades

#### Amigável 😊
- Calorosa e descontraída
- Usa emojis e linguagem casual
- Ideal para conversas cotidianas

#### Profissional 💼
- Formal e precisa
- Foco em eficiência
- Perfeita para trabalho

#### Criativa 🎨
- Imaginativa e inspiradora
- Gera ideias inovadoras
- Ótima para brainstorming

#### Analítica 📊
- Lógica e detalhada
- Baseada em dados
- Ideal para análises

#### Empática 💙
- Compreensiva e cuidadosa
- Foco no bem-estar
- Perfeita para apoio emocional

### 5. Modo Aleatório

1. Ative **"Modo Aleatório"** nas configurações
2. NOVA usará um modelo diferente a cada resposta
3. Experimente perspectivas variadas
4. Veja qual modelo foi usado em cada resposta

## 🔧 Configurações Avançadas

### Configurar Voz Natural

#### 1. Configurações Básicas
\`\`\`javascript
// Em components/aria-interface.tsx
const [voiceSpeed, setVoiceSpeed] = useState([1.0])  // Velocidade
const [voicePitch, setVoicePitch] = useState([1.1])  // Tom mais feminino
\`\`\`

#### 2. Voz ElevenLabs (Premium)
\`\`\`typescript
// Criar components/voice/elevenlabs-voice.tsx
import { ElevenLabsVoice } from '@elevenlabs/voice-sdk'

const voice = new ElevenLabsVoice({
  apiKey: process.env.ELEVENLABS_API_KEY,
  voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
  model: 'eleven_multilingual_v2'
})
\`\`\`

#### 3. Voz Azure (Empresarial)
\`\`\`typescript
// Criar components/voice/azure-voice.tsx
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_SPEECH_KEY,
  process.env.AZURE_SPEECH_REGION
)
speechConfig.speechSynthesisVoiceName = 'pt-BR-FranciscaNeural'
\`\`\`

### Personalizar Interface

#### 1. Cores e Tema
\`\`\`css
/* Em app/globals.css */
:root {
  --nova-primary: #00D4FF;    /* Ciano NOVA */
  --nova-secondary: #0099CC;  /* Azul escuro */
  --nova-accent: #66E5FF;     /* Ciano claro */
  --nova-background: #0F172A; /* Fundo escuro */
}
\`\`\`

#### 2. Avatar Personalizado
\`\`\`typescript
// Em components/avatar-display.tsx
// Substitua a URL da imagem do avatar
const avatarUrl = "https://sua-url-personalizada.com/avatar.png"
\`\`\`

#### 3. Adicionar Novos Modelos
\`\`\`typescript
// Em components/advanced-model-selector.tsx
const customModels: ModelInfo[] = [
  {
    id: "seu-modelo",
    name: "Seu Modelo IA",
    type: "cloud",
    description: "Descrição do seu modelo",
    provider: "Seu Provider",
    // ... outras configurações
  }
]
\`\`\`

## 🚨 Solução de Problemas

### Problemas Comuns

#### 1. Voz não funciona
\`\`\`bash
# Verificar permissões do navegador
# Chrome: chrome://settings/content/microphone
# Firefox: about:preferences#privacy

# Testar síntese de voz
console.log(window.speechSynthesis.getVoices())
\`\`\`

#### 2. Modelos não carregam
\`\`\`bash
# Verificar chaves de API
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Testar conexão
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
\`\`\`

#### 3. Ollama não conecta
\`\`\`bash
# Verificar se está rodando
ollama list

# Reiniciar serviço
ollama serve

# Verificar porta
curl http://localhost:11434/api/tags
\`\`\`

#### 4. Erro de build
\`\`\`bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
\`\`\`

### Logs de Debug

#### 1. Ativar logs detalhados
\`\`\`typescript
// Em app/api/chat/route.ts
console.log("🔍 Debug:", {
  model,
  personality,
  knowledgeEnabled,
  messages: messages.length
})
\`\`\`

#### 2. Monitorar performance
\`\`\`typescript
// Em components/aria-interface.tsx
console.time("Response Time")
// ... código da resposta
console.timeEnd("Response Time")
\`\`\`

## 📱 Deploy em Produção

### Vercel (Recomendado)

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
\`\`\`

### Docker

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

\`\`\`bash
# Build e run
docker build -t nova-ai .
docker run -p 3000:3000 nova-ai
\`\`\`

### Netlify

\`\`\`bash
# Build command
npm run build

# Publish directory
out

# Environment variables
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
\`\`\`

## 🔐 Segurança e Privacidade

### Configurações de Segurança

#### 1. Variáveis de Ambiente
\`\`\`env
# Nunca commite chaves de API
# Use .env.local para desenvolvimento
# Configure no painel do provedor para produção
\`\`\`

#### 2. Validação de Input
\`\`\`typescript
// Sanitizar entradas do usuário
const sanitizeInput = (input: string) => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}
\`\`\`

#### 3. Rate Limiting
\`\`\`typescript
// Implementar limite de requisições
const rateLimiter = {
  requests: new Map(),
  limit: 60, // 60 requests per minute
  window: 60000 // 1 minute
}
\`\`\`

### Privacidade dos Dados

- **Conversas**: Armazenadas localmente no navegador
- **Conhecimento**: Salvo no localStorage
- **APIs**: Apenas metadados são enviados
- **Voz**: Processada localmente quando possível

## 🤝 Contribuindo

### Como Contribuir

1. **Fork** o repositório
2. **Crie** uma branch: `git checkout -b feature/nova-feature`
3. **Commit** suas mudanças: `git commit -m 'Add nova feature'`
4. **Push** para a branch: `git push origin feature/nova-feature`
5. **Abra** um Pull Request

### Estrutura do Projeto

\`\`\`
nova-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # Estilos globais
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── aria-interface.tsx # Interface principal
│   ├── knowledge-system.tsx # Sistema de conhecimento
│   └── ...               # Outros componentes
├── lib/                  # Utilitários
├── public/              # Arquivos estáticos
├── .env.local          # Variáveis de ambiente
├── README.md           # Este arquivo
└── package.json        # Dependências
\`\`\`

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

### Documentação
- **GitHub**: [github.com/seu-usuario/nova-ai](https://github.com/seu-usuario/nova-ai)
- **Wiki**: [github.com/seu-usuario/nova-ai/wiki](https://github.com/seu-usuario/nova-ai/wiki)

### Comunidade
- **Discord**: [discord.gg/nova-ai](https://discord.gg/nova-ai)
- **Telegram**: [@nova_ai_brasil](https://t.me/nova_ai_brasil)

### Issues
- **Bug Reports**: [github.com/seu-usuario/nova-ai/issues](https://github.com/seu-usuario/nova-ai/issues)
- **Feature Requests**: [github.com/seu-usuario/nova-ai/discussions](https://github.com/seu-usuario/nova-ai/discussions)

---

**Desenvolvido com ❤️ para a comunidade brasileira de IA**

*NOVA - Sua assistente virtual inteligente que aprende e evolui com você!*
