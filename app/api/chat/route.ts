import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Configuração do Ollama
const OLLAMA_BASE_URL = "http://localhost:11434";
const LOCAL_MODELS = {
  ollama: [
    "mistral:7b-instruct-q4_K_M",
    "llama3",
    "phi3",
    "gemma:2b",
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

// Verificadores de disponibilidade
async function checkLocalAIAvailability() {
  const results = {
    ollama: await checkOllamaAvailability(),
    webllm: await checkWebLLMAvailability(),
  };
  return results;
}

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
      models: data.models.map((model: any) => model.name),
    };
  } catch {
    return { available: false, models: [] };
  }
}

async function checkWebLLMAvailability() {
  try {
    // @ts-ignore - Verifica se WebLLM está disponível no navegador
    if (typeof window !== "undefined" && window.webllm) {
      const availableModels = await window.webllm.getAvailableModels();
      return {
        available: true,
        models: availableModels,
      };
    }
    return { available: false, models: [] };
  } catch {
    return { available: false, models: [] };
  }
}

// Geradores de resposta
async function generateLocalResponse(
  messages: any[],
  model: string,
  systemPrompt: string
) {
  // Verifica primeiro se é um modelo Ollama
  const ollamaStatus = await checkOllamaAvailability();
  if (ollamaStatus.available && ollamaStatus.models.includes(model)) {
    return generateOllamaResponse(messages, model, systemPrompt);
  }

  // Tenta WebLLM se estiver disponível
  const webllmStatus = await checkWebLLMAvailability();
  if (webllmStatus.available && webllmStatus.models.includes(model)) {
    return generateWebLLMResponse(messages, model, systemPrompt);
  }

  throw new Error("Modelo local não disponível");
}

async function generateOllamaResponse(
  messages: any[],
  model: string,
  systemPrompt: string
) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
      ],
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
  return response.body;
}

async function generateWebLLMResponse(
  messages: any[],
  model: string,
  systemPrompt: string
) {
  try {
    // @ts-ignore - Usa WebLLM se disponível
    const chat = await window.webllm.ChatModule();
    await chat.reload(model, undefined, {
      conversation: {
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        const response = await chat.generateResponse();
        const chunks = response.split(" ");

        for (const chunk of chunks) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: {"type":"text-delta","textDelta":"${chunk.replace(
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

    return stream;
  } catch (error) {
    throw new Error(`WebLLM error: ${error.message}`);
  }
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
    } = await req.json();

    // Verifica disponibilidade de modelos locais
    const localAI = await checkLocalAIAvailability();
    const isLocalModel =
      LOCAL_MODELS.ollama.includes(model) ||
      LOCAL_MODELS.webllm.includes(model);

    // Prioriza modelos locais se disponíveis
    if (
      isLocalModel &&
      (localAI.ollama.available || localAI.webllm.available)
    ) {
      console.log(`🖥️ Usando modelo local: ${model}`);

      const systemPrompt = buildSystemPrompt(
        personality,
        knowledgeEnabled,
        learningMode,
        messages
      );

      try {
        const localStream = await generateLocalResponse(
          messages,
          model,
          systemPrompt
        );
        return new Response(localStream, {
          headers: buildHeaders(model, "local", knowledgeEnabled, learningMode),
        });
      } catch (error) {
        console.error("Erro no modelo local, caindo para simulação:", error);
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
        learningMode
      );
    }

    // Fallback para modelos de nuvem com API key
    return cloudResponse(
      messages,
      model,
      personality,
      knowledgeEnabled,
      learningMode
    );
  } catch (error) {
    console.error("Erro na API:", error);
    return errorResponse(error, await req.json());
  }
}

// Funções auxiliares de resposta
function buildSystemPrompt(
  personality: string,
  knowledgeEnabled: boolean,
  learningMode: boolean,
  messages: any[]
) {
  let prompt = `Você é NOVA, uma assistente virtual brasileira com personalidade ${personality}.`;

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
  learningMode: boolean
) {
  return {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Model-Used": model,
    "X-Model-Type": type,
    "X-Knowledge-Enabled": knowledgeEnabled.toString(),
    "X-Learning-Mode": learningMode.toString(),
  };
}

async function simulatedResponse(
  messages: any[],
  model: string,
  personality: string,
  knowledgeEnabled: boolean,
  learningMode: boolean
) {
  const allModels = [
    ...LOCAL_MODELS.ollama,
    ...LOCAL_MODELS.webllm,
    "gpt-4o",
    "claude-3-7-sonnet",
  ];
  const selectedModel = allModels.includes(model) ? model : allModels[0];

  const responseText =
    `NOVA (modo simulado) usando ${selectedModel}\n\n` +
    `Personalidade: ${personality}\n` +
    `Conhecimento: ${knowledgeEnabled ? "Ativo" : "Inativo"}\n` +
    `Aprendizado: ${learningMode ? "Ativo" : "Inativo"}\n\n` +
    `Última mensagem: ${messages[messages.length - 1]?.content || "N/A"}`;

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
      learningMode
    ),
  });
}

async function cloudResponse(
  messages: any[],
  model: string,
  personality: string,
  knowledgeEnabled: boolean,
  learningMode: boolean
) {
  const systemPrompt = buildSystemPrompt(
    personality,
    knowledgeEnabled,
    learningMode,
    messages
  );
  const result = await streamText({
    model: openai("gpt-4o"), // Fallback padrão
    messages,
    system: systemPrompt,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: {"type":"text-delta","textDelta":"${chunk.replace(
                /"/g,
                '\\"'
              )}"}\n\n`
            )
          );
        }
        controller.enqueue(
          new TextEncoder().encode('data: {"type":"finish"}\n\n')
        );
        controller.close();
      } catch (error) {
        console.error("Erro no stream:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: buildHeaders(model, "cloud", knowledgeEnabled, learningMode),
  });
}

function errorResponse(error: Error, requestData: any) {
  const {
    model = "mistral:7b-instruct-q4_K_M",
    personality = "friendly",
    knowledgeEnabled = false,
    learningMode = false,
  } = requestData;

  const errorText =
    `Ops! 😅 Ocorreu um erro:\n\n${error.message}\n\n` +
    `Estou em modo de recuperação usando ${model}. Por favor, tente novamente.`;

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
      learningMode
    ),
  });
}
