"use client"

// L7 ミッション1：アイコンを読もう
// ① 形から予想する（選択肢から意味を選ぶ）
// ② ツールバーで探す（マウスを乗せて名前を確かめる）
// ③ アイコンの「文法」はどのアプリでも同じ

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, MissionFrame, RuleBadge, Ruby, Tip, Warn, useStepFlow } from "@/components/lesson/kit"
import { DocToolbar, TOOLS, type ToolId } from "./doc-editor"
import {
  AlignCenter, AlignLeft, AlignRight, List, ListOrdered, Bold, Undo2, Redo2, ChevronDown, MoreVertical, Menu, Link2, Printer, Trash2, Italic, Underline,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx } from "@/lib/i18n"

const GUESS = [
  {
    icon: <AlignCenter className="w-16 h-16" />,
    choices: ["文字を真ん中にそろえる", "文字を消す", "文字を大きくする"],
    answer: 0,
    why: <><Ruby rt="よこせん">横線</Ruby>が<Ruby rt="ま">真</Ruby>ん<Ruby rt="なか">中</Ruby>に<Ruby rt="よ">寄</Ruby>っている → <Ruby rt="まん">真ん</Ruby><Ruby rt="なか">中</Ruby>ぞろえ</>,
    whyEn: tx("Lines gathered in the middle → center align"),
  },
  {
    icon: <List className="w-16 h-16" />,
    choices: ["表をつくる", "点をつけて1行ずつ並べる（箇条書き）", "印刷する"],
    answer: 1,
    why: <><Ruby rt="てん">点</Ruby>（●）と<Ruby rt="せん">線</Ruby> → <Ruby rt="かじょうが">箇条書</Ruby>き。<Ruby rt="すうじ">数字</Ruby>と<Ruby rt="せん">線</Ruby>なら<Ruby rt="ばんごう">番号</Ruby><Ruby rt="つ">付</Ruby>き</>,
    whyEn: tx("Dots (●) and lines → bullet list. Numbers and lines → numbered list"),
  },
  {
    icon: <Bold className="w-16 h-16" />,
    choices: ["文字を太くする（太字）", "英語にする", "ブックマークする"],
    answer: 0,
    why: <>Bold（ボールド）の B。<Ruby rt="ふと">太</Ruby>い<Ruby rt="もじ">文字</Ruby>で<Ruby rt="か">書</Ruby>いてある</>,
    whyEn: tx("B for Bold. It is written in thick letters"),
  },
  {
    icon: <Undo2 className="w-16 h-16" />,
    choices: ["次へ進む", "ページを新しくする", "ひとつ前に戻す"],
    answer: 2,
    why: <><Ruby rt="ひだり">左</Ruby>に<Ruby rt="もど">戻</Ruby>る<Ruby rt="やじるし">矢印</Ruby> → <Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>す。<Ruby rt="みぎ">右</Ruby><Ruby rt="む">向</Ruby>きはやり<Ruby rt="なお">直</Ruby>し</>,
    whyEn: tx("An arrow going back to the left → undo. Pointing right → redo"),
  },
]

const FIND: { q: React.ReactNode; en: string; answer: ToolId }[] = [
  { q: <><Ruby rt="ぶんしょう">文章</Ruby>を<Ruby rt="みぎ">右</Ruby>にそろえるボタンは？</>, en: tx("Which button aligns text to the right?"), answer: "alignRight" },
  { q: <><Ruby rt="ばんごう">番号</Ruby>（1. 2. 3.）をつけて<Ruby rt="なら">並</Ruby>べるボタンは？</>, en: tx("Which button makes a numbered list (1. 2. 3.)?"), answer: "numbered" },
  { q: <><Ruby rt="もじ">文字</Ruby>を<Ruby rt="おお">大</Ruby>きくするボタンは？</>, en: tx("Which button makes text bigger?"), answer: "sizeUp" },
  { q: <><Ruby rt="もじ">文字</Ruby>の<Ruby rt="した">下</Ruby>に<Ruby rt="せん">線</Ruby>を<Ruby rt="ひ">引</Ruby>くボタンは？</>, en: tx("Which button underlines text?"), answer: "underline" },
  { q: <>「<Ruby rt="き">記</Ruby>」を<Ruby rt="まん">真ん</Ruby><Ruby rt="なか">中</Ruby>にしたい。どのボタン？</>, en: tx("You want 「記」 in the center. Which button?"), answer: "alignCenter" },
  { q: <><Ruby rt="まちが">間違</Ruby>えた！ひとつ<Ruby rt="まえ">前</Ruby>に<Ruby rt="もど">戻</Ruby>したいときは？</>, en: tx("Oops, a mistake! How do you go back one step?"), answer: "undo" },
]

