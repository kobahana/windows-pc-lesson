"use client"

// L10 ミッション1：初めて見るメモアプリ「PocketMemo」
// 手順は教えない。目標だけを見せて、5つのルールで自分で探す。
// ・太字 → 文字を選ぶと出てくる小さなツールバー（ルール1・2）
// ・保存 → ⋮ メニューの中 or Ctrl+S（ルール4）
// ・削除 → メモを右クリック（ルール3）
// ・元に戻す → Ctrl+Z or 「元に戻す」（ルール5）

import { useEffect, useRef, useState } from "react"
import { Card, MissionFrame, RuleBadge, Ruby, Warn, useAward, useStepFlow } from "@/components/lesson/kit"
import { HoverIcon } from "@/components/lessons/l6/five-rules"
import { Bold, Italic, Link2, Palette, MoreVertical, StickyNote, Search, Pin, Plus, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx, useT } from "@/lib/i18n"

const LESSON_ID = 11

const GOALS: { goal: React.ReactNode; en: string; rule: number }[] = [
  { goal: <>「<Ruby rt="ぎゅうにゅう">牛乳</Ruby>」だけを<Ruby rt="ふとじ">太字</Ruby>にしよう</>, en: tx("Make only 「牛乳」 bold"), rule: 1 },
  { goal: <>このメモを<Ruby rt="ほぞん">保存</Ruby>しよう</>, en: tx("Save this memo"), rule: 4 },
  { goal: <>「<Ruby rt="ふる">古</Ruby>いメモ」を<Ruby rt="さくじょ">削除</Ruby>しよう</>, en: tx("Delete 「古いメモ」"), rule: 3 },
  { goal: <>あっ！<Ruby rt="まちが">間違</Ruby>えて<Ruby rt="け">消</Ruby>しちゃった…ということにして、<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>そう</>, en: tx("Oops! Let's say you deleted it by mistake. Bring it back"), rule: 5 },
]

const ITEMS = ["卵", "牛乳", "パン", "りんご", "コーヒー"]

