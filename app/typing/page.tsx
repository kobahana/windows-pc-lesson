"use client"

// タイピング計測：1分間で正しく打てた文字数（漢字変換を含む）を記録し、成長をグラフで見せる

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { Character, Ruby } from "@/components/game/character"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, Key } from "@/components/lesson/kit"
import { addTypingResult, getStudent, type TypingResult } from "@/lib/student-store"
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Timer, RotateCcw, Home, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { T } from "@/lib/i18n"

const LESSON_ID = 13
const DURATION = 60
const GUEST_KEY = "pclesson_guest_typing_v1"

// 目安（1分間の文字数）
const GOALS = [
  { cpm: 30, label: "初級 30" },
  { cpm: 60, label: "中級 60" },
  { cpm: 80, label: "就職の目標 80" },
]

const SENTENCES: { h: string; k: string }[] = [
  { h: "おせわになっております。", k: "お世話になっております。" },
  { h: "しりょうをおくります。", k: "資料を送ります。" },
  { h: "かくにんをおねがいします。", k: "確認をお願いします。" },
  { h: "あしたのかいぎはじゅうじからです。", k: "明日の会議は十時からです。" },
  { h: "しょうちいたしました。", k: "承知いたしました。" },
  { h: "でんしゃがおくれています。", k: "電車が遅れています。" },
  { h: "ほんじつはありがとうございました。", k: "本日はありがとうございました。" },
  { h: "せいきゅうしょをてんぷします。", k: "請求書を添付します。" },
  { h: "よろしくおねがいいたします。", k: "よろしくお願いいたします。" },
  { h: "らいしゅうのよていをおしえてください。", k: "来週の予定を教えてください。" },
  { h: "ファイルをほぞんしました。", k: "ファイルを保存しました。" },
  { h: "おさきにしつれいします。", k: "お先に失礼します。" },
  { h: "しょうしょうおまちください。", k: "少々お待ちください。" },
  { h: "めーるをかくにんしました。", k: "メールを確認しました。" },
  { h: "ごれんらくおまちしております。", k: "ご連絡お待ちしております。" },
]

function loadHistory(studentId: string | undefined): TypingResult[] {
  if (studentId) return getStudent(studentId)?.typing ?? []
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]")
  } catch {
    return []
  }
}

