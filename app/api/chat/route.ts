import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Configuração do Ollama
const OLLAMA_BASE_URL = "http://localhost:11434"

// Lista de modelos locais suportados
const LOCAL_MODELS = [
  "llama3",
  "llama3:8b", 
  "llama3:70b",
  "mistral",
  "mistral:7b",
  "mistral:7b-instruct",
  "mistral:7b-instruct-q4_K_M",
  "phi3",
  "phi3:mini",
  "gemma",
  "gemma:2b",
  "codellama",
  "neural-chat",
  "dolphin-mistral"
]

// Função para verificar se o Ollama está disponível
async function checkOllamaAvailability() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos timeout

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { available: false, models: [], error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    return {
      available: true,
      models: data.models?.map((model: any) => model.name) || [],
      error: null,
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return { available: false, models: [], error: "Timeout - Ollama não respondeu" }
    }
    return { available: false, models: [], error: error.message }
  }
}

// Função para gerar resposta com Ollama
async function generateOllamaResponse(messages: any[], model: string, systemPrompt: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos para geração

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`)
    }

    // Criar stream de resposta compatível
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split("\n").filter((line) => line.trim())

            for (const line of lines) {
              try {
                const data = JSON.parse(line)
                if (data.message?.content) {
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: {"type":"text-delta","textDelta":"${data.message.content.replace(/"/g, '\\"')}"}\n\n`
                    )
                  )
                }
                if (data.done) {
                  controller.enqueue(new TextEncoder().encode('data: {"type":"finish"}\n\n'))
                  controller.close()
                  return
                }
              } catch (parseError) {
                // Ignora linhas que não são JSON válido
                continue
              }
            }
          }
        } catch (error) {
          console.error("Erro no stream do Ollama:", error)
          controller.error(error)
        } finally {
          reader.releaseLock()
        }

        controller.enqueue(new TextEncoder().encode('data: {"type":"finish"}\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Model-Used": model,
        "X-Model-Type": "ollama-local",
      },
    })
  } catch (error: any) {
    console.error("Erro ao gerar resposta com Ollama:", error)
    throw new Error(`Ollama error: ${error.message}`)
  }
}

// Função para buscar na base de conhecimento
function searchKnowledgeBase(query: string) {
  const mockKnowledge = [
    {
      title: "Informações sobre IA",
      content: "Inteligência Artificial é um campo da ciência da computação que se concentra na criação de sistemas capazes de realizar tarefas que normalmente requerem inteligência humana.",
      relevance: 0.9,
    },
    {
      title: "Ollama Local",
      content: "Ollama é uma ferramenta que permite executar modelos de linguagem grandes (LLMs) localmente em seu computador, garantindo privacidade total dos dados.",
      relevance: 0.8,
    },
  ]

  return mockKnowledge
    .filter(
      (item) =>
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3)
}

// Função para construir o prompt do sistema
function buildSystemPrompt(personality: string, knowledgeEnabled: boolean, learningMode: boolean, messages: any[]) {
  const personalityPrompts = {
    friendly: "Você é NOVA, uma assistente virtual brasileira amigável, calorosa e descontraída. Use emojis ocasionalmente e linguagem casual. Seja prestativa e otimista.",
    professional: "Você é NOVA, uma assistente virtual brasileira profissional, formal e precisa. Foque em eficiência e clareza nas respostas.",
    creative: "Você é NOVA, uma assistente virtual brasileira criativa, imaginativa e inspiradora. Gere ideias inovadoras e pense fora da caixa.",
    analytical: "Você é NOVA, uma assistente virtual brasileira analítica, lógica e detalhada. Base suas respostas em dados e raciocínio estruturado.",
    empathetic: "Você é NOVA, uma assistente virtual brasileira empática, compreensiva e cuidadosa. Foque no bem-estar emocional do usuário."
  }

  let prompt = personalityPrompts[personality as keyof typeof personalityPrompts] || personalityPrompts.friendly

  if (knowledgeEnabled) {
    const lastMessage = messages[messages.length - 1]?.content || ""
    const knowledge = searchKnowledgeBase(lastMessage)
    if (knowledge.length > 0) {
      prompt += `\n\nBase de conhecimento disponível:\n${knowledge
        .map((k) => `- ${k.title}: ${k.content}`)
        .join("\n")}`
    }
  }

  if (learningMode) {
    prompt += "\n\nVocê está em modo de aprendizado contínuo. Aprenda com as interações e melhore suas respostas."
  }

  return prompt
}