export function MemoAppMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(GOALS.length, onComplete)
  const award = useAward(LESSON_ID)
  const t = useT()
  const [warn, setWarn] = useState<React.ReactNode>(null)
  const [showHint, setShowHint] = useState(false)
  const [bold, setBold] = useState<boolean[]>(ITEMS.map(() => false))
  const [floating, setFloating] = useState<{ x: number; y: number } | null>(null)
  const [saved, setSaved] = useState(false)
  const [menu, setMenu] = useState(false)
  const [notes, setNotes] = useState(["買い物リスト", "古いメモ", "バイトのシフト"])
  const [ctx, setCtx] = useState<{ note: string; x: number; y: number } | null>(null)
  const [snack, setSnack] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setWarn(null); setShowHint(false) }, [step])

  // 文字を選ぶと小さなツールバーが出る
  const onBodyMouseUp = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !bodyRef.current?.contains(sel.anchorNode)) {
      setFloating(null)
      return
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    const box = wrapRef.current!.getBoundingClientRect()
    setFloating({ x: rect.left - box.left + rect.width / 2, y: rect.top - box.top - 44 })
  }
  const applyBold = () => {
    const text = window.getSelection()?.toString() ?? ""
    // 選んだ項目がすべて太字なら解除、そうでなければ太字にする
    const picked = ITEMS.map((it) => text.includes(it))
    const allOn = picked.every((p, i) => !p || bold[i])
    const next = bold.map((b, i) => (picked[i] ? !allOn : b))
    setBold(next)
    setSaved(false)
    setFloating(null)
    window.getSelection()?.removeAllRanges()
    if (step !== 0) return
    if (next[1] && next.every((b, i) => i === 1 || !b)) succeed("太字にできた！")
    else if (next.some((b, i) => i !== 1 && b)) setWarn(`「牛乳」だけを太字にしよう。ほかの文字は、もう一度選んで同じボタンを押すと元に戻るよ / ${tx("Make only 「牛乳」 bold. For other words, select them again and press the same button to undo")}`)
  }

  const save = () => {
    setMenu(false)
    setSaved(true)
    if (step === 1) succeed("保存できた！")
  }
  // Ctrl+S / Ctrl+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      if (k === "s") {
        e.preventDefault()
        award("save")
        save()
      }
      if (k === "z" && snack) {
        e.preventDefault()
        award("undo")
        restore()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const remove = (note: string) => {
    setCtx(null)
    if (note !== "古いメモ") {
      setWarn(`「${note}」は消さないで！消したいのは「古いメモ」だよ / ${t("Don't delete 「{note}」! Delete 「古いメモ」", { note })}`)
      return
    }
    setNotes((n) => n.filter((x) => x !== note))
    setSnack(note)
    if (step === 2) succeed("削除できた！")
  }
  const restore = () => {
    if (!snack) return
    setNotes((n) => (n.includes(snack) ? n : [...n.slice(0, 1), snack, ...n.slice(1)]))
    setSnack(null)
    if (step === 3) succeed("元に戻せた！")
  }

  return (
    <MissionFrame
      wide
      message={<>このアプリは<Ruby rt="はじ">初</Ruby>めて<Ruby rt="み">見</Ruby>るね。<Ruby rt="やりかた">やり方</Ruby>は<Ruby rt="おし">教</Ruby>えないよ！<b>5つのルール</b>を<Ruby rt="おも">思</Ruby>い<Ruby rt="だ">出</Ruby>して、<Ruby rt="じぶん">自分</Ruby>で<Ruby rt="さが">探</Ruby>してみよう。<span className="block text-sm text-muted-foreground mt-1"><T>No instructions — use the 5 rules to figure it out.</T></span></>}
      step={step}
      total={GOALS.length}
      showSuccess={showSuccess}
      successMsg={successMsg}
    >
      <div className="space-y-4">
        <Card className="flex flex-col md:flex-row md:items-center gap-3 border-indigo-300 bg-indigo-50/50">
          <p className="text-xl font-bold text-slate-800 flex-1">🎯 {GOALS[step].goal}<span className="block text-sm font-normal text-slate-500"><T>{GOALS[step].en}</T></span></p>
          {showHint ? <RuleBadge n={GOALS[step].rule} /> : (
            <button onClick={() => setShowHint(true)} className="flex items-center gap-1.5 text-sm font-bold text-indigo-700 border-2 border-indigo-200 rounded-full px-4 py-1.5 bg-white hover:bg-indigo-50">
              <Lightbulb className="w-4 h-4" /> <Ruby rt="こま">困</Ruby>ったらヒント
            </button>
          )}
        </Card>

        {/* PocketMemo 本体 */}
        <div ref={wrapRef} className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-slate-700 bg-[#1f2330] text-slate-100 select-none" onClick={() => { setCtx(null) }}>
          <div className="flex items-center gap-3 px-4 py-2 bg-[#171a24] border-b border-slate-700">
            <StickyNote className="w-5 h-5 text-yellow-300" />
            <span className="font-bold tracking-wide">PocketMemo</span>
            <div className="ml-auto flex items-center gap-2 bg-[#2a2f3f] rounded-full px-3 py-1 text-sm text-slate-400"><Search className="w-4 h-4" /> <span className="hidden md:inline">メモを検索</span></div>
          </div>
          <div className="flex min-h-80">
            <div className="w-44 md:w-56 border-r border-slate-700 p-2 space-y-1">
              <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-[#2a2f3f]"><Plus className="w-4 h-4" /> <Ruby rt="あたら">新</Ruby>しいメモ</button>
              {notes.map((n) => (
                <div
                  key={n}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    award("rightclick")
                    const box = wrapRef.current!.getBoundingClientRect()
                    setCtx({ note: n, x: e.clientX - box.left, y: e.clientY - box.top })
                  }}
                  onClick={() => { if (n === "古いメモ" && step === 2) setWarn(`クリックでは開くだけ。消すには…？ / ${tx("Clicking only opens it. To delete it...?")}`) }}
                  className={cn("rounded-lg px-3 py-2 text-sm cursor-default", n === "買い物リスト" ? "bg-[#343b52] text-white" : "text-slate-300 hover:bg-[#2a2f3f]")}
                >
                  {n === "バイトのシフト" && <Pin className="inline w-3 h-3 mr-1 text-yellow-300" />}{n}
                </div>
              ))}
            </div>
            <div className="flex-1 p-5 relative">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold">買い物リスト</h3>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", saved ? "bg-emerald-800 text-emerald-200" : "bg-slate-700 text-slate-300")}>{saved ? "保存済み" : "● 未保存"}</span>
                <div className="ml-auto relative [&_button]:text-slate-300 [&_button:hover]:bg-[#2a2f3f]">
                  <HoverIcon icon={<MoreVertical className="w-5 h-5" />} name="その他" onClick={() => setMenu(!menu)} />
                  {menu && (
                    <div className="absolute right-0 top-full z-30 bg-[#2a2f3f] border border-slate-600 rounded-lg shadow-xl py-1 w-40 text-sm">
                      {["複製", "保存", "共有", "印刷"].map((m) => (
                        <button key={m} className="w-full text-left px-4 py-2 !text-slate-100" onClick={(e) => { e.stopPropagation(); if (m === "保存") save(); else { setMenu(false); setWarn(`「${m}」ではないよ / ${t("Not 「{m}」", { m })}`) } }}>{m}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div ref={bodyRef} onMouseUp={onBodyMouseUp} className="space-y-1 text-lg select-text cursor-text">
                {ITEMS.map((it, i) => (
                  <p key={it}>・<span className={cn(bold[i] && "font-black text-yellow-200")}>{it}</span></p>
                ))}
              </div>
            </div>
          </div>
          {floating && (
            <div className="absolute z-30 flex gap-0.5 bg-[#0f1118] rounded-lg px-1 py-1 shadow-xl -translate-x-1/2 [&_button]:text-slate-100 [&_button:hover]:bg-slate-700" style={{ left: floating.x, top: floating.y }} onMouseDown={(e) => e.preventDefault()}>
              <HoverIcon icon={<Bold className="w-4 h-4" />} name="太字" onClick={applyBold} />
              <HoverIcon icon={<Italic className="w-4 h-4" />} name="斜体" onClick={() => setWarn(`それは斜体（ななめの文字）だよ / ${tx("That is italic (slanted letters)")}`)} />
              <HoverIcon icon={<Palette className="w-4 h-4" />} name="文字の色" onClick={() => setWarn(`それは文字の色だよ / ${tx("That is text color")}`)} />
              <HoverIcon icon={<Link2 className="w-4 h-4" />} name="リンク" onClick={() => setWarn(`それはリンクだよ / ${tx("That is a link")}`)} />
            </div>
          )}
          {ctx && (
            <div className="absolute z-30 bg-[#2a2f3f] border border-slate-600 rounded-lg shadow-xl py-1 w-40 text-sm" style={{ left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()}>
              <button className="w-full text-left px-4 py-2 hover:bg-[#343b52]" onClick={() => { setCtx(null); setWarn(`ピン留めではないよ / ${tx("Not 「ピン留め」 (pin)")}`) }}>ピン留め</button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#343b52]" onClick={() => { setCtx(null); setWarn(`名前の変更ではないよ / ${tx("Not 「名前の変更」 (rename)")}`) }}>名前の変更</button>
              <button className="w-full text-left px-4 py-2 hover:bg-[#343b52] text-red-300" onClick={() => remove(ctx.note)}>削除</button>
            </div>
          )}
          {snack && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-100 text-slate-900 rounded-lg shadow-xl px-4 py-2 flex items-center gap-4 text-sm">
              「{snack}」を削除しました
              <button className="font-bold text-indigo-700" onClick={(e) => { e.stopPropagation(); restore() }}>元に戻す</button>
            </div>
          )}
        </div>
        <Warn>{warn}</Warn>
      </div>
    </MissionFrame>
  )
}
