"use client"

// 新レッスン（L6〜L10）で共通に使う部品。
// - MissionFrame：パソ先生のセリフ＋進みぐあい＋本体
// - useStepFlow：ミッション内のステップ進行と「すごい！」演出
// - Keys：ショートカットのキー表示（Windows/Mac で自動切り替え）
// - useAward：ショートカット・パスポートのスタンプを押す

import { useCallback, useEffect, useRef, useState } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { useSettings } from "@/components/providers/settings-provider"
import { usePlatform } from "@/lib/platform"
import { SKILL_BY_ID, formatKeys } from "@/lib/skills"
import { sounds } from "@/lib/sounds"
import { cn } from "@/lib/utils"
import { Stamp, Lightbulb } from "lucide-react"

export { Ruby }

// ===== ステップ進行 =====

export function useStepFlow(total: number, onComplete: () => void, initialStep = 0) {
  const [step, setStepState] = useState(initialStep)
  const stepRef = useRef(initialStep)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState<React.ReactNode>("")
  const busyRef = useRef(false)
  // onComplete は毎回新しい関数で渡されることが多いので、ref で持って succeed を安定させる
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const setStep = useCallback((n: number) => {
    stepRef.current = n
    setStepState(n)
  }, [])

  // 成功演出のあと次のステップへ（最後なら onComplete）
  const succeed = useCallback((msg: React.ReactNode = "すごい！") => {
    if (busyRef.current) return
    busyRef.current = true
    sounds?.playSuccess()
    setSuccessMsg(msg)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      busyRef.current = false
      const next = stepRef.current + 1
      if (next >= total) onCompleteRef.current()
      else setStep(next)
    }, 1400)
  }, [total, setStep])

  return { step, setStep, succeed, showSuccess, successMsg }
}

// ===== 画面の枠 =====

