import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const AudioAnalysisSchema = z.object({
  transcription: z.string().describe("Transcrição do áudio"),
  summary: z.string().describe("Resumo do conteúdo"),
  language: z.string().describe("Idioma identificado"),
  duration: z.string().describe("Duração estimada"),
  speakers: z.number().describe("Número estimado de falantes"),
  topics: z.array(z.string()).describe("Tópicos discutidos"),
  sentiment: z.string().describe("Sentimento geral"),
  keyPoints: z.array(z.string()).describe("Pontos principais"),
  suggestions: z.array(z.string()).describe("Sugestões baseadas no conteúdo"),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      // Análise simulada
      const mockAnalysis = {
        transcription: "Transcrição do áudio disponível na versão completa com OpenAI Whisper.",
        summary: `Áudio ${file.name} processado em modo demonstração`,
        language: "português",
        duration: "Duração não disponível em modo demo",
        speakers: 1,
        topics: ["Tópico identificado"],
        sentiment: "neutro",
        keyPoints: ["Configure OPENAI_API_KEY para análise completa"],
        suggestions: ["Use OpenAI Whisper para transcrição precisa", "Áudio processado com sucesso"],
      }

      return NextResponse.json(mockAnalysis)
    }

    // Transcrição com Whisper
    const transcriptionFormData = new FormData()
    transcriptionFormData.append("file", file)
    transcriptionFormData.append("model", "whisper-1")
    transcriptionFormData.append("language", "pt")

    const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: transcriptionFormData,
    })

    if (!transcriptionResponse.ok) {
      throw new Error("Falha na transcrição do áudio")
    }

    const transcriptionData = await transcriptionResponse.json()
    const transcription = transcriptionData.text

    // Análise do conteúdo transcrito
    const result = await generateObject({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: `Analise esta transcrição de áudio:

"${transcription}"

Forneça um resumo, identifique o idioma, estime o número de falantes, identifique tópicos, analise o sentimento, extraia pontos principais e dê sugestões úteis.`,
        },
      ],
      schema: AudioAnalysisSchema,
    })

    return NextResponse.json({
      ...result.object,
      transcription,
    })
  } catch (error) {
    console.error("Erro na análise de áudio:", error)
    return NextResponse.json({ error: "Erro interno na análise de áudio" }, { status: 500 })
  }
}
