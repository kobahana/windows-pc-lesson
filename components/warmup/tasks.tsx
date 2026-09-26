"use client"

// ウォームアップの問題集。どれも本物のキー操作・コピー/貼り付けイベントで判定する。
// 各問題は、合格するとスキル（パスポートのスタンプ）を付与する。

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Keys, Ruby, Warn } from "@/components/lesson/kit"
import { halfWidthProblem, katakanaProblem } from "@/lib/input-check"
import { T, tx, useT } from "@/lib/i18n"

export interface TaskProps {
  onDone: () => void
  award: (skillId: string) => void
}
export interface WarmupTask {
  id: string
  skills: string[]
  title: React.ReactNode
  en: string
  Component: (p: TaskProps) => React.ReactNode
}

const isMod = (e: KeyboardEvent) => e.ctrlKey || e.metaKey

// 直前に押したショートカットを覚えておく
function useModKeys() {
  const pressed = useRef<Set<string>>(new Set())
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (isMod(e)) pressed.current.add(e.key.toLowerCase()) }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])
  return pressed
}

function CopyPaste({ onDone, award }: TaskProps) {
  const t = useT()
  const [word] = useState(() => ["東京都渋谷区道玄坂1-2-3", "info@sakura.example.jp", "080-9876-5432", "https://example.com/apply"][Math.floor(Math.random() * 4)])
  const keys = useModKeys()
  const [warn, setWarn] = useState("")
  return (
    <div className="space-y-3">
      <p className="text-2xl font-bold bg-slate-50 rounded-xl p-4 select-text">{word}</p>
      <Input
        placeholder={`ここに貼り付け / ${t("Paste here")}`}
        className="h-14 text-xl"
        onPaste={(e) => {
          const t = e.clipboardData.getData("text").trim()
          if (t === word) {
            if (keys.current.has("c")) award("copy")
            if (keys.current.has("v")) award("paste")
            onDone()
          } else setWarn(`コピーした文字がちがうみたい。全部選べているかな？ / ${tx("The copied text is different. Did you select all of it?")}`)
        }}
        onChange={(e) => { if (e.target.value && e.target.value.trim() !== word) setWarn(`手で打たずに、コピーして貼り付けよう / ${tx("Don't type it. Copy and paste!")}`) }}
      />
      <Warn>{warn}</Warn>
    </div>
  )
}

function Cut({ onDone, award }: TaskProps) {
  const t = useT()
  const [a, setA] = useState("会議室は　3階")
  const [b, setB] = useState("")
  const keys = useModKeys()
  const doneRef = useRef(false)
  useEffect(() => {
    if (!doneRef.current && !a.includes("3階") && b.includes("3階")) {
      doneRef.current = true
      if (keys.current.has("x")) award("cut")
      if (keys.current.has("v")) award("paste")
      onDone()
    }
  }, [a, b, award, onDone, keys])
  return (
    <div className="space-y-3">
      <p className="text-slate-600">「3<Ruby rt="かい">階</Ruby>」を <Keys k="Mod+X" /> で<Ruby rt="き">切</Ruby>り<Ruby rt="と">取</Ruby>って、<Ruby rt="した">下</Ruby>の<Ruby rt="らん">欄</Ruby>へ <Keys k="Mod+V" /><span className="block text-sm text-slate-400"><T>Cut 「3階」 and paste it into the field below</T></span></p>
      <Input value={a} onChange={(e) => setA(e.target.value)} className="h-14 text-xl" />
      <Input value={b} onChange={(e) => setB(e.target.value)} placeholder={`ここへ移動 / ${t("Move here")}`} className="h-14 text-xl" />
    </div>
  )
}