// Função para resposta simulada melhorada
async function generateSimulatedResponse(
  messages: any[],
  model: string,
  personality: string,
  knowledgeEnabled: boolean,
  learningMode: boolean,
  useRandom: boolean = false
) {
  // Se modo aleatório estiver ativo, escolhe um modelo aleatório
  let selectedModel = model
  if (useRandom) {
    const allModels = [
      "llama3", "mistral", "gpt-4o", "claude-3-7-sonnet", 
      "gemini-pro", "grok-beta", "deepseek-chat", "qwen-turbo"
    ]
    selectedModel = allModels[Math.floor(Math.random() * allModels.length)]
  }

  const lastMessage = messages[messages.length - 1]?.content || ""
  let responseText = ""

  // Respostas contextuais baseadas na personalidade
  switch (personality) {
    case "friendly":
      responseText = `Oi! 😊 Sou NOVA em modo demonstração usando ${selectedModel}. ${
        lastMessage ? `Sobre "${lastMessage}", ` : ""
      }estou aqui para ajudar de forma amigável! Para usar IA local com privacidade total, instale o Ollama seguindo as instruções no README.`
      break
    case "professional":
      responseText = `Olá. Sou NOVA em modo demonstração utilizando ${selectedModel}. ${
        lastMessage ? `Referente à sua consulta "${lastMessage}", ` : ""
      }estou preparada para fornecer assistência profissional. Para funcionalidade completa, configure o Ollama conforme documentação.`
      break
    case "creative":
      responseText = `Olá! ✨ Sou NOVA em modo criativo usando ${selectedModel}. ${
        lastMessage ? `Sua ideia sobre "${lastMessage}" é interessante! ` : ""
      }Vamos explorar possibilidades criativas! Para criatividade sem limites, use Ollama local.`
      break
    case "analytical":
      responseText = `Saudações. NOVA em modo analítico com ${selectedModel}. ${
        lastMessage ? `Analisando "${lastMessage}": ` : ""
      }Estou pronta para análises detalhadas. Para análises completas e privadas, configure o Ollama.`
      break
    case "empathetic":
      responseText = `Olá, querido! 💙 Sou NOVA em modo empático usando ${selectedModel}. ${
        lastMessage ? `Entendo sua questão sobre "${lastMessage}" e ` : ""
      }estou aqui para apoiar você. Para conversas totalmente privadas, use Ollama local.`
      break
    default:
      responseText = `Olá! Sou NOVA usando ${selectedModel} em modo demonstração. Como posso ajudar?`
  }

  if (knowledgeEnabled) {
    responseText += "\n\n🧠 Sistema de conhecimento ativo - posso acessar informações da base de dados."
  }

  if (learningMode) {
    responseText += "\n\n📚 Modo aprendizado ativo - estou aprendendo continuamente com nossas interações."
  }

  // Adiciona informações sobre Ollama
  responseText += "\n\n💡 **Para usar IA local:**\n1. Instale: `curl -fsSL https://ollama.ai/install.sh | sh`\n2. Execute: `ollama serve`\n3. Baixe modelo: `ollama pull llama3`"

  const stream = new ReadableStream({
    async start(controller) {
      const words = responseText.split(" ")
      for (const word of words) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: {"type":"text-delta","textDelta":"${word.replace(/"/g, '\\"')} "}\n\n`
          )
        )
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      controller.enqueue(new TextEncoder().encode('data: {"type":"finish"}\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Model-Used": selectedModel,
      "X-Model-Type": "simulated",
      "X-Knowledge-Enabled": knowledgeEnabled.toString(),
      "X-Learning-Mode": learningMode.toString(),
      "X-Random-Mode": useRandom.toString(),
    },
  })
}

