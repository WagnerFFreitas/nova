"use client"

import { useEffect, useRef, useState } from "react"

type Expression = "neutral" | "talking" | "thinking" | "happy" | "surprised"

interface AnimatedAvatarProps {
  isSpeaking: boolean
  expression?: Expression
  size?: "small" | "medium" | "large" | "full"
  className?: string
}

export default function AnimatedAvatar({
  isSpeaking,
  expression = "neutral",
  size = "medium",
  className = "",
}: AnimatedAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const animationRef = useRef<number | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Define dimensions based on size prop
  useEffect(() => {
    switch (size) {
      case "small":
        setDimensions({ width: 80, height: 80 })
        break
      case "medium":
        setDimensions({ width: 200, height: 200 })
        break
      case "large":
        setDimensions({ width: 300, height: 300 })
        break
      case "full":
        setDimensions({ width: 400, height: 400 })
        break
      default:
        setDimensions({ width: 200, height: 200 })
    }
  }, [size])

  // Load the base image
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image()
      img.src =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bcb5db0d-30ee-4a51-8339-17c59b8de450-tXFl8Nq6FpHeD8yqw5l3EekzGBH5xI.png"
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageRef.current = img
        setIsLoaded(true)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Draw the base image
    const drawBaseImage = () => {
      if (!ctx || !imageRef.current) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the base image
      ctx.drawImage(
        imageRef.current,
        0,
        0,
        imageRef.current.width,
        imageRef.current.height,
        0,
        0,
        canvas.width,
        canvas.height,
      )
    }

    // Apply mouth animation when speaking
    const animateMouth = () => {
      if (!ctx) return

      // Determine mouth position (approximate for this example)
      const mouthX = canvas.width * 0.5
      const mouthY = canvas.height * 0.65
      const mouthWidth = canvas.width * 0.2
      const mouthHeight = canvas.height * 0.05

      // Different mouth shapes for talking animation
      if (isSpeaking) {
        // Calculate mouth opening based on frame
        const openAmount = Math.sin(currentFrame * 0.3) * 0.5 + 0.5

        // Draw mouth
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.beginPath()
        ctx.ellipse(mouthX, mouthY, mouthWidth * 0.5, mouthHeight * (0.5 + openAmount * 1.5), 0, 0, Math.PI * 2)
        ctx.fill()

        // Add lip highlight
        ctx.strokeStyle = "rgba(255, 200, 200, 0.5)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(mouthX, mouthY - mouthHeight * 0.2, mouthWidth * 0.5, mouthHeight * 0.5, 0, Math.PI, Math.PI * 2)
        ctx.stroke()
      }
    }

    // Apply eye animations
    const animateEyes = () => {
      if (!ctx) return

      // Determine eye positions (approximate for this example)
      const leftEyeX = canvas.width * 0.35
      const rightEyeX = canvas.width * 0.65
      const eyeY = canvas.height * 0.45
      const eyeSize = canvas.width * 0.08

      // Blink occasionally
      const shouldBlink = Math.random() < 0.01

      if (shouldBlink) {
        // Draw closed eyes
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
        ctx.lineWidth = 2

        // Left eye closed
        ctx.beginPath()
        ctx.moveTo(leftEyeX - eyeSize, eyeY)
        ctx.lineTo(leftEyeX + eyeSize, eyeY)
        ctx.stroke()

        // Right eye closed
        ctx.beginPath()
        ctx.moveTo(rightEyeX - eyeSize, eyeY)
        ctx.lineTo(rightEyeX + eyeSize, eyeY)
        ctx.stroke()
      }
    }

    // Apply expression-specific animations
    const applyExpression = () => {
      if (!ctx) return

      // Eyebrow positions
      const leftEyebrowX = canvas.width * 0.35
      const rightEyebrowX = canvas.width * 0.65
      const eyebrowY = canvas.height * 0.4
      const eyebrowWidth = canvas.width * 0.1

      ctx.strokeStyle = "rgba(0, 0, 0, 0.7)"
      ctx.lineWidth = 3

      switch (expression) {
        case "happy":
          // Raised eyebrows and smile
          ctx.beginPath()
          ctx.moveTo(leftEyebrowX - eyebrowWidth, eyebrowY)
          ctx.quadraticCurveTo(leftEyebrowX, eyebrowY - 10, leftEyebrowX + eyebrowWidth, eyebrowY)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(rightEyebrowX - eyebrowWidth, eyebrowY)
          ctx.quadraticCurveTo(rightEyebrowX, eyebrowY - 10, rightEyebrowX + eyebrowWidth, eyebrowY)
          ctx.stroke()
          break

        case "surprised":
          // High eyebrows and wide eyes
          ctx.beginPath()
          ctx.moveTo(leftEyebrowX - eyebrowWidth, eyebrowY - 10)
          ctx.quadraticCurveTo(leftEyebrowX, eyebrowY - 20, leftEyebrowX + eyebrowWidth, eyebrowY - 10)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(rightEyebrowX - eyebrowWidth, eyebrowY - 10)
          ctx.quadraticCurveTo(rightEyebrowX, eyebrowY - 20, rightEyebrowX + eyebrowWidth, eyebrowY - 10)
          ctx.stroke()
          break

        case "thinking":
          // One raised eyebrow
          ctx.beginPath()
          ctx.moveTo(leftEyebrowX - eyebrowWidth, eyebrowY)
          ctx.quadraticCurveTo(leftEyebrowX, eyebrowY - 15, leftEyebrowX + eyebrowWidth, eyebrowY)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(rightEyebrowX - eyebrowWidth, eyebrowY + 5)
          ctx.quadraticCurveTo(rightEyebrowX, eyebrowY, rightEyebrowX + eyebrowWidth, eyebrowY + 5)
          ctx.stroke()
          break

        default:
          // Neutral expression - subtle eyebrow curve
          ctx.beginPath()
          ctx.moveTo(leftEyebrowX - eyebrowWidth, eyebrowY)
          ctx.quadraticCurveTo(leftEyebrowX, eyebrowY - 5, leftEyebrowX + eyebrowWidth, eyebrowY)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(rightEyebrowX - eyebrowWidth, eyebrowY)
          ctx.quadraticCurveTo(rightEyebrowX, eyebrowY - 5, rightEyebrowX + eyebrowWidth, eyebrowY)
          ctx.stroke()
          break
      }
    }

    // Subtle head movement
    const applyHeadMovement = () => {
      if (!ctx || !canvas) return

      // Apply a subtle rotation/movement based on speaking and frame
      const angle = isSpeaking ? Math.sin(currentFrame * 0.05) * 0.02 : Math.sin(currentFrame * 0.02) * 0.01
      const shiftX = isSpeaking ? Math.sin(currentFrame * 0.1) * 2 : Math.sin(currentFrame * 0.05) * 1

      // Save the current state
      ctx.save()

      // Translate to center, rotate, translate back
      ctx.translate(canvas.width / 2 + shiftX, canvas.height / 2)
      ctx.rotate(angle)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)
    }

    // Animation frame function
    const animate = () => {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply head movement (save context state)
      applyHeadMovement()

      // Draw base image
      drawBaseImage()

      // Apply animations
      animateMouth()
      animateEyes()
      applyExpression()

      // Restore context state (from head movement)
      ctx.restore()

      // Update frame counter
      setCurrentFrame((prev) => prev + 1)

      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isLoaded, isSpeaking, expression, currentFrame, dimensions])

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