export function MissionFrame({
  message,
  mood = "happy",
  step,
  total,
  showSuccess,
  successMsg,
  children,
  wide = false,
}: {
  message: React.ReactNode
  mood?: "happy" | "neutral" | "encouraging" | "celebrating"
  step: number
  total: number
  showSuccess: boolean
  successMsg: React.ReactNode
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className={cn("mx-auto p-4 md:p-6 space-y-5", wide ? "max-w-6xl" : "max-w-4xl")}>
        <Character message={message} mood={showSuccess ? "celebrating" : mood} />
        <div className="flex items-center justify-center gap-1.5" aria-label={`ステップ ${step + 1} / ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i < step ? "w-6 bg-success" : i === step ? "w-10 bg-primary" : "w-6 bg-border",
              )}
            />
          ))}
        </div>
        <div className="animate-fade-in" key={step}>{children}</div>
      </div>
      <SuccessOverlay show={showSuccess} message={successMsg} />
    </div>
  )
}

// ===== キー表示 =====

export function Key({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn(
      "inline-flex items-center justify-center min-w-[2.2em] px-2 py-0.5 mx-0.5 rounded-lg border-2 border-slate-300 border-b-4 bg-white text-slate-800 font-bold font-sans text-[0.9em] shadow-sm align-middle",
      className,
    )}>
      {children}
    </kbd>
  )
}

// "Mod+C" → [Ctrl] + [C]（Mac なら [⌘] + [C]）
export function Keys({ k, className }: { k: string; className?: string }) {
  const { isMac } = usePlatform()
  const parts = formatKeys(k, isMac).split("+")
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap", className)}>
      {parts.map((p, i) => (
        <span key={i} className="inline-flex items-center">
          {i > 0 && <span className="mx-0.5 text-slate-400 font-bold">+</span>}
          <Key>{p}</Key>
        </span>
      ))}
    </span>
  )
}

// ===== ヒント・コラム =====

export function Tip({ children, title }: { children: React.ReactNode; title?: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-slate-700 text-sm md:text-base">
      <p className="font-bold text-amber-700 flex items-center gap-1.5 mb-1">
        <Lightbulb className="w-4 h-4" /> {title ?? <>ポイント / Tip</>}
      </p>
      {children}
    </div>
  )
}

// 間違いの声かけ（種類ごとに具体的に）
export function Warn({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return (
    <p className="text-sm md:text-base font-bold text-amber-800 bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-2 animate-fade-in">
      ⚠️ {children}
    </p>
  )
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-card rounded-2xl border-2 border-border shadow-sm p-5 md:p-6", className)}>{children}</div>
}

// ===== アプリ共通の5つのルール =====

export const FIVE_RULES: { n: number; title: React.ReactNode; en: string }[] = [
  { n: 1, title: <>先に<Ruby rt="えら">選</Ruby>んでから、<Ruby rt="そうさ">操作</Ruby>する</>, en: "Select first, then act" },
  { n: 2, title: <>アイコンは<Ruby rt="かたち">形</Ruby>から<Ruby rt="よそう">予想</Ruby>、マウスを<Ruby rt="の">乗</Ruby>せて<Ruby rt="たし">確</Ruby>かめる</>, en: "Guess from the icon, hover to check" },
  { n: 3, title: <><Ruby rt="まよ">迷</Ruby>ったら<Ruby rt="みぎ">右</Ruby>クリック</>, en: "When lost, right-click" },
  { n: 4, title: <>メニューの<Ruby rt="ばしょ">場所</Ruby>はだいたい<Ruby rt="き">決</Ruby>まっている</>, en: "Menus are in the usual places" },
  { n: 5, title: <><Ruby rt="しっぱい">失敗</Ruby>したら <Keys k="Mod+Z" /></>, en: "Made a mistake? Undo" },
]

export function RuleBadge({ n }: { n: number }) {
  const rule = FIVE_RULES[n - 1]
  return (
    <div className="inline-flex items-center gap-2 bg-indigo-50 border-2 border-indigo-200 text-indigo-800 rounded-full pl-1 pr-4 py-1 text-sm font-bold">
      <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">{n}</span>
      <span>ルール{n}：{rule.title}</span>
    </div>
  )
}

// ===== スタンプ（ショートカット・パスポート） =====

const STAMP_EVENT = "pclesson-skill-stamp"

// 合格したらスタンプを押す。はじめての合格なら画面の右下に知らせる
export function useAward(lessonId: number) {
  const { markSkill } = useSettings()
  return useCallback((skillId: string) => {
    const isNew = markSkill(skillId, lessonId)
    if (isNew) window.dispatchEvent(new CustomEvent(STAMP_EVENT, { detail: skillId }))
  }, [markSkill, lessonId])
}

export function SkillStampToast() {
  const [queue, setQueue] = useState<string[]>([])
  const { isMac } = usePlatform()

  useEffect(() => {
    const onStamp = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      setQueue((q) => [...q, id])
      setTimeout(() => setQueue((q) => q.slice(1)), 2600)
    }
    window.addEventListener(STAMP_EVENT, onStamp)
    return () => window.removeEventListener(STAMP_EVENT, onStamp)
  }, [])

  const current = queue[0] ? SKILL_BY_ID[queue[0]] : null
  if (!current) return null
  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-bounce-in pointer-events-none">
      <div className="flex items-center gap-3 bg-white border-4 border-amber-400 rounded-2xl shadow-2xl px-5 py-3">
        <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center rotate-[-12deg]">
          <Stamp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-600">スタンプGET！ / New stamp</p>
          <p className="font-bold text-slate-800">{current.label}</p>
          <p className="text-xs text-slate-500">{formatKeys(current.keys, isMac)}</p>
        </div>
      </div>
    </div>
  )
}

// ===== 選択式クイズ（理由つき） =====

export interface QuizChoice {
  label: React.ReactNode
  ok: boolean
  why?: React.ReactNode
}
export interface QuizQuestion {
  q: React.ReactNode
  en?: string
  visual?: React.ReactNode
  choices: QuizChoice[]
}

// 全問正解すると onDone。間違えたら理由を見せて、もう一度選ばせる
export function ChoiceQuiz({ questions, onDone, columns = 1 }: { questions: QuizQuestion[]; onDone: () => void; columns?: 1 | 2 | 3 }) {
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const q = questions[qi]
  const choice = picked !== null ? q.choices[picked] : null

  const next = () => {
    setPicked(null)
    if (qi + 1 >= questions.length) onDone()
    else setQi(qi + 1)
  }

  return (
    <Card className="space-y-4">
      <p className="text-sm text-slate-400 text-center">{qi + 1} / {questions.length}</p>
      <div>
        <p className="text-xl font-bold text-slate-800">{q.q}</p>
        {q.en && <p className="text-sm text-slate-400">{q.en}</p>}
      </div>
      {q.visual}
      <div className={cn("grid gap-3", columns === 2 && "md:grid-cols-2", columns === 3 && "md:grid-cols-3")}>
        {q.choices.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { if (!choice?.ok) { setPicked(i); if (!c.ok) sounds?.playError() } }}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-left text-lg transition-colors",
              picked === i ? (c.ok ? "border-success bg-success/10" : "border-amber-400 bg-amber-50") : "border-slate-200 hover:border-slate-400 bg-white",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      {choice && (
        <div className={cn("rounded-xl p-4 animate-fade-in", choice.ok ? "bg-success/10 text-slate-800" : "bg-amber-50 text-amber-900")}>
          <p className="font-bold">{choice.ok ? "正解！🎉" : "ちがうよ。もう一度えらんでね"}</p>
          {choice.why && <p className="mt-1">{choice.why}</p>}
          {choice.ok && (
            <div className="text-right mt-2">
              <button type="button" onClick={next} className="bg-primary text-primary-foreground font-bold rounded-lg px-5 py-2">
                {qi + 1 >= questions.length ? "つぎへ" : "つぎの問題"} →
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
