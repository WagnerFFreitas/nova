import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const DocumentAnalysisSchema = z.object({
  content: z.string().describe("Conteúdo extraído do documento"),
  summary: z.string().describe("Resumo do documento"),
  keyPoints: z.array(z.string()).describe("Pontos principais"),
  topics: z.array(z.string()).describe("Tópicos abordados"),
  language: z.string().describe("Idioma do documento"),
  wordCount: z.number().describe("Contagem aproximada de palavras"),
  suggestions: z.array(z.string()).describe("Sugestões baseadas no conteúdo"),
  type: z.string().describe("Tipo de documento identificado"),
})

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // Simulação de extração de PDF
    // Na implementação real, usaria pdf-parse ou similar
    return "Conteúdo extraído do PDF. Configure bibliotecas de PDF para extração completa."
  } catch (error) {
    console.error("Erro na extração de PDF:", error)
    return "Erro na extração do texto do PDF"
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    let extractedText = ""

    // Extrair texto baseado no tipo de arquivo
    if (file.type === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer)
    } else if (file.type === "text/plain" || file.type === "text/csv") {
      extractedText = new TextDecoder().decode(buffer)
    } else {
      // Tentar como texto
      extractedText = new TextDecoder().decode(buffer)
    }

    if (!process.env.OPENAI_API_KEY) {
      // Análise simulada
      const mockAnalysis = {
        content: extractedText.substring(0, 500) + "...",
        summary: `Documento ${file.name} processado em modo demonstração`,
        keyPoints: ["Ponto principal 1", "Ponto principal 2"],
        topics: ["Tópico identificado"],
        language: "português",
        wordCount: extractedText.split(" ").length,
        suggestions: ["Configure OPENAI_API_KEY para análise completa", "Documento processado com sucesso"],
        type: "documento de texto",
      }

      return NextResponse.json(mockAnalysis)
    }

    // Análise real com GPT-4
    const result = await generateObject({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: `Analise este documento detalhadamente:

${extractedText}

Forneça um resumo, pontos principais, tópicos, identifique o idioma, conte palavras aproximadamente, classifique o tipo de documento e dê sugestões úteis.`,
        },
      ],
      schema: DocumentAnalysisSchema,
    })

    return NextResponse.json({
      ...result.object,
      content: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? "..." : ""),
    })
  } catch (error) {
    console.error("Erro na análise de documento:", error)
    return NextResponse.json({ error: "Erro interno na análise de documento" }, { status: 500 })
  }
}
