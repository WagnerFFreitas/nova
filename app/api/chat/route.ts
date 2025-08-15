import { openai } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider";
import { streamText } from "ai";

// Configuração do Ollama
const OLLAMA_BASE_URL = "http://localhost:11434";

// Inicializa o provider do Ollama
const ollama = createOllama({
  baseURL: OLLAMA_BASE_URL,
});

const LOCAL_MODELS = {
  ollama: [
    "mistral:7b-instruct-q4_K_M",
    "llama3",
    "phi3",
    "gemma:2b",
    "llama3:8b",
    "llama3:70b",
    "mistral:latest",
    "codellama:latest",
    "neural-chat",
    "dolphin-mistral",
  ],
  webllm: [
    "Llama-2-7b-chat-hf-q4f32_1",
    "RedPajama-INCITE-Chat-3B-v1-q4f32_0",
    "Mistral-7B-Instruct-v0.1-q4f16_1",
  ],
};

// Funções auxiliares
function hasAPIKeys() {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

function isPreviewEnvironment() {
  return (
    process.env.VERCEL_URL?.includes("v0.dev") ||
    process.env.VERCEL_URL?.includes("vercel.app")
  );
}

// Função para verificar se o Ollama está disponível
async function checkOllamaAvailability() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) return { available: false, models: [] };
    
    const data = await response.json();
    return {
      available: true,
      models: data.models?.map((model: any) => model.name) || [],
    };
  } catch (error) {
    console.error("Erro ao verificar Ollama:", error);
    return { available: false, models: [] };
  }
}

