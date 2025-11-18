'use client'

import { useEffect, useRef } from 'react'

export default function WireframeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Maritime wireframe patterns
    const patterns = {
      grid: [] as Array<{ x: number; y: number; size: number; rotation: number; speed: number }>,
      circles: [] as Array<{ x: number; y: number; radius: number; pulsePhase: number; speed: number }>,
      lines: [] as Array<{ x1: number; y1: number; x2: number; y2: number; offset: number; speed: number }>,
    }

    // Initialize grid nodes
    for (let i = 0; i < 15; i++) {
      patterns.grid.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 40 + 20,
        rotation: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0001 + 0.00005,
      })
    }

    // Initialize sonar circles
    for (let i = 0; i < 8; i++) {
      patterns.circles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 100 + 50,
        pulsePhase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.001 + 0.0005,
      })
    }

    // Initialize depth contour lines
    for (let i = 0; i < 12; i++) {
      patterns.lines.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        offset: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0002 + 0.0001,
      })
    }

    let animationFrame: number
    let time = 0

    const animate = () => {
      time += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid nodes (rotating squares)
      patterns.grid.forEach((node) => {
        node.rotation += node.speed
        
        ctx.save()
        ctx.translate(node.x, node.y)
        ctx.rotate(node.rotation)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + Math.sin(time * 0.002) * 0.03})`
        ctx.lineWidth = 1
        ctx.strokeRect(-node.size / 2, -node.size / 2, node.size, node.size)
        ctx.restore()
      })

      // Draw sonar circles (pulsing)
      patterns.circles.forEach((circle) => {
        circle.pulsePhase += circle.speed
        const opacity = (Math.sin(circle.pulsePhase) + 1) / 2 * 0.08
        
        ctx.strokeStyle = `rgba(0, 198, 183, ${opacity})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Draw contour lines (wave effect)
      patterns.lines.forEach((line) => {
        line.offset += line.speed
        const wave = Math.sin(line.offset) * 20
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1 + wave)
        ctx.lineTo(line.x2, line.y2 + wave)
        ctx.stroke()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  )
}
