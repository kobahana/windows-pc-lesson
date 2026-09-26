"use client"

// L6 ミッション3：ブラウザの基本（戻る・リロード・タブ・ページ内検索）
// 本物のブラウザのボタン・キーを押したかどうかを判定する。
// - 戻る：URL の #p1〜#p3 を切り替え、hashchange で検知
// - リロード：performance の navigation type と sessionStorage の印で検知
// - タブ：visibilitychange（ページが隠れて、また表示された）で検知

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, Keys, MissionFrame, Ruby, Tip, Warn, useAward, useStepFlow } from "@/components/lesson/kit"
import { usePlatform } from "@/lib/platform"
import { ArrowLeft, ArrowRight, RotateCw, ExternalLink, X, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx, useT } from "@/lib/i18n"

const LESSON_ID = 7
const STEP_KEY = "pclesson_l6_browser_step"
const RELOAD_ARMED_KEY = "pclesson_l6_reload_armed"
const RELOAD_BY_KEY = "pclesson_l6_reload_key"

function loadStep(): number {
  try {
    return Number(sessionStorage.getItem(STEP_KEY) || 0)
  } catch {
    return 0
  }
}

// ===== ステップ0：ブラウザの部品クイズ =====
const PARTS = [
  { id: "back", q: <><Ruby rt="まえ">前</Ruby>のページに<Ruby rt="もど">戻</Ruby>るボタンはどれ？</>, en: tx("Which button goes back?") },
  { id: "reload", q: <>ページを<Ruby rt="あたら">新</Ruby>しくする（リロード）ボタンはどれ？</>, en: tx("Which button reloads?") },
  { id: "address", q: <>URL（ページの<Ruby rt="じゅうしょ">住所</Ruby>）が<Ruby rt="か">書</Ruby>いてあるところはどれ？</>, en: tx("Where is the URL?") },
  { id: "newtab", q: <><Ruby rt="あたら">新</Ruby>しいタブを<Ruby rt="ひら">開</Ruby>くボタンはどれ？</>, en: tx("Which button opens a new tab?") },
]

function FakeBrowser({ onPick, highlight }: { onPick: (id: string) => void; highlight?: string }) {
  const part = (id: string) => cn(
    "rounded-lg transition-colors hover:bg-slate-300/70 cursor-pointer",
    highlight === id && "ring-4 ring-success",
  )
  return (
    <div className="rounded-2xl border-2 border-slate-300 overflow-hidden shadow-md bg-white select-none">
      <div className="bg-slate-200 px-2 pt-2 flex items-end gap-1">
        <div className="bg-white rounded-t-lg px-4 py-1.5 text-sm flex items-center gap-2 min-w-40">
          パソコンレッスン <X className="w-3 h-3 text-slate-400" />
        </div>
        <button className={cn(part("newtab"), "p-1.5 mb-1")} onClick={() => onPick("newtab")} aria-label="?">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-white px-2 py-2 flex items-center gap-1 border-b border-slate-200">
        <button className={cn(part("back"), "p-2")} onClick={() => onPick("back")} aria-label="?"><ArrowLeft className="w-5 h-5" /></button>
        <button className={cn(part("forward"), "p-2")} onClick={() => onPick("forward")} aria-label="?"><ArrowRight className="w-5 h-5" /></button>
        <button className={cn(part("reload"), "p-2")} onClick={() => onPick("reload")} aria-label="?"><RotateCw className="w-5 h-5" /></button>
        <button className={cn(part("address"), "flex-1 text-left bg-slate-100 rounded-full px-4 py-2 text-slate-600 text-sm")} onClick={() => onPick("address")}>
          https://pc-lesson.example.com/lessons
        </button>
      </div>
      <div className="h-24 flex items-center justify-center text-slate-300 text-sm">（ページの<Ruby rt="なかみ">中身</Ruby> / <T>page content</T>）</div>
    </div>
  )
}

