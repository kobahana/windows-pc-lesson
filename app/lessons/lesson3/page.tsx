"use client"

import { useState, useEffect, useCallback } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star } from "lucide-react"
import Link from "next/link"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// 🎨 カラー設定 (Lesson 2と共通)
const fingerColors = {
  4: { bg: "bg-red-500", hex: "#ef4444", light: "bg-red-50", text: "text-red-600" },      // 小指
  3: { bg: "bg-amber-400", hex: "#fbbf24", light: "bg-amber-50", text: "text-amber-600" }, // 薬指
  2: { bg: "bg-emerald-500", hex: "#10b981", light: "bg-emerald-50", text: "text-emerald-600" }, // 中指
  1: { bg: "bg-purple-500", hex: "#a855f7", light: "bg-purple-50", text: "text-purple-600" }, // 人差し指
  0: { bg: "bg-slate-500", hex: "#64748b", light: "bg-slate-50", text: "text-slate-600" }, // 親指
};

const fingerMap: Record<string, { hand: 'left' | 'right', finger: number }> = {
  'a': { hand: 'left', finger: 4 }, 'i': { hand: 'right', finger: 2 }, 'u': { hand: 'right', finger: 1 }, 'e': { hand: 'left', finger: 2 }, 'o': { hand: 'right', finger: 3 },
  'k': { hand: 'right', finger: 2 }, 's': { hand: 'left', finger: 3 }, 't': { hand: 'left', finger: 1 }, 'n': { hand: 'right', finger: 1 }, 'h': { hand: 'right', finger: 1 },
  'm': { hand: 'right', finger: 1 }, 'y': { hand: 'right', finger: 1 }, 'r': { hand: 'left', finger: 1 }, 'w': { hand: 'left', finger: 3 }, 'g': { hand: 'left', finger: 1 },
  'z': { hand: 'left', finger: 4 }, 'd': { hand: 'left', finger: 2 }, 'b': { hand: 'left', finger: 1 }, 'p': { hand: 'right', finger: 4 },
  'c': { hand: 'left', finger: 2 }, 'o': { hand: 'right', finger: 3 }, 'n': { hand: 'right', finger: 1 }, 'i': { hand: 'right', finger: 2 }, 'h': { hand: 'right', finger: 1 },
}

const HandGuide = ({ activeHand, activeFinger }: { activeHand?: 'left' | 'right', activeFinger?: number }) => {
  const renderHand = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    return (
      <svg width="120" height="100" viewBox="0 0 200 180" className={cn("transition-all duration-300", activeHand === side ? "opacity-100" : "opacity-20")}>
        <path d={isLeft ? "M150,170 Q100,170 80,140 Q60,100 80,60" : "M50,170 Q100,170 120,140 Q140,100 120,60"} fill="none" stroke="#cbd5e1" strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((f) => {
          const isActive = activeHand === side && activeFinger === f;
          const config = fingerColors[f as keyof typeof fingerColors];
          const xBase = isLeft ? (f === 0 ? 120 : 160 - f * 28) : (f === 0 ? 80 : 40 + f * 28);
          const yBase = f === 0 ? 110 : 65 + Math.abs(2 - f) * 12;
          return (
            <g key={f}>
              <rect x={xBase - 12} y={yBase - (f === 0 ? 25 : 45)} width={f === 0 ? 35 : 24} height={f === 0 ? 25 : 55} rx="12" 
                fill={isActive ? config.hex : "#f1f5f9"} stroke={isActive ? config.hex : "#e2e8f0"} strokeWidth="2" />
              {isActive && <circle cx={xBase + (f === 0 ? 10 : 0)} cy={yBase - (f === 0 ? 30 : 55)} r="8" className="fill-blue-500 animate-bounce" />}
            </g>
          );
        })}
      </svg>
    );
  };
  return (
    <div className="flex justify-center gap-12 py-1 shrink-0">
      <div className="text-center">{renderHand('left')}<p className="text-[10px] font-bold mt-1 text-slate-400">ひだり手</p></div>
      <div className="text-center">{renderHand('right')}<p className="text-[10px] font-bold mt-1 text-slate-400">みぎ手</p></div>
    </div>
  );
};

