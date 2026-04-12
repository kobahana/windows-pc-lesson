"use client"

import { useState, useEffect } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

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
      <svg width="200" height="180" viewBox="0 0 200 180" className={cn("transition-all", activeHand === side ? "opacity-100" : "opacity-30")}>
        {/* 手のひら */}
        <path d={isLeft ? "M150,170 Q100,170 80,140 Q60,100 80,60" : "M50,170 Q100,170 120,140 Q140,100 120,60"} fill="none" stroke="#cbd5e1" strokeWidth="2" />
        
        {/* 指 (0:親指, 1:人差, 2:中, 3:薬, 4:小) */}
        {[0, 1, 2, 3, 4].map((f) => {
          const isActive = activeHand === side && activeFinger === f;
          const xBase = isLeft ? 160 - f * 25 : 40 + f * 25;
          const yBase = 60 + Math.abs(2 - f) * 10;
          return (
            <g key={f}>
              <rect 
                x={xBase - 10} y={yBase - 40} width="20" height="50" rx="10" 
                fill={isActive ? "#3b82f6" : "#f1f5f9"} 
                stroke={isActive ? "#2563eb" : "#e2e8f0"}
                strokeWidth="2"
                className={isActive ? "animate-pulse" : ""}
              />
              {isActive && <circle cx={xBase} cy={yBase - 45} r="4" fill="#3b82f6" className="animate-bounce" />}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex justify-center gap-20 mt-10">
      <div className="text-center">
        {renderHand('left')}
        <p className="text-[10px] font-bold text-slate-400 mt-2">ひだり手</p>
      </div>
      <div className="text-center">
        {renderHand('right')}
        <p className="text-[10px] font-bold text-slate-400 mt-2">みぎ手</p>
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

  useEffect(() => {
    if (subStep !== 'practice') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === targetKey) {
        const nextProgress = progress + 1
        if (nextProgress < practiceSequence.length) {
          setProgress(nextProgress)
          setTargetKey(practiceSequence[nextProgress])
        } else {
          setShowSuccess(true)
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [targetKey, progress, subStep])

  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ]

  const activeInfo = fingerMap[targetKey];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <SuccessOverlay show={showSuccess} message="ホームポジションをマスターしたね！" />
      
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/"><Button variant="ghost" className="gap-2"><ArrowLeft className="w-4 h-4"/> もどる</Button></Link>
          <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-bold text-sm">Lesson 2: ホームポジション</div>
        </div>

        {subStep === 'intro' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Character message="まずは「ホームポジション」をおぼえよう！指（ゆび）をおく場所（ばしょ）がとっても大切だよ。" mood="happy" />
            
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200">
              <h3 className="text-xl font-bold text-center mb-8 flex items-center justify-center gap-3">
                <CheckCircle2 className="text-green-500" /> 人差し指（ひとさしゆび）をセットしよう
              </h3>
              
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-3xl font-bold mx-auto border-b-8 border-blue-800 shadow-lg">F</div>
                  <p className="text-center font-bold text-slate-700">ひだり手の 人差し指</p>
                  <p className="text-xs text-slate-500 leading-relaxed">キーボードの「F」には、小（ちい）さな「でっぱり（ポッチ）」があるよ！そこをさわって探（さが）してみよう。</p>
                </div>
                <div className="space-y-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-3xl font-bold mx-auto border-b-8 border-blue-800 shadow-lg">J</div>
                  <p className="text-center font-bold text-slate-700">みぎ手の 人差し指</p>
                  <p className="text-xs text-slate-500 leading-relaxed">「J」にもポッチがあるね。残（のこ）りの指（ゆび）は、となりのキーにそっと置（お）くんだよ。</p>
                </div>
              </div>

              <HandGuide activeHand={undefined} />
              
              <div className="mt-10 flex justify-center">
                <Button size="lg" className="bg-blue-600 px-20 h-16 text-xl rounded-full shadow-xl hover:scale-105 transition-transform" onClick={() => setSubStep('practice')}>
                  わかった！練習（れんしゅう）する
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <Character 
              message={showSuccess ? "すごい！完璧（かんぺき）だね！" : "光（ひか）っている指（ゆび）とキーに注目（ちゅうもく）してね！"} 
              mood={showSuccess ? "celebrating" : "happy"} 
            />

            {/* 練習進捗 */}
            <div className="flex justify-center gap-3 py-4">
              {practiceSequence.map((key, index) => (
                <div key={index} className={cn(
                  "w-10 h-14 rounded-lg border-2 flex items-center justify-center font-bold transition-all",
                  index === progress ? "border-blue-500 bg-blue-50 scale-110 text-blue-600 shadow-md" : 
                  index < progress ? "border-green-500 bg-green-50 text-green-500" : "border-slate-200 text-slate-300"
                )}>
                  {key.toUpperCase()}
                </div>
              ))}
            </div>

            {/* キーボード & 手のガイド */}
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200">
              <div className="space-y-2 mb-10">
                {rows.map((row, i) => (
                  <div key={i} className="flex justify-center gap-2">
                    {row.map((key) => (
                      <div key={key} className={cn(
                        "w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all",
                        key === targetKey ? "bg-blue-600 border-blue-700 text-white scale-110 shadow-lg z-10" : "bg-slate-50 border-slate-200 text-slate-400",
                        (key === "f" || key === "j") && "border-b-4 border-slate-400"
                      )}>
                        {key.toUpperCase()}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* ここが進化ポイント！動く手のイラスト */}
              <HandGuide activeHand={activeInfo?.hand} activeFinger={activeInfo?.finger} />
              
              <div className="mt-8 text-center text-slate-400 animate-pulse text-sm font-medium">
                キーボードの {targetKey.toUpperCase()} を押（お）してね
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
