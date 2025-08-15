import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Verificar ambiente antes de qualquer tentativa de conexão
    const isProduction = process.env.NODE_ENV === "production"
    const isVercelPreview = process.env.VERCEL === "1"
    const isV0Environment = process.env.VERCEL_URL?.includes("v0.dev") || process.env.VERCEL_URL?.includes("vercel.app")
    const ollamaExplicitlyEnabled = process.env.OLLAMA_ENABLED === "true"

    // Se estamos em produção/preview e Ollama não foi explicitamente habilitado, retornar indisponível
    if ((isProduction || isVercelPreview || isV0Environment) && !ollamaExplicitlyEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Ollama não está disponível neste ambiente de produção",
          models: [],
          environmentInfo: "Ambiente de produção/preview - Para usar Ollama, configure OLLAMA_ENABLED=true",
          suggestion: "Configure OLLAMA_ENABLED=true nas variáveis de ambiente ou use modelos na nuvem",
          environmentDetails: {
            isProduction,
            isVercelPreview,
            isV0Environment,
            nodeEnv: process.env.NODE_ENV,
            vercelUrl: process.env.VERCEL_URL,
          },
        },
        { status: 200 },
      )
    }

    // Apenas em ambiente de desenvolvimento local, tentar conectar
    console.log("Tentando conectar ao Ollama em ambiente local...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("Timeout na conexão com Ollama")
      controller.abort()
    }, 5000) // Aumenta timeout para 5 segundos

    let response
    try {
      response = await fetch("http://localhost:11434/api/tags", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      console.error("Erro na conexão com Ollama:", fetchError.message)

      // Retornar erro específico baseado no tipo
      let errorMessage = "Ollama não está rodando"
      let suggestion = "1. Instale o Ollama: https://ollama.ai\n2. Execute: ollama serve\n3. Baixe um modelo: ollama pull llama3"

      if (fetchError.name === "AbortError") {
        errorMessage = "Timeout: Ollama não respondeu em 5 segundos"
        suggestion = "Verifique se o Ollama está rodando na porta 11434"
      } else if (fetchError.code === "ECONNREFUSED") {
        errorMessage = "Conexão recusada: Ollama não está rodando"
        suggestion = "1. Execute: ollama serve\n2. Verifique se a porta 11434 está livre"
      } else if (fetchError.message?.includes("fetch")) {
        errorMessage = "Erro de rede: Não foi possível conectar ao Ollama"
        suggestion = "Certifique-se de que o Ollama está rodando em localhost:11434"
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          suggestion: suggestion,
          models: [],
          installInstructions: {
            windows: "Baixe o instalador em https://ollama.ai/download",
            macos: "brew install ollama",
            linux: "curl -fsSL https://ollama.ai/install.sh | sh"
          },
          debug: {
            errorName: fetchError.name,
            errorMessage: fetchError.message,
            errorCode: fetchError.code,
          },
        },
        { status: 200 },
      )
    }

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Ollama retornou status ${response.status}`)
      return NextResponse.json(
        {
          success: false,
          error: `Ollama retornou erro: ${response.status} - ${response.statusText}`,
          suggestion: "1. Reinicie o Ollama: ollama serve\n2. Verifique os logs do Ollama\n3. Teste: curl http://localhost:11434/api/tags",
          models: [],
        },
        { status: 200 },
      )
    }

    const data = await response.json()
    console.log("Resposta do Ollama:", data)

    // Verificar se há modelos disponíveis
    if (!data.models || data.models.length === 0) {
      return NextResponse.json(
        {
          success: true,
          error: "Ollama está rodando, mas nenhum modelo foi encontrado",
          suggestion: "Baixe modelos:\n• ollama pull llama3\n• ollama pull mistral\n• ollama pull codellama",
          availableModels: [
            "llama3 (recomendado para conversação)",
            "mistral (rápido e eficiente)", 
            "codellama (especializado em código)",
            "phi3 (modelo compacto)",
            "gemma:2b (muito rápido)"
          ],
          models: [],
        },
        { status: 200 },
      )
    }

    // Formatar dados dos modelos
    const formattedModels = data.models.map((model: any) => ({
      name: model.name,
      size: model.size ? formatBytes(model.size) : "Tamanho desconhecido",
      modified_at: model.modified_at,
      digest: model.digest?.substring(0, 12) + "...",
      family: model.details?.family || "unknown",
      parameter_size: model.details?.parameter_size || "unknown",
    }))

    console.log(`Encontrados ${formattedModels.length} modelos do Ollama`)

    return NextResponse.json(
      {
        success: true,
        models: formattedModels,
        count: formattedModels.length,
        message: `${formattedModels.length} modelo(s) encontrado(s)`,
        ollamaVersion: data.version || "unknown",
        recommendations: {
          conversation: formattedModels.find(m => m.name.includes("llama3"))?.name || "llama3",
          coding: formattedModels.find(m => m.name.includes("codellama"))?.name || "codellama",
          fast: formattedModels.find(m => m.name.includes("phi3") || m.name.includes("gemma"))?.name || "phi3"
        }
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Erro inesperado na API do Ollama:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor ao verificar Ollama",
        suggestion: "1. Verifique se o Ollama está instalado\n2. Execute: ollama serve\n3. Tente novamente",
        installInstructions: {
          windows: "https://ollama.ai/download",
          macos: "brew install ollama", 
          linux: "curl -fsSL https://ollama.ai/install.sh | sh"
        },
        models: [],
        debug: {
          errorMessage: error.message,
          errorStack: error.stack?.substring(0, 500),
        },
      },
      { status: 200 },
    )
  }
}

// Função auxiliar para formatar bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