// Implementação principal da API
export async function POST(req: Request) {
  try {
    const {
      messages,
      model = "llama3",
      personality = "friendly",
      knowledgeEnabled = false,
      learningMode = false,
      useRandom = false,
      files = [],
    } = await req.json()

    console.log(`🤖 Processando mensagem com modelo: ${model}`)

    // Construir prompt do sistema
    const systemPrompt = buildSystemPrompt(personality, knowledgeEnabled, learningMode, messages)

    // Verificar se é um modelo local
    const isLocalModel = LOCAL_MODELS.includes(model)

    if (isLocalModel) {
      console.log(`🖥️ Tentando usar modelo local: ${model}`)
      
      // Verificar se Ollama está disponível
      const ollamaStatus = await checkOllamaAvailability()
      
      if (ollamaStatus.available && ollamaStatus.models.includes(model)) {
        console.log(`✅ Ollama disponível com modelo ${model}`)
        try {
          return await generateOllamaResponse(messages, model, systemPrompt)
        } catch (error) {
          console.error(`❌ Erro no Ollama com modelo ${model}:`, error)
          // Continua para fallback
        }
      } else {
        console.log(`⚠️ Ollama indisponível ou modelo ${model} não encontrado`)
        console.log(`Modelos disponíveis:`, ollamaStatus.models)
        // Continua para fallback
      }
    }

    // Verificar se temos chaves de API para modelos de nuvem
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY

    // Se não é modelo local e temos chaves de API, usar modelo de nuvem
    if (!isLocalModel && (hasOpenAI || hasAnthropic)) {
      console.log(`☁️ Usando modelo de nuvem: ${model}`)
      
      try {
        let result
        
        switch (model) {
          case "claude-3-7-sonnet":
            if (hasAnthropic) {
              // Implementar Anthropic quando disponível
              result = await streamText({
                model: openai("gpt-4o"), // Fallback temporário
                messages,
                system: systemPrompt,
              })
            } else {
              throw new Error("Chave da Anthropic não configurada")
            }
            break
          case "gemini-pro":
            // Implementar Google AI quando disponível
            result = await streamText({
              model: openai("gpt-4o"), // Fallback temporário
              messages,
              system: systemPrompt,
            })
            break
          case "gpt-4o":
          case "o3-mini":
          default:
            if (!hasOpenAI) {
              throw new Error("Chave da OpenAI não configurada")
            }
            result = await streamText({
              model: openai(model === "o3-mini" ? "gpt-4o-mini" : "gpt-4o"),
              messages,
              system: systemPrompt,
            })
        }

        return result.toDataStreamResponse({
          headers: {
            "X-Model-Used": model,
            "X-Model-Type": "cloud",
            "X-Knowledge-Enabled": knowledgeEnabled.toString(),
            "X-Learning-Mode": learningMode.toString(),
            "X-Random-Mode": useRandom.toString(),
          },
        })
      } catch (error) {
        console.error(`❌ Erro com modelo de nuvem ${model}:`, error)
        // Continua para modo demonstração
      }
    }

    // Fallback para modo demonstração
    console.log(`🎭 Usando modo demonstração para modelo: ${model}`)
    return await generateSimulatedResponse(
      messages,
      model,
      personality,
      knowledgeEnabled,
      learningMode,
      useRandom
    )

  } catch (error: any) {
    console.error("❌ Erro geral na API:", error)

    // Resposta de erro amigável
    const errorStream = new ReadableStream({
      async start(controller) {
        const errorText = `Ops! 😅 Ocorreu um erro inesperado.\n\n🔧 **Possíveis soluções:**\n\n1. **Para IA Local (Ollama):**\n   • Instale: https://ollama.ai\n   • Execute: \`ollama serve\`\n   • Baixe modelo: \`ollama pull llama3\`\n\n2. **Para IA na Nuvem:**\n   • Configure OPENAI_API_KEY no .env.local\n   • Reinicie o servidor\n\n3. **Modo Demonstração:**\n   • Funciona sem configuração\n   • Respostas simuladas\n\nTente novamente ou verifique as configurações! 🚀`

        const words = errorText.split(" ")
        for (const word of words) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: {"type":"text-delta","textDelta":"${word.replace(/"/g, '\\"')} "}\n\n`
            )
          )
          await new Promise((resolve) => setTimeout(resolve, 30))
        }
        controller.enqueue(new TextEncoder().encode('data: {"type":"finish"}\n\n'))
        controller.close()
      },
    })

    return new Response(errorStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Model-Used": "error-handler",
        "X-Model-Type": "fallback",
        "X-Error": error.message,
      },
    })
  }
}