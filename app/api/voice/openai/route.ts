import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "nova", model = "tts-1-hd", speed = 1.0 } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key não configurada" }, { status: 500 })
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        speed,
        response_format: "mp3",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Erro OpenAI TTS:", error)
      return NextResponse.json({ error: "Falha na síntese de voz" }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Erro na API de voz OpenAI:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
