"use client"

import { useState, useEffect, useCallback } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

// --- クラス名を結合するヘルパー関数 ---
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- 指とキーの対応データ ---
const fingerMap: Record<string, { hand: 'left' | 'right', finger: number }> = {
  'q': { hand: 'left', finger: 4 }, 'a': { hand: 'left', finger: 4 }, 'z': { hand: 'left', finger: 4 },
  'w': { hand: 'left', finger: 3 }, 's': { hand: 'left', finger: 3 }, 'x': { hand: 'left', finger: 3 },
  'e': { hand: 'left', finger: 2 }, 'd': { hand: 'left', finger: 2 }, 'c': { hand: 'left', finger: 2 },
  'r': { hand: 'left', finger: 1 }, 'f': { hand: 'left', finger: 1 }, 'v': { hand: 'left', finger: 1 },
  't': { hand: 'left', finger: 1 }, 'g': { hand: 'left', finger: 1 }, 'b': { hand: 'left', finger: 1 },
  'y': { hand: 'right', finger: 1 }, 'h': { hand: 'right', finger: 1 }, 'n': { hand: 'right', finger: 1 },
  'u': { hand: 'right', finger: 1 }, 'j': { hand: 'right', finger: 1 }, 'm': { hand: 'right', finger: 1 },
  'i': { hand: 'right', finger: 2 }, 'k': { hand: 'right', finger: 2 }, ',': { hand: 'right', finger: 2 },
  'o': { hand: 'right', finger: 3 }, 'l': { hand: 'right', finger: 3 }, '.': { hand: 'right', finger: 3 },
  'p': { hand: 'right', finger: 4 }, ';': { hand: 'right', finger: 4 }, '/': { hand: 'right', finger: 4 },
}

