"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Briefcase, Palette, BarChart3, Users } from "lucide-react"

type Personality = "friendly" | "professional" | "creative" | "analytical" | "empathetic"

interface PersonalitySelectorProps {
  personality: Personality
  onPersonalityChange: (personality: Personality) => void
}

const personalities = [
  {
    id: "friendly" as const,
    name: "Amigável",
    description: "Calorosa, descontraída e conversacional",
    icon: Users,
    color: "bg-green-500",
    example: "Oi! Como você está hoje? 😊",
  },
  {
    id: "professional" as const,
    name: "Profissional",
    description: "Formal, precisa e orientada a negócios",
    icon: Briefcase,
    color: "bg-blue-500",
    example: "Como posso auxiliá-lo hoje?",
  },
  {
    id: "creative" as const,
    name: "Criativa",
    description: "Imaginativa, inspiradora e inovadora",
    icon: Palette,
    color: "bg-purple-500",
    example: "Vamos criar algo incrível! ✨",
  },
  {
    id: "analytical" as const,
    name: "Analítica",
    description: "Lógica, detalhada e baseada em dados",
    icon: BarChart3,
    color: "bg-orange-500",
    example: "Vamos analisar isso sistematicamente.",
  },
  {
    id: "empathetic" as const,
    name: "Empática",
    description: "Compreensiva, cuidadosa e solidária",
    icon: Heart,
    color: "bg-pink-500",
    example: "Estou aqui para te apoiar. 💙",
  },
]

export default function PersonalitySelector({ personality, onPersonalityChange }: PersonalitySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {personalities.map((p) => {
        const Icon = p.icon
        const isSelected = personality === p.id

        return (
          <Button
            key={p.id}
            variant={isSelected ? "default" : "outline"}
            className={`h-auto p-4 flex flex-col items-start text-left transition-all duration-200 ${
              isSelected
                ? "bg-amber-700 hover:bg-amber-600 border-amber-600"
                : "bg-gray-900 border-gray-700 hover:border-amber-600"
            }`}
            onClick={() => onPersonalityChange(p.id)}
          >
            <div className="flex items-center gap-2 mb-2 w-full">
              <div className={`p-1 rounded-full ${p.color}`}>
                <Icon size={14} className="text-white" />
              </div>
              <span className="font-medium">{p.name}</span>
              {isSelected && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Ativa
                </Badge>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{p.description}</p>

            <div className="text-xs italic text-gray-500 bg-gray-800 px-2 py-1 rounded w-full">"{p.example}"</div>
          </Button>
        )
      })}
    </div>
  )
}
