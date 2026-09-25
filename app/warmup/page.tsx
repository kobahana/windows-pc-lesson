"use client"

// ウォームアップ（授業のはじめの2〜3分）
// まだ合格していない操作を優先して3問。本物のキー操作で判定する。

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { Card, useAward } from "@/components/lesson/kit"
import { WARMUP_TASKS, pickTasks, type WarmupTask } from "@/components/warmup/tasks"
import { SKILLS } from "@/lib/skills"
import { sounds } from "@/lib/sounds"
import { Timer, Stamp, RotateCcw, Home } from "lucide-react"

const LESSON_ID = 12

export default function WarmupPage() {
  const { ready, skills, recordEvent } = useSettings()
  const award = useAward(LESSON_ID)
  const [tasks, setTasks] = useState<WarmupTask[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [startAt, setStartAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const busyRef = useRef(false)
  const skillsRef = useRef(skills)
  skillsRef.current = skills
  // パスポートから来たとき（?task=ID）は、その1問だけを練習する
  const [focusTask, setFocusTask] = useState<WarmupTask | null | undefined>(undefined)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("task")
    setFocusTask(WARMUP_TASKS.find((t) => t.id === id) ?? null)
  }, [])

  const start = useCallback(() => {
    setTasks(focusTask ? [focusTask] : pickTasks(skillsRef.current, 3))
    setIdx(0)
    setFinished(false)
    setStartAt(Date.now())
    setElapsed(0)
    busyRef.current = false
    recordEvent(LESSON_ID, "start")
  }, [recordEvent, focusTask])

  useEffect(() => {
    if (ready && focusTask !== undefined && !tasks) start()
  }, [ready, focusTask, tasks, start])

  useEffect(() => {
    if (!tasks || finished) return
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startAt) / 1000)), 500)
    return () => clearInterval(t)
  }, [tasks, finished, startAt])

  const done = useCallback(() => {
    if (busyRef.current || !tasks) return
    busyRef.current = true
    sounds?.playSuccess()
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      busyRef.current = false
      if (idx + 1 >= tasks.length) {
        const sec = Math.floor((Date.now() - startAt) / 1000)
        setElapsed(sec)
        setFinished(true)
        sounds?.playClear()
        recordEvent(LESSON_ID, "stage_clear", "ウォームアップ完了", { timeSec: sec })
      } else setIdx(idx + 1)
    }, 900)
  }, [tasks, idx, startAt, recordEvent])

  const got = SKILLS.filter((s) => skills[s.id]).length
  const task = tasks?.[idx]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LessonHeader>
        <span className="font-bold text-slate-700 flex items-center gap-2"><Timer className="w-4 h-4" /> ウォームアップ {tasks && !finished && `${idx + 1}/${tasks.length}`}</span>
      </LessonHeader>
      <main className="max-w-3xl w-full mx-auto p-4 md:p-8 space-y-6">
        {!finished ? (
          <>
            <Character
              mood="happy"
              message={
                focusTask
                  ? <>パスポートの<Ruby rt="れんしゅう">練習</Ruby>だよ。できたらスタンプがもらえるよ！<span className="block text-sm text-muted-foreground mt-1">Practice this one to get the stamp.</span></>
                  : <><Ruby rt="じゅぎょう">授業</Ruby>の<Ruby rt="まえ">前</Ruby>のウォームアップ！3<Ruby rt="もん">問</Ruby>だけ、<Ruby rt="はや">速</Ruby>くできるかな？<span className="block text-sm text-muted-foreground mt-1">3 quick tasks to warm up your fingers.</span></>
              }
            />
            {task && (
              <Card key={`${task.id}-${idx}`} className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-slate-800">{task.title}</p>
                  <span className="font-mono text-slate-400 tabular-nums">{elapsed}秒</span>
                </div>
                <task.Component onDone={done} award={award} />
              </Card>
            )}
          </>
        ) : (
          <Card className="text-center space-y-4 py-8">
            <p className="text-4xl font-bold">おつかれさま！</p>
            <p className="text-lg text-slate-600"><span className="font-mono font-bold text-3xl text-slate-800">{elapsed}</span> <Ruby rt="びょう">秒</Ruby>でできたよ</p>
            <p className="flex items-center justify-center gap-2 text-amber-600 font-bold"><Stamp className="w-5 h-5" /> スタンプ {got} / {SKILLS.length}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button size="lg" variant="outline" className="gap-2" onClick={start}><RotateCcw className="w-5 h-5" /> もう<Ruby rt="いっかい">1回</Ruby></Button>
              <Link href="/passport"><Button size="lg" variant="outline" className="gap-2"><Stamp className="w-5 h-5" /> パスポート</Button></Link>
              <Link href="/"><Button size="lg" className="gap-2"><Home className="w-5 h-5" /> ホームへ</Button></Link>
            </div>
          </Card>
        )}
      </main>
      <SuccessOverlay show={showSuccess} message="OK!" />
    </div>
  )
}
