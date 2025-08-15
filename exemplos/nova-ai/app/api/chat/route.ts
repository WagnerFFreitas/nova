import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages, model } = await req.json()

  let result

  switch (model) {
    case "claude-3-7-sonnet":
      result = streamText({
        model: anthropic("claude-3-7-sonnet-20250219"),
        messages,
      })
      break
    case "o3-mini":
      result = streamText({
        model: openai("o3-mini"),
        messages,
      })
      break
    case "gemini-pro":
      // Implementação para Gemini seria adicionada aqui
      result = streamText({
        model: openai("gpt-4o"), // Fallback para GPT-4o
        messages,
      })
      break
    case "gpt-4o":
    default:
      result = streamText({
        model: openai("gpt-4o"),
        messages,
      })
      break
  }

  return result.toDataStreamResponse()
}

