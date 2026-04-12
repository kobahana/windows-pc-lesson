"use client"

import { cn } from "@/lib/utils"
import { useSettings } from "../providers/settings-provider"

interface CharacterProps {
  message: React.ReactNode
  mood: "happy" | "neutral" | "encouraging" | "celebrating"
  className?: string
}

export function Character({ message, mood, className }: CharacterProps) {
  const getMoodStyles = () => {
    switch (mood) {
      case "happy":
        return "animate-bounce-subtle"
      case "celebrating":
        return "animate-celebrate"
      case "encouraging":
        return "animate-pulse-gentle"
      default:
        return ""
    }
  }

  const getEyeExpression = () => {
    switch (mood) {
      case "celebrating":
        return "scale-y-50"
      case "happy":
        return "scale-y-75"
      default:
        return ""
    }
  }

  return (
    <div className={cn("flex items-start gap-4", className)}>
      {/* Character Avatar */}
      <div className={cn("relative flex-shrink-0", getMoodStyles())}>
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg border-4 border-card">
          {/* Simple cute face */}
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            {/* Eyes */}
            <div className="absolute top-4 left-2 w-3 h-4 md:w-4 md:h-5 bg-card rounded-full flex items-center justify-center">
              <div className={cn("w-1.5 h-2 md:w-2 md:h-2.5 bg-foreground rounded-full transition-transform", getEyeExpression())} />
            </div>
            <div className="absolute top-4 right-2 w-3 h-4 md:w-4 md:h-5 bg-card rounded-full flex items-center justify-center">
              <div className={cn("w-1.5 h-2 md:w-2 md:h-2.5 bg-foreground rounded-full transition-transform", getEyeExpression())} />
            </div>
            {/* Blush */}
            <div className="absolute top-8 left-0 w-2 h-1.5 bg-pink-300/60 rounded-full" />
            <div className="absolute top-8 right-0 w-2 h-1.5 bg-pink-300/60 rounded-full" />
            {/* Mouth */}
            <div className={cn(
              "absolute bottom-2 left-1/2 -translate-x-1/2 transition-all",
              mood === "celebrating" || mood === "happy" 
                ? "w-6 h-3 md:w-8 md:h-4 border-b-4 border-foreground rounded-b-full" 
                : "w-4 h-2 md:w-5 md:h-2.5 border-b-3 border-foreground rounded-b-full"
            )} />
          </div>
        </div>
        {/* Character name badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full text-xs font-bold text-primary shadow-md border border-border whitespace-nowrap">
          パソ<ruby>先生<rt>せんせい</rt></ruby>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1 bg-card rounded-2xl rounded-tl-sm p-4 md:p-6 shadow-lg border border-border">
        {/* Bubble tail */}
        <div className="absolute -left-3 top-4 w-0 h-0 border-t-[10px] border-t-transparent border-r-[12px] border-r-card border-b-[10px] border-b-transparent" />
        <div className="absolute -left-[14px] top-4 w-0 h-0 border-t-[11px] border-t-transparent border-r-[13px] border-r-border border-b-[11px] border-b-transparent -z-10" />
        
        <div className="text-base md:text-lg leading-relaxed text-card-foreground font-medium">
          {message}
        </div>
      </div>
    </div>
  )
}

// Helper component for furigana
export function Ruby({ children, rt }: { children: React.ReactNode; rt: string }) {
  const { showRuby } = useSettings()

  return (
    <ruby>
      {children}
      {showRuby && <rt className="text-[0.6em]">{rt}</rt>}
    </ruby>
  )
}

