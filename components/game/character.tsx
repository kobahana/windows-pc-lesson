"use client"

import { cn } from "@/lib/utils"

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
      <div className={cn("relative flex-shrink-0 pt-7", getMoodStyles())}>
        
        {/* --- 輪っかアンテナ（ピンク） --- */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-7 h-7 border-[5px] border-pink-500 rounded-full bg-background mb-[-5px] z-10" />
          <div className="w-2 h-7 bg-pink-500 rounded-full" />
        </div>

        {/* 本体ボディー（まるいピンク） */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-pink-500 rounded-full flex items-center justify-center shadow-lg border-4 border-card relative overflow-hidden">
          
          {/* まんまるなお顔パネル */}
          <div className="w-20 h-20 md:w-26 md:h-26 bg-slate-50 rounded-full flex items-center justify-center border-4 border-pink-200 shadow-inner">
            
            {/* Simple cute face */}
            <div className="relative w-14 h-14 md:w-18 md:h-18">
              {/* Eyes */}
              <div className="absolute top-4 left-1 w-3.5 h-4.5 md:w-4.5 md:h-5.5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                <div className={cn("w-2 h-2.5 md:w-2.5 md:h-3 bg-slate-900 rounded-full transition-transform", getEyeExpression())} />
              </div>
              <div className="absolute top-4 right-1 w-3.5 h-4.5 md:w-4.5 md:h-5.5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                <div className={cn("w-2 h-2.5 md:w-2.5 md:h-3 bg-slate-900 rounded-full transition-transform", getEyeExpression())} />
              </div>
              
              {/* Blush */}
              <div className="absolute top-9 left-0 w-3 h-2 bg-pink-300 rounded-full opacity-70 blur-[1px]" />
              <div className="absolute top-9 right-0 w-3 h-2 bg-pink-300 rounded-full opacity-70 blur-[1px]" />
              
              {/* Mouth */}
              <div className={cn(
                "absolute bottom-2 left-1/2 -translate-x-1/2 transition-all",
                mood === "celebrating" || mood === "happy" 
                  ? "w-7 h-3.5 md:w-9 md:h-4.5 border-b-4 border-slate-700 rounded-b-full" 
                  : "w-5 h-2.5 md:w-6 md:h-3 border-b-2 border-slate-700 rounded-b-full"
              )} />
            </div>
          </div>
          
          {/* ボディーのつや感 */}
          <div className="absolute top-3 left-6 w-8 h-4 bg-white/30 rounded-full -rotate-12" />
        </div>

        {/* Character name badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full text-xs font-bold text-pink-600 shadow-md border border-border whitespace-nowrap z-20">
          パソ<ruby>先生<rt>せんせい</rt></ruby>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1 bg-card rounded-2xl rounded-tl-sm p-4 md:p-6 shadow-lg border border-border mt-5">
        <div className="absolute -left-3 top-4 w-0 h-0 border-t-[10px] border-t-transparent border-r-[12px] border-r-card border-b-[10px] border-b-transparent" />
        <div className="absolute -left-[14px] top-4 w-0 h-0 border-t-[11px] border-t-transparent border-r-[13px] border-r-border border-b-[11px] border-b-transparent -z-10" />
        
        <div className="text-base md:text-lg leading-relaxed text-card-foreground font-medium">
          {message}
        </div>
      </div>
    </div>
  )
}

export function Ruby({ children, rt }: { children: React.ReactNode; rt: string }) {
  return (
    <ruby>
      {children}
      <rt className="text-[0.6em]">{rt}</rt>
    </ruby>
  )
}