const UNDO_TEXT = "明日の面接は10時からです。"
function UndoRedo({ onDone, award }: TaskProps) {
  const [v, setV] = useState(UNDO_TEXT)
  const [stage, setStage] = useState<"erase" | "undo" | "redo">("erase")
  const keys = useModKeys()
  const change = (nv: string) => {
    setV(nv)
    if (stage === "erase" && nv.trim() === "") {
      if (keys.current.has("a")) award("selectall")
      setStage("undo")
    } else if (stage === "undo" && nv === UNDO_TEXT) {
      award("undo")
      setStage("redo")
    } else if (stage === "redo" && nv.trim() === "") {
      if (keys.current.has("y") || keys.current.has("z")) award("redo")
      onDone()
    }
  }
  return (
    <div className="space-y-3">
      <p className="text-slate-600 font-bold">
        {stage === "erase" && <>① <Ruby rt="ぶんしょう">文章</Ruby>をクリック → <Keys k="Mod+A" /> → <Keys k="Delete" /> で<Ruby rt="け">消</Ruby>す<span className="block text-sm font-normal text-slate-400"><T>① Click the text → select all → delete</T></span></>}
        {stage === "undo" && <>② <Keys k="Mod+Z" /> で<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>す<span className="block text-sm font-normal text-slate-400"><T>② Undo</T></span></>}
        {stage === "redo" && <>③ <Keys k="Mod+Y" /> でやり<Ruby rt="なお">直</Ruby>す（もう<Ruby rt="いちど">一度</Ruby><Ruby rt="き">消</Ruby>える）<span className="block text-sm font-normal text-slate-400"><T>③ Redo (it disappears again)</T></span></>}
      </p>
      <Textarea value={v} onChange={(e) => change(e.target.value)} className="text-xl h-24" />
    </div>
  )
}

function HalfWidth({ onDone, award }: TaskProps) {
  const [target] = useState(() => ["tanaka.k@example.jp", "2025c017", "03-1234-5678", "guest2025"][Math.floor(Math.random() * 4)])
  const [v, setV] = useState("")
  const [composing, setComposing] = useState(false)
  const problem = v && v.trim() !== target ? (composing ? `日本語モードになっているよ。「半角/全角」キーで切り替えよう / ${tx("Switch to English mode")}` : halfWidthProblem(v)) : null
  return (
    <div className="space-y-3">
      <p className="text-slate-600"><Ruby rt="はんかく">半角</Ruby>で<Ruby rt="う">打</Ruby>とう：<span className="font-mono font-bold text-2xl text-slate-800">{target}</span><span className="block text-sm text-slate-400"><T>Type it in half-width</T></span></p>
      <Input
        value={v}
        autoFocus
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        onChange={(e) => {
          setV(e.target.value)
          if (e.target.value.trim() === target) { award("halfwidth"); onDone() }
        }}
        className="h-14 text-2xl font-mono"
      />
      <Warn>{problem}</Warn>
    </div>
  )
}

function Katakana({ onDone, award }: TaskProps) {
  const [target] = useState(() => [
    { k: "マリア", r: "maria" }, { k: "アンナ", r: "anna" }, { k: "ラム", r: "ramu" }, { k: "ジョン", r: "jonn" }, { k: "チャン", r: "tyann" },
  ][Math.floor(Math.random() * 5)])
  const [v, setV] = useState("")
  const [composing, setComposing] = useState(false)
  const problem = v && !composing && v.trim() !== target.k ? katakanaProblem(v) : null
  return (
    <div className="space-y-3">
      <p className="text-slate-600">カタカナで<Ruby rt="う">打</Ruby>とう：<span className="font-bold text-2xl text-slate-800">{target.k}</span> <span className="text-sm text-slate-400">（{target.r} → スペース）</span><span className="block text-sm text-slate-400"><T>Type it in katakana</T></span></p>
      <Input
        value={v}
        autoFocus
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        onChange={(e) => {
          setV(e.target.value)
          if (e.target.value.trim() === target.k) { award("katakana"); onDone() }
        }}
        className="h-14 text-2xl"
      />
      <Warn>{problem}</Warn>
    </div>
  )
}

function Save({ onDone, award }: TaskProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isMod(e) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        award("save")
        onDone()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [award, onDone])
  return <p className="text-xl text-center py-6">いま<Ruby rt="さくせいちゅう">作成中</Ruby>の<Ruby rt="ぶんしょ">文書</Ruby>を<Ruby rt="ほぞん">保存</Ruby>しよう → <Keys k="Mod+S" /><span className="block text-base text-slate-400 mt-1"><T>Save the document you are working on</T></span></p>
}