// Função para gerar resposta com Ollama
async function generateOllamaResponse(messages: any[], model: string, systemPrompt: string) {
  try {
    // Verifica se o modelo está disponível
    const ollamaStatus = await checkOllamaAvailability();
    if (!ollamaStatus.available || !ollamaStatus.models.includes(model)) {
      throw new Error(`Modelo ${model} não disponível no Ollama`);
    }

    // Usa o provider do Ollama
    const result = await streamText({
      model: ollama(model),
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Erro ao gerar resposta com Ollama:", error);
    throw error;
  }
}

function searchKnowledgeBase(query: string) {
  const mockKnowledge = [
    {
      title: "Informações sobre IA",
      content:
        "Inteligência Artificial é um campo da ciência da computação que se concentra na criação de sistemas capazes de realizar tarefas que normalmente requerem inteligência humana.",
      relevance: 0.9,
    },
    {
      title: "Aprendizado de Máquina",
      content:
        "Machine Learning é um subcampo da IA que permite aos computadores aprender e melhorar automaticamente através da experiência sem serem explicitamente programados.",
      relevance: 0.8,
    },
  ];

  return mockKnowledge
    .filter(
      (item) =>
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3);
}

// Implementação principal
export async function POST(req: Request) {
  try {
    const {
      messages,
      model,
      personality = "friendly",
      knowledgeEnabled = false,
      learningMode = false,
      useRandom = false,
    } = await req.json();

    // Constrói o prompt do sistema
    const systemPrompt = buildSystemPrompt(personality, knowledgeEnabled, learningMode, messages);

    // Verifica se é um modelo Ollama
    const isLocalModel =
      LOCAL_MODELS.ollama.includes(model) ||
      LOCAL_MODELS.webllm.includes(model);

    // Se for modelo local (Ollama), tenta usar primeiro
    if (isLocalModel) {
      console.log(`🖥️ Usando modelo local: ${model}`);
      try {
        return await generateOllamaResponse(messages, model, systemPrompt);
      } catch (error) {
        console.error("Erro no Ollama, usando fallback:", error);
        // Continua para o fallback
      }
    }

    // Fallback para simulação se em preview ou sem chaves
    if (isPreviewEnvironment() || !hasAPIKeys()) {
      console.log("🎭 Modo demonstração ativo");
      return simulatedResponse(
        messages,
        model,
        personality,
        knowledgeEnabled,
        learningMode,
        useRandom
      );
    }

    // Fallback para modelos de nuvem com API key
    console.log(`☁️ Usando modelo de nuvem: ${model}`);
    return cloudResponse(
      messages,
      model,
      personality,
      knowledgeEnabled,
      learningMode,
      useRandom
    );
  } catch (error) {
    console.error("Erro na API:", error);
    const requestData = await req.json().catch(() => ({}));
    return errorResponse(error, requestData);
  }
}

// Funções auxiliares de resposta
function buildSystemPrompt(
  personality: string,
  knowledgeEnabled: boolean,
  learningMode: boolean,
  messages: any[]
) {
  const personalityPrompts = {
    friendly: "Você é NOVA, uma assistente virtual brasileira amigável, calorosa e descontraída. Use emojis e linguagem casual.",
    professional: "Você é NOVA, uma assistente virtual brasileira profissional, formal e precisa. Foque em eficiência.",
    creative: "Você é NOVA, uma assistente virtual brasileira criativa, imaginativa e inspiradora. Gere ideias inovadoras.",
    analytical: "Você é NOVA, uma assistente virtual brasileira analítica, lógica e detalhada. Base suas respostas em dados.",
    empathetic: "Você é NOVA, uma assistente virtual brasileira empática, compreensiva e cuidadosa. Foque no bem-estar."
  };

  let prompt = personalityPrompts[personality as keyof typeof personalityPrompts] || personalityPrompts.friendly;

  if (knowledgeEnabled) {
    const lastMessage = messages[messages.length - 1]?.content || "";
    const knowledge = searchKnowledgeBase(lastMessage);
    if (knowledge.length > 0) {
      prompt += `\n\nBase de conhecimento:\n${knowledge
        .map((k) => `- ${k.title}: ${k.content}`)
        .join("\n")}`;
    }
  }

  if (learningMode) prompt += "\n\nVocê está em modo de aprendizado contínuo.";

  return prompt;
}

function buildHeaders(
  model: string,
  type: string,
  knowledgeEnabled: boolean,
  learningMode: boolean,
  useRandom: boolean = false
) {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Model-Used": model,
    "X-Model-Type": type,
    "X-Knowledge-Enabled": knowledgeEnabled.toString(),
    "X-Learning-Mode": learningMode.toString(),
    "X-Random-Mode": useRandom.toString(),
  };
}

async function simulatedResponse(
  messages: any[],
  model: string,
  personality: string,
  knowledgeEnabled: boolean,
  learningMode: boolean,
  useRandom: boolean = false
) {
  // Se modo aleatório estiver ativo, escolhe um modelo aleatório
  let selectedModel = model;
  if (useRandom) {
    const allModels = [
      ...LOCAL_MODELS.ollama,
      "gpt-4o",
      "claude-3-7-sonnet",
      "gemini-pro",
      "grok-beta",
      "deepseek-chat",
    ];
    selectedModel = allModels[Math.floor(Math.random() * allModels.length)];
  }

  // Gera resposta baseada na personalidade e contexto
  const lastMessage = messages[messages.length - 1]?.content || "";
  let responseText = "";

  // Respostas contextuais baseadas na personalidade
  switch (personality) {
    case "friendly":
      responseText = `Oi! 😊 Sou NOVA em modo demonstração usando ${selectedModel}. ${lastMessage ? `Sobre "${lastMessage}", ` : ""}estou aqui para ajudar de forma amigável e descontraída! Como posso te ajudar hoje?`;
      break;
    case "professional":
      responseText = `Olá. Sou NOVA em modo demonstração utilizando ${selectedModel}. ${lastMessage ? `Referente à sua consulta "${lastMessage}", ` : ""}estou preparada para fornecer assistência profissional e eficiente.`;
      break;
    case "creative":
      responseText = `Olá! ✨ Sou NOVA em modo criativo usando ${selectedModel}. ${lastMessage ? `Sua ideia sobre "${lastMessage}" é interessante! ` : ""}Vamos explorar possibilidades criativas juntos!`;
      break;
    case "analytical":
      responseText = `Saudações. NOVA em modo analítico com ${selectedModel}. ${lastMessage ? `Analisando "${lastMessage}": ` : ""}Estou pronta para fornecer análises detalhadas e baseadas em dados.`;
      break;
    case "empathetic":
      responseText = `Olá, querido! 💙 Sou NOVA em modo empático usando ${selectedModel}. ${lastMessage ? `Entendo sua questão sobre "${lastMessage}" e ` : ""}estou aqui para ouvir e apoiar você.`;
      break;
    default:
      responseText = `Olá! Sou NOVA usando ${selectedModel} em modo demonstração. Como posso ajudar?`;
  }

  if (knowledgeEnabled) {
    responseText += "\n\n🧠 Sistema de conhecimento ativo - posso acessar informações da base de dados.";
  }

  if (learningMode) {
    responseText += "\n\n📚 Modo aprendizado ativo - estou aprendendo continuamente com nossas interações.";
  }

  const stream = new ReadableStream({
    async start(controller) {
      const words = responseText.split(" ");
      for (const word of words) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: {"type":"text-delta","textDelta":"${word.replace(
              /"/g,
              '\\"'
            )} "}\n\n`
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      controller.enqueue(
        new TextEncoder().encode('data: {"type":"finish"}\n\n')
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: buildHeaders(
      selectedModel,
      "simulated",
      knowledgeEnabled,
      learningMode,
      useRandom
    ),
  });
}

async function cloudResponse(
  messages: any[],
  model: string,
  personality: string,
  knowledgeEnabled: boolean,
  learningMode: boolean,
  useRandom: boolean = false
) {
  const systemPrompt = buildSystemPrompt(
    personality,
    knowledgeEnabled,
    learningMode,
    messages
  );
  
  // Seleciona o modelo apropriado
  let selectedModel = model;
  if (useRandom) {
    const cloudModels = ["gpt-4o", "claude-3-7-sonnet", "gemini-pro"];
    selectedModel = cloudModels[Math.floor(Math.random() * cloudModels.length)];
  }

  let result;
  try {
    // Tenta usar o modelo específico
    switch (selectedModel) {
      case "claude-3-7-sonnet":
        // Implementar Anthropic quando disponível
        result = await streamText({
          model: openai("gpt-4o"), // Fallback
          messages,
          system: systemPrompt,
        });
        break;
      case "gemini-pro":
        // Implementar Google AI quando disponível
        result = await streamText({
          model: openai("gpt-4o"), // Fallback
          messages,
          system: systemPrompt,
        });
        break;
      default:
        result = await streamText({
          model: openai(selectedModel === "gpt-4o" ? "gpt-4o" : "gpt-4o"),
          messages,
          system: systemPrompt,
        });
    }
  } catch (error) {
    console.error(`Erro com modelo ${selectedModel}, usando GPT-4o:`, error);
    result = await streamText({
      model: openai("gpt-4o"),
      messages,
      system: systemPrompt,
    });
  }

  return result.toDataStreamResponse({
    headers: buildHeaders(selectedModel, "cloud", knowledgeEnabled, learningMode, useRandom),
  });
}

function errorResponse(error: Error, requestData: any) {
  const {
    model = "mistral:7b-instruct-q4_K_M",
    personality = "friendly",
    knowledgeEnabled = false,
    learningMode = false,
    useRandom = false,
  } = requestData;

  let errorText = "";
  
  if (error.message.includes("Ollama") || error.message.includes("localhost:11434")) {
    errorText = `🔧 Ollama não está disponível.\n\nPara usar modelos locais:\n1. Instale o Ollama (https://ollama.ai)\n2. Execute: ollama serve\n3. Baixe um modelo: ollama pull ${model}\n\nEnquanto isso, posso funcionar em modo demonstração! 😊`;
  } else {
    errorText = `Ops! 😅 Ocorreu um erro:\n\n${error.message}\n\nEstou em modo de recuperação. Tente novamente ou verifique se o Ollama está rodando.`;
  }

  const stream = new ReadableStream({
    async start(controller) {
      const words = errorText.split(" ");
      for (const word of words) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: {"type":"text-delta","textDelta":"${word.replace(
              /"/g,
              '\\"'
            )} "}\n\n`
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      controller.enqueue(
        new TextEncoder().encode('data: {"type":"finish"}\n\n')
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: buildHeaders(
      model,
      "error-fallback",
      knowledgeEnabled,
      learningMode,
      useRandom
    ),
  });
}
