"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Send, Volume2, VolumeX, RefreshCw, HelpCircle, Info, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Sidebar from "./sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import AnimatedAvatar from "./animated-avatar"

export default function NovaInterface() {
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [activeSection, setActiveSection] = useState("chat")
  const [showTutorial, setShowTutorial] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [showModelInfo, setShowModelInfo] = useState(false)
  const [avatarExpression, setAvatarExpression] = useState<"neutral" | "talking" | "thinking" | "happy" | "surprised">(
    "neutral",
  )
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const recognitionRef = useRef<any>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Olá! Eu sou NOVA, sua assistente com voz suave e doce. Posso ajudar com informações, responder perguntas ou simplesmente conversar. Como posso te ajudar hoje?",
      },
    ],
  })

  useEffect(() => {
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
  }, [])

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
      utterance.pitch = 1.2
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
        title: "Bem-vindo à NOVA",
        content:
          "NOVA é sua assistente de IA com voz suave e doce. Este tutorial rápido vai te mostrar como usar todas as funcionalidades.",
        position: "center",
      },
      {
        title: "Conversando com NOVA",
        content:
          "Digite suas mensagens na caixa de texto abaixo ou use o botão de microfone para falar. NOVA responderá com texto e voz.",
        position: "bottom",
      },
      {
        title: "Menu de Funcionalidades",
        content:
          "Use o menu lateral para acessar diferentes funcionalidades. O Chat é onde você conversa com NOVA, e em Configurações você pode personalizar sua experiência.",
        position: "left",
      },
      {
        title: "Modelos de IA",
        content:
          "NOVA pode usar diferentes modelos de IA. Cada um tem características únicas. Experimente-os na seção de Configurações para encontrar o que melhor atende suas necessidades.",
        position: "right",
      },
    ]

    const currentStep = steps[tutorialStep]

    let positionClass = "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    if (currentStep.position === "bottom") positionClass = "bottom-24 left-1/2 transform -translate-x-1/2"
    if (currentStep.position === "left") positionClass = "top-1/2 left-24 transform -translate-y-1/2"
    if (currentStep.position === "right") positionClass = "top-1/2 right-24 transform -translate-y-1/2"

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
        <div className={`absolute ${positionClass} bg-gray-800 border border-cyan-700 rounded-lg p-6 max-w-md`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cyan-400">{currentStep.title}</h3>
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
                  className={`w-2 h-2 rounded-full ${index === tutorialStep ? "bg-cyan-500" : "bg-gray-600"}`}
                />
              ))}
            </div>
            <Button onClick={nextTutorialStep} className="bg-cyan-700 hover:bg-cyan-600 text-white">
              {tutorialStep < 3 ? "Próximo" : "Começar"}
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
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
        onClick={() => setShowModelInfo(false)}
      >
        <div
          className="bg-gray-800 border border-cyan-700 rounded-lg p-6 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-cyan-400">{modelInfo.name}</h3>
            <button onClick={() => setShowModelInfo(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-200 mb-4">{modelInfo.description}</p>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Pontos Fortes:</h4>
            <ul className="list-disc pl-5 text-gray-300">
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
            {/* Avatar display when no messages or at the top */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="mb-6">
                  <AnimatedAvatar isSpeaking={isSpeaking} expression={avatarExpression} size="large" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-cyan-400">Olá, eu sou NOVA</h2>
                <p className="text-gray-400 max-w-md text-center">
                  Sua assistente com voz suave e doce. Como posso ajudar você hoje?
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <AnimatedAvatar isSpeaking={isSpeaking} expression={avatarExpression} size="medium" />
                </div>
                <div className="flex-1 overflow-auto mb-4 space-y-4 pr-2">
                  {messages.map((message) => (
                    <Card
                      key={message.id}
                      className={`p-3 ${
                        message.role === "user"
                          ? "ml-12 bg-gray-800 border-gray-700"
                          : "mr-12 bg-gray-900 border-cyan-900"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-cyan-700">
                            <AnimatedAvatar
                              isSpeaking={isSpeaking && messages[messages.length - 1].id === message.id}
                              expression="neutral"
                              size="small"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1 text-gray-400">
                            {message.role === "user" ? "Você" : "NOVA"}
                            {message.role === "assistant" &&
                              isSpeaking &&
                              messages[messages.length - 1].id === message.id && (
                                <span className="ml-2 text-cyan-500 animate-pulse">•••</span>
                              )}
                          </div>
                          <div className={message.role === "assistant" ? "text-cyan-50" : "text-gray-200"}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Digite sua mensagem para NOVA..."
                className="min-h-[60px] resize-none bg-gray-800 border-gray-700 text-gray-200"
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
                        className={isListening ? "bg-red-900 border-red-700" : "bg-gray-800 border-gray-700"}
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
                        disabled={isLoading || !input.trim()}
                        className="bg-cyan-700 hover:bg-cyan-600 text-white"
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
        )
      case "settings":
        return (
          <div className="p-4 space-y-6">
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
                  <p className="text-xs text-gray-500 mt-1">
                    Cada modelo tem características diferentes. O GPT-4o é versátil, o Claude é seguro, o o3-mini é
                    rápido, e o Gemini tem amplo conhecimento.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Configurações de Voz</Label>
                  <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                    <span className="text-sm text-gray-300">Resposta por voz</span>
                    <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Quando ativado, NOVA lerá suas respostas em voz alta com um tom suave e doce.
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
                    className="bg-gray-900 border-gray-700 text-gray-200"
                    onClick={() => setAvatarExpression("neutral")}
                  >
                    Neutra
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-900 border-gray-700 text-gray-200"
                    onClick={() => setAvatarExpression("happy")}
                  >
                    Feliz
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-gray-900 border-gray-700 text-gray-200"
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
                <div>
                  <h3 className="font-medium text-gray-200">NOVA Assistente IA</h3>
                  <p className="text-sm text-gray-400">Versão 1.0.0</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uma interface de IA com voz suave e doce, capaz de utilizar modelos pré-treinados e se atualizar com
                    outras IAs.
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
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md text-center">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Funcionalidade em Desenvolvimento</h3>
              <p className="text-gray-300 mb-4">
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
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              NOVA
            </h1>
            <span className="text-sm text-gray-400">Assistente IA</span>
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVoice}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                  >
                    {voiceEnabled ? (
                      <Volume2 size={18} className="text-cyan-400" />
                    ) : (
                      <VolumeX size={18} className="text-gray-400" />
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
                    className="bg-gray-800 border-gray-700 hover:bg-gray-700"
                  >
                    <HelpCircle size={18} className="text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mostrar tutorial</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-600">
              <img src="/placeholder.svg?height=40&width=40" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-hidden flex flex-col">{renderContent()}</main>
      </div>

      {renderTutorial()}
      {renderModelInfo()}
    </div>
  )
}