const GRAMMAR: { icons: React.ReactNode; meaning: React.ReactNode; en: string }[] = [
  { icons: <><AlignLeft /><AlignCenter /><AlignRight /></>, meaning: <><Ruby rt="よこせん">横線</Ruby>の<Ruby rt="よ">寄</Ruby>り<Ruby rt="かた">方</Ruby> → <Ruby rt="もじ">文字</Ruby>のそろえ<Ruby rt="かた">方</Ruby></>, en: tx("Where the lines lean → how text is aligned") },
  { icons: <><Bold /><Italic /><Underline /></>, meaning: <>B・I・U → <Ruby rt="もじ">文字</Ruby>のかざり（<Ruby rt="ふとじ">太字</Ruby>・<Ruby rt="しゃたい">斜体</Ruby>・<Ruby rt="かせん">下線</Ruby>）</>, en: tx("B, I, U → text style (bold, italic, underline)") },
  { icons: <><List /><ListOrdered /></>, meaning: <>● や 1. と<Ruby rt="せん">線</Ruby> → リスト</>, en: tx("● or 1. with lines → a list") },
  { icons: <><Undo2 /><Redo2 /></>, meaning: <><Ruby rt="まる">丸</Ruby>い<Ruby rt="やじるし">矢印</Ruby> → <Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>す・やり<Ruby rt="なお">直</Ruby>し</>, en: tx("Round arrows → undo and redo") },
  { icons: <ChevronDown />, meaning: <>▼ →「ほかにも<Ruby rt="えら">選</Ruby>べるよ」</>, en: tx('▼ → "there are more choices"') },
  { icons: <><MoreVertical /><Menu /></>, meaning: <>⋮ ☰ → かくれたメニュー（スマホも<Ruby rt="おな">同</Ruby>じ）</>, en: tx("⋮ ☰ → a hidden menu (same on phones)") },
  { icons: <><Link2 /><Printer /><Trash2 /></>, meaning: <>リンク・<Ruby rt="いんさつ">印刷</Ruby>・<Ruby rt="さくじょ">削除</Ruby>（ゴミ<Ruby rt="ばこ">箱</Ruby>）</>, en: tx("Link, print, delete (trash can)") },
]

