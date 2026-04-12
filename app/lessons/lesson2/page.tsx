"use client"

import { useState, useEffect, useCallback } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Star } from "lucide-react"
import Link from "next/link"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- すべてのキーに対する指の割り当て (0:親指, 1:人差, 2:中, 3:薬, 4:小) ---
const fingerMap: Record<string, { hand: 'left' | 'right', finger: number }> = {
  // 数字列
  '1': { hand: 'left', finger: 4 }, '2': { hand: 'left', finger: 3 }, '3': { hand: 'left', finger: 2 }, '4': { hand: 'left', finger: 1 }, '5': { hand: 'left', finger: 1 },
  '6': { hand: 'right', finger: 1 }, '7': { hand: 'right', finger: 1 }, '8': { hand: 'right', finger: 2 }, '9': { hand: 'right', finger: 3 }, '0': { hand: 'right', finger: 4 },
  // 上段
  'q': { hand: 'left', finger: 4 }, 'w': { hand: 'left', finger: 3 }, 'e': { hand: 'left', finger: 2 }, 'r': { hand: 'left', finger: 1 }, 't': { hand: 'left', finger: 1 },
  'y': { hand: 'right', finger: 1 }, 'u': { hand: 'right', finger: 1 }, 'i': { hand: 'right', finger: 2 }, 'o': { hand: 'right', finger: 3 }, 'p': { hand: 'right', finger: 4 },
  // 中段 (ホーム)
  'a': { hand: 'left', finger: 4 }, 's': { hand: 'left', finger: 3 }, 'd': { hand: 'left', finger: 2 }, 'f': { hand: 'left', finger: 1 }, 'g': { hand: 'left', finger: 1 },
  'h': { hand: 'right', finger: 1 }, 'j': { hand: 'right', finger: 1 }, 'k': { hand: 'right', finger: 2 }, 'l': { hand: 'right', finger: 3 }, ';': { hand: 'right', finger: 4 },
  // 下段
  'z': { hand: 'left', finger: 4 }, 'x': { hand: 'left', finger: 3 }, 'c': { hand: 'left', finger: 2 }, 'v': { hand: 'left', finger: 1 }, 'b': { hand: 'left', finger: 1 },
  'n': { hand: 'right', finger: 1 }, 'm': { hand: 'right', finger: 1 }, ',': { hand: 'right', finger: 2 }, '.': { hand: 'right', finger: 3 }, '/': { hand: 'right', finger: 4 },
  // 特殊
  ' ': { hand: 'right', finger: 0 }, // スペースキーは親指
}

