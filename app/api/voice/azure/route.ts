import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "pt-BR-FranciscaNeural", rate = 1.0, pitch = 1.0 } = await request.json()

    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      return NextResponse.json({ error: "Azure Speech credentials não configuradas" }, { status: 500 })
    }

    // Obter token de acesso
    const tokenResponse = await fetch(
      `https://${process.env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: "Falha na autenticação Azure" }, { status: 401 })
    }

    const accessToken = await tokenResponse.text()

    // SSML para controle avançado da voz
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">
        <voice name="${voice}">
          <prosody rate="${rate}" pitch="${pitch > 1 ? "+" : ""}${((pitch - 1) * 50).toFixed(0)}%">
            ${text}
          </prosody>
        </voice>
      </speak>
    `

    const response = await fetch(
      `https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        },
        body: ssml,
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Erro Azure TTS:", error)
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
    console.error("Erro na API de voz Azure:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