export function IconReadingMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(3, onComplete)
  const [warn, setWarn] = useState<React.ReactNode>(null)
  const [gi, setGi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [fi, setFi] = useState(0)
  const [flash, setFlash] = useState<ToolId | undefined>()
  useEffect(() => { setWarn(null) }, [step])

  const pickGuess = (i: number) => {
    if (picked !== null) return
    setPicked(i)
  }
  const nextGuess = () => {
    setPicked(null)
    if (gi + 1 >= GUESS.length) succeed("予想の名人！")
    else setGi(gi + 1)
  }

  const onTool = (id: ToolId) => {
    if (id === FIND[fi].answer) {
      setWarn(null)
      setFlash(id)
      setTimeout(() => {
        setFlash(undefined)
        if (fi + 1 >= FIND.length) succeed("ツールバー名人！")
        else setFi((n) => n + 1)
      }, 600)
    } else {
      const name = TOOLS.find((t) => t.id === id)?.name ?? ""
      setWarn(<>それは「{name}」だよ。マウスを<Ruby rt="の">乗</Ruby>せると<Ruby rt="なまえ">名前</Ruby>が<Ruby rt="で">出</Ruby>るよ<span className="block text-sm font-normal"><T s="That is 「{name}」. Put the mouse on an icon to see its name." v={{ name }} /></span></>)
    }
  }

  const g = GUESS[gi]
  const messages: React.ReactNode[] = [
    <>このアイコン、<Ruby rt="なに">何</Ruby>をするボタンだと<Ruby rt="おも">思</Ruby>う？<Ruby rt="かたち">形</Ruby>をよく<Ruby rt="み">見</Ruby>て<Ruby rt="よそう">予想</Ruby>してみよう！<span className="block text-sm text-muted-foreground mt-1"><T>Guess what the icon does from its shape.</T></span></>,
    <>Googleドキュメントのツールバーだよ。<Ruby rt="しつもん">質問</Ruby>のボタンを<Ruby rt="さが">探</Ruby>してクリックしてね。<span className="block text-sm text-muted-foreground mt-1"><T>Find the button in the Google Docs toolbar.</T></span></>,
    <>アイコンの<Ruby rt="かたち">形</Ruby>にはルールがあるよ。Word でも Excel でも Gmail でも、ほとんど<Ruby rt="おな">同</Ruby>じ！<span className="block text-sm text-muted-foreground mt-1"><T>Icons follow the same rules in almost every app.</T></span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={3} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <Card className="space-y-5">
          <RuleBadge n={2} />
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-700">{g.icon}</div>
          </div>
          <div className="grid gap-3 max-w-md mx-auto">
            {g.choices.map((c, i) => (
              <Button
                key={i}
                variant="outline"
                size="lg"
                onClick={() => pickGuess(i)}
                className={cn(
                  "text-lg h-auto py-3 whitespace-normal",
                  picked !== null && i === g.answer && "border-success bg-success/10 text-success",
                  picked === i && i !== g.answer && "border-amber-400 bg-amber-50",
                )}
              >
                {c}
              </Button>
            ))}
          </div>
          {picked !== null && (
            <div className="text-center space-y-3 animate-fade-in">
              <p className="text-lg font-bold">{picked === g.answer ? "正解！🎉" : "おしい！"}</p>
              <p className="text-slate-600">{g.why}</p>
              <p className="text-sm text-slate-500"><T>{g.whyEn}</T></p>
              <Button size="lg" onClick={nextGuess}>{gi + 1 >= GUESS.length ? "つぎへ" : "つぎの問題"} →</Button>
            </div>
          )}
          <p className="text-center text-sm text-slate-400">{gi + 1} / {GUESS.length}</p>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card className="text-center">
            <p className="text-sm text-slate-400">{fi + 1} / {FIND.length}</p>
            <p className="text-xl font-bold text-slate-800">{FIND[fi].q}</p>
            <p className="text-sm text-slate-400"><T>{FIND[fi].en}</T></p>
          </Card>
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-3 overflow-x-auto">
            <DocToolbar onAction={onTool} size={11} flash={flash} />
          </div>
          <Warn>{warn}</Warn>
          <Tip>わからないときは、アイコンにマウスを<Ruby rt="の">乗</Ruby>せて1<Ruby rt="びょう">秒</Ruby><Ruby rt="ま">待</Ruby>とう。<Ruby rt="ほんもの">本物</Ruby>のGoogleドキュメントでも<Ruby rt="なまえ">名前</Ruby>が<Ruby rt="で">出</Ruby>るよ。<span className="block text-sm text-slate-500 mt-1"><T>If you don't know, put the mouse on the icon and wait one second. The name appears in the real Google Docs too.</T></span></Tip>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <p className="font-bold text-lg text-slate-800">アイコンの<Ruby rt="ぶんぽう">文法</Ruby> / <T>Icon grammar</T></p>
            {GRAMMAR.map((row, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                <div className="flex gap-1 text-slate-700 [&>svg]:w-6 [&>svg]:h-6 w-28 shrink-0">{row.icons}</div>
                <p className="text-slate-700">{row.meaning}<span className="block text-sm text-slate-400"><T>{row.en}</T></span></p>
              </div>
            ))}
          </Card>
          <div className="text-center">
            <Button size="lg" className="text-lg px-10" onClick={() => succeed("覚えた！")}>おぼえた！ / <T>Got it</T></Button>
          </div>
        </div>
      )}
    </MissionFrame>
  )
}