function Print({ onDone, award }: TaskProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isMod(e) && e.key.toLowerCase() === "p") {
        e.preventDefault()
        award("print")
        onDone()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [award, onDone])
  return <p className="text-xl text-center py-6"><Ruby rt="いんさつ">印刷</Ruby>の<Ruby rt="がめん">画面</Ruby>を<Ruby rt="ひら">開</Ruby>こう → <Keys k="Mod+P" /><span className="block text-base text-slate-400 mt-1"><T>Open the print screen</T></span></p>
}

function TabFields({ onDone, award }: TaskProps) {
  const t = useT()
  const [vals, setVals] = useState(["", "", ""])
  const usedTab = useRef(0)
  const answers = ["3", "12", "2026"]
  const set = (i: number, v: string) => {
    const next = vals.map((x, j) => (j === i ? v : x))
    setVals(next)
    if (next.every((x, j) => x.trim() === answers[j])) {
      if (usedTab.current >= 2) award("tab")
      onDone()
    }
  }
  return (
    <div className="space-y-3">
      <p className="text-slate-600">マウスを<Ruby rt="つか">使</Ruby>わずに、<Keys k="Tab" /> で<Ruby rt="つぎ">次</Ruby>の<Ruby rt="らん">欄</Ruby>へ<Ruby rt="い">移</Ruby>ろう：<b>3 → 12 → 2026</b><span className="block text-sm text-slate-400"><T>Without the mouse, move to the next field with Tab</T></span></p>
      <div className="flex gap-3">
        {[`月 / ${t("Month")}`, `日 / ${t("Day")}`, `年 / ${t("Year")}`].map((ph, i) => (
          <Input key={i} autoFocus={i === 0} placeholder={ph} value={vals[i]} onChange={(e) => set(i, e.target.value)} onKeyDown={(e) => { if (e.key === "Tab") usedTab.current++ }} className="h-14 text-xl text-center" />
        ))}
      </div>
    </div>
  )
}

const FIND_WORDS = ["駐輪場", "健康診断", "給料日", "制服"]
function Find({ onDone, award }: TaskProps) {
  const [answerIdx] = useState(() => Math.floor(Math.random() * FIND_WORDS.length))
  const used = useRef(false)
  const [warn, setWarn] = useState("")
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (isMod(e) && e.key.toLowerCase() === "f") used.current = true }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  const lines = Array.from({ length: 16 }, (_, i) => `ルール${i + 1}：${i === 11 ? `${FIND_WORDS[answerIdx]}については、事務所の掲示板を見てください。` : "決められた時間を守り、職場をきれいに使いましょう。"}`)
  return (
    <div className="space-y-3">
      <p className="text-slate-600"><Keys k="Mod+F" /> で「<b>{FIND_WORDS[answerIdx]}</b>」を<Ruby rt="さが">探</Ruby>して、それが<Ruby rt="なんばん">何番</Ruby>のルールか<Ruby rt="こた">答</Ruby>えよう<span className="block text-sm text-slate-400"><T s="Find 「{word}」 with the find keys and answer which rule number it is" v={{ word: FIND_WORDS[answerIdx] }} /></span></p>
      <div className="max-h-40 overflow-y-auto bg-slate-50 rounded-xl p-3 text-sm space-y-1">{lines.map((l) => <p key={l}>{l}</p>)}</div>
      <div className="flex gap-2 flex-wrap">
        {[4, 9, 12, 15].map((n) => (
          <button key={n} className="border-2 rounded-lg px-4 py-2 font-bold hover:bg-slate-50" onClick={() => {
            if (n !== 12) return setWarn(`ちがうよ / ${tx("Not quite")}`)
            if (!used.current) return setWarn(`正解！でも Ctrl+F を使って探してみよう / ${tx("Right! But try finding it with Ctrl+F")}`)
            award("find")
            onDone()
          }}>ルール{n}</button>
        ))}
      </div>
      <Warn>{warn}</Warn>
    </div>
  )
}

