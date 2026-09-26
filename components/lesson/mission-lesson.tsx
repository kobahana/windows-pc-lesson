"use client"

// 新レッスン（L6〜L10）共通の入れ物。
// ミッションの切り替え・クリア記録・完了画面を担当する。
// 現在のミッションは sessionStorage に保存する（リロードの練習をしても続きから再開できるように）。

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MissionHeader } from "@/components/game/mission-header"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { Button } from "@/components/ui/button"
import { Ruby } from "@/components/game/character"
import { sounds } from "@/lib/sounds"
import { Home, RotateCcw, Trophy } from "lucide-react"
import { T } from "@/lib/i18n"

export interface MissionDef {
  title: string // 短い名前（スマホ表示用）
  titleFull: React.ReactNode
  learned: React.ReactNode // 完了画面の「学んだこと」
  learnedEn?: string // learned の英語（tx で）
  render: (onComplete: () => void) => React.ReactNode
}

export function MissionLesson({ lessonId, missions }: { lessonId: number; missions: MissionDef[] }) {
  const storageKey = `pclesson_lesson_state_${lessonId}`
  const [current, setCurrent] = useState(1)
  const [completed, setCompleted] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const [restored, setRestored] = useState(false)
  const { markLessonCompleted, recordEvent, ready } = useSettings()
  const startRecordedRef = useRef(false)

  // リロード後も続きから再開する
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as { current: number; completed: number[] }
        if (saved.current >= 1 && saved.current <= missions.length) setCurrent(saved.current)
        setCompleted(saved.completed ?? [])
      }
    } catch {
      // 読めなければ最初から
    }
    // パスポートから来たときは ?mission=N のミッションを開く。
    // URL からは消しておく（このあとリロードの練習をしても、進んだミッションに戻れるように）
    const url = new URL(window.location.href)
    const mission = Number(url.searchParams.get("mission"))
    if (mission >= 1 && mission <= missions.length) {
      setCurrent(mission)
      url.searchParams.delete("mission")
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash)
    }
    setRestored(true)
  }, [storageKey, missions.length])

  useEffect(() => {
    if (!restored) return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ current, completed }))
    } catch {
      // 保存できなくても続行
    }
  }, [restored, storageKey, current, completed])

  // レッスン開始を1回だけ記録（ログイン情報の読み込み完了を待つ）
  useEffect(() => {
    if (!ready || startRecordedRef.current) return
    startRecordedRef.current = true
    recordEvent(lessonId, "start")
  }, [ready, recordEvent, lessonId])

  const handleComplete = useCallback((n: number) => {
    setCompleted((prev) => (prev.includes(n) ? prev : [...prev, n]))
    recordEvent(lessonId, "stage_clear", `ミッション${n}`)
    if (n < missions.length) {
      setCurrent(n + 1)
    } else {
      sounds?.playClear()
      setDone(true)
      markLessonCompleted(lessonId)
      recordEvent(lessonId, "lesson_clear")
      try {
        sessionStorage.removeItem(storageKey)
      } catch {
        // 無視
      }
    }
  }, [lessonId, missions.length, markLessonCompleted, recordEvent, storageKey])

  const headerMissions = missions.map((m, i) => ({
    id: i + 1,
    title: m.title,
    titleFull: m.titleFull,
    completed: completed.includes(i + 1),
    current: current === i + 1,
  }))

  const select = (id: number) => {
    sounds?.playClick()
    setCurrent(id)
    setDone(false)
  }

  const header = (
    <LessonHeader>
      <div className="flex-1 w-full max-w-3xl">
        <MissionHeader missions={headerMissions} currentMission={current} onMissionSelect={select} />
      </div>
    </LessonHeader>
  )

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {header}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl animate-bounce-subtle">
              <Trophy className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">おめでとう！</h1>
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border text-left mb-6">
              <h2 className="font-bold text-lg mb-3"><Ruby rt="まな">学</Ruby>んだこと：</h2>
              <ul className="space-y-2 text-muted-foreground">
                {missions.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm shrink-0">✓</span>
                    <span>
                      {m.learned}
                      {m.learnedEn && <span className="block text-sm"><T>{m.learnedEn}</T></span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="lg" className="gap-2" onClick={() => { setCompleted([]); select(1) }}>
                <RotateCcw className="w-5 h-5" /> もう<Ruby rt="いちど">一度</Ruby>
              </Button>
              <Link href="/">
                <Button size="lg" className="gap-2"><Home className="w-5 h-5" /> ホームへ</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {header}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {restored && (
          <div key={current} className="flex-1 flex flex-col min-h-0">
            {missions[current - 1].render(() => handleComplete(current))}
          </div>
        )}
      </main>
    </div>
  )
}
