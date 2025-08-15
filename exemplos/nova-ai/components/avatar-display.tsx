"use client"

import { useEffect, useRef, useState } from "react"

type Expression = "neutral" | "talking" | "thinking" | "happy" | "surprised"

interface AvatarDisplayProps {
  isSpeaking: boolean
  expression?: Expression
  size?: "small" | "medium" | "large" | "full"
  className?: string
}

export default function AvatarDisplay({
  isSpeaking,
  expression = "neutral",
  size = "medium",
  className = "",
}: AvatarDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const frameCountRef = useRef(0)
  const animationRef = useRef<number | null>(null)
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

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return
    setIsLoaded(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Colors for the avatar
    const skinColor = "#C9A889" // Parda skin tone
    const hairColor = "#3A2213" // Dark brown hair
    const eyeColor = "#5E3A1C" // Brown eyes
    const lipColor = "#A15843" // Natural lip color
    const blushColor = "rgba(225, 126, 126, 0.2)" // Subtle blush

    // Draw face
    const drawFace = () => {
      if (!ctx) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const faceRadius = canvas.width * 0.4

      // Face shape
      ctx.fillStyle = skinColor
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, faceRadius, faceRadius * 1.1, 0, 0, Math.PI * 2)
      ctx.fill()

      // Add some shading/highlight
      const gradient = ctx.createRadialGradient(
        centerX - faceRadius * 0.2,
        centerY - faceRadius * 0.2,
        faceRadius * 0.1,
        centerX,
        centerY,
        faceRadius * 1.2,
      )
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
      gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, faceRadius, faceRadius * 1.1, 0, 0, Math.PI * 2)
      ctx.fill()

      // Add blush to cheeks
      ctx.fillStyle = blushColor
      ctx.beginPath()
      ctx.ellipse(
        centerX - faceRadius * 0.5,
        centerY + faceRadius * 0.1,
        faceRadius * 0.2,
        faceRadius * 0.15,
        0,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(
        centerX + faceRadius * 0.5,
        centerY + faceRadius * 0.1,
        faceRadius * 0.2,
        faceRadius * 0.15,
        0,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }

    // Draw hair
    const drawHair = () => {
      if (!ctx) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const faceRadius = canvas.width * 0.4

      // Back hair (behind face)
      ctx.fillStyle = hairColor

      // Long hair flowing down
      ctx.beginPath()
      ctx.moveTo(centerX - faceRadius * 1.2, centerY - faceRadius * 0.8)
      ctx.quadraticCurveTo(centerX, centerY + faceRadius * 2, centerX + faceRadius * 1.2, centerY - faceRadius * 0.8)
      ctx.lineTo(centerX + faceRadius * 0.8, centerY - faceRadius * 0.8)
      ctx.lineTo(centerX + faceRadius * 0.8, centerY + faceRadius * 1.5)
      ctx.lineTo(centerX - faceRadius * 0.8, centerY + faceRadius * 1.5)
      ctx.lineTo(centerX - faceRadius * 0.8, centerY - faceRadius * 0.8)
      ctx.fill()

      // Front hair (bangs and sides)
      ctx.beginPath()
      ctx.moveTo(centerX - faceRadius * 0.8, centerY - faceRadius * 0.6)

      // Left side hair
      ctx.quadraticCurveTo(
        centerX - faceRadius * 0.9,
        centerY - faceRadius * 0.2,
        centerX - faceRadius * 0.7,
        centerY + faceRadius * 0.4,
      )

      // Right side hair
      ctx.moveTo(centerX + faceRadius * 0.8, centerY - faceRadius * 0.6)
      ctx.quadraticCurveTo(
        centerX + faceRadius * 0.9,
        centerY - faceRadius * 0.2,
        centerX + faceRadius * 0.7,
        centerY + faceRadius * 0.4,
      )

      // Bangs
      ctx.moveTo(centerX - faceRadius * 0.5, centerY - faceRadius * 0.8)
      ctx.quadraticCurveTo(centerX, centerY - faceRadius * 0.6, centerX + faceRadius * 0.5, centerY - faceRadius * 0.8)

      ctx.fill()

      // Hair highlights
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(centerX - faceRadius * 0.3, centerY - faceRadius * 0.4)
      ctx.quadraticCurveTo(centerX, centerY + faceRadius * 1.2, centerX + faceRadius * 0.4, centerY - faceRadius * 0.2)
      ctx.stroke()
    }

    // Draw eyes
    const drawEyes = () => {
      if (!ctx) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const faceRadius = canvas.width * 0.4

      const eyeWidth = faceRadius * 0.25
      const eyeHeight = faceRadius * 0.15
      const eyeY = centerY - faceRadius * 0.1
      const leftEyeX = centerX - faceRadius * 0.25
      const rightEyeX = centerX + faceRadius * 0.25

      // Eye whites
      ctx.fillStyle = "white"

      // Left eye
      ctx.beginPath()
      ctx.ellipse(leftEyeX, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2)
      ctx.fill()

      // Right eye
      ctx.beginPath()
      ctx.ellipse(rightEyeX, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2)
      ctx.fill()

      // Determine pupil position based on expression
      let pupilShiftX = 0
      let pupilShiftY = 0

      if (expression === "thinking") {
        pupilShiftX = -0.3
        pupilShiftY = -0.3
      } else if (expression === "surprised") {
        pupilShiftY = -0.4
      }

      // Blink animation
      const shouldBlink = Math.random() < 0.01

      if (shouldBlink) {
        // Draw closed eyes
        ctx.strokeStyle = "rgba(0, 0, 0, 0.7)"
        ctx.lineWidth = 2

        // Left eye closed
        ctx.beginPath()
        ctx.moveTo(leftEyeX - eyeWidth, eyeY)
        ctx.quadraticCurveTo(leftEyeX, eyeY + 2, leftEyeX + eyeWidth, eyeY)
        ctx.stroke()

        // Right eye closed
        ctx.beginPath()
        ctx.moveTo(rightEyeX - eyeWidth, eyeY)
        ctx.quadraticCurveTo(rightEyeX, eyeY + 2, rightEyeX + eyeWidth, eyeY)
        ctx.stroke()
      } else {
        // Draw pupils
        const pupilSize = eyeWidth * 0.5
        ctx.fillStyle = eyeColor

        // Left pupil
        ctx.beginPath()
        ctx.ellipse(
          leftEyeX + pupilShiftX * eyeWidth,
          eyeY + pupilShiftY * eyeHeight,
          pupilSize,
          pupilSize,
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        // Right pupil
        ctx.beginPath()
        ctx.ellipse(
          rightEyeX + pupilShiftX * eyeWidth,
          eyeY + pupilShiftY * eyeHeight,
          pupilSize,
          pupilSize,
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        // Eye highlights
        ctx.fillStyle = "white"

        // Left eye highlight
        ctx.beginPath()
        ctx.ellipse(
          leftEyeX + pupilShiftX * eyeWidth - pupilSize * 0.3,
          eyeY + pupilShiftY * eyeHeight - pupilSize * 0.3,
          pupilSize * 0.3,
          pupilSize * 0.3,
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        // Right eye highlight
        ctx.beginPath()
        ctx.ellipse(
          rightEyeX + pupilShiftX * eyeWidth - pupilSize * 0.3,
          eyeY + pupilShiftY * eyeHeight - pupilSize * 0.3,
          pupilSize * 0.3,
          pupilSize * 0.3,
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }

      // Eyebrows
      ctx.strokeStyle = hairColor
      ctx.lineWidth = 3

      // Eyebrow positions based on expression
      let leftEyebrowY1 = eyeY - eyeHeight * 2
      let leftEyebrowY2 = eyeY - eyeHeight * 2
      let rightEyebrowY1 = eyeY - eyeHeight * 2
      let rightEyebrowY2 = eyeY - eyeHeight * 2

      switch (expression) {
        case "happy":
          leftEyebrowY1 = eyeY - eyeHeight * 2.2
          rightEyebrowY1 = eyeY - eyeHeight * 2.2
          break
        case "surprised":
          leftEyebrowY1 = eyeY - eyeHeight * 2.5
          leftEyebrowY2 = eyeY - eyeHeight * 2.5
          rightEyebrowY1 = eyeY - eyeHeight * 2.5
          rightEyebrowY2 = eyeY - eyeHeight * 2.5
          break
        case "thinking":
          leftEyebrowY1 = eyeY - eyeHeight * 2.3
          rightEyebrowY2 = eyeY - eyeHeight * 1.8
          break
      }

      // Left eyebrow
      ctx.beginPath()
      ctx.moveTo(leftEyeX - eyeWidth * 1.2, leftEyebrowY1)
      ctx.quadraticCurveTo(leftEyeX, leftEyebrowY2 - eyeHeight * 0.5, leftEyeX + eyeWidth * 1.2, leftEyebrowY2)
      ctx.stroke()

      // Right eyebrow
      ctx.beginPath()
      ctx.moveTo(rightEyeX - eyeWidth * 1.2, rightEyebrowY1)
      ctx.quadraticCurveTo(rightEyeX, rightEyebrowY2 - eyeHeight * 0.5, rightEyeX + eyeWidth * 1.2, rightEyebrowY2)
      ctx.stroke()
    }

    // Draw nose
    const drawNose = () => {
      if (!ctx) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const faceRadius = canvas.width * 0.4

      // Simple nose
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
      ctx.lineWidth = 1

      ctx.beginPath()
      ctx.moveTo(centerX, centerY - faceRadius * 0.1)
      ctx.quadraticCurveTo(centerX + faceRadius * 0.1, centerY + faceRadius * 0.1, centerX, centerY + faceRadius * 0.15)
      ctx.stroke()

      // Nostril hint
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.beginPath()
      ctx.ellipse(
        centerX - faceRadius * 0.05,
        centerY + faceRadius * 0.15,
        faceRadius * 0.03,
        faceRadius * 0.02,
        0,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(
        centerX + faceRadius * 0.05,
        centerY + faceRadius * 0.15,
        faceRadius * 0.03,
        faceRadius * 0.02,
        0,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }

    // Draw mouth
    const drawMouth = () => {
      if (!ctx) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const faceRadius = canvas.width * 0.4

      const mouthY = centerY + faceRadius * 0.3
      const mouthWidth = faceRadius * 0.4

      // Different mouth shapes based on expression and speaking
      if (isSpeaking) {
        // Talking mouth animation
        const openAmount = Math.sin(frameCountRef.current * 0.3) * 0.5 + 0.5
        const mouthHeight = faceRadius * 0.1 * (0.5 + openAmount)

        // Mouth background (inside)
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.beginPath()
        ctx.ellipse(centerX, mouthY, mouthWidth * 0.8, mouthHeight, 0, 0, Math.PI * 2)
        ctx.fill()

        // Lips
        ctx.strokeStyle = lipColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(centerX, mouthY, mouthWidth * 0.8, mouthHeight, 0, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        // Static mouth based on expression
        ctx.strokeStyle = lipColor
        ctx.lineWidth = 2

        switch (expression) {
          case "happy":
            // Smile
            ctx.beginPath()
            ctx.moveTo(centerX - mouthWidth, mouthY)
            ctx.quadraticCurveTo(centerX, mouthY + faceRadius * 0.2, centerX + mouthWidth, mouthY)
            ctx.stroke()

            // Filled lips
            ctx.fillStyle = lipColor
            ctx.beginPath()
            ctx.moveTo(centerX - mouthWidth, mouthY)
            ctx.quadraticCurveTo(centerX, mouthY + faceRadius * 0.05, centerX + mouthWidth, mouthY)
            ctx.quadraticCurveTo(centerX, mouthY + faceRadius * 0.02, centerX - mouthWidth, mouthY)
            ctx.fill()
            break

          case "surprised":
            // O shaped mouth
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
            ctx.beginPath()
            ctx.ellipse(centerX, mouthY, mouthWidth * 0.5, faceRadius * 0.15, 0, 0, Math.PI * 2)
            ctx.fill()

            // Lips
            ctx.strokeStyle = lipColor
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.ellipse(centerX, mouthY, mouthWidth * 0.5, faceRadius * 0.15, 0, 0, Math.PI * 2)
            ctx.stroke()
            break

          case "thinking":
            // Slightly asymmetric mouth
            ctx.beginPath()
            ctx.moveTo(centerX - mouthWidth, mouthY)
            ctx.quadraticCurveTo(centerX, mouthY, centerX + mouthWidth, mouthY - faceRadius * 0.05)
            ctx.stroke()

            // Filled lips
            ctx.fillStyle = lipColor
            ctx.beginPath()
            ctx.moveTo(centerX - mouthWidth, mouthY)
            ctx.quadraticCurveTo(centerX, mouthY + faceRadius * 0.02, centerX + mouthWidth, mouthY - faceRadius * 0.05)
            ctx.quadraticCurveTo(centerX, mouthY - faceRadius * 0.02, centerX - mouthWidth, mouthY)
            ctx.fill()
            break

          default:
            // Neutral mouth
            ctx.fillStyle = lipColor
            ctx.beginPath()
            ctx.moveTo(centerX - mouthWidth, mouthY)
            ctx.quadraticCurveTo(centerX, mouthY + faceRadius * 0.02, centerX + mouthWidth, mouthY)
            ctx.quadraticCurveTo(centerX, mouthY - faceRadius * 0.02, centerX - mouthWidth, mouthY)
            ctx.fill()
            break
        }
      }
    }

    // Subtle head movement
    const applyHeadMovement = () => {
      if (!ctx || !canvas) return

      // Apply a subtle rotation/movement based on speaking and frame
      const angle = isSpeaking
        ? Math.sin(frameCountRef.current * 0.05) * 0.02
        : Math.sin(frameCountRef.current * 0.02) * 0.01
      const shiftX = isSpeaking ? Math.sin(frameCountRef.current * 0.1) * 2 : Math.sin(frameCountRef.current * 0.05) * 1

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

      // Draw avatar components in order
      drawHair() // Hair behind face
      drawFace()
      drawEyes()
      drawNose()
      drawMouth()

      // Restore context state (from head movement)
      ctx.restore()

      // Update frame counter usando a referência em vez do estado
      frameCountRef.current += 1

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
  }, [isLoaded, isSpeaking, expression, dimensions])

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

