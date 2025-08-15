"use client"

import { useEffect, useRef, useState } from "react"

type Expression = "neutral" | "talking" | "thinking" | "happy" | "surprised" | "winking"

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

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.max(10, Math.min(canvas.width, canvas.height) / 2 - 10) // Ensure minimum radius

    // Colors for the tech avatar
    const primaryColor = "#00D4FF" // Bright cyan
    const secondaryColor = "#0099CC" // Darker cyan
    const accentColor = "#66E5FF" // Light cyan
    const glowColor = "#00FFFF" // Pure cyan
    const darkColor = "#001122" // Dark blue

    // Draw background with particles
    const drawBackground = () => {
      if (!ctx) return

      // Dark gradient background
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)
      bgGradient.addColorStop(0, "rgba(0, 20, 40, 0.9)")
      bgGradient.addColorStop(0.5, "rgba(0, 10, 30, 0.7)")
      bgGradient.addColorStop(1, "rgba(0, 5, 20, 0.5)")

      ctx.fillStyle = bgGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2)
      ctx.fill()

      // Animated particles
      const particleCount = Math.max(8, Math.min(20, Math.floor(maxRadius / 5))) // Scale particles with size
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + frameCountRef.current * 0.01
        const radius = maxRadius * 0.3 + Math.sin(frameCountRef.current * 0.02 + i) * (maxRadius * 0.1)
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        const size = Math.max(0.5, 1 + Math.sin(frameCountRef.current * 0.03 + i) * 0.5)

        ctx.fillStyle = `rgba(0, 212, 255, ${0.3 + Math.sin(frameCountRef.current * 0.02 + i) * 0.2})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw concentric circles
    const drawConcentricCircles = () => {
      if (!ctx) return

      const numRings = Math.max(3, Math.min(5, Math.floor(maxRadius / 20))) // Scale rings with size
      const baseRotation = frameCountRef.current * 0.005

      for (let i = 0; i < numRings; i++) {
        const radius = Math.max(5, (maxRadius * (i + 1)) / numRings) // Ensure minimum radius
        const rotation = baseRotation * (i % 2 === 0 ? 1 : -1) * (i + 1)
        const opacity = 0.3 + (i / numRings) * 0.4

        // Ring segments
        const segments = Math.max(4, 8 + i * 2) // Scale segments with ring
        const segmentAngle = (Math.PI * 2) / segments

        ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`
        ctx.lineWidth = Math.max(1, 2 + i * 0.5)

        for (let j = 0; j < segments; j++) {
          const startAngle = j * segmentAngle + rotation
          const endAngle = startAngle + segmentAngle * 0.7 // Gap between segments

          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, startAngle, endAngle)
          ctx.stroke()
        }

        // Add glow effect for outer rings
        if (i >= numRings - 2) {
          ctx.shadowColor = glowColor
          ctx.shadowBlur = Math.max(5, 10)
          ctx.strokeStyle = `rgba(102, 229, 255, ${opacity * 0.5})`
          ctx.lineWidth = 1

          for (let j = 0; j < segments; j++) {
            const startAngle = j * segmentAngle + rotation
            const endAngle = startAngle + segmentAngle * 0.7

            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, startAngle, endAngle)
            ctx.stroke()
          }

          ctx.shadowBlur = 0
        }
      }
    }

    // Draw central core
    const drawCore = () => {
      if (!ctx) return

      const coreRadius = Math.max(3, maxRadius * 0.15) // Ensure minimum core radius
      const pulseIntensity = isSpeaking ? 0.3 : 0.1
      const pulse = 1 + Math.sin(frameCountRef.current * 0.1) * pulseIntensity

      // Core glow
      const glowRadius = Math.max(coreRadius * 1.5, coreRadius * pulse * 2)
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius)
      coreGradient.addColorStop(0, `rgba(0, 255, 255, ${0.8 * pulse})`)
      coreGradient.addColorStop(0.5, `rgba(0, 212, 255, ${0.4 * pulse})`)
      coreGradient.addColorStop(1, "rgba(0, 212, 255, 0)")

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
      ctx.fill()

      // Core solid
      ctx.fillStyle = primaryColor
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreRadius * pulse, 0, Math.PI * 2)
      ctx.fill()

      // Core inner ring
      const innerRingRadius = Math.max(2, coreRadius * pulse * 0.7)
      ctx.strokeStyle = accentColor
      ctx.lineWidth = Math.max(1, 2)
      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRingRadius, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw expression indicators
    const drawExpressionIndicators = () => {
      if (!ctx) return

      const indicatorRadius = Math.max(10, maxRadius * 0.25)
      const indicatorSize = Math.max(1, Math.min(3, maxRadius / 20))

      switch (expression) {
        case "happy":
          // Happy indicators - upward arcs
          const happyCount = Math.max(4, Math.min(8, Math.floor(maxRadius / 10)))
          for (let i = 0; i < happyCount; i++) {
            const angle = (i / happyCount) * Math.PI * 2
            const x = centerX + Math.cos(angle) * indicatorRadius
            const y = centerY + Math.sin(angle) * indicatorRadius

            ctx.strokeStyle = `rgba(102, 255, 102, 0.8)`
            ctx.lineWidth = Math.max(1, 2)
            ctx.beginPath()
            ctx.arc(x, y, indicatorSize, angle - Math.PI / 4, angle + Math.PI / 4)
            ctx.stroke()
          }
          break

        case "thinking":
          // Thinking indicators - rotating dots
          for (let i = 0; i < 3; i++) {
            const angle = frameCountRef.current * 0.05 + (i * Math.PI * 2) / 3
            const x = centerX + Math.cos(angle) * indicatorRadius
            const y = centerY + Math.sin(angle) * indicatorRadius

            ctx.fillStyle = `rgba(255, 255, 102, ${0.5 + Math.sin(frameCountRef.current * 0.1 + i) * 0.3})`
            ctx.beginPath()
            ctx.arc(x, y, indicatorSize, 0, Math.PI * 2)
            ctx.fill()
          }
          break

        case "surprised":
          // Surprised indicators - expanding rings
          const surpriseRadius = Math.max(
            5,
            indicatorRadius + Math.sin(frameCountRef.current * 0.2) * (maxRadius * 0.1),
          )
          if (surpriseRadius > 0) {
            ctx.strokeStyle = `rgba(255, 102, 255, 0.6)`
            ctx.lineWidth = Math.max(1, 2)
            ctx.beginPath()
            ctx.arc(centerX, centerY, surpriseRadius, 0, Math.PI * 2)
            ctx.stroke()
          }
          break

        case "winking":
          // Winking indicators - asymmetric pattern
          const winkCount = Math.max(3, Math.min(6, Math.floor(maxRadius / 15)))
          for (let i = 0; i < winkCount; i++) {
            const angle = (i / winkCount) * Math.PI * 2 + frameCountRef.current * 0.03
            const radius = indicatorRadius + (i % 2) * (maxRadius * 0.05)
            const x = centerX + Math.cos(angle) * radius
            const y = centerY + Math.sin(angle) * radius

            ctx.fillStyle = `rgba(255, 102, 255, ${0.4 + (i % 2) * 0.3})`
            ctx.beginPath()
            ctx.arc(x, y, indicatorSize, 0, Math.PI * 2)
            ctx.fill()
          }
          break
      }
    }

    // Draw speaking animation - FIXED
    const drawSpeakingAnimation = () => {
      if (!ctx || !isSpeaking) return

      const baseWaveRadius = maxRadius * 0.6 // Start closer to center
      const waveSpacing = Math.max(5, maxRadius * 0.1) // Dynamic spacing
      const waveCount = Math.max(1, Math.min(3, Math.floor(maxRadius / 30))) // Scale wave count

      for (let i = 0; i < waveCount; i++) {
        const waveRadius = baseWaveRadius + i * waveSpacing

        // Only draw if radius is positive and within bounds
        if (waveRadius > 0 && waveRadius < maxRadius) {
          const waveOffset = (frameCountRef.current * 0.1 + i * 0.5) % (Math.PI * 2)
          const waveIntensity = Math.max(0.1, 0.3 + Math.sin(waveOffset) * 0.2)

          ctx.strokeStyle = `rgba(0, 255, 255, ${waveIntensity})`
          ctx.lineWidth = 1
          ctx.setLineDash([Math.max(2, 5), Math.max(2, 5)])

          ctx.beginPath()
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2)
          ctx.stroke()

          ctx.setLineDash([])
        }
      }
    }

    // Draw data streams
    const drawDataStreams = () => {
      if (!ctx) return

      const streamCount = Math.max(6, Math.min(12, Math.floor(maxRadius / 8)))
      const startRadius = Math.max(5, maxRadius * 0.4)
      const endRadius = Math.max(startRadius + 10, maxRadius * 0.9)

      for (let i = 0; i < streamCount; i++) {
        const angle = (i / streamCount) * Math.PI * 2 + frameCountRef.current * 0.02
        const startX = centerX + Math.cos(angle) * startRadius
        const startY = centerY + Math.sin(angle) * startRadius
        const endX = centerX + Math.cos(angle) * endRadius
        const endY = centerY + Math.sin(angle) * endRadius

        // Create gradient for stream
        const streamGradient = ctx.createLinearGradient(startX, startY, endX, endY)
        streamGradient.addColorStop(0, "rgba(0, 212, 255, 0)")
        streamGradient.addColorStop(0.5, `rgba(0, 212, 255, ${0.3 + Math.sin(frameCountRef.current * 0.05 + i) * 0.2})`)
        streamGradient.addColorStop(1, "rgba(0, 212, 255, 0)")

        ctx.strokeStyle = streamGradient
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }
    }

    // Main animation function
    const animate = () => {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Reset any transforms or effects
      ctx.save()

      try {
        // Draw all components in order
        drawBackground()
        drawDataStreams()
        drawConcentricCircles()
        drawSpeakingAnimation()
        drawExpressionIndicators()
        drawCore()
      } catch (error) {
        console.error("Animation error:", error)
      }

      ctx.restore()

      frameCountRef.current += 1

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
      className={`relative overflow-hidden rounded-full border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/20 ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-full">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Tech overlay effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
    </div>
  )
}
