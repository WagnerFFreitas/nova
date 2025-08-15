"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Cpu,
  Cloud,
  Wifi,
  Shuffle,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  WifiOff,
  Globe,
  Sparkles,
  Code,
  Rocket,
  Brain,
} from "lucide-react"

interface ModelInfo {
  id: string
  name: string
  type: "cloud" | "local" | "platform"
  description: string
  status: "available" | "unavailable" | "checking"
  provider?: string
  speed?: number
  quality?: number
  category?: "general" | "coding" | "creative" | "chinese" | "specialized"
}

interface OllamaResponse {
  success: boolean
  error?: string
  suggestion?: string
  models: any[]
  count?: number
  message?: string
  environmentInfo?: string
  environmentDetails?: any
  debug?: any
}

interface AdvancedModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  randomMode: boolean
  onRandomModeChange: (enabled: boolean) => void
}

export default function AdvancedModelSelector({
  selectedModel,
  onModelChange,
  randomMode,
  onRandomModeChange,
}: AdvancedModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [isCheckingOllama, setIsCheckingOllama] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState<"connected" | "disconnected" | "checking" | "unavailable">(
    "checking",
  )
  const [lastUsedModel, setLastUsedModel] = useState<string>("")
  const [modelStats, setModelStats] = useState<Record<string, number>>({})
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [suggestion, setSuggestion] = useState<string>("")
  const [environmentInfo, setEnvironmentInfo] = useState<string>("")
  const [isEnvironmentUnavailable, setIsEnvironmentUnavailable] = useState(false)

  // Modelos expandidos com novos providers
  const cloudModels: ModelInfo[] = [
    // OpenAI
    {
      id: "gpt-4o",
      name: "GPT-4o",
      type: "cloud",
      description: "OpenAI GPT-4o - Modelo mais avançado para conversação geral",
      status: "available",
      provider: "OpenAI",
      speed: 85,
      quality: 95,
      category: "general",
    },
    {
      id: "o3-mini",
      name: "o1-mini",
      type: "cloud",
      description: "OpenAI o1-mini - Otimizado para raciocínio complexo",
      status: "available",
      provider: "OpenAI",
      speed: 70,
      quality: 88,
      category: "general",
    },

    // Anthropic
    {
      id: "claude-3-7-sonnet",
      name: "Claude 3.5 Sonnet",
      type: "cloud",
      description: "Anthropic Claude - Excelente para análise e raciocínio",
      status: "available",
      provider: "Anthropic",
      speed: 80,
      quality: 90,
      category: "general",
    },

    // Google
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      type: "cloud",
      description: "Google Gemini - Conhecimento amplo e multimodal",
      status: "available",
      provider: "Google",
      speed: 90,
      quality: 85,
      category: "general",
    },
    {
      id: "gemini-flash",
      name: "Gemini Flash",
      type: "cloud",
      description: "Google AI Studio - Gemini Flash para respostas rápidas",
      status: "available",
      provider: "Google AI Studio",
      speed: 95,
      quality: 80,
      category: "general",
    },

    // xAI (Grok)
    {
      id: "grok-beta",
      name: "Grok Beta",
      type: "cloud",
      description: "xAI Grok - IA com personalidade rebelde e humor",
      status: "available",
      provider: "xAI",
      speed: 85,
      quality: 82,
      category: "creative",
    },
    {
      id: "grok-2",
      name: "Grok-2",
      type: "cloud",
      description: "xAI Grok-2 - Versão mais avançada com raciocínio melhorado",
      status: "available",
      provider: "xAI",
      speed: 80,
      quality: 88,
      category: "general",
    },

    // DeepSeek
    {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
      type: "cloud",
      description: "DeepSeek - Modelo chinês avançado para conversação",
      status: "available",
      provider: "DeepSeek",
      speed: 88,
      quality: 85,
      category: "chinese",
    },
    {
      id: "deepseek-coder",
      name: "DeepSeek Coder",
      type: "cloud",
      description: "DeepSeek Coder - Especializado em programação",
      status: "available",
      provider: "DeepSeek",
      speed: 85,
      quality: 90,
      category: "coding",
    },

    // Qwen (Alibaba)
    {
      id: "qwen-turbo",
      name: "Qwen Turbo",
      type: "cloud",
      description: "Alibaba Qwen - Modelo rápido para uso geral",
      status: "available",
      provider: "Alibaba Cloud",
      speed: 92,
      quality: 83,
      category: "chinese",
    },
    {
      id: "qwen-plus",
      name: "Qwen Plus",
      type: "cloud",
      description: "Alibaba Qwen Plus - Versão premium com melhor qualidade",
      status: "available",
      provider: "Alibaba Cloud",
      speed: 85,
      quality: 87,
      category: "chinese",
    },

    // Kimi (Moonshot)
    {
      id: "kimi-chat",
      name: "Kimi Chat",
      type: "cloud",
      description: "Moonshot Kimi - IA chinesa com contexto longo",
      status: "available",
      provider: "Moonshot AI",
      speed: 80,
      quality: 85,
      category: "chinese",
    },
  ]

  // Plataformas especializadas
  const platformModels: ModelInfo[] = [
    {
      id: "bolt-ai",
      name: "Bolt.new",
      type: "platform",
      description: "StackBlitz Bolt - Especialista em desenvolvimento web",
      status: "available",
      provider: "StackBlitz",
      speed: 90,
      quality: 92,
      category: "coding",
    },
    {
      id: "v0-ai",
      name: "v0.dev",
      type: "platform",
      description: "Vercel v0 - Gerador de interfaces React/Next.js",
      status: "available",
      provider: "Vercel",
      speed: 88,
      quality: 95,
      category: "coding",
    },
    {
      id: "cursor-ai",
      name: "Cursor AI",
      type: "platform",
      description: "Cursor - Editor de código com IA integrada",
      status: "available",
      provider: "Cursor",
      speed: 85,
      quality: 90,
      category: "coding",
    },
    {
      id: "manu-ai",
      name: "Manu AI",
      type: "platform",
      description: "Manu - Assistente especializada em tarefas específicas",
      status: "available",
      provider: "Manu",
      speed: 82,
      quality: 85,
      category: "specialized",
    },
  ]

  // Verificar modelos Ollama através da nossa API
  const checkOllamaModels = async () => {
    if (isEnvironmentUnavailable) {
      console.log("Ambiente não suporta Ollama, pulando verificação")
      return
    }

    setIsCheckingOllama(true)
    setOllamaStatus("checking")
    setErrorMessage("")
    setSuggestion("")
    setEnvironmentInfo("")

    try {
      console.log("Verificando modelos Ollama...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log("Timeout na verificação do Ollama")
        controller.abort()
      }, 8000)

      const response = await fetch("/api/ollama/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data: OllamaResponse = await response.json()
        console.log("Resposta da API Ollama:", data)

        if (data.environmentInfo) {
          setModels([...cloudModels, ...platformModels])
          setOllamaStatus("unavailable")
          setEnvironmentInfo(data.environmentInfo)
          setIsEnvironmentUnavailable(true)
          setErrorMessage(data.error || "")
          console.log("Ambiente não suporta Ollama:", data.environmentInfo)
        } else if (data.success && data.models && data.models.length > 0) {
          const ollamaModels: ModelInfo[] = data.models.map((model: any) => ({
            id: model.name,
            name: model.name.charAt(0).toUpperCase() + model.name.slice(1),
            type: "local" as const,
            description: `Modelo local Ollama - ${model.name} (${model.size})`,
            status: "available" as const,
            provider: "Ollama",
            speed: 60,
            quality: 75,
            category: "general" as const,
          }))

          setModels([...cloudModels, ...platformModels, ...ollamaModels])
          setOllamaStatus("connected")
          setErrorMessage("")
          setSuggestion("")
          console.log(`Encontrados ${ollamaModels.length} modelos Ollama`)
        } else if (data.success && data.models.length === 0) {
          setModels([...cloudModels, ...platformModels])
          setOllamaStatus("connected")
          setErrorMessage(data.error || "Nenhum modelo encontrado")
          setSuggestion(data.suggestion || "Execute 'ollama pull <modelo>' para baixar modelos")
          console.log("Ollama conectado mas sem modelos")
        } else {
          setModels([...cloudModels, ...platformModels])
          setOllamaStatus("disconnected")
          setErrorMessage(data.error || "Erro ao conectar com Ollama")
          setSuggestion(data.suggestion || "Verifique se o Ollama está rodando")
          console.log("Ollama não conectado:", data.error)
        }
      } else {
        console.error("Erro na API:", response.status, response.statusText)
        setModels([...cloudModels, ...platformModels])
        setOllamaStatus("disconnected")
        setErrorMessage("Erro na API de verificação do Ollama")
        setSuggestion("Tente novamente em alguns segundos")
      }
    } catch (error: any) {
      console.error("Erro ao verificar Ollama:", error)
      setModels([...cloudModels, ...platformModels])
      setOllamaStatus("disconnected")

      if (error.name === "AbortError") {
        setErrorMessage("Timeout: Verificação demorou mais que 8 segundos")
        setSuggestion("Verifique sua conexão ou tente novamente")
      } else if (error.message?.includes("Failed to fetch")) {
        setErrorMessage("Erro de rede na verificação")
        setSuggestion("Verifique sua conexão com a internet")
      } else {
        setErrorMessage("Erro inesperado na verificação")
        setSuggestion("Tente novamente em alguns segundos")
      }
    } finally {
      setIsCheckingOllama(false)
    }
  }

  // Carregar estatísticas de uso dos modelos
  useEffect(() => {
    const savedStats = localStorage.getItem("nova-model-stats")
    if (savedStats) {
      try {
        setModelStats(JSON.parse(savedStats))
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      }
    }

    const savedLastModel = localStorage.getItem("nova-last-model")
    if (savedLastModel) {
      setLastUsedModel(savedLastModel)
    }
  }, [])

  // Verificar modelos na inicialização
  useEffect(() => {
    setModels([...cloudModels, ...platformModels])

    const timer = setTimeout(() => {
      checkOllamaModels()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Verificação periódica apenas se não for ambiente indisponível
  useEffect(() => {
    if (isEnvironmentUnavailable) return

    const interval = setInterval(() => {
      if (!isCheckingOllama) {
        checkOllamaModels()
      }
    }, 120000)

    return () => clearInterval(interval)
  }, [isCheckingOllama, isEnvironmentUnavailable])

  // Atualizar estatísticas quando modelo muda
  useEffect(() => {
    if (selectedModel && selectedModel !== lastUsedModel) {
      setLastUsedModel(selectedModel)
      localStorage.setItem("nova-last-model", selectedModel)

      const newStats = {
        ...modelStats,
        [selectedModel]: (modelStats[selectedModel] || 0) + 1,
      }
      setModelStats(newStats)
      localStorage.setItem("nova-model-stats", JSON.stringify(newStats))
    }
  }, [selectedModel, lastUsedModel, modelStats])

  const availableModels = models.filter((m) => m.status === "available")
  const localModels = availableModels.filter((m) => m.type === "local")
  const cloudModelsAvailable = availableModels.filter((m) => m.type === "cloud")
  const platformModelsAvailable = availableModels.filter((m) => m.type === "platform")

  const getModelIcon = (model: ModelInfo) => {
    if (model.type === "local") return <Cpu size={14} />
    if (model.type === "platform") return <Code size={14} />
    if (model.category === "coding") return <Code size={14} />
    if (model.category === "creative") return <Sparkles size={14} />
    if (model.category === "chinese") return <Brain size={14} />
    return <Cloud size={14} />
  }

  const getModelBadgeColor = (model: ModelInfo) => {
    if (model.type === "local") return "bg-green-500"
    if (model.type === "platform") return "bg-purple-500"
    if (model.category === "coding") return "bg-blue-500"
    if (model.category === "creative") return "bg-pink-500"
    if (model.category === "chinese") return "bg-orange-500"
    return "bg-cyan-500"
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case "coding":
        return "Código"
      case "creative":
        return "Criativo"
      case "chinese":
        return "Chinês"
      case "specialized":
        return "Especializado"
      default:
        return "Geral"
    }
  }

  const selectRandomModel = () => {
    if (availableModels.length > 0) {
      const randomModel = availableModels[Math.floor(Math.random() * availableModels.length)]
      onModelChange(randomModel.id)
    }
  }

  const getStatusIcon = () => {
    switch (ollamaStatus) {
      case "connected":
        return <CheckCircle size={12} className="text-green-400" />
      case "disconnected":
        return <WifiOff size={12} className="text-red-400" />
      case "unavailable":
        return <Globe size={12} className="text-yellow-400" />
      case "checking":
        return <RefreshCw size={12} className="text-blue-400 animate-spin" />
      default:
        return <AlertCircle size={12} className="text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (ollamaStatus) {
      case "connected":
        return localModels.length > 0 ? `${localModels.length} modelos` : "Sem modelos"
      case "disconnected":
        return "Desconectado"
      case "unavailable":
        return "Indisponível"
      case "checking":
        return "Verificando..."
      default:
        return "Desconhecido"
    }
  }

  const getStatusColor = () => {
    switch (ollamaStatus) {
      case "connected":
        return "border-green-600"
      case "disconnected":
        return "border-red-600"
      case "unavailable":
        return "border-yellow-600"
      case "checking":
        return "border-blue-600"
      default:
        return "border-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Status e Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket size={16} className="text-cyan-400" />
          <h4 className="text-md font-medium text-gray-200">Modelos IA Expandidos</h4>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={checkOllamaModels}
                  disabled={isCheckingOllama || isEnvironmentUnavailable}
                  className="h-8 w-8 bg-transparent"
                >
                  <RefreshCw size={14} className={isCheckingOllama ? "animate-spin" : ""} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isEnvironmentUnavailable ? "Ollama indisponível neste ambiente" : "Verificar modelos disponíveis"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Badge variant="outline" className="text-xs">
            {availableModels.length} disponíveis
          </Badge>
        </div>
      </div>

      {/* Estatísticas dos Modelos */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-900 border border-cyan-600 rounded-lg p-3">
          <div className="text-lg font-bold text-cyan-400">{cloudModelsAvailable.length}</div>
          <div className="text-xs text-gray-400">Modelos Nuvem</div>
        </div>
        <div className="bg-gray-900 border border-purple-600 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-400">{platformModelsAvailable.length}</div>
          <div className="text-xs text-gray-400">Plataformas</div>
        </div>
        <div className="bg-gray-900 border border-green-600 rounded-lg p-3">
          <div className="text-lg font-bold text-green-400">{localModels.length}</div>
          <div className="text-xs text-gray-400">Modelos Locais</div>
        </div>
      </div>

      {/* Status do Ollama */}
      <div className={`bg-gray-900 border rounded-lg p-4 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-green-400" />
            <span className="text-sm font-medium text-gray-200">Ollama Local</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
        </div>

        {environmentInfo && (
          <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-600 rounded text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={12} className="text-yellow-400" />
              <strong className="text-yellow-400">Ambiente:</strong>
            </div>
            <div className="text-yellow-300">{environmentInfo}</div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-2 p-3 bg-red-900/20 border border-red-600 rounded text-xs">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={12} className="text-red-400" />
              <strong className="text-red-400">Status:</strong>
            </div>
            <div className="text-red-300">{errorMessage}</div>
          </div>
        )}

        {suggestion && (
          <div className="mt-2 p-3 bg-blue-900/20 border border-blue-600 rounded text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Info size={12} className="text-blue-400" />
              <strong className="text-blue-400">Sugestão:</strong>
            </div>
            <div className="text-blue-300">{suggestion}</div>
          </div>
        )}
      </div>

      {/* Modo Aleatório */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shuffle size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-gray-200">Modo Aleatório</span>
          </div>
          <Switch checked={randomMode} onCheckedChange={onRandomModeChange} />
        </div>

        {randomMode && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              NOVA escolherá automaticamente entre {availableModels.length} modelos diferentes para cada resposta
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={selectRandomModel}
              className="w-full flex items-center gap-2 bg-transparent"
            >
              <Shuffle size={14} />
              Sortear Modelo Agora
            </Button>
          </div>
        )}
      </div>

      {/* Seletor de Modelo */}
      {!randomMode && (
        <div className="space-y-3">
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 max-h-80">
              {/* Modelos na Nuvem */}
              <div className="px-2 py-1 text-xs font-medium text-gray-400 border-b border-gray-700">
                ☁️ Modelos na Nuvem
              </div>
              {cloudModelsAvailable.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2 w-full">
                    {getModelIcon(model)}
                    <span>{model.name}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Badge className={`text-xs text-white ${getModelBadgeColor(model)}`}>{model.provider}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(model.category)}
                      </Badge>
                      {modelStats[model.id] && (
                        <Badge variant="outline" className="text-xs">
                          {modelStats[model.id]}x
                        </Badge>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}

              {/* Plataformas Especializadas */}
              {platformModelsAvailable.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-gray-400 border-b border-gray-700 mt-2">
                    🚀 Plataformas Especializadas
                  </div>
                  {platformModelsAvailable.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2 w-full">
                        {getModelIcon(model)}
                        <span>{model.name}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          <Badge className={`text-xs text-white ${getModelBadgeColor(model)}`}>{model.provider}</Badge>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(model.category)}
                          </Badge>
                          {modelStats[model.id] && (
                            <Badge variant="outline" className="text-xs">
                              {modelStats[model.id]}x
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* Modelos Locais */}
              {localModels.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-gray-400 border-b border-gray-700 mt-2">
                    🖥️ Modelos Locais (Ollama)
                  </div>
                  {localModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2 w-full">
                        {getModelIcon(model)}
                        <span>{model.name}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          <Badge className={`text-xs text-white ${getModelBadgeColor(model)}`}>Local</Badge>
                          {modelStats[model.id] && (
                            <Badge variant="outline" className="text-xs">
                              {modelStats[model.id]}x
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>

          {/* Informações do Modelo Selecionado */}
          {selectedModel && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              {(() => {
                const currentModel = models.find((m) => m.id === selectedModel)
                if (!currentModel) return null

                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getModelIcon(currentModel)}
                      <span className="font-medium text-gray-200">{currentModel.name}</span>
                      <Badge className={`text-xs text-white ${getModelBadgeColor(currentModel)}`}>
                        {currentModel.provider}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(currentModel.category)}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-400">{currentModel.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Velocidade</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${currentModel.speed}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{currentModel.speed}%</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Qualidade</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${currentModel.quality}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{currentModel.quality}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {currentModel.type === "local" ? (
                          <CheckCircle size={12} className="text-green-400" />
                        ) : currentModel.type === "platform" ? (
                          <Rocket size={12} className="text-purple-400" />
                        ) : (
                          <Wifi size={12} className="text-blue-400" />
                        )}
                        {currentModel.type === "local"
                          ? "Privacidade Total"
                          : currentModel.type === "platform"
                            ? "Plataforma Especializada"
                            : "Requer Internet"}
                      </div>

                      {modelStats[currentModel.id] && <div>Usado {modelStats[currentModel.id]} vezes</div>}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* Informação sobre novos modelos */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-sm font-medium text-purple-400">Novos Modelos Adicionados!</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Agora com suporte a Grok (xAI), DeepSeek, Qwen, Kimi, Bolt.new, v0.dev e muito mais!
        </p>
        <div className="flex flex-wrap gap-2">
          {["Grok", "DeepSeek", "Qwen", "Kimi", "Bolt", "v0.dev", "Cursor"].map((name) => (
            <Badge key={name} className="text-xs bg-purple-600 text-white">
              {name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Estatísticas de Uso */}
      {Object.keys(modelStats).length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
            <Info size={14} />
            Estatísticas de Uso
          </h5>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(modelStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([modelId, count]) => {
                const model = models.find((m) => m.id === modelId)
                return (
                  <div key={modelId} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 truncate">{model?.name || modelId}</span>
                    <Badge variant="outline" className="text-xs">
                      {count}x
                    </Badge>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