// ===== ステップ4：ページ内検索用の長い文章 =====
const RULES = [
  "出勤したら、タイムカードを押してください。",
  "休憩は12時から13時までです。",
  "制服は毎週金曜日にクリーニングに出してください。",
  "ロッカーのかぎは帰るときに返してください。",
  "お客様には笑顔であいさつをしましょう。",
  "スマートフォンは休憩室だけで使えます。",
  "遅刻するときは、始業の30分前までに店長に電話してください。",
  "レジのお金は、閉店後に2人で数えます。",
  "ゴミは燃えるゴミと燃えないゴミに分けてください。",
  "シフトの希望は、毎月15日までに出してください。",
  "けがをしたら、すぐに店長に知らせてください。",
  "お客様の個人情報は、ぜったいに外に話さないでください。",
  "冷蔵庫の中の食べ物には、名前を書いてください。",
  "有給休暇の申請は、休みたい日の7日前までにしてください。",
  "制服のボタンがとれたら、事務所で直せます。",
  "給料は毎月25日に銀行に振り込まれます。",
  "住所や電話番号が変わったら、事務所に知らせてください。",
  "非常口は、店の奥とレジの横にあります。",
  "最後に帰る人は、電気とエアコンを消してください。",
  "わからないことは、いつでも先輩に聞いてください。",
]

