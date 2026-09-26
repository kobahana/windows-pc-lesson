"use client"

// L6 ミッション4：どのアプリにも共通する「5つのルール」
// 1 選んでから操作 / 2 アイコンを予想して確かめる / 3 迷ったら右クリック
// 4 メニューの場所 / 5 失敗したら Ctrl+Z

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, FIVE_RULES, Keys, MissionFrame, RuleBadge, Ruby, Tip, Warn, useAward, useStepFlow } from "@/components/lesson/kit"
import { Bold, Printer, Trash2, Search, Settings, Share2, Undo2, FileText, MoreVertical, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx } from "@/lib/i18n"

const LESSON_ID = 7

// マウスを乗せると名前が出るボタン（ルール2）
export function HoverIcon({
  icon,
  name,
  onClick,
  className,
  active,
}: {
  icon: React.ReactNode
  name: string
  onClick?: () => void
  className?: string
  active?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className={cn(
          "p-2 rounded-md hover:bg-slate-200 text-slate-700 transition-colors",
          active && "bg-blue-100 text-blue-700",
          className,
        )}
        aria-label={name}
      >
        {icon}
      </button>
      {hover && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-30 whitespace-nowrap bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded pointer-events-none">
          {name}
        </span>
      )}
    </span>
  )
}

const ICON_QUIZ = [
  { q: <><Ruby rt="いんさつ">印刷</Ruby>するボタンは？</>, en: tx("Print"), answer: "印刷" },
  { q: <>ゴミ<Ruby rt="ばこ">箱</Ruby>に<Ruby rt="す">捨</Ruby>てる（<Ruby rt="さくじょ">削除</Ruby>）ボタンは？</>, en: tx("Delete"), answer: "削除" },
  { q: <><Ruby rt="せってい">設定</Ruby>を<Ruby rt="か">変</Ruby>えるボタンは？</>, en: tx("Settings"), answer: "設定" },
]
const QUIZ_ICONS = [
  { name: "検索", icon: <Search className="w-7 h-7" /> },
  { name: "印刷", icon: <Printer className="w-7 h-7" /> },
  { name: "共有", icon: <Share2 className="w-7 h-7" /> },
  { name: "削除", icon: <Trash2 className="w-7 h-7" /> },
  { name: "設定", icon: <Settings className="w-7 h-7" /> },
  { name: "元に戻す", icon: <Undo2 className="w-7 h-7" /> },
]

const UNDO_TEXT = "来週の月曜日、10時から会議があります。資料は前日までに共有してください。"

