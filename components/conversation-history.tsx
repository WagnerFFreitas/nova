"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, MessageSquare, Trash2, Calendar } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Conversation {
  id: string
  title: string
  messages: any[]
  timestamp: Date
  personality: string
}

interface ConversationHistoryProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onLoadConversation: (conversation: Conversation) => void
  onDeleteConversation: (conversationId: string) => void
  onClose: () => void
  onNewConversation: () => void
}

export default function ConversationHistory({
  conversations,
  currentConversationId,
  onLoadConversation,
  onDeleteConversation,
  onClose,
  onNewConversation,
}: ConversationHistoryProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Hoje"
    if (days === 1) return "Ontem"
    if (days < 7) return `${days} dias atrás`
    return date.toLocaleDateString("pt-BR")
  }

  const getPersonalityColor = (personality: string) => {
    const colors = {
      friendly: "bg-green-500",
      professional: "bg-blue-500",
      creative: "bg-purple-500",
      analytical: "bg-orange-500",
      empathetic: "bg-pink-500",
    }
    return colors[personality as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 dark:bg-gray-800 light:bg-white border border-amber-700 dark:border-amber-700 light:border-amber-300 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 dark:border-gray-700 light:border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-amber-400" />
            <h3 className="text-xl font-bold text-amber-400 dark:text-amber-400 light:text-amber-600">
              Histórico de Conversas
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onNewConversation} className="bg-amber-700 hover:bg-amber-600 text-white" size="sm">
              Nova Conversa
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                Nenhuma conversa salva
              </h4>
              <p className="text-gray-500 dark:text-gray-500 light:text-gray-600">
                Suas conversas com NOVA aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border ${
                    currentConversationId === conversation.id
                      ? "border-amber-500 bg-amber-900/20 dark:border-amber-500 dark:bg-amber-900/20 light:border-amber-400 light:bg-amber-50"
                      : "border-gray-700 bg-gray-900/50 hover:border-amber-700 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-amber-700 light:border-gray-200 light:bg-gray-50 light:hover:border-amber-300"
                  }`}
                  onClick={() => onLoadConversation(conversation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-200 dark:text-gray-200 light:text-gray-800 truncate">
                          {conversation.title}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs text-white ${getPersonalityColor(conversation.personality)}`}
                        >
                          {conversation.personality}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(conversation.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare size={12} />
                          {conversation.messages.length} mensagens
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {currentConversationId === conversation.id && (
                        <Badge variant="outline" className="text-xs">
                          Atual
                        </Badge>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteConversation(conversation.id)
                              }}
                              className="h-8 w-8 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir conversa</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