// --- 手のイラストコンポーネント ---
const HandGuide = ({ activeHand, activeFinger }: { activeHand?: 'left' | 'right', activeFinger?: number }) => {
  const renderHand = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    return (
      <svg width="160" height="150" viewBox="0 0 200 180" className={cn("transition-all duration-300", activeHand === side ? "opacity-100 scale-105" : "opacity-20")}>
        <path d={isLeft ? "M150,170 Q100,170 80,140 Q60,100 80,60" : "M50,170 Q100,170 120,140 Q140,100 120,60"} fill="none" stroke="#64748b" strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((f) => {
          const isActive = activeHand === side && activeFinger === f;
          const xBase = isLeft ? 160 - f * 28 : 40 + f * 28;
          const yBase = 65 + Math.abs(2 - f) * 12;
          return (
            <g key={f}>
              <rect 
                x={xBase - 12} y={yBase - 45} width="24" height="55" rx="12" 
                fill={isActive ? "#3b82f6" : "#e2e8f0"} 
                stroke={isActive ? "#2563eb" : "#cbd5e1"}
                strokeWidth="2"
              />
              {isActive && (
                <circle cx={xBase} cy={yBase - 55} r="6" fill="#ef4444" className="animate-bounce" />
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex justify-center gap-16 py-4">
      <div className="text-center">
        {renderHand('left')}
        <p className={cn("text-xs font-bold mt-2", activeHand === 'left' ? "text-blue-600" : "text-slate-400")}>ひだり手</p>
      </div>
      <div className="text-center">
        {renderHand('right')}
        <p className={cn("text-xs font-bold mt-2", activeHand === 'right' ? "text-blue-600" : "text-slate-400")}>みぎ手</p>
      </div>
    </div>
  );
};

export default function Lesson2() {
  const [subStep, setSubStep] = useState<'intro' | 'practice'>('intro');
  const [targetKey, setTargetKey] = useState("f")
  const [progress, setProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const practiceSequence = ["f", "f", "j", "j", "d", "k", "s", "l", "a", ";"]

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (subStep !== 'practice' || showSuccess) return;
    if (e.key.toLowerCase() === targetKey) {
      const nextProgress = progress + 1
      if (nextProgress < practiceSequence.length) {
        setProgress(nextProgress)
        setTargetKey(practiceSequence[nextProgress])
      } else {
        setShowSuccess(true)
      }
    }
  }, [targetKey, progress, subStep, showSuccess]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ]

  const activeInfo = fingerMap[targetKey];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      {showSuccess && <SuccessOverlay show={true} message="ホームポジションをマスターしたね！" />}
      
      <div className="w-full max-w-5xl space-y-6 relative z-10">
        <div className="flex justify-between items-center">
          <Link href="/"><Button variant="ghost" className="gap-2"><ArrowLeft className="w-4 h-4"/> もどる</Button></Link>
          <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">Lesson 2: ホームポジション</div>
        </div>

        {subStep === 'intro' ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Character message="まずは指（ゆび）をおく場所（ばしょ）をおぼえよう！基本（きほん）がとっても大切だよ。" mood="happy" />
            
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 text-center">
              <h3 className="text-2xl font-bold mb-8 flex items-center justify-center gap-3">
                <CheckCircle2 className="text-green-500 w-8 h-8" /> ホームポジションの準備（じゅんび）
              </h3>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="p-8 bg-blue-50 rounded-3xl border-2 border-blue-100 shadow-inner">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto border-b-8 border-blue-800 mb-4 shadow-xl">F</div>
                  <p className="font-bold text-lg text-blue-800 mb-2">ひだり手 の 人差し指</p>
                  <p className="text-sm text-slate-600 leading-relaxed">「F」のキーにある<span className="font-bold text-red-500 underline">ちいさなでっぱり</span>を、指先（ゆびさき）でさがしてね！</p>
                </div>
                <div className="p-8 bg-blue-50 rounded-3xl border-2 border-blue-100 shadow-inner">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto border-b-8 border-blue-800 mb-4 shadow-xl">J</div>
                  <p className="font-bold text-lg text-blue-800 mb-2">みぎ手 の 人差し指</p>
                  <p className="text-sm text-slate-600 leading-relaxed">「J」のキーにも<span className="font-bold text-red-500 underline">でっぱり</span>があるよ。そこに指をおこう！</p>
                </div>
              </div>

              <HandGuide activeHand={undefined} />
              
              <div className="mt-10">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 px-24 h-20 text-2xl rounded-full shadow-2xl hover:scale-105 transition-all font-bold relative z-50"
                  onClick={() => setSubStep('practice')}
                >
                  わかった！練習（れんしゅう）する
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <Character 
              message={showSuccess ? "すごい！完璧（かんぺき）だね！" : "光（ひか）っているキーを、光っている指（ゆび）でおそう！"} 
              mood={showSuccess ? "celebrating" : "happy"} 
            />

            <div className="flex justify-center gap-3 py-2 overflow-x-auto">
              {practiceSequence.map((key, index) => (
                <div key={index} className={cn(
                  "w-12 h-16 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all shrink-0",
                  index === progress ? "border-blue-500 bg-blue-50 scale-110 text-blue-600 shadow-md ring-2 ring-blue-200" : 
                  index < progress ? "border-green-500 bg-green-50 text-green-500" : "border-slate-200 text-slate-300 bg-white"
                )}>
                  {key.toUpperCase()}
                </div>
              ))}
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200">
              <div className="space-y-3 mb-12">
                {rows.map((row, i) => (
                  <div key={i} className="flex justify-center gap-2">
                    {row.map((key) => (
                      <div key={key} className={cn(
                        "w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-all",
                        key === targetKey ? "bg-blue-600 border-blue-700 text-white scale-110 shadow-lg z-20" : "bg-slate-50 border-slate-200 text-slate-400",
                        (key === "f" || key === "j") && "border-b-8 border-slate-300"
                      )}>
                        {key.toUpperCase()}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <HandGuide activeHand={activeInfo?.hand} activeFinger={activeInfo?.finger} />
              
              <div className="mt-8 text-center text-slate-400 text-lg font-bold">
                {targetKey.toUpperCase()} を押（お）してね！
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
