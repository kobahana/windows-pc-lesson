"use client"

import Link from "next/link"
import { Character, Ruby } from "@/components/game/character"
import { Button } from "@/components/ui/button"
import { Monitor, Keyboard, Languages, PenTool } from "lucide-react"

export default function Home() {
  const lessons = [
    {
      id: 1,
      title: "Windowsの基本操作",
      ruby: "Windowsのきほんそうさ",
      description: "マウス操作、Wi-Fi、保存、シャットダウンを覚えよう！",
      icon: <Monitor className="w-10 h-10 text-blue-500" />,
      link: "/lessons/lesson1",
      available: true,
    },
    {
      id: 2,
      title: "ホームポジションに慣れよう",
      ruby: "ホームポジションになれよう",
      description: "正しい指の置き方を覚えて、タイピングの準備をしよう！",
      icon: <Keyboard className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson2",
      available: true,
    },
    {
      id: 3,
      title: "日本語をローマ字入力しよう",
      ruby: "にほんごをローマじにゅうりょくしよう",
      description: "「ん」や「っ」など、難しい打ち方を練習しよう！",
      icon: <Languages className="w-10 h-10 text-slate-400" />,
      link: "#",
      available: false,
    },
    {
      id: 4,
      title: "漢字変換マスターになろう",
      ruby: "かんじへんかんマスターになろう",
      description: "正しい漢字を選んで、文章を完成させよう！",
      icon: <PenTool className="w-10 h-10 text-slate-400" />,
      link: "#",
      available: false,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <Character 
          message="こんにちは！どの練習（れんしゅう）からはじめる？好きなコースをえらんでね！" 
          mood="happy" 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lessons.map((lesson) => (
            <div 
              key={lesson.id}
              className={`relative bg-white rounded-3xl p-8 shadow-sm border-2 transition-all ${
                lesson.available 
                ? "border-transparent hover:border-blue-400 hover:shadow-xl cursor-pointer" 
                : "border-slate-100 opacity-60"
              }`}
            >
              <div className="flex items-start gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl shrink-0 text-slate-400">
                  {lesson.icon}
                </div>
                <div className="space-y-3 flex-1">
                  <span className="text-sm font-bold text-blue-500 block mb-1">Lesson {lesson.id}</span>
                  
                  {/* タイトルの重複を解消し、ルビを綺麗に配置 */}
                  <h2 className="text-2xl font-bold text-slate-800 leading-relaxed">
                    <Ruby rt={lesson.ruby}>{lesson.title}</Ruby>
                  </h2>
                  
                  <p className="text-slate-500 leading-relaxed pt-2">
                    {lesson.description}
                  </p>
                  
                  {lesson.available ? (
                    <Link href={lesson.link}>
                      <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 shadow-md">
                        スタート！
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="mt-4 w-full bg-slate-100 text-slate-400">
                      準備中（じゅんびちゅう）
                    </Button>
                  )}
                </div>
              </div>
              {!lesson.available && (
                <div className="absolute top-4 right-4 bg-slate-100 text-slate-400 text-[10px] px-3 py-1 rounded-full font-bold">
                  COMING SOON
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
