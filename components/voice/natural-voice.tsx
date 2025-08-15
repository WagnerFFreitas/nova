"use client"

import { useState, useCallback, useRef } from "react"

export interface VoiceConfig {
  provider: "browser" | "elevenlabs" | "azure" | "openai"
  voiceId?: string
  model?: string
  speed?: number
  pitch?: number
  volume?: number
}

export function useNaturalVoice(config: VoiceConfig) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      // Stop any current speech
      stop()

      try {
        setIsSpeaking(true)

        switch (config.provider) {
          case "openai":
            await speakWithOpenAI(text)
            break
          case "elevenlabs":
            await speakWithElevenLabs(text)
            break
          case "azure":
            await speakWithAzure(text)
            break
          case "browser":
          default:
            await speakWithBrowser(text)
            break
        }
      } catch (error) {
        console.error("Erro na síntese de voz:", error)
        // Fallback para voz do navegador
        await speakWithBrowser(text)
      } finally {
        setIsSpeaking(false)
      }
    },
    [config],
  )

  const speakWithOpenAI = async (text: string) => {
    try {
      const response = await fetch("/api/voice/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: config.voiceId || "nova",
          model: config.model || "tts-1-hd",
          speed: config.speed || 1.0,
        }),
      })

      if (!response.ok) throw new Error("Falha na API OpenAI TTS")

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      audioRef.current = new Audio(audioUrl)
      audioRef.current.volume = config.volume || 1.0

      return new Promise<void>((resolve, reject) => {
        if (audioRef.current) {
          audioRef.current.onended = () => {
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          audioRef.current.onerror = reject
          audioRef.current.play()
        }
      })
    } catch (error) {
      console.error("Erro OpenAI TTS:", error)
      throw error
    }
  }

  const speakWithElevenLabs = async (text: string) => {
    try {
      const response = await fetch("/api/voice/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_id: config.voiceId || "21m00Tcm4TlvDq8ikWAM",
          model_id: config.model || "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      })

      if (!response.ok) throw new Error("Falha na API ElevenLabs")

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      audioRef.current = new Audio(audioUrl)
      audioRef.current.volume = config.volume || 1.0

      return new Promise<void>((resolve, reject) => {
        if (audioRef.current) {
          audioRef.current.onended = () => {
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          audioRef.current.onerror = reject
          audioRef.current.play()
        }
      })
    } catch (error) {
      console.error("Erro ElevenLabs:", error)
      throw error
    }
  }

  const speakWithAzure = async (text: string) => {
    try {
      const response = await fetch("/api/voice/azure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: config.voiceId || "pt-BR-FranciscaNeural",
          rate: config.speed || 1.0,
          pitch: config.pitch || 1.0,
        }),
      })

      if (!response.ok) throw new Error("Falha na API Azure Speech")

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      audioRef.current = new Audio(audioUrl)
      audioRef.current.volume = config.volume || 1.0

      return new Promise<void>((resolve, reject) => {
        if (audioRef.current) {
          audioRef.current.onended = () => {
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          audioRef.current.onerror = reject
          audioRef.current.play()
        }
      })
    } catch (error) {
      console.error("Erro Azure Speech:", error)
      throw error
    }
  }

  const speakWithBrowser = async (text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!window.speechSynthesis) {
        setIsSupported(false)
        reject(new Error("Speech Synthesis não suportado"))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Configurar voz feminina em português
      const voices = window.speechSynthesis.getVoices()
      const femaleVoice =
        voices.find(
          (voice) =>
            voice.lang.includes("pt") &&
            (voice.name.toLowerCase().includes("female") ||
              voice.name.toLowerCase().includes("feminina") ||
              voice.name.toLowerCase().includes("woman") ||
              voice.name.toLowerCase().includes("mulher")),
        ) ||
        voices.find((voice) => voice.lang.includes("pt")) ||
        voices[0]

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      // Configurações para voz mais natural
      utterance.pitch = config.pitch || 1.2
      utterance.rate = config.speed || 1.0
      utterance.volume = config.volume || 1.0

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`))

      window.speechSynthesis.speak(utterance)
    })
  }

  const stop = useCallback(() => {
    // Parar áudio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Parar speech synthesis
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
    }

    setIsSpeaking(false)
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  }
}