// --- 手のイラストコンポーネント (親指対応) ---
const HandGuide = ({ activeHand, activeFinger }: { activeHand?: 'left' | 'right', activeFinger?: number }) => {
  const renderHand = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    return (
      <svg width="180" height="160" viewBox="0 0 200 180" className={cn("transition-all duration-300", activeHand === side ? "opacity-100 scale-105" : "opacity-20")}>
        <path d={isLeft ? "M150,170 Q100,170 80,140 Q60,100 80,60" : "M50,170 Q100,170 120,140 Q140,100 120,60"} fill="none" stroke="#64748b" strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((f) => {
          const isActive = activeHand === side && activeFinger === f;
          // 親指(0)の位置を調整
          const xBase = isLeft 
            ? (f === 0 ? 120 : 160 - f * 28) 
            : (f === 0 ? 80 : 40 + f * 28);
          const yBase = f === 0 ? 110 : 65 + Math.abs(2 - f) * 12;
          
          return (
            <g key={f}>
              <rect 
                x={xBase - 12} y={yBase - (f === 0 ? 25 : 45)} 
                width={f === 0 ? 35 : 24} height={f === 0 ? 25 : 55} 
                rx="12" 
                fill={isActive ? "#3b82f6" : "#e2e8f0"} 
                stroke={isActive ? "#2563eb" : "#cbd5e1"}
                strokeWidth="2"
              />
              {isActive && (
                <circle cx={xBase + (f === 0 ? 10 : 0)} cy={yBase - (f === 0 ? 30 : 55)} r="6" fill="#ef4444" className="animate-bounce" />
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex justify-center gap-20 py-4">
      <div className="text-center">{renderHand('left')}<p className={cn("text-xs font-bold mt-2", activeHand === 'left' ? "text-blue-600" : "text-slate-400")}>ひだり手</p></div>
      <div className="text-center">{renderHand('right')}<p className={cn("text-xs font-bold mt-2", activeHand === 'right' ? "text-blue-600" : "text-slate-400")}>みぎ手</p></div>
    </div>
  );
};

export default function Lesson2() {
  const [subStep, setSubStep] = useState<'intro' | 'practice'>('intro');
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  // 練習ステージの定義
  const stages = [
    { name: "ホームポジション (中段)", keys: ["f", "j", "d", "k", "s", "l", "a", ";", "g", "h"] },
    { name: "上の段 (QWERTY)", keys: ["r", "u", "e", "i", "w", "o", "q", "p", "t", "y"] },
    { name: "下の段 (ZXCV)", keys: ["v", "n", "c", "m", "x", ",", "z", ".", "b", "/"] },
    { name: "数字の段 (12345)", keys: ["4", "7", "3", "8", "2", "9", "1", "0", "5", "6"] },
    { name: "スペースキー", keys: [" ", " ", "f", " ", "j", " ", " ", " ", " ", " "] },
  ];

  const practiceSequence = stages[currentStage].keys;
  const targetKey = practiceSequence[progress];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (subStep !== 'practice' || showSuccess) return;
    
    // スペースキーの判定
    const pressedKey = e.key === " " ? " " : e.key.toLowerCase();
    
    if (pressedKey === targetKey) {
      const nextProgress = progress + 1
      if (nextProgress < practiceSequence.length) {
        setProgress(nextProgress)
      } else {
        // ステージクリア判定
        if (currentStage < stages.length - 1) {
          setCurrentStage(prev => prev + 1);
          setProgress(0);
        } else {
          setShowSuccess(true)
        }
      }
    }
  }, [targetKey, progress, subStep, showSuccess, currentStage, practiceSequence.length, stages.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ]

  const activeInfo = fingerMap[targetKey];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      {showSuccess && <SuccessOverlay show={true} message="すべてのキーをマスターしたね！" />}
      
      <div className="w-full max-w-5xl space-y-6 relative z-10">
        <div className="flex justify-between items-center">
          <Link href="/"><Button variant="ghost" className="gap-2"><ArrowLeft className="w-4 h-4"/> もどる</Button></Link>
          <div className="flex items-center gap-4">
            {stages.map((_, i) => (
              <div key={i} className={cn("w-3 h-3 rounded-full", i < currentStage ? "bg-green-500" : i === currentStage ? "bg-blue-600 scale-125 shadow-md" : "bg-slate-200")} />
            ))}
          </div>
          <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> ステージ {currentStage + 1}
          </div>
        </div>

        {subStep === 'intro' ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Character message="ホームポジションだけじゃなく、すべてのキーを打（う）てるようになろう！" mood="happy" />
            
            <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-slate-200 text-center">
              <h3 className="text-3xl font-bold mb-8">タイピング完全（かんぜん）マスター</h3>
              <p className="text-slate-600 mb-10 text-lg">
                キーボードの４つの段（だん）と、スペースキーを練習（れんしゅう）するよ。<br />
                パソ先生（せんせい）と一緒に、ひとつずつクリアしていこう！
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                  <div className="text-left"><p className="font-bold text-slate-700">まずはホームポジション</p><p className="text-xs text-slate-400">中段のキーから始めよう</p></div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">2</div>
                  <div className="text-left"><p className="font-bold text-slate-700">上と下の段、数字も！</p><p className="text-xs text-slate-400">指をのばして届くかな？</p></div>
                </div>
              </div>

              <div className="mt-10">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 px-24 h-20 text-2xl rounded-full shadow-2xl hover:scale-105 transition-all font-bold"
                  onClick={() => setSubStep('practice')}
                >
                  トレーニングを開始（かいし）！
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <div className="text-center">
              <h4 className="text-blue-600 font-bold mb-2">練習中（れんしゅうちゅう）：{stages[currentStage].name}</h4>
              <Character 
                message={showSuccess ? "すごい！全ステージクリア！" : `指（ゆび）をホームポジションにもどしながら、おそう！`} 
                mood={showSuccess ? "celebrating" : "happy"} 
              />
            </div>

            {/* ステージ内の進捗 */}
            <div className="flex justify-center gap-3 py-2">
              {practiceSequence.map((key, index) => (
                <div key={index} className={cn(
                  "w-12 h-16 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all shrink-0 shadow-sm",
                  index === progress ? "border-blue-500 bg-blue-50 scale-110 text-blue-600 ring-2 ring-blue-100" : 
                  index < progress ? "border-green-500 bg-green-50 text-green-500" : "border-slate-200 text-slate-300 bg-white"
                )}>
                  {key === " " ? "スペース" : key.toUpperCase()}
                </div>
              ))}
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-200">
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
                {/* スペースキー */}
                <div className="flex justify-center mt-4">
                  <div className={cn(
                    "w-80 h-14 rounded-2xl border-2 flex items-center justify-center text-sm font-bold transition-all",
                    targetKey === " " ? "bg-blue-600 border-blue-700 text-white scale-105 shadow-lg z-20" : "bg-slate-50 border-slate-200 text-slate-300"
                  )}>
                    SPACE (スペースキー)
                  </div>
                </div>
              </div>

              <HandGuide activeHand={activeInfo?.hand} activeFinger={activeInfo?.finger} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