function HistoryChart({ history }: { history: TypingResult[] }) {
  const data = history.slice(-20).map((r, i) => ({
    n: i + 1,
    date: new Date(r.at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }),
    cpm: r.cpm,
  }))
  if (data.length === 0) return null
  const max = Math.max(90, ...data.map((d) => d.cpm + 10))
  return (
    <Card className="space-y-2">
      <p className="font-bold text-slate-800">1<Ruby rt="ぷんかん">分間</Ruby>の<Ruby rt="もじすう">文字数</Ruby>（<Ruby rt="さいきん">最近</Ruby>{data.length}<Ruby rt="かい">回</Ruby>）</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 88, bottom: 4, left: -12 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
            <YAxis domain={[0, max]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            {GOALS.map((g) => (
              <ReferenceLine key={g.cpm} y={g.cpm} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: g.label, position: "right", fontSize: 11, fill: "#475569" }} />
            ))}
            <Tooltip
              formatter={(v) => [`${v} 文字/分`, "記録"]}
              labelFormatter={(l) => `${l}`}
              contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }}
            />
            <Line type="monotone" dataKey="cpm" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default function TypingPage() {
  const { ready, student, recordEvent } = useSettings()
  const [phase, setPhase] = useState<"intro" | "run" | "done">("intro")
  const [order, setOrder] = useState<number[]>([])
  const [si, setSi] = useState(0)
  const [input, setInput] = useState("")
  const [chars, setChars] = useState(0)
  const [miss, setMiss] = useState(0)
  const [left, setLeft] = useState(DURATION)
  const [flash, setFlash] = useState(false)
  const [history, setHistory] = useState<TypingResult[]>([])
  const endRef = useRef(0)
  const statsRef = useRef({ chars: 0, miss: 0 })
  statsRef.current = { chars, miss }

  useEffect(() => {
    if (ready) setHistory(loadHistory(student?.id))
  }, [ready, student])

  const start = () => {
    setOrder(SENTENCES.map((_, i) => i).sort(() => Math.random() - 0.5))
    setSi(0)
    setInput("")
    setChars(0)
    setMiss(0)
    setLeft(DURATION)
    endRef.current = Date.now() + DURATION * 1000
    setPhase("run")
    recordEvent(LESSON_ID, "start")
  }

  const finish = useCallback(() => {
    const { chars: cpm, miss: m } = statsRef.current
    const result: TypingResult = { at: new Date().toISOString(), cpm, miss: m }
    if (student) addTypingResult(student.id, result)
    else {
      try {
        localStorage.setItem(GUEST_KEY, JSON.stringify([...loadHistory(undefined), result].slice(-100)))
      } catch {
        // 保存できなくても結果は表示する
      }
    }
    setHistory(loadHistory(student?.id))
    recordEvent(LESSON_ID, "stage_clear", `${cpm}文字/分`, { missCount: m })
    setPhase("done")
  }, [student, recordEvent])

  useEffect(() => {
    if (phase !== "run") return
    const t = setInterval(() => {
      const l = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000))
      setLeft(l)
      if (l === 0) {
        clearInterval(t)
        finish()
      }
    }, 200)
    return () => clearInterval(t)
  }, [phase, finish])

  const target = SENTENCES[order[si % Math.max(order.length, 1)] ?? 0]
  const submit = () => {
    if (input.trim() === target.k) {
      setChars((c) => c + target.k.length)
      setSi((i) => i + 1)
      setInput("")
    } else {
      setMiss((m) => m + 1)
      setFlash(true)
      setTimeout(() => setFlash(false), 400)
    }
  }

  const best = history.reduce((m, r) => Math.max(m, r.cpm), 0)
  const last = history[history.length - 1]
  const nextGoal = GOALS.find((g) => g.cpm > (last?.cpm ?? 0))

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LessonHeader>
        <span className="font-bold text-slate-700 flex items-center gap-2"><Timer className="w-4 h-4" /> タイピング<Ruby rt="けいそく">計測</Ruby></span>
      </LessonHeader>
      <main className="max-w-3xl w-full mx-auto p-4 md:p-8 space-y-6">
        {phase === "intro" && (
          <>
            <Character mood="happy" message={<>1<Ruby rt="ぷんかん">分間</Ruby>で<Ruby rt="なんもじ">何文字</Ruby><Ruby rt="う">打</Ruby>てるかな？<Ruby rt="かんじ">漢字</Ruby>に<Ruby rt="へんかん">変換</Ruby>して、<Key>Enter</Key> で<Ruby rt="つぎ">次</Ruby>へ。<Ruby rt="まいかい">毎回</Ruby><Ruby rt="はか">測</Ruby>って、<Ruby rt="せいちょう">成長</Ruby>を<Ruby rt="み">見</Ruby>よう！<span className="block text-sm text-muted-foreground mt-1"><T>How many characters can you type in 1 minute?</T></span></>} />
            <Card className="text-center space-y-4">
              <div className="flex justify-center gap-3 flex-wrap text-sm">
                {GOALS.map((g) => <span key={g.cpm} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">{g.label}<Ruby rt="もじ">文字</Ruby></span>)}
              </div>
              {best > 0 && <p className="text-slate-600"><Ruby rt="じこ">自己</Ruby>ベスト：<b className="text-2xl text-slate-800">{best}</b> <Ruby rt="もじ">文字</Ruby>/<Ruby rt="ぷん">分</Ruby> <span className="text-sm text-slate-400"><T>Personal best (characters per minute)</T></span></p>}
              <Button size="lg" className="text-xl px-12 h-14" onClick={start}>スタート！</Button>
            </Card>
            <HistoryChart history={history} />
          </>
        )}

        {phase === "run" && (
          <Card className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="font-mono text-3xl font-bold tabular-nums text-slate-800">{left}<span className="text-base text-slate-400">秒</span></span>
              <span className="text-slate-600"><b className="text-2xl tabular-nums text-slate-800">{chars}</b> <Ruby rt="もじ">文字</Ruby></span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${(left / DURATION) * 100}%` }} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-slate-400">{target.h}</p>
              <p className="text-3xl md:text-4xl font-bold text-slate-800">{target.k}</p>
            </div>
            <Input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); submit() } }}
              className={cn("h-16 text-2xl text-center", flash && "border-red-400 bg-red-50")}
            />
          </Card>
        )}

        {phase === "done" && last && (
          <>
            <Card className="text-center space-y-3 py-8">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
              <p className="text-slate-600">1<Ruby rt="ぷんかん">分間</Ruby>で</p>
              <p className="text-6xl font-black text-slate-800 tabular-nums">{last.cpm}<span className="text-2xl font-bold text-slate-500"> 文字</span></p>
              <p className="text-slate-500">ミス {last.miss}<Ruby rt="かい">回</Ruby>{last.cpm >= best && history.length > 1 && <b className="ml-2 text-rose-500">自己ベスト！</b>}</p>
              {nextGoal && <p className="text-slate-600"><Ruby rt="つぎ">次</Ruby>の<Ruby rt="もくひょう">目標</Ruby>：<b>{nextGoal.label}</b> <Ruby rt="もじ">文字</Ruby>（あと {nextGoal.cpm - last.cpm}<Ruby rt="もじ">文字</Ruby>）<span className="block text-sm text-slate-400"><T s="Next goal: {goal} characters ({n} more)" v={{ goal: nextGoal.cpm, n: nextGoal.cpm - last.cpm }} /></span></p>}
              <div className="flex gap-3 justify-center pt-2">
                <Button size="lg" variant="outline" className="gap-2" onClick={start}><RotateCcw className="w-5 h-5" /> もう<Ruby rt="いちど">一度</Ruby></Button>
                <Link href="/"><Button size="lg" className="gap-2"><Home className="w-5 h-5" /> ホームへ</Button></Link>
              </div>
            </Card>
            <HistoryChart history={history} />
          </>
        )}
      </main>
    </div>
  )
}

