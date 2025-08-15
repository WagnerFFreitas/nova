"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Globe,
  Database,
  Search,
  Zap,
  RefreshCw,
  Plus,
  Trash2,
  Download,
  TrendingUp,
  Bot,
  Users,
  Clock,
  CheckCircle,
  Info,
  X,
} from "lucide-react"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  source: "web" | "user" | "ai" | "interaction"
  url?: string
  timestamp: Date
  tags: string[]
  confidence: number
  verified: boolean
  usage_count: number
}

interface LearningSession {
  id: string
  topic: string
  sources_learned: number
  knowledge_gained: number
  timestamp: Date
  status: "active" | "completed" | "failed"
}

interface KnowledgeSystemProps {
  onClose: () => void
}

export default function KnowledgeSystem({ onClose }: KnowledgeSystemProps) {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([])
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [learningTopic, setLearningTopic] = useState("")
  const [customKnowledge, setCustomKnowledge] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [customTags, setCustomTags] = useState("")
  const [isLearning, setIsLearning] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [webAccess, setWebAccess] = useState(true)
  const [aiIntegration, setAiIntegration] = useState(true)
  const [learningProgress, setLearningProgress] = useState(0)
  const [selectedTab, setSelectedTab] = useState("knowledge")
  const [stats, setStats] = useState({
    totalKnowledge: 0,
    webSources: 0,
    userContributions: 0,
    aiLearned: 0,
    lastUpdate: new Date(),
  })

  // Carregar dados salvos
  useEffect(() => {
    const savedKnowledge = localStorage.getItem("nova-knowledge-base")
    const savedSessions = localStorage.getItem("nova-learning-sessions")
    const savedSettings = localStorage.getItem("nova-learning-settings")

    if (savedKnowledge) {
      try {
        const parsed = JSON.parse(savedKnowledge).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setKnowledgeBase(parsed)
      } catch (error) {
        console.error("Erro ao carregar base de conhecimento:", error)
      }
    }

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
        }))
        setLearningSessions(parsed)
      } catch (error) {
        console.error("Erro ao carregar sessões:", error)
      }
    }

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setAutoUpdate(settings.autoUpdate ?? true)
        setWebAccess(settings.webAccess ?? true)
        setAiIntegration(settings.aiIntegration ?? true)
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      }
    }
  }, [])

  // Salvar dados
  const saveData = () => {
    localStorage.setItem("nova-knowledge-base", JSON.stringify(knowledgeBase))
    localStorage.setItem("nova-learning-sessions", JSON.stringify(learningSessions))
    localStorage.setItem(
      "nova-learning-settings",
      JSON.stringify({
        autoUpdate,
        webAccess,
        aiIntegration,
      }),
    )
  }

  // Atualizar estatísticas
  useEffect(() => {
    const webSources = knowledgeBase.filter((k) => k.source === "web").length
    const userContributions = knowledgeBase.filter((k) => k.source === "user").length
    const aiLearned = knowledgeBase.filter((k) => k.source === "ai").length

    setStats({
      totalKnowledge: knowledgeBase.length,
      webSources,
      userContributions,
      aiLearned,
      lastUpdate: new Date(),
    })

    saveData()
  }, [knowledgeBase, learningSessions, autoUpdate, webAccess, aiIntegration])

  // Simular busca na web
  const simulateWebSearch = async (query: string): Promise<KnowledgeItem[]> => {
    setIsSearching(true)

    // Simular delay de busca
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResults: KnowledgeItem[] = [
      {
        id: Date.now().toString(),
        title: `Informações sobre ${query}`,
        content: `Esta é uma simulação de conteúdo web sobre ${query}. Na implementação real, isso seria obtido através de APIs como Serper, Tavily, ou web scraping. O conteúdo incluiria informações atualizadas, artigos relevantes, e dados em tempo real sobre o tópico pesquisado.`,
        source: "web",
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        timestamp: new Date(),
        tags: query.split(" ").slice(0, 3),
        confidence: 0.85,
        verified: false,
        usage_count: 0,
      },
      {
        id: (Date.now() + 1).toString(),
        title: `Análise avançada: ${query}`,
        content: `Análise detalhada sobre ${query} incluindo tendências recentes, dados estatísticos e insights de especialistas. Esta informação seria coletada de múltiplas fontes confiáveis e processada para fornecer uma visão abrangente do tópico.`,
        source: "web",
        url: `https://research.example.com/${query.replace(/\s+/g, "-")}`,
        timestamp: new Date(),
        tags: [...query.split(" ").slice(0, 2), "análise", "tendências"],
        confidence: 0.92,
        verified: true,
        usage_count: 0,
      },
    ]

    setIsSearching(false)
    return mockResults
  }

  // Simular aprendizado com outras IAs
  const simulateAILearning = async (topic: string): Promise<KnowledgeItem[]> => {
    const aiSources = ["GPT-4", "Claude", "Gemini", "Grok", "DeepSeek"]
    const results: KnowledgeItem[] = []

    for (let i = 0; i < 3; i++) {
      const aiSource = aiSources[Math.floor(Math.random() * aiSources.length)]
      results.push({
        id: (Date.now() + i).toString(),
        title: `Insights de ${aiSource} sobre ${topic}`,
        content: `Conhecimento sintetizado de ${aiSource} sobre ${topic}. Esta informação representa o processamento e análise de múltiplas fontes de dados, oferecendo perspectivas únicas e insights avançados sobre o tópico em questão.`,
        source: "ai",
        timestamp: new Date(),
        tags: [topic, aiSource.toLowerCase(), "ai-generated"],
        confidence: 0.88,
        verified: true,
        usage_count: 0,
      })
    }

    return results
  }

  // Iniciar sessão de aprendizado
  const startLearningSession = async () => {
    if (!learningTopic.trim()) return

    setIsLearning(true)
    setLearningProgress(0)

    const session: LearningSession = {
      id: Date.now().toString(),
      topic: learningTopic,
      sources_learned: 0,
      knowledge_gained: 0,
      timestamp: new Date(),
      status: "active",
    }

    setLearningSessions((prev) => [session, ...prev])

    try {
      let allNewKnowledge: KnowledgeItem[] = []

      // Fase 1: Busca na web (se habilitada)
      if (webAccess) {
        setLearningProgress(20)
        const webResults = await simulateWebSearch(learningTopic)
        allNewKnowledge = [...allNewKnowledge, ...webResults]
        session.sources_learned += webResults.length
      }

      // Fase 2: Aprendizado com outras IAs (se habilitado)
      if (aiIntegration) {
        setLearningProgress(60)
        const aiResults = await simulateAILearning(learningTopic)
        allNewKnowledge = [...allNewKnowledge, ...aiResults]
        session.sources_learned += aiResults.length
      }

      // Fase 3: Processamento e integração
      setLearningProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Adicionar conhecimento à base
      setKnowledgeBase((prev) => [...allNewKnowledge, ...prev])
      session.knowledge_gained = allNewKnowledge.length
      session.status = "completed"

      setLearningProgress(100)

      // Atualizar sessão
      setLearningSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)))
    } catch (error) {
      session.status = "failed"
      setLearningSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)))
    } finally {
      setIsLearning(false)
      setLearningTopic("")
      setTimeout(() => setLearningProgress(0), 2000)
    }
  }

  // Buscar na base de conhecimento
  const searchKnowledge = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    // Simular busca
    await new Promise((resolve) => setTimeout(resolve, 500))

    const results = knowledgeBase.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    // Atualizar contadores de uso
    results.forEach((item) => {
      item.usage_count += 1
    })

    setKnowledgeBase([...knowledgeBase])
    setIsSearching(false)

    // Mostrar resultados (aqui você poderia abrir um modal ou destacar os resultados)
    console.log("Resultados da busca:", results)
  }

  // Adicionar conhecimento personalizado
  const addCustomKnowledge = () => {
    if (!customTitle.trim() || !customKnowledge.trim()) return

    const newKnowledge: KnowledgeItem = {
      id: Date.now().toString(),
      title: customTitle,
      content: customKnowledge,
      source: "user",
      timestamp: new Date(),
      tags: customTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      confidence: 1.0,
      verified: true,
      usage_count: 0,
    }

    setKnowledgeBase((prev) => [newKnowledge, ...prev])
    setCustomTitle("")
    setCustomKnowledge("")
    setCustomTags("")
  }

  // Remover item de conhecimento
  const removeKnowledge = (id: string) => {
    setKnowledgeBase((prev) => prev.filter((item) => item.id !== id))
  }

  // Exportar base de conhecimento
  const exportKnowledge = () => {
    const dataStr = JSON.stringify({ knowledgeBase, learningSessions }, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `nova-knowledge-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "web":
        return <Globe size={14} className="text-blue-400" />
      case "user":
        return <Users size={14} className="text-green-400" />
      case "ai":
        return <Bot size={14} className="text-purple-400" />
      case "interaction":
        return <Zap size={14} className="text-yellow-400" />
      default:
        return <Database size={14} className="text-gray-400" />
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "web":
        return "bg-blue-500"
      case "user":
        return "bg-green-500"
      case "ai":
        return "bg-purple-500"
      case "interaction":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-cyan-700 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Brain size={24} className="text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-cyan-400">Sistema de Conhecimento NOVA</h3>
              <p className="text-sm text-gray-400">Aprendizado contínuo e atualização inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {stats.totalKnowledge} itens
            </Badge>
            <Button
              onClick={exportKnowledge}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download size={14} />
              Exportar
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">{stats.totalKnowledge}</div>
              <div className="text-xs text-gray-400">Total de Conhecimento</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.webSources}</div>
              <div className="text-xs text-gray-400">Fontes Web</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.userContributions}</div>
              <div className="text-xs text-gray-400">Contribuições</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.aiLearned}</div>
              <div className="text-xs text-gray-400">IA Aprendida</div>
            </div>
          </div>

          {/* Learning Progress */}
          {isLearning && (
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-200">Aprendendo...</span>
                <span className="text-sm text-gray-400">{learningProgress}%</span>
              </div>
              <Progress value={learningProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900 m-4">
              <TabsTrigger value="knowledge" className="flex items-center gap-2">
                <Database size={14} />
                Base de Conhecimento
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex items-center gap-2">
                <Brain size={14} />
                Aprender
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Clock size={14} />
                Sessões
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Zap size={14} />
                Configurações
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto px-6 pb-6">
              <TabsContent value="knowledge" className="mt-0 space-y-4">
                {/* Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar na base de conhecimento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    onKeyDown={(e) => e.key === "Enter" && searchKnowledge()}
                  />
                  <Button onClick={searchKnowledge} disabled={isSearching} className="flex items-center gap-2">
                    {isSearching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                    Buscar
                  </Button>
                </div>

                {/* Knowledge Items */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {knowledgeBase.length === 0 ? (
                    <div className="text-center py-8">
                      <Database size={48} className="mx-auto text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-300 mb-2">Base de conhecimento vazia</h4>
                      <p className="text-gray-500">
                        Comece adicionando conhecimento ou iniciando uma sessão de aprendizado.
                      </p>
                    </div>
                  ) : (
                    knowledgeBase.map((item) => (
                      <Card key={item.id} className="p-4 bg-gray-900 border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(item.source)}
                            <h4 className="font-medium text-gray-200">{item.title}</h4>
                            {item.verified && <CheckCircle size={14} className="text-green-400" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs text-white ${getSourceColor(item.source)}`}>{item.source}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.usage_count}x
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeKnowledge(item.id)}
                              className="h-6 w-6 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.content}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Confiança: {Math.round(item.confidence * 100)}%</span>
                            <span>{item.timestamp.toLocaleDateString()}</span>
                          </div>
                        </div>

                        {item.url && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <Globe size={12} />
                              {item.url}
                            </a>
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="learn" className="mt-0 space-y-6">
                {/* Auto Learning */}
                <Card className="p-4 bg-gray-900 border-gray-700">
                  <h4 className="font-medium text-gray-200 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-cyan-400" />
                    Aprendizado Automático
                  </h4>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite um tópico para aprender..."
                        value={learningTopic}
                        onChange={(e) => setLearningTopic(e.target.value)}
                        className="bg-gray-800 border-gray-700"
                        onKeyDown={(e) => e.key === "Enter" && !isLearning && startLearningSession()}
                      />
                      <Button
                        onClick={startLearningSession}
                        disabled={isLearning || !learningTopic.trim()}
                        className="flex items-center gap-2"
                      >
                        {isLearning ? <RefreshCw size={14} className="animate-spin" /> : <Brain size={14} />}
                        {isLearning ? "Aprendendo..." : "Aprender"}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500">
                      A NOVA irá buscar informações na web e consultar outras IAs sobre o tópico especificado.
                    </div>
                  </div>
                </Card>

                {/* Manual Knowledge Addition */}
                <Card className="p-4 bg-gray-900 border-gray-700">
                  <h4 className="font-medium text-gray-200 mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-green-400" />
                    Adicionar Conhecimento Manual
                  </h4>

                  <div className="space-y-4">
                    <Input
                      placeholder="Título do conhecimento..."
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />

                    <Textarea
                      placeholder="Conteúdo do conhecimento..."
                      value={customKnowledge}
                      onChange={(e) => setCustomKnowledge(e.target.value)}
                      className="bg-gray-800 border-gray-700 min-h-[100px]"
                    />

                    <Input
                      placeholder="Tags (separadas por vírgula)..."
                      value={customTags}
                      onChange={(e) => setCustomTags(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />

                    <Button
                      onClick={addCustomKnowledge}
                      disabled={!customTitle.trim() || !customKnowledge.trim()}
                      className="w-full flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Adicionar Conhecimento
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="mt-0 space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {learningSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-300 mb-2">Nenhuma sessão de aprendizado</h4>
                      <p className="text-gray-500">Inicie uma sessão na aba "Aprender" para ver o histórico aqui.</p>
                    </div>
                  ) : (
                    learningSessions.map((session) => (
                      <Card key={session.id} className="p-4 bg-gray-900 border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-200">{session.topic}</h4>
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "default"
                                : session.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {session.status === "completed"
                              ? "Concluída"
                              : session.status === "failed"
                                ? "Falhou"
                                : "Ativa"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-400">Fontes consultadas:</span>
                            <span className="ml-2 text-gray-200">{session.sources_learned}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-400">Conhecimento adquirido:</span>
                            <span className="ml-2 text-gray-200">{session.knowledge_gained}</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">{session.timestamp.toLocaleString()}</div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-6">
                <Card className="p-4 bg-gray-900 border-gray-700">
                  <h4 className="font-medium text-gray-200 mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    Configurações de Aprendizado
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-200">Atualização Automática</div>
                        <div className="text-xs text-gray-400">Atualizar conhecimento automaticamente</div>
                      </div>
                      <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-200">Acesso à Web</div>
                        <div className="text-xs text-gray-400">Permitir busca de informações na internet</div>
                      </div>
                      <Switch checked={webAccess} onCheckedChange={setWebAccess} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-200">Integração com IAs</div>
                        <div className="text-xs text-gray-400">Aprender com outras inteligências artificiais</div>
                      </div>
                      <Switch checked={aiIntegration} onCheckedChange={setAiIntegration} />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-900 border-gray-700">
                  <h4 className="font-medium text-gray-200 mb-4 flex items-center gap-2">
                    <Info size={16} className="text-blue-400" />
                    Sobre o Sistema de Conhecimento
                  </h4>

                  <div className="space-y-3 text-sm text-gray-400">
                    <p>
                      <strong className="text-gray-200">Aprendizado Web:</strong> Busca informações atualizadas na
                      internet usando APIs como Serper, Tavily, e web scraping.
                    </p>
                    <p>
                      <strong className="text-gray-200">Integração Multi-IA:</strong> Consulta outras IAs (GPT, Claude,
                      Gemini, etc.) para obter perspectivas diversas.
                    </p>
                    <p>
                      <strong className="text-gray-200">RAG (Retrieval-Augmented Generation):</strong> Usa embeddings
                      para busca semântica na base de conhecimento.
                    </p>
                    <p>
                      <strong className="text-gray-200">Memória Persistente:</strong> Armazena conhecimento localmente e
                      sincroniza com a nuvem.
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
