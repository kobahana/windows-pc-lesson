"use client"

// ショートカット・パスポート：合格した操作にスタンプが押されるスタンプ帳

import Link from "next/link"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { Ruby } from "@/components/game/character"
import { Button } from "@/components/ui/button"
import { SKILLS, formatKeys, type SkillLevel } from "@/lib/skills"
import { usePlatform } from "@/lib/platform"
import { Stamp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const LEVELS: { level: SkillLevel; title: React.ReactNode; en: string }[] = [
  { level: 1, title: <>★1 まずはこれだけ</>, en: "Must-know" },
  { level: 2, title: <>★2 <Ruby rt="しごと">仕事</Ruby>がはやくなる</>, en: "Work faster" },
  { level: 3, title: <>★3 できたら<Ruby rt="じょうきゅうしゃ">上級者</Ruby></>, en: "Advanced" },
]

export default function PassportPage() {
  const { skills, ready, student } = useSettings()
  const { isMac } = usePlatform()
  const got = SKILLS.filter((s) => skills[s.id]).length

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LessonHeader>
        <span className="font-bold text-slate-700">ショートカット・パスポート</span>
      </LessonHeader>
      <main className="max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-rose-500 text-white flex flex-col items-center justify-center shrink-0 rotate-[-8deg] shadow-lg">
            <span className="text-3xl font-black tabular-nums">{ready ? got : "-"}</span>
            <span className="text-xs">/ {SKILLS.length}</span>
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-800">{student ? `${student.name ?? student.id} さんのパスポート` : "パスポート"}</h1>
            <p className="text-slate-500">レッスンやウォームアップで<Ruby rt="ごうかく">合格</Ruby>すると、スタンプが<Ruby rt="お">押</Ruby>されるよ。<Ruby rt="ぜんぶ">全部</Ruby><Ruby rt="あつ">集</Ruby>めよう！<span className="block text-xs">Collect stamps by passing lessons and warm-ups.</span></p>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${(got / SKILLS.length) * 100}%` }} />
            </div>
          </div>
          <Link href="/warmup">
            <Button size="lg" className="gap-2 bg-rose-500 hover:bg-rose-600"><Zap className="w-5 h-5" /> ウォームアップ</Button>
          </Link>
        </div>

        {LEVELS.map((lv) => (
          <section key={lv.level} className="space-y-3">
            <h2 className="text-xl font-bold text-slate-800">{lv.title} <span className="text-sm font-normal text-slate-400">{lv.en}</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SKILLS.filter((s) => s.level === lv.level).map((s) => {
                const at = skills[s.id]
                return (
                  <div key={s.id} className={cn("relative rounded-2xl border-2 p-4 bg-white min-h-32 flex flex-col", at ? "border-rose-300" : "border-dashed border-slate-200")}>
                    <p className="font-bold text-slate-800">{s.ruby ? <Ruby rt={s.ruby}>{s.label}</Ruby> : s.label}</p>
                    <p className="text-xs text-slate-400">{s.en}</p>
                    <p className="mt-auto pt-2 font-mono font-bold text-slate-600 text-sm">{formatKeys(s.keys, isMac)}</p>
                    {at && (
                      <div className="absolute top-2 right-2 w-12 h-12 rounded-full border-4 border-rose-500 text-rose-500 flex flex-col items-center justify-center rotate-[-15deg] bg-white/80">
                        <Stamp className="w-4 h-4" />
                        <span className="text-[9px] font-bold leading-none">{new Date(at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
