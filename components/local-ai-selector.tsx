"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Cpu, Wifi, WifiOff } from "lucide-react"

interface LocalAISelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export default function LocalAISelector({ selectedModel, onModelChange }: LocalAISelectorProps) {
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isOllamaRunning, setIsOllamaRunning] = useState(false)

  // Verificar se Ollama está rodando
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch("http://localhost:11434/api/tags")
        if (response.ok) {
          const data = await response.json()
          setAvailableModels(data.models?.map((m: any) => m.name) || [])
          setIsOllamaRunning(true)
        }
      } catch (error) {
        setIsOllamaRunning(false)
        setAvailableModels([])
      }
    }

    checkOllama()
    const interval = setInterval(checkOllama, 10000) // Verificar a cada 10s

    return () => clearInterval(interval)
  }, [])

  const localModels = [
    { id: "llama2", name: "Llama 2", description: "Meta's Llama 2 - Conversação geral" },
    { id: "mistral", name: "Mistral", description: "Mistral AI - Rápido e eficiente" },
    { id: "codellama", name: "Code Llama", description: "Especializado em programação" },
    { id: "gemma", name: "Gemma", description: "Google Gemma - Modelo compacto" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Cpu size={16} className="text-cyan-400" />
        <h4 className="text-md font-medium text-gray-200">Modelos Locais (Ollama)</h4>
        <Badge variant={isOllamaRunning ? "default" : "destructive"} className="text-xs">
          {isOllamaRunning ? (
            <>
              <Wifi size={12} className="mr-1" />
              Conectado
            </>
          ) : (
            <>
              <WifiOff size={12} className="mr-1" />
              Desconectado
            </>
          )}
        </Badge>
      </div>

      {!isOllamaRunning ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h5 className="text-sm font-medium text-yellow-400 mb-2">Ollama não detectado</h5>
          <p className="text-xs text-gray-400 mb-3">Para usar IAs locais, instale o Ollama:</p>
          <div className="bg-gray-800 rounded p-2 font-mono text-xs text-green-400">
            <div>curl -fsSL https://ollama.ai/install.sh | sh</div>
            <div>ollama pull llama2</div>
            <div>ollama pull mistral</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
              <SelectValue placeholder="Selecione um modelo local" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {localModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <Cpu size={14} />
                    {model.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-xs text-gray-500">
            <strong>Modelos disponíveis:</strong> {availableModels.length > 0 ? availableModels.join(", ") : "Nenhum"}
          </div>

          {localModels.find((m) => m.id === selectedModel) && (
            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <div className="text-sm text-gray-300">
                {localModels.find((m) => m.id === selectedModel)?.description}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <Cpu size={10} className="mr-1" />
                  Local
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Privacidade Total
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
