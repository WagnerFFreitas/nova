import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Verificando disponibilidade do Ollama...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout na conexão com Ollama (5s)")
      controller.abort()
    }, 5000)

    try {
      const response = await fetch("http://localhost:11434/api/tags", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ Ollama conectado com ${data.models?.length || 0} modelos`)

      // Verificar se há modelos disponíveis
      if (!data.models || data.models.length === 0) {
        return NextResponse.json({
          success: true,
          connected: true,
          error: "Ollama conectado, mas nenhum modelo instalado",
          suggestion: "Instale modelos:\n• ollama pull llama3\n• ollama pull mistral\n• ollama pull phi3",
          models: [],
          installCommands: [
            "ollama pull llama3      # Modelo geral (4.7GB)",
            "ollama pull mistral     # Rápido (4.1GB)", 
            "ollama pull phi3        # Compacto (2.3GB)",
            "ollama pull gemma:2b    # Muito rápido (1.4GB)"
          ]
        })
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

      return NextResponse.json({
        success: true,
        connected: true,
        models: formattedModels,
        count: formattedModels.length,
        message: `${formattedModels.length} modelo(s) disponível(is)`,
        recommendations: {
          conversation: formattedModels.find(m => m.name.includes("llama3"))?.name || "llama3",
          coding: formattedModels.find(m => m.name.includes("codellama"))?.name || "codellama",
          fast: formattedModels.find(m => m.name.includes("phi3") || m.name.includes("gemma"))?.name || "phi3"
        }
      })

    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      console.error("❌ Erro na conexão com Ollama:", fetchError.message)

      let errorMessage = "Ollama não está rodando"
      let suggestion = "1. Instale o Ollama: https://ollama.ai\n2. Execute: ollama serve\n3. Baixe um modelo: ollama pull llama3"

      if (fetchError.name === "AbortError") {
        errorMessage = "Timeout: Ollama não respondeu em 5 segundos"
        suggestion = "1. Verifique se o Ollama está rodando\n2. Teste: curl http://localhost:11434/api/tags\n3. Reinicie: ollama serve"
      } else if (fetchError.message?.includes("ECONNREFUSED") || fetchError.message?.includes("fetch")) {
        errorMessage = "Não foi possível conectar ao Ollama"
        suggestion = "1. Execute: ollama serve\n2. Verifique se a porta 11434 está livre\n3. Teste: curl http://localhost:11434/api/tags"
      }

      return NextResponse.json({
        success: false,
        connected: false,
        error: errorMessage,
        suggestion: suggestion,
        models: [],
        installInstructions: {
          windows: "Baixe em: https://ollama.ai/download",
          macos: "Execute: brew install ollama",
          linux: "Execute: curl -fsSL https://ollama.ai/install.sh | sh"
        },
        quickStart: [
          "# 1. Instalar Ollama",
          "curl -fsSL https://ollama.ai/install.sh | sh",
          "",
          "# 2. Iniciar serviço", 
          "ollama serve",
          "",
          "# 3. Baixar modelo (em outro terminal)",
          "ollama pull llama3",
          "",
          "# 4. Testar",
          "ollama run llama3 'Olá!'"
        ]
      })
    }

  } catch (error: any) {
    console.error("❌ Erro inesperado:", error)

    return NextResponse.json({
      success: false,
      connected: false,
      error: "Erro interno do servidor",
      suggestion: "1. Verifique se o Ollama está instalado\n2. Execute: ollama serve\n3. Reinicie o servidor Next.js",
      models: [],
      debug: {
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
      },
    })
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
