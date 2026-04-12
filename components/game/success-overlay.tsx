"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface SuccessOverlayProps {
  show: boolean
  message?: string
}

export function SuccessOverlay({ show, message = "すごい！" }: SuccessOverlayProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5
      }))
      setParticles(newParticles)
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        >
          <Sparkles className={cn(
            "w-6 h-6",
            particle.id % 3 === 0 ? "text-primary" : particle.id % 3 === 1 ? "text-accent" : "text-warning"
          )} />
        </div>
      ))}
      
      {/* Success message (only if provided) */}
      {message && (
        <div className="bg-success text-success-foreground px-8 py-4 rounded-2xl shadow-2xl animate-bounce-in">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            <span className="text-2xl font-bold">{message}</span>
            <Sparkles className="w-8 h-8" />
          </div>
        </div>
      )}
    </div>
  )
}