export default function Lesson3() {
  const [currentStage, setCurrentStage] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0); // ローマ字の何文字目か
  const [showSuccess, setShowSuccess] = useState(false);

  const stages = [
    { name: "基本の母音 (A I U E O)", words: [{ h: "あ", r: "a" }, { h: "い", r: "i" }, { h: "う", r: "u" }, { h: "え", r: "e" }, { h: "お", r: "o" }] },
    { name: "か行・さ行 (K / S)", words: [{ h: "か", r: "ka" }, { h: "き", r: "ki" }, { h: "く", r: "ku" }, { h: "さ", r: "sa" }, { h: "し", r: "shi" }] },
    { name: "あいさつ (A1 Level)", words: [{ h: "こんにちは", r: "konnichiwa" }, { h: "にほん", r: "nihon" }, { h: "りんご", r: "ringo" }] },
  ];

  const currentWord = stages[currentStage].words[wordIndex];
  const targetChar = currentWord.r[charIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showSuccess) return;
    if (e.key.toLowerCase() === targetChar) {
      if (charIndex + 1 < currentWord.r.length) {
        setCharIndex(prev => prev + 1);
      } else {
        // 次の単語へ
        if (wordIndex + 1 < stages[currentStage].words.length) {
          setWordIndex(prev => prev + 1);
          setCharIndex(0);
        } else {
          // 次のステージへ
          if (currentStage + 1 < stages.length) {
            setCurrentStage(prev => prev + 1);
            setWordIndex(0);
            setCharIndex(0);
          } else {
            setShowSuccess(true);
          }
        }
      }
    }
  }, [targetChar, charIndex, currentWord.r.length, wordIndex, stages, currentStage, showSuccess]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ];

  const activeFingerInfo = fingerMap[targetChar];

  return (
    <div className="h-screen bg-slate-50 p-2 flex flex-col items-center overflow-hidden">
      {showSuccess && <SuccessOverlay show={true} message="ローマ字入力、ばっちりだね！" />}
      
      <div className="w-full max-w-4xl space-y-2 relative z-10 flex flex-col h-full text-slate-800">
        <div className="flex justify-between items-center shrink-0 px-2">
          <Link href="/"><Button variant="ghost" size="sm" className="gap-1 h-7 text-xs text-slate-500"><ArrowLeft className="w-3 h-3"/> もどる</Button></Link>
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-[10px] shadow-sm tracking-widest uppercase">
            {stages[currentStage].name}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
          <div className="text-center shrink-0">
            <Character message="ひらがなを見て、ローマ字（Romaji）で打ってみよう！" mood="happy" />
          </div>

          {/* 出題エリア */}
          <div className="flex flex-col items-center justify-center py-4 shrink-0">
            <div className="text-6xl font-bold mb-2 text-slate-800 tracking-tighter">{currentWord.h}</div>
            <div className="flex gap-1">
              {currentWord.r.split("").map((letter, i) => (
                <div key={i} className={cn(
                  "text-3xl font-mono font-bold w-10 h-12 flex items-center justify-center border-b-4 transition-all",
                  i < charIndex ? "text-green-500 border-green-500" : 
                  i === charIndex ? "text-blue-600 border-blue-600 animate-pulse scale-110" : "text-slate-300 border-slate-200"
                )}>
                  {letter.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* キーボード & 手 (Lesson 2のUIを継承) */}
          <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center">
            <div className="space-y-1 mb-4 w-full max-w-[620px]">
              {rows.map((row, i) => (
                <div key={i} className="flex justify-center gap-1">
                  {row.map((key) => {
                    const info = fingerMap[key];
                    const color = fingerColors[info?.finger as keyof typeof fingerColors];
                    const isActive = key === targetChar;
                    return (
                      <div key={key} className={cn(
                        "w-11 h-11 rounded-xl border flex items-center justify-center text-sm font-bold transition-all duration-200",
                        isActive ? `${color.bg} text-white scale-115 shadow-xl z-20 border-white ring-2 ring-slate-100` : 
                        `${color?.light || "bg-slate-50"} ${color?.border || "border-slate-100"} ${color?.text || "text-slate-300"} opacity-30`,
                      )}>{key.toUpperCase()}</div>
                    )
                  })}
                </div>
              ))}
            </div>
            <HandGuide activeHand={activeFingerInfo?.hand} activeFinger={activeFingerInfo?.finger} />
          </div>
        </div>
      </div>
    </div>
  )
}
