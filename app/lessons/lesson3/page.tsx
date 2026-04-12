"use client"

import { useState, useEffect, useCallback } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, ChevronRight, Star } from "lucide-react"
import Link from "next/link"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// 🎨 カラー設定 (Lesson 2を完全継承)
const fingerColors = {
  4: { bg: "bg-red-500", hex: "#ef4444", light: "bg-red-50", text: "text-red-600" },      // 小指：赤
  3: { bg: "bg-amber-400", hex: "#fbbf24", light: "bg-amber-50", text: "text-amber-600" }, // 薬指：黄
  2: { bg: "bg-emerald-500", hex: "#10b981", light: "bg-emerald-50", text: "text-emerald-600" }, // 中指：緑
  1: { bg: "bg-purple-500", hex: "#a855f7", light: "bg-purple-50", text: "text-purple-600" }, // 人差し指：紫
  0: { bg: "bg-slate-500", hex: "#64748b", light: "bg-slate-50", text: "text-slate-600" }, // 親指：グレー
};

const fingerMap: Record<string, { hand: 'left' | 'right', finger: number }> = {
  'q': { hand: 'left', finger: 4 }, 'w': { hand: 'left', finger: 3 }, 'e': { hand: 'left', finger: 2 }, 'r': { hand: 'left', finger: 1 }, 't': { hand: 'left', finger: 1 },
  'y': { hand: 'right', finger: 1 }, 'u': { hand: 'right', finger: 1 }, 'i': { hand: 'right', finger: 2 }, 'o': { hand: 'right', finger: 3 }, 'p': { hand: 'right', finger: 4 },
  'a': { hand: 'left', finger: 4 }, 's': { hand: 'left', finger: 3 }, 'd': { hand: 'left', finger: 2 }, 'f': { hand: 'left', finger: 1 }, 'g': { hand: 'left', finger: 1 },
  'h': { hand: 'right', finger: 1 }, 'j': { hand: 'right', finger: 1 }, 'k': { hand: 'right', finger: 2 }, 'l': { hand: 'right', finger: 3 }, ';': { hand: 'right', finger: 4 },
  'z': { hand: 'left', finger: 4 }, 'x': { hand: 'left', finger: 3 }, 'c': { hand: 'left', finger: 2 }, 'v': { hand: 'left', finger: 1 }, 'b': { hand: 'left', finger: 1 },
  'n': { hand: 'right', finger: 1 }, 'm': { hand: 'right', finger: 1 }, ',': { hand: 'right', finger: 2 }, '.': { hand: 'right', finger: 3 }, '/': { hand: 'right', finger: 4 },
  '-': { hand: 'right', finger: 4 }, ' ': { hand: 'right', finger: 0 },
}

const HandGuide = ({ activeHand, activeFinger }: { activeHand?: 'left' | 'right', activeFinger?: number }) => {
  const renderHand = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    return (
      <svg width="130" height="110" viewBox="0 0 200 180" className={cn("transition-all duration-300", activeHand === side ? "opacity-100" : "opacity-15")}>
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
      <div className="text-center">{renderHand('left')}<p className="text-[9px] font-bold mt-1 text-slate-300 uppercase">Left</p></div>
      <div className="text-center">{renderHand('right')}<p className="text-[9px] font-bold mt-1 text-slate-300 uppercase">Right</p></div>
    </div>
  );
};

