"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Send, Volume2, VolumeX, RefreshCw, HelpCircle, X, Settings, User } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import AvatarDisplay from "./avatar-display"

export default function AriaInterface() {
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [avatarExpression, setAvatarExpression] = useState<"neutral" | "talking" | "thinking" | "happy" | "surprised">(
    "neutral",
  )
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const recognitionRef = useRef<any>(null)
  const [darkMode, setDarkMode] = useState(true)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Olá! Eu sou ARIA, sua assistente virtual. Como posso ajudar você hoje?",
      },
    ],
  })

  useEffect(() => {
    // Set dark mode
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Initialize speech synthesis
    if (typeof window !== "undefined") {
      speechSynthesisRef.current = window.speechSynthesis

      // Initialize speech recognition if available
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
      }
    }

    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel()
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [darkMode])

  // Set avatar expression based on context
  useEffect(() => {
    if (isLoading) {
      setAvatarExpression("thinking")
    } else if (isSpeaking) {
      setAvatarExpression("talking")
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]

      // Check content for sentiment to set expression
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

  // Speak the last message when it arrives
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant" && voiceEnabled) {
      speakText(messages[messages.length - 1].content)
    }
  }, [messages, voiceEnabled])

  const speakText = (text: string) => {
    if (speechSynthesisRef.current && voiceEnabled) {
      speechSynthesisRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Get available voices
      const voices = speechSynthesisRef.current.getVoices()

      // Try to find a female voice for Portuguese
      const femaleVoice =
        voices.find((voice) => voice.lang.includes("pt") && voice.name.includes("Female")) ||
        voices.find((voice) => voice.lang.includes("pt")) ||
        voices[0]

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      // Set a slightly higher pitch for a sweeter voice
      utterance.pitch = 1.1
      utterance.rate = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)

      speechSynthesisRef.current.speak(utterance)
    }
  }

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
      } else {
        setIsListening(true)
        recognitionRef.current.start()
      }
    }
  }

  const toggleVoice = () => {
    if (isSpeaking && speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel()
      setIsSpeaking(false)
    }
    setVoiceEnabled(!voiceEnabled)
  }

  const nextTutorialStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1)
    } else {
      setShowTutorial(false)
    }
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
        title: "Bem-vindo à ARIA",
        content:
          "ARIA é sua assistente de IA inteligente. Este tutorial rápido vai te mostrar como usar todas as funcionalidades.",
        position: "center",
      },
      {
        title: "Conversando com ARIA",
        content:
          "Digite suas mensagens na caixa de texto abaixo ou use o botão de microfone para falar. ARIA responderá com texto e voz.",
        position: "bottom",
      },
      {
        title: "Expressões Faciais",
        content: "ARIA tem expressões faciais que mudam conforme a conversa. Observe como ela reage às suas mensagens!",
        position: "top",
      },
      {
        title: "Configurações",
        content:
          "Você pode personalizar a ARIA nas configurações. Experimente diferentes modelos de IA para encontrar o que melhor atende suas necessidades.",
        position: "right",
      },
    ]

    const currentStep = steps[tutorialStep]

    let positionClass = "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    if (currentStep.position === "bottom") positionClass = "bottom-24 left-1/2 transform -translate-x-1/2"
    if (currentStep.position === "top") positionClass = "top-24 left-1/2 transform -translate-x-1/2"
    if (currentStep.position === "right") positionClass = "top-1/2 right-24 transform -translate-y-1/2"

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
        <div className={`absolute ${positionClass} bg-gray-800 border border-amber-700 rounded-lg p-6 max-w-md`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-amber-400">{currentStep.title}</h3>
            <button onClick={() => setShowTutorial(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-200 mb-6">{currentStep.content}</p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === tutorialStep ? "bg-amber-500" : "bg-gray-600"}`}
                />
              ))}
            </div>
            <Button onClick={nextTutorialStep} className="bg-amber-700 hover:bg-amber-600 text-white">
              {tutorialStep < 3 ? "Próximo" : "Começar"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderSettings = () => {
    if (!showSettings) return null

    return (
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
        onClick={() => setShowSettings(false)}
      >
        <div
          className="bg-gray-800 border border-amber-700 rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-amber-400">Configurações</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-200">Modelo de IA</h4>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
                  <SelectItem value="claude-3-7-sonnet">Claude 3.7 Sonnet</SelectItem>
                  <SelectItem value="o3-mini">OpenAI o3-mini</SelectItem>
                  <SelectItem value="gemini-pro">Google Gemini Pro</SelectItem>
                </SelectContent>
              </Select>

              <div className="bg-gray-900 p-3 rounded-md border border-gray-700 mt-2">
                <h5 className="text-sm font-medium text-amber-400 mb-1">{getModelDescription(selectedModel).name}</h5>
                <p className="text-xs text-gray-300 mb-2">{getModelDescription(selectedModel).description}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">Velocidade:</span>
                  <Progress value={getModelDescription(selectedModel).speed} className="h-1 flex-1" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-200">Voz</h4>
              <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                <span className="text-sm text-gray-300">Resposta por voz</span>
                <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>
              <p className="text-xs text-gray-500">Quando ativado, ARIA lerá suas respostas em voz alta.</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-200">Aparência</h4>
              <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                <span className="text-sm text-gray-300">Modo escuro</span>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-200">Expressões do Avatar</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="bg-gray-900 border-gray-700 text-gray-200 text-xs"
                  onClick={() => setAvatarExpression("neutral")}
                >
                  Neutra
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-900 border-gray-700 text-gray-200 text-xs"
                  onClick={() => setAvatarExpression("happy")}
                >
                  Feliz
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-900 border-gray-700 text-gray-200 text-xs"
                  onClick={() => setAvatarExpression("surprised")}
                >
                  Surpresa
                </Button>
              </div>
              <p className="text-xs text-gray-500">Teste as diferentes expressões faciais da ARIA.</p>
            </div>

            <Button className="w-full bg-amber-700 hover:bg-amber-600 text-white" onClick={() => setShowTutorial(true)}>
              <HelpCircle size={16} className="mr-2" />
              Mostrar Tutorial
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <span className="font-bold text-white">A</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            ARIA
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVoice}
                  className="text-gray-400 hover:text-amber-400 hover:bg-gray-800"
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
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
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="text-gray-400 hover:text-amber-400 hover:bg-gray-800"
                >
                  <Settings size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-amber-400 hover:bg-gray-800">
                  <User size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Perfil</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col">
          <div className="flex justify-center mb-6">
            <AvatarDisplay
              isSpeaking={isSpeaking}
              expression={avatarExpression}
              size={messages.length === 0 ? "large" : "medium"}
            />
          </div>

          {messages.length === 0 ? (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-amber-400">Olá! Eu sou ARIA</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Sua assistente virtual com expressões faciais. Como posso ajudar você hoje?
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto mb-4 space-y-4 pr-2">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={`p-3 ${
                    message.role === "user"
                      ? "ml-12 bg-gray-800/70 border-gray-700"
                      : "mr-12 bg-gray-900/70 border-amber-900/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-amber-700/50">
                        <AvatarDisplay
                          isSpeaking={isSpeaking && messages[messages.length - 1].id === message.id}
                          expression="neutral"
                          size="small"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1 text-gray-400">
                        {message.role === "user" ? "Você" : "ARIA"}
                        {message.role === "assistant" &&
                          isSpeaking &&
                          messages[messages.length - 1].id === message.id && (
                            <span className="ml-2 text-amber-500 animate-pulse">•••</span>
                          )}
                      </div>
                      <div className={message.role === "assistant" ? "text-amber-50" : "text-gray-200"}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem para ARIA..."
              className="min-h-[60px] resize-none bg-gray-800/50 border-gray-700 text-gray-200 focus:border-amber-600"
            />
            <div className="flex flex-col gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={toggleListening}
                      className={
                        isListening
                          ? "bg-red-900/70 border-red-700"
                          : "bg-gray-800/50 border-gray-700 hover:border-amber-600"
                      }
                    >
                      {isListening ? (
                        <MicOff size={18} className="text-red-400" />
                      ) : (
                        <Mic size={18} className="text-gray-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{isListening ? "Parar de ouvir" : "Falar com ARIA"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !input.trim()}
                      className="bg-amber-700 hover:bg-amber-600 text-white"
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
      </main>

      {renderTutorial()}
      {renderSettings()}
    </div>
  )
}

