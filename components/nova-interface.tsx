"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  HelpCircle,
  Info,
  X,
  Paperclip,
  AlertTriangle,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Sidebar from "./sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import AnimatedAvatar from "./animated-avatar"
import FileUpload from "./file-upload"
import { useNaturalVoice } from "./voice/natural-voice"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NovaInterface() {
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [activeSection, setActiveSection] = useState("chat")
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showModelInfo, setShowModelInfo] = useState(false)
  const [avatarExpression, setAvatarExpression] = useState<"neutral" | "talking" | "thinking" | "happy" | "surprised">(
    "neutral",
  )
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [voiceProvider, setVoiceProvider] = useState<"browser" | "elevenlabs" | "azure" | "openai">("openai")
  const [error, setError] = useState<string | null>(null)
  const [knowledgeEnabled, setKnowledgeEnabled] = useState(false)
  const [learningMode, setLearningMode] = useState(false)
  const [useRandomModel, setUseRandomModel] = useState(false)
  const recognitionRef = useRef<any>(null)
  const errorTimeoutRef = useRef<NodeJS.Timeout>()

  // Configuração de voz natural
  const voiceConfig = {
    provider: voiceProvider,
    voiceId:
      voiceProvider === "openai"
        ? "nova"
        : voiceProvider === "elevenlabs"
          ? "21m00Tcm4TlvDq8ikWAM"
          : "pt-BR-FranciscaNeural",
    model: voiceProvider === "openai" ? "tts-1-hd" : "eleven_multilingual_v2",
    speed: 1.0,
    pitch: 1.2,
    volume: 1.0,
  }

  const { speak, stop, isSpeaking, isSupported } = useNaturalVoice(voiceConfig)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatError,
  } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      files: uploadedFiles,
      useRandom: useRandomModel,
      knowledgeEnabled,
      learningMode,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Olá! Eu sou NOVA, sua assistente inteligente com voz natural. Posso analisar imagens, documentos, áudio e muito mais. Como posso ajudar você hoje?",
      },
    ],
    onError: (error) => {
      setError(`Erro na conversa: ${error.message}`)
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = setTimeout(() => setError(null), 5000)
    },
  })

  // Verificar se a conversa realmente começou (mais de uma mensagem além da inicial)
  const hasStartedConversation = messages.length > 1

  useEffect(() => {
    // Initialize speech recognition if available
    if (typeof window !== "undefined") {
      if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.lang = "pt-BR"
        recognitionRef.current.interimResults = false

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          handleInputChange({ target: { value: transcript } } as any)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          setError(`Erro no reconhecimento de voz: ${event.error}`)
          setIsListening(false)
          if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
          errorTimeoutRef.current = setTimeout(() => setError(null), 3000)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [])

  // Set avatar expression based on context
  useEffect(() => {
    if (isLoading) {
      setAvatarExpression("thinking")
    } else if (isSpeaking) {
      setAvatarExpression("talking")
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]

      if (lastMessage.role === "assistant") {
        if (
          lastMessage.content.includes("!") ||
          lastMessage.content.includes("😊") ||
          lastMessage.content.includes("ótimo") ||
          lastMessage.content.includes("excelente")
        ) {
          setAvatarExpression("happy")
          setTimeout(() => setAvatarExpression("neutral"), 3000)
        } else if (
          lastMessage.content.includes("?") ||
          lastMessage.content.includes("interessante") ||
          lastMessage.content.includes("curioso")
        ) {
          setAvatarExpression("surprised")
          setTimeout(() => setAvatarExpression("neutral"), 3000)
        } else {
          setAvatarExpression("neutral")
        }
      }
    } else {
      setAvatarExpression("neutral")
    }
  }, [isLoading, isSpeaking, messages])

  // Speak the last message when it arrives using natural voice
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant" && voiceEnabled) {
      const lastMessage = messages[messages.length - 1].content
      speak(lastMessage).catch((error) => {
        console.error("Erro na síntese de voz:", error)
        setError("Erro na síntese de voz. Verifique as configurações.")
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = setTimeout(() => setError(null), 3000)
      })
    }
  }, [messages, voiceEnabled, speak])

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
      } else {
        setIsListening(true)
        recognitionRef.current.start()
      }
    } else {
      setError("Reconhecimento de voz não suportado neste navegador")
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = setTimeout(() => setError(null), 3000)
    }
  }

  const toggleVoice = () => {
    if (isSpeaking) {
      stop()
    }
    setVoiceEnabled(!voiceEnabled)
  }

  const nextTutorialStep = () => {
    if (tutorialStep < 4) {
      setTutorialStep(tutorialStep + 1)
    } else {
      setShowTutorial(false)
    }
  }

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const handleFileAnalyzed = (fileId: string, analysis: any) => {
    setUploadedFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, analysis } : file)))
  }

  const getModelDescription = (modelId: string) => {
    switch (modelId) {
      case "gpt-4o":
        return {
          name: "OpenAI GPT-4o",
          description: "Modelo avançado da OpenAI com excelente compreensão de contexto e geração de texto natural.",
          strengths: ["Respostas detalhadas", "Compreensão de contexto", "Versatilidade"],
          speed: 85,
        }
      case "claude-3-7-sonnet":
        return {
          name: "Claude 3.7 Sonnet",
          description: "Modelo da Anthropic com foco em respostas seguras e bem fundamentadas.",
          strengths: ["Respostas seguras", "Explicações claras", "Raciocínio lógico"],
          speed: 80,
        }
      case "o3-mini":
        return {
          name: "OpenAI o3-mini",
          description: "Versão compacta e rápida do modelo o3 da OpenAI, ideal para respostas rápidas.",
          strengths: ["Velocidade", "Eficiência", "Respostas concisas"],
          speed: 95,
        }
      case "gemini-pro":
        return {
          name: "Google Gemini Pro",
          description: "Modelo avançado do Google com capacidades multimodais e conhecimento amplo.",
          strengths: ["Conhecimento amplo", "Multimodalidade", "Precisão"],
          speed: 90,
        }
      default:
        return {
          name: modelId,
          description: "Modelo de IA para processamento de linguagem natural.",
          strengths: ["Processamento de texto", "Geração de conteúdo"],
          speed: 80,
        }
    }
  }

  const renderTutorial = () => {
    if (!showTutorial) return null

    const steps = [
      {
        title: "Bem-vindo à NOVA",
        content:
          "NOVA é sua assistente de IA com voz natural e capacidades avançadas. Este tutorial vai te mostrar como usar todas as funcionalidades.",
        position: "center",
      },
      {
        title: "Conversando com NOVA",
        content:
          "Digite suas mensagens na caixa de texto ou use o botão de microfone para falar. NOVA responderá com texto e voz natural.",
        position: "bottom",
      },
      {
        title: "Sistema de Anexos",
        content:
          "Após iniciar uma conversa, você pode anexar imagens, documentos e áudio. NOVA analisará automaticamente o conteúdo.",
        position: "bottom",
      },
      {
        title: "Menu de Funcionalidades",
        content:
          "Use o menu lateral para acessar Chat, Configurações e outras funcionalidades. Explore as diferentes seções.",
        position: "left",
      },
      {
        title: "Configurações Avançadas",
        content:
          "Nas configurações, você pode escolher modelos de IA, configurar voz, ativar sistema de conhecimento e modo de aprendizado.",
        position: "right",
      },
    ]

    const currentStep = steps[tutorialStep]

    let positionClass = "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    if (currentStep.position === "bottom") positionClass = "bottom-4 left-1/2 transform -translate-x-1/2"
    if (currentStep.position === "left") positionClass = "top-1/2 left-4 transform -translate-y-1/2"
    if (currentStep.position === "right") positionClass = "top-1/2 right-4 transform -translate-y-1/2"

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div
          className={`absolute ${positionClass} bg-gray-800 border border-cyan-700 rounded-lg p-4 md:p-6 max-w-sm md:max-w-md w-full mx-4`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-bold text-cyan-400">{currentStep.title}</h3>
            <button onClick={() => setShowTutorial(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm md:text-base text-gray-200 mb-6">{currentStep.content}</p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === tutorialStep ? "bg-cyan-500" : "bg-gray-600"}`}
                />
              ))}
            </div>
            <Button onClick={nextTutorialStep} className="bg-cyan-700 hover:bg-cyan-600 text-white text-sm">
              {tutorialStep < 4 ? "Próximo" : "Começar"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderModelInfo = () => {
    if (!showModelInfo) return null

    const modelInfo = getModelDescription(selectedModel)

    return (
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={() => setShowModelInfo(false)}
      >
        <div
          className="bg-gray-800 border border-cyan-700 rounded-lg p-4 md:p-6 max-w-sm md:max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-bold text-cyan-400">{modelInfo.name}</h3>
            <button onClick={() => setShowModelInfo(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm md:text-base text-gray-200 mb-4">{modelInfo.description}</p>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Pontos Fortes:</h4>
            <ul className="list-disc pl-5 text-gray-300 text-sm">
              {modelInfo.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Velocidade de Resposta:</h4>
            <div className="flex items-center gap-2">
              <Progress value={modelInfo.speed} className="h-2" />
              <span className="text-sm text-gray-300">{modelInfo.speed}%</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "chat":
        return (
          <div className="flex-1 flex flex-col h-full">
            {/* Error Alert */}
            {error && (
              <Alert className="mb-4 border-red-700 bg-red-950/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            {/* Avatar display when no messages or at the top */}
            {!hasStartedConversation ? (
              <div className="flex flex-col items-center justify-center flex-1 px-4">
                <div className="mb-6">
                  <AnimatedAvatar isSpeaking={isSpeaking} expression={avatarExpression} size="large" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold mb-2 text-cyan-400 text-center">Olá, eu sou NOVA</h2>
                <p className="text-gray-400 max-w-md text-center text-sm md:text-base">
                  Sua assistente inteligente com voz natural. Como posso ajudar você hoje?
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 text-sm"
                    onClick={() => handleInputChange({ target: { value: "Analise uma imagem para mim" } } as any)}
                  >
                    📸 Analisar Imagem
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 text-sm"
                    onClick={() => handleInputChange({ target: { value: "Me ajude com um documento" } } as any)}
                  >
                    📄 Analisar Documento
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 text-sm"
                    onClick={() => handleInputChange({ target: { value: "Transcreva um áudio" } } as any)}
                  >
                    🎵 Transcrever Áudio
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 text-sm"
                    onClick={() => handleInputChange({ target: { value: "Como você pode me ajudar?" } } as any)}
                  >
                    💬 Conversar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4 md:mb-6">
                  <AnimatedAvatar isSpeaking={isSpeaking} expression={avatarExpression} size="medium" />
                </div>
                <div className="flex-1 overflow-auto mb-4 space-y-4 pr-2">
                  {messages.map((message) => (
                    <Card
                      key={message.id}
                      className={`p-3 ${
                        message.role === "user"
                          ? "ml-2 md:ml-12 bg-gray-800 border-gray-700"
                          : "mr-2 md:mr-12 bg-gray-900 border-cyan-900"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && (
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden flex-shrink-0 border border-cyan-700">
                            <AnimatedAvatar
                              isSpeaking={isSpeaking && messages[messages.length - 1].id === message.id}
                              expression="neutral"
                              size="small"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs md:text-sm font-medium mb-1 text-gray-400">
                            {message.role === "user" ? "Você" : "NOVA"}
                            {message.role === "assistant" &&
                              isSpeaking &&
                              messages[messages.length - 1].id === message.id && (
                                <span className="ml-2 text-cyan-500 animate-pulse">•••</span>
                              )}
                          </div>
                          <div
                            className={`text-sm md:text-base break-words ${message.role === "assistant" ? "text-cyan-50" : "text-gray-200"}`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <div className="space-y-4">
              {showFileUpload && hasStartedConversation && (
                <FileUpload
                  onFilesUploaded={handleFilesUploaded}
                  onFileAnalyzed={handleFileAnalyzed}
                  maxFiles={5}
                  maxSize={25}
                  className="mb-4"
                />
              )}

              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Digite sua mensagem para NOVA..."
                  className="min-h-[60px] resize-none bg-gray-800 border-gray-700 text-gray-200 text-sm md:text-base"
                  rows={2}
                />
                <div className="flex flex-col gap-2">
                  {hasStartedConversation && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowFileUpload(!showFileUpload)}
                            className={`h-10 w-10 ${showFileUpload ? "bg-cyan-900 border-cyan-700" : "bg-gray-800 border-gray-700"}`}
                          >
                            <Paperclip size={18} className={showFileUpload ? "text-cyan-400" : "text-gray-400"} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>{showFileUpload ? "Ocultar anexos" : "Anexar arquivos"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={toggleListening}
                          className={`h-10 w-10 ${isListening ? "bg-red-900 border-red-700" : "bg-gray-800 border-gray-700"}`}
                        >
                          {isListening ? (
                            <MicOff size={18} className="text-red-400" />
                          ) : (
                            <Mic size={18} className="text-gray-400" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{isListening ? "Parar de ouvir" : "Falar com NOVA"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="submit"
                          size="icon"
                          disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
                          className="bg-cyan-700 hover:bg-cyan-600 text-white h-10 w-10"
                        >
                          {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Enviar mensagem</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </form>
            </div>
          </div>
        )
      case "settings":
        return (
          <div className="p-4 space-y-6 overflow-auto h-full">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-cyan-400">Modelos de IA</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowModelInfo(true)}
                        className="text-gray-400 hover:text-cyan-400"
                      >
                        <Info size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver informações sobre o modelo selecionado</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model" className="text-gray-300">
                    Selecione o modelo de IA
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="ai-model" className="bg-gray-900 border-gray-700 text-gray-200">
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
                      <SelectItem value="claude-3-7-sonnet">Claude 3.7 Sonnet</SelectItem>
                      <SelectItem value="o3-mini">OpenAI o3-mini</SelectItem>
                      <SelectItem value="gemini-pro">Google Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                    <span className="text-sm text-gray-300">Modo Aleatório</span>
                    <Switch checked={useRandomModel} onCheckedChange={setUseRandomModel} />
                  </div>
                  <p className="text-xs text-gray-500">
                    Usa um modelo diferente a cada resposta para perspectivas variadas.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-cyan-400 mb-4">Sistema Inteligente</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                  <div>
                    <span className="text-sm text-gray-300">Base de Conhecimento</span>
                    <p className="text-xs text-gray-500">RAG e busca semântica</p>
                  </div>
                  <Switch checked={knowledgeEnabled} onCheckedChange={setKnowledgeEnabled} />
                </div>

                <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                  <div>
                    <span className="text-sm text-gray-300">Aprendizado Contínuo</span>
                    <p className="text-xs text-gray-500">Aprende com interações</p>
                  </div>
                  <Switch checked={learningMode} onCheckedChange={setLearningMode} />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-cyan-400 mb-4">Configurações de Voz</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                  <span className="text-sm text-gray-300">Resposta por voz</span>
                  <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Provedor de Voz</Label>
                  <Select value={voiceProvider} onValueChange={(value: any) => setVoiceProvider(value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="openai">OpenAI TTS (Recomendado)</SelectItem>
                      <SelectItem value="elevenlabs">ElevenLabs (Premium)</SelectItem>
                      <SelectItem value="azure">Azure Speech</SelectItem>
                      <SelectItem value="browser">Navegador (Gratuito)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    OpenAI TTS oferece a voz mais natural, similar ao ChatGPT. ElevenLabs tem qualidade premium.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-cyan-400 mb-4">Configurações do Avatar</h3>
              <div className="flex flex-col items-center mb-4">
                <AnimatedAvatar isSpeaking={false} expression={avatarExpression} size="medium" />
                <div className="grid grid-cols-3 gap-2 mt-4 w-full">
                  <Button
                    variant="outline"
                    className="bg-gray-900 border-gray-700 text-gray-200 text-xs md:text-sm"
                    onClick={() => setAvatarExpression("neutral")}
                  >
                    Neutra
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-900 border-gray-700 text-gray-200 text-xs md:text-sm"
                    onClick={() => setAvatarExpression("happy")}
                  >
                    Feliz
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-900 border-gray-700 text-gray-200 text-xs md:text-sm"
                    onClick={() => setAvatarExpression("surprised")}
                  >
                    Surpresa
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  O avatar da NOVA reage automaticamente durante a conversa, mostrando expressões faciais baseadas no
                  contexto.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-cyan-400 mb-4">Sobre NOVA</h3>
              <div className="flex items-center gap-4">
                <AnimatedAvatar isSpeaking={false} expression="neutral" size="default" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-200">NOVA Assistente IA</h3>
                  <p className="text-sm text-gray-400">Versão 2.0.0</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Assistente inteligente com voz natural, análise de arquivos, sistema de conhecimento e aprendizado
                    contínuo.
                  </p>
                </div>
              </div>
              <Button
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white"
                onClick={() => setShowTutorial(true)}
              >
                <HelpCircle size={16} className="mr-2" />
                Mostrar Tutorial Novamente
              </Button>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md text-center mx-4">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Funcionalidade em Desenvolvimento</h3>
              <p className="text-gray-300 mb-4 text-sm md:text-base">
                Esta seção está sendo desenvolvida e estará disponível em breve. Por enquanto, você pode usar o Chat
                para conversar com NOVA ou ajustar as configurações.
              </p>
              <Button className="bg-cyan-700 hover:bg-cyan-600 text-white" onClick={() => setActiveSection("chat")}>
                Voltar para o Chat
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <div className="hidden md:block">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-gray-800 border-b border-gray-700 p-3 md:p-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              NOVA
            </h1>
            <span className="text-xs md:text-sm text-gray-400">Assistente IA</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVoice}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700 h-8 w-8 md:h-10 md:w-10"
                  >
                    {voiceEnabled ? (
                      <Volume2 size={16} className="text-cyan-400" />
                    ) : (
                      <VolumeX size={16} className="text-gray-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{voiceEnabled ? "Desativar voz" : "Ativar voz"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowTutorial(true)}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700 h-8 w-8 md:h-10 md:w-10"
                  >
                    <HelpCircle size={16} className="text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mostrar tutorial</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-cyan-600">
              <img src="/placeholder.svg?height=40&width=40" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-gray-800 border-b border-gray-700 p-2">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={activeSection === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("chat")}
              className="whitespace-nowrap"
            >
              💬 Chat
            </Button>
            <Button
              variant={activeSection === "settings" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection("settings")}
              className="whitespace-nowrap"
            >
              ⚙️ Config
            </Button>
          </div>
        </div>

        <main className="flex-1 p-3 md:p-4 overflow-hidden flex flex-col">{renderContent()}</main>
      </div>

      {renderTutorial()}
      {renderModelInfo()}
    </div>
  )
}