export default function Lesson3() {
  const [currentStage, setCurrentStage] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const stages = [
    { id: 1, name: "あいうえお", words: [{ h: "あいうえお", r: "aiueo" }] },
    { id: 2, name: "かさたなは", words: [{ h: "かきくけこ", r: "kakikukeko" }, { h: "さしすせそ", r: "sasisuseso" }, { h: "たちつてと", r: "tatituteto" }] },
    { id: 3, name: "まやらわん", words: [{ h: "まみむめも", r: "mamimumemo" }, { h: "やゆよ", r: "yayuyo" }, { h: "らりるれろ", r: "rarirurero" }, { h: "わをん", r: "wawonn" }] },
    { id: 4, name: "濁音・半濁音", words: [{ h: "がぎぐげご", r: "gagigugego" }, { h: "ざじずぜぞ", r: "zazizuzeto" }, { h: "ばびぶべぼ", r: "babibubebo" }, { h: "ぱぴぷぺぽ", r: "papipupepo" }] },
    { id: 5, name: "ん・っ・ー", words: [{ h: "にほん", r: "nihonn" }, { h: "きって", r: "kitte" }, { h: "けしごむ", r: "kesigomu" }, { h: "ノート", r: "no-to" }] },
    { id: 6, name: "あいさつ", words: [{ h: "こんにちは", r: "konnnitiwa" }, { h: "ありがとう", r: "arigatou" }, { h: "すみません", r: "sumimasenn" }] },
    { id: 7, name: "たべもの", words: [{ h: "ごはん", r: "gohann" }, { h: "みず", r: "mizu" }, { h: "おちゃ", r: "otya" }, { h: "すし", r: "susi" }] },
    { id: 8, name: "じこしょうかい", words: [{ h: "なまえ", r: "namae" }, { h: "ともだち", r: "tomodati" }, { h: "がくせい", r: "gakusei" }] },
  ];

  const currentWord = stages[currentStage].words[wordIndex];
  const targetChar = currentWord.r[charIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showSuccess) return;
    const pressedKey = e.key.toLowerCase();
    
    if (pressedKey === targetChar) {
      if (charIndex + 1 < currentWord.r.length) {
        setCharIndex(prev => prev + 1);
      } else {
        if (wordIndex + 1 < stages[currentStage].words.length) {
          setWordIndex(prev => prev + 1);
          setCharIndex(0);
        } else {
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
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ];

  const activeFingerInfo = fingerMap[targetChar];

  return (
    <div className="h-screen bg-slate-50 p-2 flex flex-col items-center overflow-hidden">
      {showSuccess && <SuccessOverlay show={true} message="ローマ字入力の達人！" />}
      
      <div className="w-full max-w-5xl space-y-2 relative z-10 flex flex-col h-full text-slate-800">
        {/* ヘッダー兼ステージナビゲーション */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-center px-2">
            <Link href="/"><Button variant="ghost" size="sm" className="gap-1 h-7 text-xs text-slate-500"><ArrowLeft className="w-3 h-3"/> もどる</Button></Link>
            <div className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold text-xs shadow-md">
              STAGE {currentStage + 1}: {stages[currentStage].name}
            </div>
          </div>
          
          {/* 進捗バー 兼 ステージ選択 */}
          <div className="flex justify-between gap-1 px-4">
            {stages.map((stage, i) => (
              <button
                key={stage.id}
                onClick={() => { setCurrentStage(i); setWordIndex(0); setCharIndex(0); }}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all duration-300",
                  i < currentStage ? "bg-green-500" : 
                  i === currentStage ? "bg-blue-600 ring-4 ring-blue-100 scale-y-125" : "bg-slate-200 hover:bg-slate-300"
                )}
                title={stage.name}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
          <div className="text-center shrink-0">
            <Character message="ひらがなを見て、下（した）のアルファベットを打（う）とう！" mood="happy" />
          </div>

          {/* 出題エリア（より大きく視認性アップ） */}
          <div className="flex flex-col items-center justify-center py-6 shrink-0 bg-white/40 rounded-3xl mx-10 border border-white shadow-inner">
            <div className="text-7xl font-bold mb-4 text-slate-800 tracking-tight drop-shadow-sm">{currentWord.h}</div>
            <div className="flex gap-2">
              {currentWord.r.split("").map((letter, i) => (
                <div key={i} className={cn(
                  "text-4xl font-mono font-black w-12 h-16 flex items-center justify-center border-b-8 transition-all duration-150",
                  i < charIndex ? "text-green-500 border-green-500 opacity-40" : 
                  i === charIndex ? "text-blue-600 border-blue-600 scale-110 shadow-sm" : "text-slate-200 border-slate-100"
                )}>
                  {letter.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* キーボード & 手 */}
          <div className="bg-white p-5 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-center">
            <div className="space-y-1 mb-4 w-full max-w-[650px]">
              {rows.map((row, i) => (
                <div key={i} className="flex justify-center gap-1.5">
                  {row.map((key) => {
                    const info = fingerMap[key];
                    const color = fingerColors[info?.finger as keyof typeof fingerColors];
                    const isActive = key === targetChar;
                    return (
                      <div key={key} className={cn(
                        "w-11 h-11 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-150",
                        isActive ? `${color.bg} text-white scale-115 shadow-xl z-20 border-white ring-2 ring-slate-100` : 
                        `${color?.light || "bg-slate-50"} ${color?.border || "border-slate-100"} ${color?.text || "text-slate-200"} opacity-20`,
                        (key === "f" || key === "j") && !isActive && "border-b-4 border-slate-300"
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
