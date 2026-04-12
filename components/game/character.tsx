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

  // 瞳の瞬きアニメーション（アニメっぽくするために少し複雑に）
  const getEyeExpression = () => {
    switch (mood) {
      case "celebrating":
        return "scale-y-50"
      case "happy":
        return "scale-y-75"
      default:
        return "scale-y-100"
    }
  }

  // 日本アニメ風の「うるうるお目目」をCSSで表現
  const AnimeEye = () => (
    <div className="relative w-5 h-6.5 md:w-6.5 md:h-8">
      {/* 目の形（白目） */}
      <div className="absolute inset-0 bg-white rounded-full shadow-inner border border-slate-100" />
      
      {/* 瞳（黒目） */}
      <div className={cn("absolute inset-0.5 bg-slate-950 rounded-full transition-transform duration-150 origin-center", getEyeExpression())}>
        {/* アンプハイライト1：大きな光 */}
        <div className="absolute top-1 right-1 w-2.5 h-3 md:w-3.5 md:h-4 bg-white rounded-full" />
        {/* アンプハイライト2：小さな光 */}
        <div className="absolute bottom-1.5 left-1 w-1 h-1.5 bg-white rounded-full" />
      </div>
      
      {/* アイライン */}
      <div className="absolute -top-0.5 left-0.5 w-4 h-1.5 md:w-5.5 md:h-2 border-t-2 md:border-t-3 border-slate-950 rounded-full" />
    </div>
  )

  return (
    <div className={cn("flex items-start gap-4 p-3 md:p-5", className)}>
      {/* Character Avatar */}
      <div className={cn("relative flex-shrink-0 pt-8", getMoodStyles())}>
        
        {/* --- 輪っかアンテナ（グリーン） --- */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-8 h-8 md:w-10 md:h-10 border-[5px] md:border-[6px] border-emerald-500 rounded-full bg-background mb-[-6px] z-10" />
          <div className="w-2.5 h-8 md:w-3 md:h-10 bg-emerald-500 rounded-full" />
        </div>

        {/* 本体ボディー（ピンク） */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-pink-500 rounded-full flex items-center justify-center shadow-lg border-4 border-card relative overflow-hidden">
          
          {/* お顔パネル */}
          <div className="w-20 h-20 md:w-26 md:h-26 bg-slate-50 rounded-full flex flex-col items-center justify-center border-4 border-pink-200 shadow-inner p-1">
            
            {/* 顔のパーツコンテナ */}
            <div className="relative w-full h-full flex flex-col items-center justify-center pt-2">
              
              {/* 両目 */}
              <div className="flex gap-1.5 md:gap-2.5 mb-2">
                <AnimeEye />
                <AnimeEye />
              </div>
              
              {/* 小鼻 */}
              <div className="w-1 h-1 bg-pink-300 rounded-full opacity-70" />
              
              {/* Blush (うるうる感を出すために鮮やかに) */}
              <div className="absolute top-9 left-1 w-3.5 h-2.5 bg-pink-400 rounded-full opacity-60 blur-[1px]" />
              <div className="absolute top-9 right-1 w-3.5 h-2.5 bg-pink-400 rounded-full opacity-60 blur-[1px]" />
              
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

        {/* Character name badge（グリーンの文字） */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-md border border-border whitespace-nowrap z-20 uppercase tracking-wider">
          Paso<ruby>Sensei<rt>せんせい</rt></ruby>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1 bg-card rounded-2xl rounded-tl-sm p-4 md:p-6 shadow-lg border border-border mt-6">
        <div className="absolute -left-3 top-4 w-0 h-0 border-t-[10px] border-t-transparent border-r-[12px] border-r-card border-b-[10px] border-b-transparent" />
        <div className="absolute -left-[14px] top-4 w-0 h-0 border-t-[11px] border-t-transparent border-r-[13px] border-r-border border-b-[11px] border-b-transparent -z-10" />
        
        <div className="text-base md:text-lg leading-relaxed text-card-foreground font-medium">
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
      <rt className="text-[0.6em] text-slate-400">{rt}</rt>
    </ruby>
  )
}
