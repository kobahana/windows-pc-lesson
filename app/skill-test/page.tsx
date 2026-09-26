"use client"

// PC操作テスト（5分間）
// 本物のキー操作で判定する操作問題＋選択問題。1問1点、スキップは0点。
// まとめテストと同じく効果音は鳴らさない。表示は先生用ページの「まとめテスト」スイッチと連動。

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { Character, Ruby } from "@/components/game/character"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/lesson/kit"
import { WARMUP_TASKS } from "@/components/warmup/tasks"
import { useTestEnabled } from "@/lib/test-settings"
import { AlignCenter, AlignLeft, AlignRight, AlignJustify, ClipboardCheck, Home, SkipForward, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx } from "@/lib/i18n"

const LESSON_ID = 14
const TIME_LIMIT_SEC = 5 * 60
const DONE_KEY = "pclesson_skilltest_done_v1"

type Item =
  | { kind: "op"; taskId: string }
  | { kind: "mc"; q: React.ReactNode; en: string; choices: React.ReactNode[]; answer: number }

const ITEMS: Item[] = [
  { kind: "op", taskId: "halfwidth" },
  { kind: "op", taskId: "katakana" },
  { kind: "op", taskId: "copypaste" },
  { kind: "mc", q: <>「<Ruby rt="ちゅうおう">中央</Ruby>そろえ」のボタンはどれ？</>, en: tx("Which is the \"center align\" button?"), choices: [<AlignLeft key="l" className="w-8 h-8" />, <AlignCenter key="c" className="w-8 h-8" />, <AlignRight key="r" className="w-8 h-8" />, <AlignJustify key="j" className="w-8 h-8" />], answer: 1 },
  { kind: "op", taskId: "cut" },
  { kind: "mc", q: <><Ruby rt="か">書</Ruby>き<Ruby rt="か">換</Ruby>えられない<Ruby rt="かたち">形</Ruby>で<Ruby rt="せいきゅうしょ">請求書</Ruby>を<Ruby rt="おく">送</Ruby>りたい。ファイルの<Ruby rt="しゅるい">種類</Ruby>は？</>, en: tx("You want to send an invoice in a form that can't be changed. Which file type?"), choices: ["請求書.xlsx", "請求書.docx", "請求書.pdf"], answer: 2 },
  { kind: "op", taskId: "undoredo" },
  { kind: "mc", q: <>B2 が<Ruby rt="たんか">単価</Ruby>、C2 が<Ruby rt="すうりょう">数量</Ruby>。<Ruby rt="きんがく">金額</Ruby>を<Ruby rt="だ">出</Ruby>す<Ruby rt="ただ">正</Ruby>しい<Ruby rt="しき">式</Ruby>は？</>, en: tx("B2 is the unit price and C2 is the quantity. Which formula gives the amount?"), choices: ["B2×C2", "=B2*C2", "＝B2*C2", "=120*3"], answer: 1 },
  { kind: "op", taskId: "tab" },
  { kind: "mc", q: <>100<Ruby rt="にん">人</Ruby>のお<Ruby rt="きゃく">客</Ruby>さまに<Ruby rt="いっせい">一斉</Ruby>にメールを<Ruby rt="おく">送</Ruby>る。<Ruby rt="あてさき">宛先</Ruby>はどこに<Ruby rt="い">入</Ruby>れる？</>, en: tx("You send an email to 100 customers at once. Where do you put the addresses?"), choices: ["To", "CC", "BCC"], answer: 2 },
  { kind: "op", taskId: "find" },
  { kind: "mc", q: <>「お<Ruby rt="にもつ">荷物</Ruby>を<Ruby rt="も">持</Ruby>ち<Ruby rt="かえ">帰</Ruby>りました。<Ruby rt="かくにん">確認</Ruby>はこちら http://…」という SMS。どうする？</>, en: tx("An SMS says \"We took your package back. Check here http://…\". What do you do?"), choices: ["リンクを開いて確認する", "リンクは開かず、公式アプリや不在票で確認する", "返信して聞く"], answer: 1 },
  { kind: "op", taskId: "rightclick" },
  { kind: "mc", q: <><Ruby rt="せき">席</Ruby>を<Ruby rt="はな">離</Ruby>れるときに<Ruby rt="がめん">画面</Ruby>をロックするキーは？</>, en: tx("Which keys lock the screen when you leave your seat?"), choices: ["Windows + L", "Ctrl + L", "Alt + F4"], answer: 0 },
  { kind: "op", taskId: "save" },
]
const MAX = ITEMS.length

function loadDone(): Record<string, { score: number; timeSec: number }> {
  try {
    return JSON.parse(sessionStorage.getItem(DONE_KEY) || "{}")
  } catch {
    return {}
  }
}

export default function SkillTestPage() {
  const { ready, student, recordEvent } = useSettings()
  const enabled = useTestEnabled(true)
  const [phase, setPhase] = useState<"intro" | "run" | "done">("intro")
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [deadline, setDeadline] = useState(0)
  const [left, setLeft] = useState(TIME_LIMIT_SEC)
  const [picked, setPicked] = useState<number | null>(null)
  const [summary, setSummary] = useState<{ score: number; timeSec: number } | null>(null)
  const startRef = useRef(0)
  const stateRef = useRef({ score: 0 })
  stateRef.current = { score }

  // 同じ学籍番号は、このタブでは1回だけ受験できる
  useEffect(() => {
    if (!ready || !student) return
    const done = loadDone()[student.id]
    if (done) {
      setSummary(done)
      setPhase("done")
    }
  }, [ready, student])

  const finish = useCallback((finalScore: number) => {
    if (!student) return
    const timeSec = Math.min(TIME_LIMIT_SEC, Math.round((Date.now() - startRef.current) / 1000))
    const s = { score: finalScore, timeSec }
    try {
      sessionStorage.setItem(DONE_KEY, JSON.stringify({ ...loadDone(), [student.id]: s }))
    } catch {
      // 保存できなくても続行
    }
    recordEvent(LESSON_ID, "test_clear", `${finalScore}/${MAX}点`, { timeSec })
    setSummary(s)
    setPhase("done")
  }, [student, recordEvent])

  useEffect(() => {
    if (phase !== "run") return
    const t = setInterval(() => {
      const l = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setLeft(l)
      if (l === 0) {
        clearInterval(t)
        finish(stateRef.current.score)
      }
    }, 250)
    return () => clearInterval(t)
  }, [phase, deadline, finish])

  const start = () => {
    startRef.current = Date.now()
    setDeadline(Date.now() + TIME_LIMIT_SEC * 1000)
    setIdx(0)
    setScore(0)
    setResults([])
    setPhase("run")
    recordEvent(LESSON_ID, "start")
  }

  const next = (ok: boolean) => {
    const newScore = score + (ok ? 1 : 0)
    setScore(newScore)
    setResults((r) => [...r, ok])
    setPicked(null)
    if (idx + 1 >= MAX) finish(newScore)
    else setIdx(idx + 1)
  }

  // テストでは、スタンプ（スキル）は付与しない
  const noAward = useCallback(() => {}, [])
  const item = ITEMS[idx]
  const opTask = item?.kind === "op" ? WARMUP_TASKS.find((t) => t.id === item.taskId) : undefined

  const header = (
    <LessonHeader>
      <span className="font-bold text-slate-700 flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> PC<Ruby rt="そうさ">操作</Ruby>テスト</span>
    </LessonHeader>
  )

  if (ready && enabled === false && phase !== "run" && phase !== "done") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">{header}
        <main className="max-w-xl mx-auto p-8 text-center space-y-4">
          <p className="text-lg text-slate-600">いまはテストの<Ruby rt="じかん">時間</Ruby>ではありません。<span className="block text-sm"><T>The test is not open now.</T></span></p>
          <Link href="/"><Button>ホームへ</Button></Link>
        </main>
      </div>
    )
  }

  if (ready && !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">{header}
        <main className="max-w-xl mx-auto p-8 text-center space-y-4">
          <p className="text-lg text-slate-600">テストを<Ruby rt="う">受</Ruby>けるには、ホームで<Ruby rt="がくせきばんごう">学籍番号</Ruby>を<Ruby rt="い">入</Ruby>れてログインしてね。<span className="block text-sm"><T>Please log in with your student ID first.</T></span></p>
          <Link href="/"><Button>ホームへ</Button></Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {header}
      <main className="max-w-3xl w-full mx-auto p-4 md:p-8 space-y-6">
        {phase === "intro" && student && (
          <>
            <Character mood="happy" message={<>PC<Ruby rt="そうさ">操作</Ruby>テストだよ。5<Ruby rt="ふんかん">分間</Ruby>で{MAX}<Ruby rt="もん">問</Ruby>。わからない<Ruby rt="もんだい">問題</Ruby>はスキップしてOK！<span className="block text-sm text-muted-foreground mt-1"><T s="{n} tasks in 5 minutes. You can skip." v={{ n: MAX }} /></span></>} />
            <Card className="text-center space-y-4">
              <p className="text-slate-600"><Ruby rt="がくせきばんごう">学籍番号</Ruby>：<b className="font-mono text-xl text-slate-800">{student.id}</b>{student.name && <>（{student.name}）</>}</p>
              <p className="text-sm text-slate-500">この<Ruby rt="がくせきばんごう">学籍番号</Ruby>で<Ruby rt="きろく">記録</Ruby>されます。ちがうときは、ホームでログアウトしてね。<span className="block"><T>Your result is saved with this student ID. If it is not yours, log out on the home page.</T></span></p>
              <Button size="lg" className="text-xl px-12 h-14 bg-amber-500 hover:bg-amber-600" onClick={start}>スタート！</Button>
            </Card>
          </>
        )}

        {phase === "run" && item && (
          <>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600">{idx + 1} / {MAX}</span>
              <span className={cn("font-mono text-2xl font-bold tabular-nums flex items-center gap-1", left <= 60 ? "text-red-600" : "text-slate-800")}>
                <Timer className="w-5 h-5" />{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
              </span>
            </div>
            <Card key={idx} className="space-y-4">
              {opTask ? (
                <>
                  <p className="text-xl font-bold text-slate-800">{opTask.title} <span className="text-sm font-normal text-slate-400"><T>{opTask.en}</T></span></p>
                  <opTask.Component onDone={() => next(true)} award={noAward} />
                </>
              ) : item.kind === "mc" ? (
                <>
                  <p className="text-xl font-bold text-slate-800">{item.q}<span className="block text-sm font-normal text-slate-400"><T>{item.en}</T></span></p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {item.choices.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => { if (picked === null) { setPicked(i); setTimeout(() => next(i === item.answer), 400) } }}
                        className={cn("rounded-xl border-2 px-4 py-3 text-lg flex items-center justify-center min-h-16", picked === i ? "border-primary bg-primary/10" : "border-slate-200 hover:border-slate-400 bg-white")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </Card>
            <div className="text-right">
              <Button variant="ghost" className="gap-1 text-slate-500" onClick={() => next(false)}>スキップ <SkipForward className="w-4 h-4" /></Button>
            </div>
          </>
        )}

        {phase === "done" && summary && (
          <Card className="text-center space-y-3 py-10">
            <p className="text-slate-600">おつかれさまでした！</p>
            <p className="text-6xl font-black text-slate-800 tabular-nums">{summary.score}<span className="text-2xl text-slate-500"> / {MAX}<Ruby rt="てん">点</Ruby></span></p>
            <p className="text-slate-500">{Math.floor(summary.timeSec / 60)}<Ruby rt="ふん">分</Ruby>{summary.timeSec % 60}<Ruby rt="びょう">秒</Ruby></p>
            {results.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {results.map((r, i) => <span key={i} className={cn("w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center", r ? "bg-success text-white" : "bg-slate-200 text-slate-500")}>{i + 1}</span>)}
              </div>
            )}
            <Link href="/"><Button size="lg" className="gap-2 mt-4"><Home className="w-5 h-5" /> ホームへ</Button></Link>
          </Card>
        )}
      </main>
    </div>
  )
}
