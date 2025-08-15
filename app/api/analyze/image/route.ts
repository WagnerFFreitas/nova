import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const ImageAnalysisSchema = z.object({
  description: z.string().describe("Descrição detalhada da imagem"),
  objects: z.array(z.string()).describe("Lista de objetos identificados"),
  colors: z.array(z.string()).describe("Cores predominantes"),
  mood: z.string().describe("Humor ou atmosfera da imagem"),
  text: z.string().optional().describe("Texto encontrado na imagem"),
  suggestions: z.array(z.string()).describe("Sugestões baseadas na imagem"),
  summary: z.string().describe("Resumo conciso da análise"),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Converter para base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mimeType = file.type

    if (!process.env.OPENAI_API_KEY) {
      // Análise simulada para demonstração
      const mockAnalysis = {
        description: "Imagem carregada com sucesso. Análise visual disponível na versão completa.",
        objects: ["objeto_detectado", "elemento_visual"],
        colors: ["azul", "branco", "cinza"],
        mood: "neutro",
        text: "",
        suggestions: ["Configure OPENAI_API_KEY para análise completa", "Imagem processada em modo demonstração"],
        summary: `Análise da imagem ${file.name} (${(file.size / 1024).toFixed(1)}KB) em modo demo`,
      }

      return NextResponse.json(mockAnalysis)
    }

    // Análise real com GPT-4 Vision
    const result = await generateObject({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise esta imagem detalhadamente. Identifique objetos, cores, texto (se houver), humor/atmosfera e forneça sugestões úteis baseadas no conteúdo.",
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
      schema: ImageAnalysisSchema,
    })

    return NextResponse.json(result.object)
  } catch (error) {
    console.error("Erro na análise de imagem:", error)
    return NextResponse.json({ error: "Erro interno na análise de imagem" }, { status: 500 })
  }
}
