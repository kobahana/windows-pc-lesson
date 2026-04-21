"use client"

import { useState, useEffect, useCallback } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { CheckCircle2, RotateCcw, Trophy, Clock, Target } from "lucide-react"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { sounds } from "@/lib/sounds"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// 🎨 指ごとのカラーコード定義（SVG用）
const fingerColors = {
  4: { hex: "#ef4444", light: "bg-red-50", border: "border-red-200", text: "text-red-600", bg: "bg-red-500" },      // 小指：赤
  3: { hex: "#fbbf24", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", bg: "bg-amber-400" }, // 薬指：黄
  2: { hex: "#10b981", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", bg: "bg-emerald-500" }, // 中指：緑
  1: { hex: "#a855f7", light: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", bg: "bg-purple-500" }, // 人差し指：紫
  0: { hex: "#64748b", light: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", bg: "bg-slate-500" }, // 親指：グレー
};

const fingerMap: Record<string, { hand: 'left' | 'right', finger: number }> = {
  '1': { hand: 'left', finger: 4 }, '2': { hand: 'left', finger: 3 }, '3': { hand: 'left', finger: 2 }, '4': { hand: 'left', finger: 1 }, '5': { hand: 'left', finger: 1 },
  '6': { hand: 'right', finger: 1 }, '7': { hand: 'right', finger: 1 }, '8': { hand: 'right', finger: 2 }, '9': { hand: 'right', finger: 3 }, '0': { hand: 'right', finger: 4 },
  'q': { hand: 'left', finger: 4 }, 'w': { hand: 'left', finger: 3 }, 'e': { hand: 'left', finger: 2 }, 'r': { hand: 'left', finger: 1 }, 't': { hand: 'left', finger: 1 },
  'y': { hand: 'right', finger: 1 }, 'u': { hand: 'right', finger: 1 }, 'i': { hand: 'right', finger: 2 }, 'o': { hand: 'right', finger: 3 }, 'p': { hand: 'right', finger: 4 },
  'a': { hand: 'left', finger: 4 }, 's': { hand: 'left', finger: 3 }, 'd': { hand: 'left', finger: 2 }, 'f': { hand: 'left', finger: 1 }, 'g': { hand: 'left', finger: 1 },
  'h': { hand: 'right', finger: 1 }, 'j': { hand: 'right', finger: 1 }, 'k': { hand: 'right', finger: 2 }, 'l': { hand: 'right', finger: 3 }, ';': { hand: 'right', finger: 4 },
  'z': { hand: 'left', finger: 4 }, 'x': { hand: 'left', finger: 3 }, 'c': { hand: 'left', finger: 2 }, 'v': { hand: 'left', finger: 1 }, 'b': { hand: 'left', finger: 1 },
  'n': { hand: 'right', finger: 1 }, 'm': { hand: 'right', finger: 1 }, ',': { hand: 'right', finger: 2 }, '.': { hand: 'right', finger: 3 }, '/': { hand: 'right', finger: 4 },
  ' ': { hand: 'right', finger: 0 },
}

const HandGuide = ({ activeHand, activeFinger }: { activeHand?: 'left' | 'right', activeFinger?: number }) => {
  const renderHand = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    return (
      <svg width="140" height="120" viewBox="0 0 200 180" className={cn("transition-all duration-300", activeHand === side ? "opacity-100" : "opacity-20")}>
        {/* 手のひらライン */}
        <path d={isLeft ? "M150,170 Q100,170 80,140 Q60,100 80,60" : "M50,170 Q100,170 120,140 Q140,100 120,60"} fill="none" stroke="#cbd5e1" strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((f) => {
          const isActive = activeHand === side && activeFinger === f;
          const config = fingerColors[f as keyof typeof fingerColors];
          const xBase = isLeft ? (f === 0 ? 120 : 160 - f * 28) : (f === 0 ? 80 : 40 + f * 28);
          const yBase = f === 0 ? 110 : 65 + Math.abs(2 - f) * 12;

          return (
            <g key={f}>
              <rect
                x={xBase - 12}
                y={yBase - (f === 0 ? 25 : 45)}
                width={f === 0 ? 35 : 24}
                height={f === 0 ? 25 : 55}
                rx="12"
                fill={isActive ? config.hex : "#f1f5f9"}
                stroke={isActive ? config.hex : "#e2e8f0"}
                strokeWidth="2"
                className="transition-all duration-300 shadow-sm"
              />
              {isActive && (
                <g className="animate-bounce">
                  <circle cx={xBase + (f === 0 ? 10 : 0)} cy={yBase - (f === 0 ? 40 : 65)} r="8" fill={config.hex} />
                  <path d={`M${xBase + (f === 0 ? 10 : 0)} ${yBase - (f === 0 ? 32 : 57)} L${xBase + (f === 0 ? 10 : 0)} ${yBase - (f === 0 ? 25 : 50)}`} stroke={config.hex} strokeWidth="4" />
                </g>
              )}
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

export default function Lesson2() {
  const [subStep, setSubStep] = useState<'intro' | 'practice'>('intro');
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  // Score state
  const [missCount, setMissCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { markLessonCompleted } = useSettings();

  const stages = [
    { name: "ホームのきほん", keys: ["f", "f", "j", "j", "f", "j", "f", "j", "d", "d", "k", "k", "d", "k", "d", "k"] },
    { name: "ホームポジションぜんぶ", keys: ["s", "l", "a", ";", "g", "h", "a", "s", "d", "f", "j", "k", "l", ";"] },
    { name: "上の段 (だん)", keys: ["r", "u", "e", "i", "w", "o", "q", "p", "t", "y"] },
    { name: "下の段 (だん)", keys: ["v", "n", "c", "m", "x", ",", "z", ".", "b", "/"] },
    { name: "数字 (すすじ) とスペース", keys: ["1", "2", "3", "4", "5", " ", "6", "7", "8", "9", "0", " "] },
  ];

  const practiceSequence = stages[currentStage].keys;
  const targetKey = practiceSequence[progress];

  // Start timer
  useEffect(() => {
    if (subStep === 'practice' && !showSuccess && !startTime) {
      setStartTime(Date.now());
    }
  }, [subStep, showSuccess, startTime]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (subStep !== 'practice' || showSuccess) return;
    const pressedKey = e.key === " " ? " " : e.key.toLowerCase();

    // ignore meta keys
    if (e.metaKey || e.ctrlKey || e.altKey || pressedKey.length > 1) return;

    if (pressedKey === targetKey) {
      sounds?.playClick();
      const nextProgress = progress + 1
      if (nextProgress < practiceSequence.length) {
        setProgress(nextProgress)
      } else {
        sounds?.playSuccess();
        if (currentStage < stages.length - 1) {
          setCurrentStage(prev => prev + 1);
          setProgress(0);
        } else {
          // Finished all stages
          const end = Date.now();
          setElapsedTime(startTime ? Math.floor((end - startTime) / 1000) : 0);
          sounds?.playClear();
          setShowSuccess(true);
          markLessonCompleted(2);
        }
      }
    } else {
      sounds?.playError();
      setMissCount(prev => prev + 1);
    }
  }, [targetKey, progress, subStep, showSuccess, currentStage, practiceSequence.length, stages.length, startTime, markLessonCompleted]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const handleRetry = () => {
    sounds?.playClick();
    setCurrentStage(0);
    setProgress(0);
    setMissCount(0);
    setStartTime(null);
    setElapsedTime(0);
    setShowSuccess(false);
  }

  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ]

  const activeFingerInfo = fingerMap[targetKey];

  if (showSuccess) {
    let evaluationMessage = "すばらしい！かんぺきなタイピングです！";
    if (missCount > 5) evaluationMessage = "よくがんばりました！次はノーミスをめざそう！";
    if (missCount > 15) evaluationMessage = "最後までやりきりました！くりかえし練習しよう！";

    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <LessonHeader />
        <SuccessOverlay show={true} message="" />
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-green-100 p-8 max-w-lg w-full text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-slate-800 mb-2">クリアおめでとう！</h2>
            <p className="text-slate-600 mb-8 font-medium">{evaluationMessage}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 font-bold">
                  <Target className="w-5 h-5 text-red-500" />
                  ミスした回数
                </div>
                <div className="text-3xl font-black text-slate-800">
                  {missCount} <span className="text-base font-bold text-slate-400">回</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 font-bold">
                  <Clock className="w-5 h-5 text-blue-500" />
                  かかった時間
                </div>
                <div className="text-3xl font-black text-slate-800">
                  {elapsedTime} <span className="text-base font-bold text-slate-400">秒</span>
                </div>
              </div>
            </div>

            <Button onClick={handleRetry} size="lg" className="w-full h-14 text-xl rounded-xl gap-2 font-bold bg-green-600 hover:bg-green-700 shadow-md">
              <RotateCcw className="w-6 h-6" />
              もう一度あそぶ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <LessonHeader>
        <div className="flex gap-2">
          {stages.map((_, i) => (
            <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-colors", i < currentStage ? "bg-green-500" : i === currentStage ? "bg-blue-600 shadow-sm" : "bg-slate-200")} />
          ))}
        </div>
        <div className="ml-3 bg-blue-600 text-white px-3 py-0.5 rounded-full font-bold text-[10px] shadow-sm tracking-widest whitespace-nowrap">
          STAGE {currentStage + 1}
        </div>
      </LessonHeader>

      <div className="flex-1 flex flex-col items-center p-2 relative text-slate-800 min-h-0">
        <div className="w-full max-w-4xl flex flex-col h-full">
          {subStep === 'intro' ? (
            <div className="flex-1 flex flex-col justify-start pt-6 space-y-4 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto px-4 pb-4">
              <Character message="まずは、指（ゆび）をおく場所（ばしょ）をおぼえよう！基本（きほん）がとっても大切だよ。" mood="happy" />

              <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 mt-4">
                <h3 className="text-xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                  <CheckCircle2 className="text-green-500 w-8 h-8" /> ホームポジションのじゅんび
                </h3>

                <div className="grid grid-cols-2 gap-8 mb-10 text-center">
                  <div className="p-8 bg-blue-50 rounded-3xl border-2 border-blue-100 shadow-inner">
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto border-b-8 border-blue-800 mb-4 shadow-xl">F</div>
                    <p className="font-bold text-lg text-blue-800">ひだり手 の 人差し指</p>
                    <p className="text-sm text-slate-600 mt-2">「F」にある<span className="text-red-500 font-bold underline">でっぱり</span>を、指（ゆび）でさがしてね！</p>
                  </div>
                  <div className="p-8 bg-blue-50 rounded-3xl border-2 border-blue-100 shadow-inner">
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto border-b-8 border-blue-800 mb-4 shadow-xl">J</div>
                    <p className="font-bold text-lg text-blue-800">みぎ手 の 人差し指</p>
                    <p className="text-sm text-slate-600 mt-2">「J」にも<span className="text-red-500 font-bold underline">でっぱり</span>があるよ。そこに指をおこう！</p>
                  </div>
                </div>

                <HandGuide activeHand={undefined} />

                <div className="mt-10 flex justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-24 h-16 text-xl rounded-full shadow-2xl font-bold" onClick={() => { sounds?.playClick(); setSubStep('practice'); }}>
                    わかった！練習（れんしゅう）する
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between py-1 animate-in slide-in-from-right-10 duration-500 overflow-hidden relative">
              <div className="text-center shrink-0">
                <Character message="光（ひか）っているキーを、同じ色（いろ）の指（ゆび）でおそう！" mood="happy" />
              </div>

              <div className="flex justify-center gap-1 py-2 shrink-0 overflow-x-auto">
                {practiceSequence.map((key, index) => {
                  const info = fingerMap[key];
                  const color = fingerColors[info?.finger as keyof typeof fingerColors];
                  return (
                    <div key={index} className={cn(
                      "w-10 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all shrink-0",
                      index === progress ? `${color.bg} text-white scale-110 shadow-lg ring-2 ring-white z-10` :
                        index < progress ? "bg-slate-50 text-slate-200 border-transparent opacity-50" : "border-slate-200 text-slate-300 bg-white"
                    )}>
                      {key === " " ? "SPC" : key.toUpperCase()}
                    </div>
                  );
                })}
              </div>

              <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center relative">
                <div className="space-y-1 mb-4 w-full max-w-[620px]">
                  {rows.map((row, i) => (
                    <div key={i} className="flex justify-center gap-1">
                      {row.map((key) => {
                        const info = fingerMap[key];
                        const color = fingerColors[info?.finger as keyof typeof fingerColors];
                        const isActive = key === targetKey;
                        return (
                          <div key={key} className={cn(
                            "w-11 h-11 rounded-xl border flex items-center justify-center text-sm font-bold transition-all duration-200",
                            isActive ? `${color.bg} text-white scale-115 shadow-xl z-20 border-white ring-2 ring-slate-100` :
                              `${color.light} ${color.border} ${color.text} opacity-30`,
                            (key === "f" || key === "j") && !isActive && "border-b-4"
                          )}>{key.toUpperCase()}</div>
                        )
                      })}
                    </div>
                  ))}
                  <div className="flex justify-center mt-1">
                    <div className={cn(
                      "w-64 h-11 rounded-2xl border flex items-center justify-center text-[10px] font-bold transition-all",
                      targetKey === " " ? "bg-slate-600 text-white scale-105 shadow-xl" : "bg-slate-50 border-slate-100 text-slate-300 opacity-20"
                    )}>SPACE</div>
                  </div>
                </div>
                <HandGuide activeHand={activeFingerInfo?.hand} activeFinger={activeFingerInfo?.finger} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
