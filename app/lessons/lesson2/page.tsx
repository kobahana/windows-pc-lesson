"use client"

import { useState, useEffect } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { Keyboard, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Lesson2() {
  const [targetKey, setTargetKey] = useState("f")
  const [progress, setProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // 練習するキーのリスト（ホームポジション）
  const practiceSequence = ["f", "f", "j", "j", "d", "k", "s", "l", "a", ";"]

  useEffect(() => {
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
  }, [targetKey, progress])

  // キーボードの見た目を作るためのデータ
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <SuccessOverlay show={showSuccess} message="ホームポジション、ばっちりだね！" />
      
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2"><ArrowLeft className="w-4 h-4"/> もどる</Button>
          </Link>
          <div className="text-slate-400 font-bold text-xl">Lesson 2</div>
        </div>

        <Character 
          message={
            showSuccess 
            ? "すごい！指（ゆび）の準備（じゅんび）ができたね！" 
            : `キーボードの「${targetKey.toUpperCase()}」を、決（き）められた指（ゆび）で押（お）してみよう！`
          } 
          mood={showSuccess ? "celebrating" : "happy"} 
        />

        {/* ターゲット表示 */}
        <div className="flex justify-center gap-4 py-10">
          {practiceSequence.map((key, index) => (
            <div 
              key={index}
              className={`w-12 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                index === progress ? "border-blue-500 bg-blue-50 scale-125 shadow-lg text-blue-600" : 
                index < progress ? "border-green-500 bg-green-50 text-green-500" : "border-slate-200 text-slate-300"
              }`}
            >
              {key.toUpperCase()}
            </div>
          ))}
        </div>

        {/* バーチャルキーボード（Playgram風） */}
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-slate-200 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex justify-center gap-2">
              {row.map((key) => (
                <div 
                  key={key}
                  className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all ${
                    key === targetKey 
                    ? "bg-blue-500 border-blue-600 text-white scale-110 shadow-lg" 
                    : "bg-slate-50 border-slate-200 text-slate-400"
                  } ${
                    (key === "f" || key === "j") && key !== targetKey ? "border-slate-400 border-b-4" : ""
                  }`}
                >
                  {key.toUpperCase()}
                </div>
              ))}
            </div>
          ))}
          
          {/* 指のガイドメッセージ */}
          <div className="mt-8 text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-blue-700 font-bold">
              {targetKey === "f" && "👈 ひだり手 の 人さし指 で おしてね！"}
              {targetKey === "j" && "👉 みぎ手 の 人さし指 で おしてね！"}
              {targetKey === "d" && "👈 ひだり手 の なか指 で おしてね！"}
              {targetKey === "k" && "👉 みぎ手 の なか指 で おしてね！"}
              {targetKey === "s" && "👈 ひだり手 の くすり指 で おしてね！"}
              {targetKey === "l" && "👉 みぎ手 の くすり指 で おしてね！"}
              {targetKey === "a" && "👈 ひだり手 の 小指 で おしてね！"}
              {targetKey === ";" && "👉 みぎ手 の 小指 で おしてね！"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
