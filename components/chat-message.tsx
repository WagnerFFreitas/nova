"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Volume2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import AvatarDisplay from "./avatar-display"
import { useState } from "react"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
  }
  isLast: boolean
  isSpeaking: boolean
  onCopy: () => void
}

export default function ChatMessage({ message, isLast, isSpeaking, onCopy }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded text-sm">$1</code>')
  }

  return (
    <Card
      className={`p-4 transition-all duration-300 hover:shadow-lg ${
        message.role === "user"
          ? "ml-12 bg-gray-800/70 dark:bg-gray-800/70 light:bg-blue-50/70 border-gray-700 dark:border-gray-700 light:border-blue-200"
          : "mr-12 bg-gray-900/70 dark:bg-gray-900/70 light:bg-white/70 border-amber-900/50 dark:border-amber-900/50 light:border-amber-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {message.role === "assistant" && (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-700/50 dark:border-amber-700/50 light:border-amber-300">
            <AvatarDisplay isSpeaking={isSpeaking && isLast} expression="neutral" size="small" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600">
              {message.role === "user" ? "Você" : "NOVA"}
              {message.role === "assistant" && isSpeaking && isLast && (
                <span className="ml-2 text-amber-500 animate-pulse">
                  <Volume2 size={14} className="inline" />
                </span>
              )}
            </div>

            {message.role === "assistant" && (
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-6 w-6 text-gray-400 hover:text-amber-400"
                      >
                        <Copy size={12} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{copied ? "Copiado!" : "Copiar resposta"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <div
            className={`prose prose-sm max-w-none ${
              message.role === "assistant"
                ? "text-amber-50 dark:text-amber-50 light:text-gray-800"
                : "text-gray-200 dark:text-gray-200 light:text-gray-700"
            }`}
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
        </div>

        {message.role === "user" && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        )}
      </div>
    </Card>
  )
}
