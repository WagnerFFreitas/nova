"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  HelpCircle,
  X,
  Settings,
  History,
  Download,
  Palette,
  MessageSquare,
  Sparkles,
  Moon,
  Sun,
  Shuffle,
  Brain,
  Database,
  Paperclip,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import AvatarDisplay from "./avatar-display"
import ChatMessage from "./chat-message"
import ConversationHistory from "./conversation-history"
import PersonalitySelector from "./personality-selector"
import AdvancedModelSelector from "./advanced-model-selector"
import KnowledgeSystem from "./knowledge-system"
import FileUpload from "./file-upload"

type Personality = "friendly" | "professional" | "creative" | "analytical" | "empathetic"
type Theme = "dark" | "light" | "auto"

interface Conversation {
  id: string
  title: string
  messages: any[]
  timestamp: Date
  personality: Personality
}

interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  category: "image" | "document" | "audio" | "video" | "archive" | "other"
  url: string
  uploadProgress: number
  status: "uploading" | "processing" | "completed" | "error"
  analysis?: {
    description?: string
    text?: string
    metadata?: Record<string, any>
  }
}

export default function NovaInterface() {
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [randomMode, setRandomMode] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showKnowledge, setShowKnowledge] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [theme, setTheme] = useState<Theme>("dark")
  const [personality, setPersonality] = useState<Personality>("friendly")
  const [voiceSpeed, setVoiceSpeed] = useState([1.0])
  const [voicePitch, setVoicePitch] = useState([1.1])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [currentModelUsed, setCurrentModelUsed] = useState<string>("")
  const [avatarExpression, setAvatarExpression] = useState<
    "neutral" | "talking" | "thinking" | "happy" | "surprised" | "winking"
  >("neutral")
  const [knowledgeEnabled, setKnowledgeEnabled] = useState(true)
  const [learningMode, setLearningMode] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([])

  // Estados locais para gerenciar input manualmente
  const [localInput, setLocalInput] = useState("")
  const [localMessages, setLocalMessages] = useState<any[]>([])
  const [localIsLoading, setLocalIsLoading] = useState(false)
  const [ollamaAvailable, setOllamaAvailable] = useState(false)

  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verificar status do Ollama na inicialização
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch("/api/ollama/models");
        const data = await response.json();
        setOllamaAvailable(data.success && data.models.length > 0);
      } catch (error) {
        console.error("Erro ao verificar Ollama:", error);
        setOllamaAvailable(false);
      }
    };

    checkOllama();
    // Verifica a cada 30 segundos
    const interval = setInterval(checkOllama, 30000);
    return () => clearInterval(interval);
  }, []);

  function getPersonalityGreeting(personality: Personality): string {
    const greetings = {
      friendly:
        `Olá! Eu sou NOVA, sua assistente virtual amigável! 😊 ${ollamaAvailable ? "Estou rodando com Ollama local para máxima privacidade! 🔒" : "Estou em modo demonstração - instale o Ollama para funcionalidade completa!"} Como posso ajudar você hoje?`,
      professional:
        `Bom dia. Sou NOVA, sua assistente virtual profissional. ${ollamaAvailable ? "Sistema local ativo." : "Modo demonstração ativo."} Como posso auxiliá-lo hoje?`,
      creative:
        `Oi! Sou NOVA, sua assistente criativa! ✨ ${ollamaAvailable ? "Com processamento local, sua criatividade fica protegida!" : "Em modo demo - instale Ollama para criatividade sem limites!"} Vamos criar algo incrível?`,
      analytical:
        `Olá. Sou NOVA, sua assistente analítica. ${ollamaAvailable ? "Análises locais garantem privacidade total." : "Modo demonstração - configure Ollama para análises completas."} Como posso ajudar?`,
      empathetic:
        `Olá, querido! Sou NOVA, sua assistente compreensiva. 💙 ${ollamaAvailable ? "Com Ollama local, suas conversas ficam totalmente privadas." : "Em modo demo - instale Ollama para privacidade completa."} Como posso te ajudar?`,
    }
    return greetings[personality]
  }

  // Inicializar mensagens locais
  useEffect(() => {
    setLocalMessages([
      {
        id: "welcome",
        role: "assistant",
        content: getPersonalityGreeting(personality),
      },
    ])
  }, [personality])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [localMessages, scrollToBottom])

  // Theme management
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else if (theme === "light") {
      root.classList.remove("dark")
      root.classList.add("light")
    } else {
      // Auto theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      if (mediaQuery.matches) {
        root.classList.add("dark")
        root.classList.remove("light")
      } else {
        root.classList.remove("dark")
        root.classList.add("light")
      }
    }
  }, [theme])

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nova-conversations")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConversations(
          parsed.map((conv: any) => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
          })),
        )
      } catch (error) {
        console.error("Error loading conversations:", error)
      }
    }
  }, [])

  // Save conversations to localStorage
  const saveConversations = useCallback((convs: Conversation[]) => {
    localStorage.setItem("nova-conversations", JSON.stringify(convs))
  }, [])

  // Save current conversation
  const saveCurrentConversation = useCallback(() => {
    if (localMessages.length <= 1) return // Don't save if only welcome message

    const conversationTitle = localMessages[1]?.content?.slice(0, 50) + "..." || "Nova Conversa"
    const conversation: Conversation = {
      id: currentConversationId || Date.now().toString(),
      title: conversationTitle,
      messages: localMessages,
      timestamp: new Date(),
      personality: personality,
    }

    setConversations((prev) => {
      const existing = prev.findIndex((c) => c.id === conversation.id)
      let updated
      if (existing >= 0) {
        updated = [...prev]
        updated[existing] = conversation
      } else {
        updated = [conversation, ...prev].slice(0, 50) // Keep only last 50 conversations
      }
      saveConversations(updated)
      return updated
    })

    if (!currentConversationId) {
      setCurrentConversationId(conversation.id)
    }
  }, [localMessages, currentConversationId, personality, saveConversations])

  // Initialize speech synthesis
  useEffect(() => {
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
          console.log("🎤 Speech recognition result:", transcript)
          setLocalInput(transcript || "")
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
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

  // Enhanced expression logic
  useEffect(() => {
    if (localIsLoading) {
      setAvatarExpression("thinking")
    } else if (isSpeaking) {
      setAvatarExpression("talking")
    } else if (localMessages.length > 0) {
      const lastMessage = localMessages[localMessages.length - 1]

      if (lastMessage.role === "assistant") {
        const content = lastMessage.content.toLowerCase()

        if (
          content.includes("😊") ||
          content.includes("😄") ||
          content.includes("excelente") ||
          content.includes("ótimo")
        ) {
          setAvatarExpression("happy")
          setTimeout(() => setAvatarExpression("neutral"), 4000)
        } else if (content.includes("😉") || content.includes("segredo") || content.includes("dica")) {
          setAvatarExpression("winking")
          setTimeout(() => setAvatarExpression("neutral"), 3000)
        } else if (content.includes("?") || content.includes("interessante") || content.includes("uau")) {
          setAvatarExpression("surprised")
          setTimeout(() => setAvatarExpression("neutral"), 3000)
        } else {
          setAvatarExpression("neutral")
        }
      }
    } else {
      setAvatarExpression("neutral")
    }
  }, [localIsLoading, isSpeaking, localMessages])

  // Enhanced text-to-speech
  const speakText = useCallback(
    (text: string) => {
      if (speechSynthesisRef.current && voiceEnabled) {
        speechSynthesisRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const voices = speechSynthesisRef.current.getVoices()

        const femaleVoice =
          voices.find((voice) => voice.lang.includes("pt") && voice.name.includes("Female")) ||
          voices.find((voice) => voice.lang.includes("pt")) ||
          voices[0]

        if (femaleVoice) {
          utterance.voice = femaleVoice
        }

        utterance.pitch = voicePitch[0]
        utterance.rate = voiceSpeed[0]

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        speechSynthesisRef.current.speak(utterance)
      }
    },
    [voiceEnabled, voicePitch, voiceSpeed],
  )

  // Speak last message
  useEffect(() => {
    if (localMessages.length > 0 && localMessages[localMessages.length - 1].role === "assistant" && voiceEnabled) {
      speakText(localMessages[localMessages.length - 1].content)
    }
  }, [localMessages, voiceEnabled, speakText])

  const toggleListening = useCallback(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
      } else {
        setIsListening(true)
        recognitionRef.current.start()
      }
    }
  }, [isListening])

  const toggleVoice = useCallback(() => {
    if (isSpeaking && speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel()
      setIsSpeaking(false)
    }
    setVoiceEnabled(!voiceEnabled)
  }, [isSpeaking, voiceEnabled])

  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null)
    setCurrentModelUsed("")
    setLocalInput("")
    setAttachedFiles([])
    setLocalMessages([
      {
        id: "welcome",
        role: "assistant",
        content: getPersonalityGreeting(personality),
      },
    ])
    setShowHistory(false)
  }, [personality])

  const loadConversation = useCallback((conversation: Conversation) => {
    setCurrentConversationId(conversation.id)
    setLocalMessages(conversation.messages)
    setPersonality(conversation.personality)
    setAttachedFiles([])
    setShowHistory(false)
  }, [])

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== conversationId)
        saveConversations(updated)
        return updated
      })

      if (currentConversationId === conversationId) {
        startNewConversation()
      }
    },
    [currentConversationId, saveConversations, startNewConversation],
  )

  const exportConversation = useCallback(() => {
    const conversation = conversations.find((c) => c.id === currentConversationId)
    if (conversation) {
      const dataStr = JSON.stringify(conversation, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `nova-conversation-${conversation.id}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()
    }
  }, [conversations, currentConversationId])

  const copyLastResponse = useCallback(() => {
    const lastAssistantMessage = localMessages.filter((m) => m.role === "assistant").pop()
    if (lastAssistantMessage) {
      navigator.clipboard.writeText(lastAssistantMessage.content)
    }
  }, [localMessages])

  const handlePersonalityChange = useCallback((newPersonality: Personality) => {
    setPersonality(newPersonality)
    // Update welcome message
    setLocalMessages((prev) =>
      prev.map((msg, index) =>
        index === 0 && msg.role === "assistant" ? { ...msg, content: getPersonalityGreeting(newPersonality) } : msg,
      ),
    )
  }, [])

  // Handler de input local
  const handleLocalInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setLocalInput(value)
  }, [])

  // Handler para arquivos anexados
  const handleFilesUploaded = useCallback((files: UploadedFile[]) => {
    setAttachedFiles((prev) => [...prev, ...files])
  }, [])

  const handleFileAnalyzed = useCallback((fileId: string, analysis: any) => {
    setAttachedFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, analysis } : file)))
  }, [])

  // Sistema de envio híbrido com arquivos
  const handleHybridSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if ((!localInput || !localInput.trim()) && attachedFiles.length === 0) {
        return
      }

      if (localIsLoading) {
        return
      }

      // Preparar conteúdo da mensagem
      let messageContent = localInput.trim()

      // Adicionar informações dos arquivos anexados
      if (attachedFiles.length > 0) {
        messageContent += "\n\n📎 **Arquivos anexados:**\n"
        attachedFiles.forEach((file) => {
          messageContent += `• ${file.name} (${file.category})`
          if (file.analysis?.description) {
            messageContent += ` - ${file.analysis.description}`
          }
          if (file.analysis?.text) {
            messageContent += `\n  Conteúdo: ${file.analysis.text.slice(0, 200)}...`
          }
          messageContent += "\n"
        })
      }

      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: messageContent,
        attachments: attachedFiles.map((file) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          category: file.category,
          analysis: file.analysis,
        })),
      }

      setLocalIsLoading(true)
      setIsTyping(true)
      setCurrentModelUsed("")

      // Adicionar mensagem do usuário
      setLocalMessages((prev) => [...prev, userMessage])

      // Limpar input e arquivos
      setLocalInput("")
      setAttachedFiles([])

      try {
        // Fazer requisição manual para a API com arquivos
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...localMessages, userMessage],
            model: selectedModel,
            personality: personality,
            useRandom: randomMode,
            knowledgeEnabled: knowledgeEnabled,
            learningMode: learningMode,
            attachments: userMessage.attachments,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Capturar informações do modelo e conhecimento
        const modelUsed = response.headers.get("X-Model-Used")
        const modelType = response.headers.get("X-Model-Type")
        const randomMode = response.headers.get("X-Random-Mode")

        if (modelUsed) {
          setCurrentModelUsed(modelUsed)
          console.log(`✅ Resposta gerada por: ${modelUsed} (${modelType})${randomMode === "true" ? " [ALEATÓRIO]" : ""}`)
        }

        // Processar stream de resposta
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error("No response body")
        }

        let assistantContent = ""
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: "",
        }

        // Adicionar mensagem vazia do assistente
        setLocalMessages((prev) => [...prev, assistantMessage])

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split("\n").filter((line) => line.trim())

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.type === "text-delta" && data.textDelta) {
                    assistantContent += data.textDelta
                    // Atualizar mensagem do assistente em tempo real
                    setLocalMessages((prev) =>
                      prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg)),
                    )
                  }
                } catch (parseError) {
                  console.error("Erro ao processar chunk:", parseError)
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
        }

        console.log("✅ Mensagem enviada com sucesso")
      } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error)

        // Adicionar mensagem de erro mais informativa
        let errorMessage = "Desculpe, ocorreu um erro ao processar sua mensagem.";
        
        if (error.message.includes("HTTP error! status: 500")) {
          errorMessage = "🔧 Erro no servidor. Se estiver usando Ollama, verifique se está rodando corretamente.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "🌐 Erro de conexão. Verifique sua internet ou se o Ollama está ativo.";
        }

        const errorMessageObj = {
          id: (Date.now() + 2).toString(),
          role: "assistant" as const,
          content: errorMessage + "\n\n💡 Dica: Para usar IA local, instale o Ollama e execute 'ollama serve'.",
        }

        setLocalMessages((prev) => [...prev, errorMessageObj])
      } finally {
        setLocalIsLoading(false)
        setIsTyping(false)
      }
    },
    [
      localInput,
      attachedFiles,
      localIsLoading,
      localMessages,
      selectedModel,
      personality,
      randomMode,
      knowledgeEnabled,
      learningMode,
    ],
  )

  // Calcular se o botão deve estar habilitado
  const isButtonEnabled =
    Boolean((localInput && localInput.trim().length > 0) || attachedFiles.length > 0) && !localIsLoading

  const renderTutorial = () => {
    if (!showTutorial) return null

    const steps = [
      {
        title: "NOVA com Anexos de Arquivos",
        content: "NOVA agora pode analisar imagens, documentos, áudio e vídeos! Anexe arquivos para análise completa.",
        position: "center",
      },
      {
        title: "Upload de Arquivos",
        content:
          "Clique no ícone 📎 para anexar arquivos ou arraste e solte diretamente na interface. Suporta imagens, PDFs, áudio e mais!",
        position: "bottom",
      },
      {
        title: "Análise Inteligente",
        content:
          "NOVA analisa automaticamente seus arquivos: descreve imagens, extrai texto de documentos e transcreve áudio.",
        position: "right",
      },
      {
        title: "Sistema Completo",
        content:
          "Combine arquivos com o sistema de conhecimento para análises ainda mais profundas e contextualizadas.",
        position: "top",
      },
    ]

    const currentStep = steps[tutorialStep]
    let positionClass = "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"

    switch (currentStep.position) {
      case "bottom":
        positionClass = "bottom-24 left-1/2 transform -translate-x-1/2"
        break
      case "top":
        positionClass = "top-24 left-1/2 transform -translate-x-1/2"
        break
      case "right":
        positionClass = "top-1/2 right-24 transform -translate-y-1/2"
        break
    }

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
            <Button
              onClick={() => (tutorialStep < 3 ? setTutorialStep(tutorialStep + 1) : setShowTutorial(false))}
              className="bg-cyan-700 hover:bg-cyan-600 text-white"
            >
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
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-cyan-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">Configurações Avançadas</h3>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seleção de Modelo */}
            <div className="space-y-4">
              <AdvancedModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                randomMode={randomMode}
                onRandomModeChange={setRandomMode}
              />
            </div>

            {/* Outras Configurações */}
            <div className="space-y-6">
              {/* Sistema de Conhecimento */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-200 flex items-center gap-2">
                  <Brain size={16} />
                  Sistema de Conhecimento
                </h4>

                <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                  <span className="text-sm text-gray-300">Usar base de conhecimento</span>
                  <Switch checked={knowledgeEnabled} onCheckedChange={setKnowledgeEnabled} />
                </div>

                <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                  <span className="text-sm text-gray-300">Modo aprendizado ativo</span>
                  <Switch checked={learningMode} onCheckedChange={setLearningMode} />
                </div>

                <Button
                  onClick={() => setShowKnowledge(true)}
                  className="w-full flex items-center gap-2 bg-purple-700 hover:bg-purple-600"
                >
                  <Database size={16} />
                  Gerenciar Conhecimento
                </Button>
              </div>

              {/* Personality Selection */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-200 flex items-center gap-2">
                  <Sparkles size={16} />
                  Personalidade
                </h4>
                <PersonalitySelector personality={personality} onPersonalityChange={handlePersonalityChange} />
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-200 flex items-center gap-2">
                  <Palette size={16} />
                  Tema
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon size={14} />
                    Escuro
                  </Button>
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun size={14} />
                    Claro
                  </Button>
                  <Button
                    variant={theme === "auto" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("auto")}
                    className="flex items-center gap-2"
                  >
                    <Settings size={14} />
                    Auto
                  </Button>
                </div>
              </div>

              {/* Voice Settings */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-200 flex items-center gap-2">
                  <Volume2 size={16} />
                  Configurações de Voz
                </h4>

                <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md border border-gray-700">
                  <span className="text-sm text-gray-300">Resposta por voz</span>
                  <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Velocidade da Voz</label>
                  <Slider
                    value={voiceSpeed}
                    onValueChange={setVoiceSpeed}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">Atual: {voiceSpeed[0]}x</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Tom da Voz</label>
                  <Slider
                    value={voicePitch}
                    onValueChange={setVoicePitch}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">Atual: {voicePitch[0]}</div>
                </div>
              </div>

              {/* Avatar Settings */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-200">Interface Tecnológica</h4>
                <div className="flex justify-center mb-4">
                  <AvatarDisplay isSpeaking={false} expression={avatarExpression} size="medium" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["neutral", "happy", "surprised", "thinking", "winking"] as const).map((expr) => (
                    <Button
                      key={expr}
                      variant="outline"
                      className="bg-gray-900 border-gray-700 text-gray-200 text-xs capitalize"
                      onClick={() => setAvatarExpression(expr)}
                    >
                      {expr === "neutral"
                        ? "Neutra"
                        : expr === "happy"
                          ? "Feliz"
                          : expr === "surprised"
                            ? "Surpresa"
                            : expr === "thinking"
                              ? "Pensativa"
                              : "Piscando"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Export/Import */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-200">Dados</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportConversation}
                    disabled={!currentConversationId}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Download size={14} />
                    Exportar Conversa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTutorial(true)}
                    className="flex items-center gap-2"
                  >
                    <HelpCircle size={14} />
                    Tutorial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-900 dark:to-gray-950 light:from-gray-50 light:to-gray-100 text-white dark:text-white light:text-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-gray-900/50 dark:bg-gray-900/50 light:bg-white/50 backdrop-blur-sm border-b border-gray-800 dark:border-gray-800 light:border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center">
            <span className="font-bold text-white">N</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              NOVA
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {personality.charAt(0).toUpperCase() + personality.slice(1)}
              </Badge>
              {randomMode && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Shuffle size={10} />
                  Aleatório
                </Badge>
              )}
              {knowledgeEnabled && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 bg-purple-600">
                  <Brain size={10} />
                  Conhecimento
                </Badge>
              )}
              {attachedFiles.length > 0 && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 bg-green-600">
                  <Paperclip size={10} />
                  {attachedFiles.length} arquivo{attachedFiles.length > 1 ? "s" : ""}
                </Badge>
              )}
              {currentModelUsed && (
                <Badge variant="outline" className="text-xs">
                  {currentModelUsed}
                </Badge>
              )}
              {ollamaAvailable && (
                <Badge variant="outline" className="text-xs bg-green-600">
                  Ollama Ativo
                </Badge>
              )}
              {!ollamaAvailable && (
                <Badge variant="outline" className="text-xs bg-orange-600">
                  Modo Demo
                </Badge>
              )}
              <Badge variant="outline" className="text-xs bg-green-600">
                Sistema Completo
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={startNewConversation}
                  className="text-gray-400 hover:text-cyan-400 hover:bg-gray-800"
                >
                  <MessageSquare size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nova Conversa</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(true)}
                  className="text-gray-400 hover:text-cyan-400 hover:bg-gray-800"
                >
                  <History size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Histórico</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKnowledge(true)}
                  className="text-gray-400 hover:text-purple-400 hover:bg-gray-800"
                >
                  <Brain size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sistema de Conhecimento</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="text-gray-400 hover:text-green-400 hover:bg-gray-800"
                >
                  <Paperclip size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Anexar Arquivos</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVoice}
                  className="text-gray-400 hover:text-cyan-400 hover:bg-gray-800"
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{voiceEnabled ? "Desativar voz" : "Ativar voz"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="text-gray-400 hover:text-cyan-400 hover:bg-gray-800"
                >
                  <Settings size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configurações</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <AvatarDisplay
              isSpeaking={isSpeaking}
              expression={avatarExpression}
              size={localMessages.length === 0 ? "large" : "medium"}
            />
          </div>

          {/* Welcome or Messages */}
          {localMessages.length === 0 ? (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-cyan-400">Olá! Eu sou NOVA</h2>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-md mx-auto mb-4">
                Sua assistente virtual inteligente com sistema de aprendizado contínuo, base de conhecimento dinâmica e
                análise de arquivos.
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge variant="outline">Sistema Inteligente</Badge>
                <Badge variant="outline">Análise de Arquivos</Badge>
                <Badge variant="outline">16+ Modelos IA</Badge>
                <Badge variant="outline">Base de Conhecimento</Badge>
                <Badge variant="outline">Voz Natural</Badge>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto mb-4 space-y-4 pr-2">
              {localMessages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === localMessages.length - 1}
                  isSpeaking={isSpeaking && index === localMessages.length - 1}
                  onCopy={copyLastResponse}
                />
              ))}
              {isTyping && (
                <div className="flex justify-center">
                  <div className="bg-gray-800/70 dark:bg-gray-800/70 light:bg-gray-200/70 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AvatarDisplay isSpeaking={false} expression="thinking" size="small" />
                      <span className="text-sm text-gray-400">
                        NOVA está processando
                        {randomMode ? " (modo aleatório)" : ""}
                        {knowledgeEnabled ? " (usando conhecimento)" : ""}
                        {attachedFiles.length > 0
                          ? ` (${attachedFiles.length} arquivo${attachedFiles.length > 1 ? "s" : ""})`
                          : ""}
                        ...
                      </span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* File Upload Area */}
          {showFileUpload && (
            <div className="mb-4">
              <FileUpload
                onFilesUploaded={handleFilesUploaded}
                onFileAnalyzed={handleFileAnalyzed}
                maxFiles={5}
                maxSize={50}
                className="border border-gray-700 rounded-lg p-4"
              />
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleHybridSubmit} className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={localInput}
                onChange={handleLocalInputChange}
                placeholder={`Digite sua mensagem para NOVA${randomMode ? " (modo aleatório)" : ` (${selectedModel})`}${knowledgeEnabled ? " + conhecimento" : ""}${attachedFiles.length > 0 ? ` + ${attachedFiles.length} arquivo${attachedFiles.length > 1 ? "s" : ""}` : ""}...`}
                className="min-h-[60px] max-h-32 resize-none bg-gray-800/50 dark:bg-gray-800/50 light:bg-white/50 border-gray-700 dark:border-gray-700 light:border-gray-300 text-gray-200 dark:text-gray-200 light:text-gray-900 focus:border-cyan-600 pr-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (isButtonEnabled) {
                      handleHybridSubmit(e)
                    }
                  }
                }}
              />
              {(localInput || attachedFiles.length > 0) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setLocalInput("")
                    setAttachedFiles([])
                  }}
                  className="absolute right-2 top-2 h-8 w-8 text-gray-400 hover:text-gray-200"
                >
                  <X size={14} />
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className={
                        showFileUpload || attachedFiles.length > 0
                          ? "bg-green-900/70 border-green-700"
                          : "bg-gray-800/50 dark:bg-gray-800/50 light:bg-white/50 border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-cyan-600"
                      }
                    >
                      <Paperclip size={18} className={attachedFiles.length > 0 ? "text-green-400" : "text-gray-400"} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {showFileUpload ? "Fechar anexos" : "Anexar arquivos"}
                    {attachedFiles.length > 0 && ` (${attachedFiles.length})`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={toggleListening}
                      disabled={!recognitionRef.current}
                      className={
                        isListening
                          ? "bg-red-900/70 border-red-700 animate-pulse"
                          : "bg-gray-800/50 dark:bg-gray-800/50 light:bg-white/50 border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-cyan-600"
                      }
                    >
                      {isListening ? (
                        <MicOff size={18} className="text-red-400" />
                      ) : (
                        <Mic size={18} className="text-gray-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">{isListening ? "Parar de ouvir" : "Falar com NOVA"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!isButtonEnabled}
                      className={`text-white transition-all duration-200 ${
                        isButtonEnabled
                          ? `${ollamaAvailable ? "bg-green-700 hover:bg-green-600" : "bg-cyan-700 hover:bg-cyan-600"} cursor-pointer shadow-lg shadow-cyan-500/25`
                          : "bg-gray-600 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {localIsLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {!isButtonEnabled
                      ? localInput?.trim() || attachedFiles.length > 0
                        ? "Carregando..."
                        : "Digite uma mensagem ou anexe arquivos"
                      : `Enviar mensagem ${ollamaAvailable ? "(Ollama Local)" : "(Modo Demo)"}`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </div>
      </main>

      {/* Modals */}
      {renderTutorial()}
      {renderSettings()}

      {showHistory && (
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversationId}
          onLoadConversation={loadConversation}
          onDeleteConversation={deleteConversation}
          onClose={() => setShowHistory(false)}
          onNewConversation={startNewConversation}
        />
      )}

      {showKnowledge && <KnowledgeSystem onClose={() => setShowKnowledge(false)} />}
    </div>
  )
}