export function BrowserMission({ onComplete }: { onComplete: () => void }) {
  const t = useT()
  const finish = () => {
    try {
      sessionStorage.removeItem(STEP_KEY)
    } catch {
      // 無視
    }
    onComplete()
  }
  const [initial] = useState(loadStep)
  const { step, succeed, showSuccess, successMsg } = useStepFlow(5, finish, initial)
  const { isMac } = usePlatform()
  const award = useAward(LESSON_ID)
  const [warn, setWarn] = useState<React.ReactNode>(null)

  useEffect(() => {
    setWarn(null)
    try {
      sessionStorage.setItem(STEP_KEY, String(step))
    } catch {
      // 無視
    }
  }, [step])

  // --- ステップ0：部品クイズ ---
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizOk, setQuizOk] = useState<string | undefined>()
  const pickPart = (id: string) => {
    const target = PARTS[quizIndex]?.id
    if (!target || quizOk) return
    if (id === target) {
      setQuizOk(id)
      setWarn(null)
      setTimeout(() => {
        setQuizOk(undefined)
        if (quizIndex + 1 >= PARTS.length) succeed("ブラウザ博士！")
        else setQuizIndex((i) => i + 1)
      }, 700)
    } else {
      setWarn(<>ちがうよ。マウスを<Ruby rt="の">乗</Ruby>せて、<Ruby rt="かたち">形</Ruby>をよく<Ruby rt="み">見</Ruby>てね / <T>Try again</T></>)
    }
  }

  // --- ステップ1：戻る ---
  const [page, setPage] = useState(1)
  const reached3Ref = useRef(false)
  const ownNavRef = useRef(false)
  const backKeyRef = useRef(false)
  useEffect(() => {
    if (step !== 1) return
    const readPage = () => Number(/#p([1-3])/.exec(window.location.hash)?.[1] ?? 1)
    window.location.hash = "p1"
    setPage(1)
    const onHash = () => {
      const p = readPage()
      setPage(p)
      if (p === 3) reached3Ref.current = true
      if (ownNavRef.current) {
        ownNavRef.current = false
        return
      }
      if (p === 1 && reached3Ref.current) {
        award("back")
        if (backKeyRef.current) award("backkey")
        history.replaceState(null, "", window.location.pathname)
        succeed("戻れたね！")
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.altKey && e.key === "ArrowLeft") || (e.metaKey && e.key === "[")) backKeyRef.current = true
    }
    window.addEventListener("hashchange", onHash)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("hashchange", onHash)
      window.removeEventListener("keydown", onKey)
    }
  }, [step, award, succeed])
  const goNext = () => {
    ownNavRef.current = true
    window.location.hash = `p${page + 1}`
  }

  // --- ステップ2：リロード ---
  const [reloaded, setReloaded] = useState(false)
  const [loadedAt] = useState(() => new Date().toLocaleTimeString("ja-JP"))
  useEffect(() => {
    if (step !== 2) return
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
      if (sessionStorage.getItem(RELOAD_ARMED_KEY) === "1" && nav?.type === "reload") {
        setReloaded(true)
        award("reload")
        if (sessionStorage.getItem(RELOAD_BY_KEY) === "1") award("reloadkey")
        sessionStorage.removeItem(RELOAD_ARMED_KEY)
        sessionStorage.removeItem(RELOAD_BY_KEY)
        return
      }
      sessionStorage.setItem(RELOAD_ARMED_KEY, "1")
    } catch {
      // sessionStorage が使えない環境では、ボタンで次へ進めるようにする
      setReloaded(true)
    }
    const onKey = (e: KeyboardEvent) => {
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") || e.key === "F5") {
        try {
          sessionStorage.setItem(RELOAD_BY_KEY, "1")
        } catch {
          // 無視
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step, award])

  // --- ステップ3：新しいタブ ---
  const [leftTab, setLeftTab] = useState(false)
  useEffect(() => {
    if (step !== 3) return
    let hidden = false
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        hidden = true
        setLeftTab(true)
      } else if (hidden) {
        award("newtab")
        succeed("おかえり！")
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [step, award, succeed])

  // --- ステップ4：ページ内検索 ---
  const usedFindRef = useRef(false)
  useEffect(() => {
    if (step !== 4) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") usedFindRef.current = true
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step])
  const answerFind = (a: string) => {
    if (a !== "7日前") {
      setWarn(<>ちがうよ。<Keys k="Mod+F" /> で「<Ruby rt="ゆうきゅう">有給</Ruby>」と<Ruby rt="けんさく">検索</Ruby>してみよう</>)
      return
    }
    if (!usedFindRef.current) {
      setWarn(<><Ruby rt="せいかい">正解</Ruby>！でも <Keys k="Mod+F" /> を<Ruby rt="つか">使</Ruby>って<Ruby rt="さが">探</Ruby>してみよう。<Ruby rt="なが">長</Ruby>いページで<Ruby rt="やく">役</Ruby>に<Ruby rt="た">立</Ruby>つよ</>)
      return
    }
    award("find")
    succeed("検索名人！")
  }

  const messages: React.ReactNode[] = [
    <>ブラウザ（Chrome や Edge）の<Ruby rt="ぶひん">部品</Ruby>を<Ruby rt="おぼ">覚</Ruby>えよう！<Ruby rt="した">下</Ruby>の<Ruby rt="しつもん">質問</Ruby>に<Ruby rt="こた">答</Ruby>えて、<Ruby rt="ただ">正</Ruby>しい<Ruby rt="ぶひん">部品</Ruby>をクリックしてね。<span className="block text-sm text-muted-foreground mt-1"><T>Learn the parts of a browser.</T></span></>,
    <>ここからは<b><Ruby rt="ほんもの">本物</Ruby></b>のブラウザを<Ruby rt="つか">使</Ruby>うよ！ページ3まで<Ruby rt="すす">進</Ruby>んだら、ブラウザの <ArrowLeft className="inline w-5 h-5" /> ボタンでページ1まで<Ruby rt="もど">戻</Ruby>ろう。<span className="block text-sm text-muted-foreground mt-1"><T>Use the REAL back button of your browser.</T></span></>,
    reloaded
      ? <>おかえり！ページが<Ruby rt="あたら">新</Ruby>しくなったね。<Ruby rt="か">書</Ruby>いた<Ruby rt="もじ">文字</Ruby>はどうなった？<span className="block text-sm text-muted-foreground mt-1"><T>The page was reloaded. What happened to your text?</T></span></>
      : <>ページが<Ruby rt="うご">動</Ruby>かないときや、<Ruby rt="ふる">古</Ruby>いときは「リロード」！まず<Ruby rt="した">下</Ruby>に<Ruby rt="なまえ">名前</Ruby>を<Ruby rt="か">書</Ruby>いてから、ブラウザの <RotateCw className="inline w-5 h-5" /> を<Ruby rt="お">押</Ruby>してね。<span className="block text-sm text-muted-foreground mt-1"><T>Write your name, then press the reload button.</T></span></>,
    <>リンクを<Ruby rt="あたら">新</Ruby>しいタブで<Ruby rt="ひら">開</Ruby>いて、このタブに<Ruby rt="もど">戻</Ruby>ってこよう！<span className="block text-sm text-muted-foreground mt-1"><T>Open a link in a new tab, then come back.</T></span></>,
    <><Ruby rt="なが">長</Ruby>いページから<Ruby rt="ことば">言葉</Ruby>を<Ruby rt="さが">探</Ruby>すときは <Keys k="Mod+F" />！アルバイトのルールから<Ruby rt="こた">答</Ruby>えを<Ruby rt="さが">探</Ruby>そう。<span className="block text-sm text-muted-foreground mt-1"><T s="Use {key} to find words on a page." v={{ key: `${isMac ? "⌘" : "Ctrl"}+F` }} /></span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={5} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-4">
          <Card className="text-center">
            <p className="text-sm text-slate-400">{quizIndex + 1} / {PARTS.length}</p>
            <p className="text-xl font-bold text-slate-800">{PARTS[quizIndex].q}</p>
            <p className="text-sm text-slate-400"><T>{PARTS[quizIndex].en}</T></p>
          </Card>
          <FakeBrowser onPick={pickPart} highlight={quizOk} />
          <Warn>{warn}</Warn>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card className="text-center space-y-4">
            <p className="text-sm font-bold text-slate-400">いまのページ / <T>Current page</T></p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3].map((p) => (
                <div key={p} className={cn(
                  "w-20 h-24 rounded-xl border-4 flex items-center justify-center text-3xl font-bold transition-all",
                  p === page ? "border-primary bg-primary text-primary-foreground scale-110" : "border-slate-200 text-slate-300",
                )}>
                  {p}
                </div>
              ))}
            </div>
            {page < 3 ? (
              <Button size="lg" onClick={goNext} className="text-lg gap-2">
                <Ruby rt="つぎ">次</Ruby>のページへ <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <p className="text-xl font-bold text-primary animate-pulse-gentle">
                ブラウザの<Ruby rt="ひだりうえ">左上</Ruby>にある <ArrowLeft className="inline w-6 h-6" /> を2<Ruby rt="かい">回</Ruby><Ruby rt="お">押</Ruby>そう！
              </p>
            )}
          </Card>
          <Tip>
            <Ruby rt="もど">戻</Ruby>るボタンは、ブラウザのいちばん<Ruby rt="うえ">上</Ruby>・<Ruby rt="ひだり">左</Ruby>にあるよ。キーなら <Keys k={isMac ? "Mod+[" : "Alt+←"} /> でも<Ruby rt="もど">戻</Ruby>れる。
            <span className="block mt-1 text-slate-500">※ <Ruby rt="がめん">画面</Ruby>の<Ruby rt="なか">中</Ruby>の「もどる」ボタンとは<Ruby rt="べつ">別</Ruby>のものだよ。</span>
          </Tip>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <p className="text-sm text-slate-500">このページを<Ruby rt="ひら">開</Ruby>いた<Ruby rt="じこく">時刻</Ruby>：<span className="font-mono font-bold text-slate-800 text-lg">{loadedAt}</span></p>
            {!reloaded ? (
              <>
                <Textarea placeholder={`名前を書いてね / ${t("Write your name")}`} className="text-xl h-24" />
                <p className="font-bold text-primary">
                  <Ruby rt="か">書</Ruby>いたら、ブラウザの <RotateCw className="inline w-5 h-5" /> を<Ruby rt="お">押</Ruby>そう（<Keys k="Mod+R" /> でもOK）
                </p>
              </>
            ) : (
              <>
                <Textarea placeholder={`（からっぽ / ${t("empty")}）`} className="text-xl h-24" />
                <p className="text-lg font-bold text-slate-800">
                  <Ruby rt="じこく">時刻</Ruby>が<Ruby rt="か">変</Ruby>わって、<Ruby rt="か">書</Ruby>いた<Ruby rt="もじ">文字</Ruby>は<Ruby rt="き">消</Ruby>えたね！
                </p>
                <Button size="lg" onClick={() => succeed("リロード完璧！")}>わかった！ / <T>Got it</T></Button>
              </>
            )}
          </Card>
          <Tip title={<><Ruby rt="ちゅうい">注意</Ruby> / <T>Be careful</T></>}>
            リロードすると、<Ruby rt="にゅうりょく">入力</Ruby>した<Ruby rt="もじ">文字</Ruby>は<Ruby rt="き">消</Ruby>えてしまうことが<Ruby rt="おお">多</Ruby>いよ。<Ruby rt="もうしこ">申し込</Ruby>みフォームの<Ruby rt="とちゅう">途中</Ruby>ではリロードしないでね。
            ページが<Ruby rt="うご">動</Ruby>かない・<Ruby rt="ひょうじ">表示</Ruby>がおかしいときに<Ruby rt="つか">使</Ruby>おう。
          </Tip>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Card className="text-center space-y-4">
            <a
              href="https://www.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xl font-bold text-blue-600 underline underline-offset-4"
            >
              Google を<Ruby rt="ひら">開</Ruby>く <ExternalLink className="w-5 h-5" />
            </a>
            <p className="text-slate-600">
              {leftTab
                ? <><Ruby rt="あたら">新</Ruby>しいタブが<Ruby rt="ひら">開</Ruby>いたね！<Ruby rt="うえ">上</Ruby>の「パソコンレッスン」のタブをクリックして<Ruby rt="もど">戻</Ruby>ってきて。</>
                : <>① リンクをクリック → ② <Ruby rt="あたら">新</Ruby>しいタブが<Ruby rt="ひら">開</Ruby>く → ③ このタブに<Ruby rt="もど">戻</Ruby>る</>}
            </p>
          </Card>
          <Tip>
            <p>タブは<Ruby rt="ほん">本</Ruby>の「しおり」のようなもの。いくつも<Ruby rt="ひら">開</Ruby>いて<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えられるよ。</p>
            <p className="mt-1">
              <Keys k="Mod+T" /> <Ruby rt="あたら">新</Ruby>しいタブ ／ <Keys k="Mod+W" /> タブを<Ruby rt="と">閉</Ruby>じる
            </p>
          </Tip>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <Ruby rt="しつもん">質問</Ruby>：<Ruby rt="ゆうきゅうきゅうか">有給休暇</Ruby>の<Ruby rt="しんせい">申請</Ruby>は、<Ruby rt="なんにちまえ">何日前</Ruby>までにする？
            </p>
            <div className="flex gap-3 flex-wrap">
              {["1日前", "3日前", "7日前", "30日前"].map((a) => (
                <Button key={a} variant="outline" size="lg" className="text-lg" onClick={() => answerFind(a)}>{a}</Button>
              ))}
            </div>
            <Warn>{warn}</Warn>
          </Card>
          <Card>
            <p className="font-bold text-slate-700 mb-2">アルバイトのルール（<Ruby rt="ぜん">全</Ruby>{RULES.length}<Ruby rt="こ">個</Ruby>）</p>
            <ol className="list-decimal pl-6 space-y-3 text-slate-600">
              {[...RULES.slice(0, 7), ...RULES.slice(8), RULES[7]].map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </Card>
        </div>
      )}
    </MissionFrame>
  )
}
