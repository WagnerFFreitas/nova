"use client"

import { MessageSquare, Settings, Database, Code, FileText, BarChart4, Zap, Layers, Star } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const menuItems = [
    { id: "chat", icon: MessageSquare, label: "Chat", description: "Converse com NOVA" },
    { id: "data", icon: Database, label: "Dados", description: "Gerencie seus dados" },
    { id: "code", icon: Code, label: "Código", description: "Gere e edite código" },
    { id: "docs", icon: FileText, label: "Documentos", description: "Crie e edite documentos" },
    { id: "analytics", icon: BarChart4, label: "Análise", description: "Visualize estatísticas" },
    { id: "tools", icon: Zap, label: "Ferramentas", description: "Acesse ferramentas úteis" },
    { id: "models", icon: Layers, label: "Modelos", description: "Gerencie modelos de IA" },
    { id: "favorites", icon: Star, label: "Favoritos", description: "Acesse seus itens favoritos" },
    { id: "settings", icon: Settings, label: "Configurações", description: "Personalize sua experiência" },
  ]

  return (
    <div className="w-16 md:w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-center md:justify-start">
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="font-bold text-white">N</span>
        </div>
        <span className="hidden md:block ml-3 font-bold text-lg text-cyan-400">NOVA</span>
      </div>

      <div className="flex-1 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center p-2 md:px-4 ${
                          activeSection === item.id
                            ? "bg-cyan-900/30 text-cyan-400 border-l-2 border-cyan-400"
                            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                        }`}
                      >
                        <Icon size={20} className="flex-shrink-0" />
                        <span className="hidden md:block ml-3">{item.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="hidden md:flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-xs text-gray-300">FH</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-200">FIVYLE ILAN</p>
            <p className="text-xs text-gray-500">Conta ID</p>
          </div>
        </div>
        <div className="md:hidden flex justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-xs text-gray-300">FH</span>
          </div>
        </div>
      </div>
    </div>
  )
}