function RightClick({ onDone, award }: TaskProps) {
  const t = useT()
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [warn, setWarn] = useState("")
  return (
    <div className="space-y-3">
      <p className="text-slate-600"><Ruby rt="した">下</Ruby>の<Ruby rt="しゃしん">写真</Ruby>を「<Ruby rt="ほぞん">保存</Ruby>」したい。ボタンはないよ…<span className="block text-sm text-slate-400"><T>You want to save the picture below. There is no button...</T></span></p>
      <div className="relative h-36 rounded-xl bg-gradient-to-br from-sky-300 to-emerald-300 flex items-center justify-center text-5xl select-none"
        onContextMenu={(e) => { e.preventDefault(); const b = e.currentTarget.getBoundingClientRect(); setMenu({ x: e.clientX - b.left, y: e.clientY - b.top }); award("rightclick") }}
        onClick={() => { setMenu(null); setWarn(`左クリックでは何も出ないね。ルール3！ / ${tx("Left-click shows nothing. Rule 3!")}`) }}
      >
        🏔️
        {menu && (
          <div className="absolute z-10 bg-white text-sm rounded-lg shadow-xl border py-1 w-44 text-left" style={{ left: menu.x, top: menu.y }} onClick={(e) => e.stopPropagation()}>
            {["新しいタブで画像を開く", "名前を付けて画像を保存", "画像をコピー"].map((m) => (
              <button key={m} className="w-full px-3 py-2 text-left hover:bg-blue-50" onClick={() => { setMenu(null); if (m.includes("保存")) onDone(); else setWarn(`「${m}」ではないよ / ${t("Not 「{m}」", { m })}`) }}>{m}</button>
            ))}
          </div>
        )}
      </div>
      <Warn>{warn}</Warn>
    </div>
  )
}

export const WARMUP_TASKS: WarmupTask[] = [
  { id: "copypaste", skills: ["copy", "paste"], title: <>コピーして<Ruby rt="はりつ">貼り付</Ruby>け</>, en: tx("Copy and paste"), Component: CopyPaste },
  { id: "cut", skills: ["cut"], title: <><Ruby rt="き">切</Ruby>り<Ruby rt="と">取</Ruby>って<Ruby rt="いどう">移動</Ruby></>, en: tx("Cut and move"), Component: Cut },
  { id: "undoredo", skills: ["selectall", "undo", "redo"], title: <><Ruby rt="け">消</Ruby>して・<Ruby rt="もど">戻</Ruby>して・やり<Ruby rt="なお">直</Ruby>す</>, en: tx("Delete, undo, redo"), Component: UndoRedo },
  { id: "halfwidth", skills: ["halfwidth"], title: <><Ruby rt="はんかく">半角</Ruby>で<Ruby rt="にゅうりょく">入力</Ruby></>, en: tx("Type in half-width"), Component: HalfWidth },
  { id: "katakana", skills: ["katakana"], title: <>カタカナで<Ruby rt="にゅうりょく">入力</Ruby></>, en: tx("Type in katakana"), Component: Katakana },
  { id: "save", skills: ["save"], title: <><Ruby rt="ほぞん">保存</Ruby>のショートカット</>, en: tx("Shortcut to save"), Component: Save },
  { id: "print", skills: ["print"], title: <><Ruby rt="いんさつ">印刷</Ruby>のショートカット</>, en: tx("Shortcut to print"), Component: Print },
  { id: "tab", skills: ["tab"], title: <>Tab で<Ruby rt="つぎ">次</Ruby>の<Ruby rt="らん">欄</Ruby>へ</>, en: tx("Tab to the next field"), Component: TabFields },
  { id: "find", skills: ["find"], title: <>ページ<Ruby rt="ない">内</Ruby><Ruby rt="けんさく">検索</Ruby></>, en: tx("Find on page"), Component: Find },
  { id: "rightclick", skills: ["rightclick"], title: <><Ruby rt="みぎ">右</Ruby>クリック</>, en: tx("Right-click"), Component: RightClick },
]

// まだ合格していないスキルを含む問題を優先して、n 問えらぶ
export function pickTasks(mastered: Record<string, string>, n = 3): WarmupTask[] {
  const shuffle = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map((p) => p[1])
  const todo = shuffle(WARMUP_TASKS.filter((t) => t.skills.some((s) => !mastered[s])))
  const done = shuffle(WARMUP_TASKS.filter((t) => t.skills.every((s) => mastered[s])))
  return [...todo, ...done].slice(0, n)
}