export function FiveRulesMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(6, onComplete)
  const award = useAward(LESSON_ID)
  const [warn, setWarn] = useState<React.ReactNode>(null)
  useEffect(() => { setWarn(null) }, [step])

  // ルール1
  const [bolded, setBolded] = useState(false)
  const sentenceRef = useRef<HTMLParagraphElement>(null)
  const clickBold = () => {
    const sel = window.getSelection()
    const text = sel?.toString() ?? ""
    const inside = sel && sel.anchorNode && sentenceRef.current?.contains(sel.anchorNode)
    if (!text || !inside) {
      setWarn(<>何も<Ruby rt="えら">選</Ruby>ばれていないよ。<Ruby rt="さき">先</Ruby>に「<Ruby rt="たいせつ">大切</Ruby>」をマウスでなぞって<Ruby rt="えら">選</Ruby>んでね / <T>Select first!</T></>)
      return
    }
    if (text.includes("大切") && text.length <= 4) {
      setBolded(true)
      sel.removeAllRanges()
      succeed("選んでから操作！")
    } else {
      setWarn(<>「<Ruby rt="たいせつ">大切</Ruby>」だけを<Ruby rt="えら">選</Ruby>んでね（<Ruby rt="いま">今</Ruby>：「{text}」）</>)
    }
  }

  // ルール2
  const [quizIndex, setQuizIndex] = useState(0)
  const pickIcon = (name: string) => {
    if (name === ICON_QUIZ[quizIndex].answer) {
      setWarn(null)
      if (quizIndex + 1 >= ICON_QUIZ.length) succeed("アイコン名人！")
      else setQuizIndex((i) => i + 1)
    } else {
      setWarn(<>それは「{name}」だよ。マウスを<Ruby rt="の">乗</Ruby>せると<Ruby rt="なまえ">名前</Ruby>が<Ruby rt="で">出</Ruby>るよ</>)
    }
  }

  // ルール3
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [fileName, setFileName] = useState("報告書")
  const [leftClicks, setLeftClicks] = useState(0)

  // ルール4
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [menuTask, setMenuTask] = useState(0)
  const MENU_TASKS = [
    { q: <>「<Ruby rt="いんさつ">印刷</Ruby>」はどのメニューにある？<Ruby rt="さが">探</Ruby>してクリックしよう</>, answer: "印刷" },
    { q: <>「<Ruby rt="なまえ">名前</Ruby>を<Ruby rt="つ">付</Ruby>けて<Ruby rt="ほぞん">保存</Ruby>」を<Ruby rt="さが">探</Ruby>そう</>, answer: "名前を付けて保存" },
    { q: <><Ruby rt="みぎうえ">右上</Ruby>の <MoreVertical className="inline w-4 h-4" />（<Ruby rt="てん">点</Ruby>3つ）の<Ruby rt="なか">中</Ruby>から「ヘルプ」を<Ruby rt="さが">探</Ruby>そう</>, answer: "ヘルプ" },
  ]
  const MENUS: Record<string, string[]> = {
    ファイル: ["新規作成", "開く", "名前を付けて保存", "印刷", "閉じる"],
    編集: ["元に戻す", "切り取り", "コピー", "貼り付け", "すべて選択"],
    表示: ["拡大", "縮小", "全画面表示"],
    more: ["設定", "ヘルプ", "ログアウト"],
  }
  const pickMenuItem = (item: string) => {
    setOpenMenu(null)
    if (item === MENU_TASKS[menuTask].answer) {
      setWarn(null)
      if (menuTask + 1 >= MENU_TASKS.length) succeed("メニュー名人！")
      else setMenuTask((t) => t + 1)
    } else {
      setWarn(<>それは「{item}」。ほかのメニューも<Ruby rt="ひら">開</Ruby>いてみよう</>)
    }
  }
  // Ctrl+P でもOK（印刷のタスク）
  useEffect(() => {
    if (step !== 4) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault()
        award("print")
        if (menuTask === 0) pickMenuItem("印刷")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  // ルール5
  const [undoText, setUndoText] = useState(UNDO_TEXT)
  const [erased, setErased] = useState(false)
  const selectAllRef = useRef(false)
  const redoRef = useRef(false)
  useEffect(() => {
    if (step !== 5) return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (!(e.ctrlKey || e.metaKey)) return
      if (k === "a") selectAllRef.current = true
      if (k === "y" || (k === "z" && e.shiftKey)) redoRef.current = true
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step])
  const onUndoChange = (v: string) => {
    setUndoText(v)
    if (v.trim() === "") {
      setErased(true)
      if (selectAllRef.current) award("selectall")
    } else if (erased && v === UNDO_TEXT) {
      award("undo")
      if (redoRef.current) award("redo")
      succeed("元に戻った！")
    }
  }

  const messages: React.ReactNode[] = [
    <>アプリはたくさんあるけど、<Ruby rt="つか">使</Ruby>い<Ruby rt="かた">方</Ruby>のルールはだいたい<Ruby rt="おな">同</Ruby>じ！この5つを<Ruby rt="おぼ">覚</Ruby>えれば、<Ruby rt="はじ">初</Ruby>めてのアプリもこわくないよ。<span className="block text-sm text-muted-foreground mt-1"><T>5 rules that work in almost every app.</T></span></>,
    <><b>ルール1</b>：パソコンは「<Ruby rt="なに">何</Ruby>に」<Ruby rt="そうさ">操作</Ruby>するかを<Ruby rt="さき">先</Ruby>に<Ruby rt="おし">教</Ruby>えないと<Ruby rt="うご">動</Ruby>かないよ。<span className="block text-sm text-muted-foreground mt-1"><T>Select first, then act.</T></span></>,
    <><b>ルール2</b>：アイコンは<Ruby rt="かたち">形</Ruby>を<Ruby rt="み">見</Ruby>て<Ruby rt="よそう">予想</Ruby>！わからなければ、マウスを<Ruby rt="の">乗</Ruby>せて<Ruby rt="すこ">少</Ruby>し<Ruby rt="ま">待</Ruby>つと<Ruby rt="なまえ">名前</Ruby>が<Ruby rt="で">出</Ruby>るよ。<span className="block text-sm text-muted-foreground mt-1"><T>Guess from the shape, hover to check.</T></span></>,
    <><b>ルール3</b>：ボタンが<Ruby rt="み">見</Ruby>つからないときは<Ruby rt="みぎ">右</Ruby>クリック！そこでできることが<Ruby rt="で">出</Ruby>てくるよ。<span className="block text-sm text-muted-foreground mt-1"><T>Can&apos;t find a button? Right-click!</T></span></>,
    <><b>ルール4</b>：メニューの<Ruby rt="ばしょ">場所</Ruby>はだいたい<Ruby rt="き">決</Ruby>まっているよ。<Ruby rt="ひだりうえ">左上</Ruby>の「ファイル」「<Ruby rt="へんしゅう">編集</Ruby>」、<Ruby rt="みぎうえ">右上</Ruby>の <MoreVertical className="inline w-4 h-4" /> <Menu className="inline w-4 h-4" /> <Settings className="inline w-4 h-4" /> だ！<span className="block text-sm text-muted-foreground mt-1"><T>Menus live in the usual places.</T></span></>,
    <><b>ルール5</b>：<Ruby rt="しっぱい">失敗</Ruby>しても <Keys k="Mod+Z" /> で<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>せる。だから、こわがらずにいろいろ<Ruby rt="ため">試</Ruby>してみよう！<span className="block text-sm text-muted-foreground mt-1"><T>Don&apos;t be afraid — you can always undo.</T></span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={6} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-3">
          {FIVE_RULES.map((r) => (
            <Card key={r.n} className="flex items-center gap-4 py-4">
              <span className="w-12 h-12 rounded-full bg-indigo-600 text-white text-2xl font-bold flex items-center justify-center shrink-0">{r.n}</span>
              <div>
                <p className="text-lg font-bold text-slate-800">{r.title}</p>
                <p className="text-sm text-slate-400"><T>{r.en}</T></p>
              </div>
            </Card>
          ))}
          <div className="text-center pt-2">
            <Button size="lg" className="text-lg px-10" onClick={() => succeed("やってみよう！")}>やってみる！ / <T>Let&apos;s try</T></Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <Card className="space-y-4">
          <RuleBadge n={1} />
          <p className="font-bold text-slate-600">「<Ruby rt="たいせつ">大切</Ruby>」を<Ruby rt="ふとじ">太字</Ruby>にしよう。① マウスでなぞって<Ruby rt="えら">選</Ruby>ぶ → ② <Bold className="inline w-4 h-4" /> ボタン</p>
          <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-2 py-1">
              <HoverIcon icon={<Bold className="w-5 h-5" />} name="太字" onClick={clickBold} />
            </div>
            <p ref={sentenceRef} className="p-5 text-2xl select-text">
              <Ruby rt="あした">明日</Ruby>の<Ruby rt="かいぎ">会議</Ruby>は<span className={cn(bolded && "font-black text-slate-900")}>大切</span>です。
            </p>
          </div>
          <Warn>{warn}</Warn>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-4">
          <RuleBadge n={2} />
          <p className="text-xl font-bold text-slate-800">{ICON_QUIZ[quizIndex].q} <span className="text-sm font-normal text-slate-400"><T>{ICON_QUIZ[quizIndex].en}</T></span></p>
          <div className="flex flex-wrap gap-3 justify-center py-4 bg-slate-50 rounded-xl">
            {QUIZ_ICONS.map((ic) => (
              <HoverIcon key={ic.name} icon={ic.icon} name={ic.name} onClick={() => pickIcon(ic.name)} className="p-3 border-2 border-slate-200 bg-white" />
            ))}
          </div>
          <p className="text-sm text-center text-slate-400">{quizIndex + 1} / {ICON_QUIZ.length}</p>
          <Warn>{warn}</Warn>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-4" >
          <RuleBadge n={3} />
          <p className="font-bold text-slate-600">ファイルの<Ruby rt="なまえ">名前</Ruby>を「<b>報告書_完成</b>」に<Ruby rt="か">変</Ruby>えよう。ボタンはないよ…どうする？</p>
          <div className="relative bg-slate-50 rounded-xl p-8 min-h-48" onClick={() => setMenu(null)}>
            <div
              className="inline-flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-blue-50 cursor-default select-none"
              onClick={(e) => {
                e.stopPropagation()
                setLeftClicks((n) => n + 1)
                if (leftClicks >= 1) setWarn(<><Ruby rt="ひだり">左</Ruby>クリックでは<Ruby rt="なに">何</Ruby>も<Ruby rt="で">出</Ruby>ないね。ルール3を<Ruby rt="おも">思</Ruby>い<Ruby rt="だ">出</Ruby>して！</>)
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                award("rightclick")
                setWarn(null)
                const box = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
                setMenu({ x: e.clientX - box.left, y: e.clientY - box.top })
              }}
            >
              <FileText className="w-14 h-14 text-blue-500" />
              {renaming ? (
                <Input
                  autoFocus
                  value={fileName}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFileName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" || e.nativeEvent.isComposing) return
                    if (fileName.trim() === "報告書_完成") {
                      setRenaming(false)
                      succeed("右クリック名人！")
                    } else {
                      setWarn(<>「報告書_完成」と<Ruby rt="い">入</Ruby>れてね。「_」は <Keys k="Shift+ろ" /> だよ</>)
                    }
                  }}
                  className="h-9 w-40 text-center"
                />
              ) : (
                <span className="text-sm font-bold text-slate-700">{fileName}.docx</span>
              )}
            </div>
            {menu && (
              <div
                className="absolute z-20 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-44 text-sm"
                style={{ left: menu.x, top: menu.y }}
                onClick={(e) => e.stopPropagation()}
              >
                {["開く", "コピー", "名前の変更", "削除", "プロパティ"].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50"
                    onClick={() => {
                      setMenu(null)
                      if (item === "名前の変更") setRenaming(true)
                      else setWarn(<>「{item}」ではないよ。<Ruby rt="なまえ">名前</Ruby>を<Ruby rt="か">変</Ruby>えるのはどれかな？</>)
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Warn>{warn}</Warn>
        </Card>
      )}

      {step === 4 && (
        <Card className="space-y-4">
          <RuleBadge n={4} />
          <p className="text-lg font-bold text-slate-800">{MENU_TASKS[menuTask].q}</p>
          <div className="border-2 border-slate-200 rounded-xl" onMouseLeave={() => setOpenMenu(null)}>
            <div className="flex items-center bg-slate-50 border-b border-slate-200 px-2 rounded-t-xl relative">
              {["ファイル", "編集", "表示"].map((m) => (
                <div key={m} className="relative">
                  <button
                    className={cn("px-3 py-2 text-sm hover:bg-slate-200 rounded", openMenu === m && "bg-slate-200")}
                    onClick={() => setOpenMenu(openMenu === m ? null : m)}
                  >
                    {m}
                  </button>
                  {openMenu === m && (
                    <div className="absolute left-0 top-full z-20 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-48 text-sm">
                      {MENUS[m].map((item) => (
                        <button key={item} className="w-full text-left px-4 py-2 hover:bg-blue-50" onClick={() => pickMenuItem(item)}>{item}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex-1" />
              <div className="relative">
                <HoverIcon icon={<MoreVertical className="w-5 h-5" />} name="その他のオプション" onClick={() => setOpenMenu(openMenu === "more" ? null : "more")} />
                {openMenu === "more" && (
                  <div className="absolute right-0 top-full z-20 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-40 text-sm">
                    {MENUS.more.map((item) => (
                      <button key={item} className="w-full text-left px-4 py-2 hover:bg-blue-50" onClick={() => pickMenuItem(item)}>{item}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="h-28 p-4 text-slate-300">（<Ruby rt="ぶんしょ">文書</Ruby>の<Ruby rt="なかみ">中身</Ruby> / <T>document</T>）</div>
          </div>
          <Warn>{warn}</Warn>
          {menuTask === 0 && <p className="text-sm text-slate-500"><Keys k="Mod+P" /> でも<Ruby rt="いんさつ">印刷</Ruby>できるよ。</p>}
        </Card>
      )}

      {step === 5 && (
        <Card className="space-y-4">
          <RuleBadge n={5} />
          <p className="font-bold text-slate-600">
            {erased
              ? <>ぜんぶ<Ruby rt="き">消</Ruby>えちゃった！<Keys k="Mod+Z" /> で<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>そう</>
              : <>① <Ruby rt="ぶんしょう">文章</Ruby>をクリック → ② <Keys k="Mod+A" /> で<Ruby rt="ぜんぶ">全部</Ruby><Ruby rt="えら">選</Ruby>ぶ → ③ <Keys k="Delete" /> で<Ruby rt="け">消</Ruby>してみよう</>}
          </p>
          <Textarea value={undoText} onChange={(e) => onUndoChange(e.target.value)} className="text-xl h-32" />
          <p className="text-sm text-slate-500"><Keys k="Mod+Y" /> で「やり<Ruby rt="なお">直</Ruby>し」（<Ruby rt="もど">戻</Ruby>しすぎたとき）</p>
          <Tip>
            <Ruby rt="き">消</Ruby>えても<Ruby rt="あわ">慌</Ruby>てない！<Keys k="Mod+Z" /> はWord・Excel・Googleドキュメント・メールなど、ほとんどのアプリで<Ruby rt="つか">使</Ruby>えるよ。
          </Tip>
        </Card>
      )}
    </MissionFrame>
  )
}
