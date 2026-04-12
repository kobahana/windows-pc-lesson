"use client"

import { cn } from "@/lib/utils"

interface CharacterProps {
  message: React.ReactNode
  mood: "happy" | "neutral" | "encouraging" | "celebrating"
  className?: string
}

export function Character({ message, mood, className }: CharacterProps) {
  // アニメーションのロジックはそのまま継承
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

  // 目の表情（瞬き）のロジックもそのまま継承
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
    <div className={cn("flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100", className)}>
      {/* Paso-Sensei Avatar (8-bit Pixel Art Style) */}
      <div className={cn("shrink-0 relative mt-2", getMoodStyles())}>
        <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
          {/* Main Body (Pink, 8-bit style) */}
          <rect x="15" y="30" width="50" height="50" rx="25" fill="#f43f5e" />
          <rect x="20" y="35" width="40" height="40" rx="20" fill="#f43f5e" />
          {/* Subtle green accent (like the vacuum) */}
          <rect x="35" y="70" width="10" height="5" rx="2.5" fill="#10b981" />

          {/* Eyes (Simple, circular, wide-set like image_17.png) */}
          <circle cx="30" cy="45" r="7" fill="white" />
          <circle cx="50" cy="45" r="7" fill="white" />
          
          {/* Pupils (8-bit, simple with a tiny highlight) */}
          <g fill="#111827">
            {/* Pupil form changes with mood */}
            <rect x="28" y="43" width="4" height="4" className={cn("transition-transform", getEyeExpression())} />
            <rect x="48" y="43" width="4" height="4" className={cn("transition-transform", getEyeExpression())} />
            {/* Small light highlight */}
            <rect x="30" y="44" width="1" height="1" fill="white" />
            <rect x="50" y="44" width="1" height="1" fill="white" />
          </g>

          {/* Simple mouth (8-bit style) */}
          <path 
            d={mood === "celebrating" || mood === "happy" ? "M30 65 Q40 70 50 65" : "M32 68H48"} 
            stroke="#111827" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Blush (8-bit style) */}
          <rect x="22" y="52" width="4" height="2" fill="#fda4af" opacity="0.6" />
          <rect x="54" y="52" width="4" height="2" fill="#fda4af" opacity="0.6" />
          
        </svg>

        <div className="absolute -bottom-1 -right-1 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
          <span className="text-[10px] font-black text-rose-600">パソ<ruby>先生<rt>せんせい</rt></ruby></span>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 pt-2">
        <div className="text-slate-700 leading-relaxed font-medium">
          {message}
        </div>
      </div>
    </div>
  )
}

// 補助コンポーネント：Ruby
export function Ruby({ children, rt }: { children: React.ReactNode; rt: string }) {
  return (
    <ruby>
      {children}
      <rt className="text-[0.6em] text-slate-400 font-normal">{rt}</rt>
    </ruby>
  )
}
