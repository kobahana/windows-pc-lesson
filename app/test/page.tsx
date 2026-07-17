"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Character } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Lightbulb, Home, ClipboardCheck, CornerDownLeft, Timer, Sparkles } from "lucide-react"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { sounds } from "@/lib/sounds"
import { useTestEnabled } from "@/lib/test-settings"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

type Question = { h: string; k: string; chunks: { k: string; r: string }[] }

// 本編20問：Lesson 1〜5 の内容から出題（PC用語 / 促音・撥音・長音 / 日常文 / ビジネス日本語）
const mainQuestions: Question[] = [
  // Lesson 1: パソコンの基本用語
  { h: "ふぁいるをほぞんします。", k: "ファイルを保存します。", chunks: [{ k: "ファイルを", r: "fairuwo" }, { k: "保存します。", r: "hozonnsimasu." }] },
  { h: "でんげんをきります。", k: "電源を切ります。", chunks: [{ k: "電源を", r: "dengennwo" }, { k: "切ります。", r: "kirimasu." }] },
  { h: "がめんをみます。", k: "画面を見ます。", chunks: [{ k: "画面を", r: "gamennwo" }, { k: "見ます。", r: "mimasu." }] },
  { h: "まうすをつかいます。", k: "マウスを使います。", chunks: [{ k: "マウスを", r: "mausuwo" }, { k: "使います。", r: "tukaimasu." }] },
  // Lesson 3: 促音・撥音・長音
  { h: "きってをかいます。", k: "切手を買います。", chunks: [{ k: "切手を", r: "kittewo" }, { k: "買います。", r: "kaimasu." }] },
  { h: "がっこうへいきます。", k: "学校へ行きます。", chunks: [{ k: "学校へ", r: "gakkouhe" }, { k: "行きます。", r: "ikimasu." }] },
  { h: "しんぶんをよみます。", k: "新聞を読みます。", chunks: [{ k: "新聞を", r: "sinbunnwo" }, { k: "読みます。", r: "yomimasu." }] },
  { h: "こーひーをのみます。", k: "コーヒーを飲みます。", chunks: [{ k: "コーヒーを", r: "ko-hi-wo" }, { k: "飲みます。", r: "nomimasu." }] },
  { h: "まっすぐすすみます。", k: "まっすぐ進みます。", chunks: [{ k: "まっすぐ", r: "massugu" }, { k: "進みます。", r: "susumimasu." }] },
  // Lesson 4: 日常の文
  { h: "きょうははれです。", k: "今日は晴れです。", chunks: [{ k: "今日は", r: "kyouha" }, { k: "晴れです。", r: "haredesu." }] },
  { h: "わたしはがくせいです。", k: "私は学生です。", chunks: [{ k: "私は", r: "watasiha" }, { k: "学生です。", r: "gakuseidesu." }] },
  { h: "あしたはやすみです。", k: "明日は休みです。", chunks: [{ k: "明日は", r: "asitaha" }, { k: "休みです。", r: "yasumidesu." }] },
  { h: "へやをそうじします。", k: "部屋を掃除します。", chunks: [{ k: "部屋を", r: "heyawo" }, { k: "掃除します。", r: "souzisimasu." }] },
  { h: "てがみをだします。", k: "手紙を出します。", chunks: [{ k: "手紙を", r: "tegamiwo" }, { k: "出します。", r: "dasimasu." }] },
  { h: "えいがをみました。", k: "映画を見ました。", chunks: [{ k: "映画を", r: "eigawo" }, { k: "見ました。", r: "mimasita." }] },
  { h: "かんじをれんしゅうします。", k: "漢字を練習します。", chunks: [{ k: "漢字を", r: "kanziwo" }, { k: "練習します。", r: "rensyuusimasu." }] },
  { h: "としょかんでべんきょうします。", k: "図書館で勉強します。", chunks: [{ k: "図書館で", r: "tosyokannde" }, { k: "勉強します。", r: "benkyousimasu." }] },
  // Lesson 5: ビジネス日本語
  { h: "おつかれさまです。", k: "お疲れ様です。", chunks: [{ k: "お疲れ様です。", r: "otukaresamadesu." }] },
  { h: "よろしくおねがいします。", k: "よろしくお願いします。", chunks: [{ k: "よろしく", r: "yorosiku" }, { k: "お願いします。", r: "onegaisimasu." }] },
  { h: "しょうちいたしました。", k: "承知いたしました。", chunks: [{ k: "承知", r: "syouti" }, { k: "いたしました。", r: "itasimasita." }] },
]

// ボーナス5問：少し長め・難しめ（全問クリアした人だけ挑戦できる）
const bonusQuestions: Question[] = [
  { h: "まいあさしちじにおきます。", k: "毎朝七時に起きます。", chunks: [{ k: "毎朝", r: "maiasa" }, { k: "七時に", r: "sitizini" }, { k: "起きます。", r: "okimasu." }] },
  { h: "でんしゃでえきへいきます。", k: "電車で駅へ行きます。", chunks: [{ k: "電車で", r: "densyade" }, { k: "駅へ", r: "ekihe" }, { k: "行きます。", r: "ikimasu." }] },
  { h: "らいしゅうてすとがあります。", k: "来週テストがあります。", chunks: [{ k: "来週", r: "raisyuu" }, { k: "テストが", r: "tesutoga" }, { k: "あります。", r: "arimasu." }] },
  { h: "かいぎのしりょうをつくります。", k: "会議の資料を作ります。", chunks: [{ k: "会議の", r: "kaigino" }, { k: "資料を", r: "siryouwo" }, { k: "作ります。", r: "tukurimasu." }] },
  { h: "ごれんらくおまちしております。", k: "ご連絡お待ちしております。", chunks: [{ k: "ご連絡", r: "gorennraku" }, { k: "お待ちしております。", r: "omatisiteorimasu." }] },
]

// 5分間タイムアタック：クリア1問=1点（ヒントを見た問題は0.5点）、ボーナスで最大25点
const TIME_LIMIT_SEC = 5 * 60
const MAX_MAIN = mainQuestions.length // 20
const MAX_BONUS = bonusQuestions.length // 5
const MAX_SCORE = MAX_MAIN + MAX_BONUS // 25

type ClearedEntry = { hint: boolean; bonus: boolean }

// テスト結果（このタブで受験済みかどうかの判定にも使う）
type DoneSummary = {
  score: number
  mainCleared: number
  bonusCleared: number
  hintCount: number
  timeSec: number
  missCount: number
}

// テストはタブを開いている間、1回だけ受けられる（形式変更に伴い v2）
const TEST_DONE_KEY = "pclesson_test_done_v2"

function formatRemaining(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

type Phase = "intro" | "main" | "bonusOffer" | "bonus" | "done"

export default function TestPage() {
  const { recordEvent, ready } = useSettings()
  // 先生の切り替えを定期的に確認（テスト開始後は最後まで解けるよう、入口だけを制御する）
  const enabled = useTestEnabled(true)
  const [phase, setPhase] = useState<Phase>("intro")
  const [qIndex, setQIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [hintTotal, setHintTotal] = useState(0)
  const [cleared, setCleared] = useState<ClearedEntry[]>([])
  const [missCount, setMissCount] = useState(0)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [deadline, setDeadline] = useState<number | null>(null)
  const [remainingSec, setRemainingSec] = useState(TIME_LIMIT_SEC)
  const [summary, setSummary] = useState<DoneSummary | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // このタブで受験済みなら、結果画面だけを表示する（再受験はできない）
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(TEST_DONE_KEY)
      if (raw) {
        setSummary(JSON.parse(raw))
        setPhase("done")
      }
    } catch {
      // 壊れたデータは無視
    }
  }, [])

  const isBonus = phase === "bonus"
  const questionList = isBonus ? bonusQuestions : mainQuestions
  const question = questionList[qIndex]
  const mainClearedCount = cleared.filter((c) => !c.bonus).length
  const bonusClearedCount = cleared.filter((c) => c.bonus).length

  const calcScore = (list: ClearedEntry[]) =>
    list.reduce((sum, c) => sum + (c.hint ? 0.5 : 1), 0)

  const finish = (finalCleared?: ClearedEntry[]) => {
    if (phase === "done") return
    const list = finalCleared ?? cleared
    const elapsed = deadline
      ? Math.min(TIME_LIMIT_SEC, Math.max(0, TIME_LIMIT_SEC - Math.ceil((deadline - Date.now()) / 1000)))
      : 0
    const mainCleared = list.filter((c) => !c.bonus).length
    const bonusCleared = list.filter((c) => c.bonus).length
    const score = calcScore(list)
    const result: DoneSummary = {
      score,
      mainCleared,
      bonusCleared,
      hintCount: hintTotal,
      timeSec: elapsed,
      missCount,
    }
    setSummary(result)
    // このタブでは再受験できないように記録しておく
    try {
      sessionStorage.setItem(TEST_DONE_KEY, JSON.stringify(result))
    } catch {
      // 保存できなくてもテスト自体は続行
    }
    sounds?.playClear()
    setPhase("done")
    recordEvent(
      6,
      "test_clear",
      `得点${score}/${MAX_SCORE}点・クリア${mainCleared}/${MAX_MAIN}問・ボーナス${bonusCleared}/${MAX_BONUS}問・ヒント${hintTotal}回`,
      { timeSec: elapsed, missCount }
    )
  }

  // 毎レンダーで最新の finish を保持（タイマーから安全に呼ぶため）
  const finishRef = useRef(finish)
  finishRef.current = finish

  // 残り時間のカウントダウン。0になったら強制終了
  useEffect(() => {
    if (!deadline || phase === "intro" || phase === "done") return
    const tick = () => {
      const rem = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemainingSec(rem)
      if (rem <= 0) finishRef.current()
    }
    tick()
    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [deadline, phase])

  const submit = () => {
    if (!userInput.trim() || phase === "done" || !question) return
    if (userInput.trim() === question.k.trim()) {
      sounds?.playSuccess()
      const entry: ClearedEntry = { hint: hintUsed, bonus: isBonus }
      const newCleared = [...cleared, entry]
      setCleared(newCleared)
      setUserInput("")
      setShowHint(false)
      setHintUsed(false)
      if (!isBonus) {
        if (qIndex + 1 < MAX_MAIN) {
          setQIndex((i) => i + 1)
        } else {
          // 本編20問クリア！ボーナスに挑戦するか選べる
          setPhase("bonusOffer")
          setQIndex(0)
        }
      } else {
        if (qIndex + 1 < MAX_BONUS) {
          setQIndex((i) => i + 1)
        } else {
          // 全25問クリア！
          finish(newCleared)
        }
      }
      inputRef.current?.focus()
    } else {
      // まちがえても何回でもチャレンジできる（入力は残すので直して再挑戦）
      sounds?.playError()
      setMissCount((m) => m + 1)
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 700)
    }
  }

  const start = () => {
    sounds?.playClick()
    setDeadline(Date.now() + TIME_LIMIT_SEC * 1000)
    setRemainingSec(TIME_LIMIT_SEC)
    setPhase("main")
    if (ready) recordEvent(6, "start")
  }

  const startBonus = () => {
    sounds?.playClick()
    setPhase("bonus")
    setQIndex(0)
    setUserInput("")
    setShowHint(false)
    setHintUsed(false)
  }

  if (enabled === null && phase === "intro") {
    return <div className="min-h-screen bg-slate-50" />
  }

  // 先生がテストをオフにしている場合(開始前のみ。開始後は最後まで解ける)
  if (!enabled && phase === "intro") {
    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <LessonHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-8 max-w-md w-full text-center space-y-6">
            <ClipboardCheck className="w-16 h-16 text-slate-300 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">いまはテストの時間じゃないよ</h2>
              <p className="text-slate-500">先生がテストをはじめると、ここでちょうせんできるよ！</p>
              <p className="text-sm text-slate-400 mt-1">The test is not open right now. Please wait for your teacher.</p>
            </div>
            <Link href="/">
              <Button className="w-full h-12 text-lg font-bold gap-2 bg-blue-600 hover:bg-blue-700">
                <Home className="w-5 h-5" /> ホームへもどる
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // はじめる前の説明画面
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <LessonHeader>
          <div className="bg-amber-500 text-white px-4 py-1 rounded-full font-bold text-xs shadow-sm tracking-wider whitespace-nowrap">
            まとめテスト：5分間タイムアタック！
          </div>
        </LessonHeader>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            <Character
              message={
                <>
                  Lesson 1〜5でならったことのテストだよ！5分間で、ひらがなを漢字に変換してどんどんクリアしよう！
                  <span className="block text-sm text-muted-foreground mt-1">
                    Time attack! Convert to kanji — clear as many as you can in 5 minutes.
                  </span>
                </>
              }
              mood="happy"
            />
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-amber-100 space-y-5">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-amber-500" /> テストのルール / Rules
              </h2>
              <ul className="space-y-3 text-slate-700 font-medium">
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                  <span>
                    せいげん時間は <strong>5分</strong>！時間内にできるだけたくさんクリアしよう
                    <span className="block text-xs text-slate-400">You have 5 minutes</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                  <span>
                    ぜんぶで <strong>{MAX_MAIN}問</strong>。1問クリアで <strong>1点</strong>（満点{MAX_MAIN}点）
                    <span className="block text-xs text-slate-400">{MAX_MAIN} questions, 1 point each</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                  <span>
                    まちがえても<strong>何回でも</strong>チャレンジOK！あきらめずに直そう
                    <span className="block text-xs text-slate-400">Unlimited tries — just fix and retry</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">4</span>
                  <span>
                    こまったら「ヒント」を見てもOK。でも、ヒントを見た問題は <strong>1点 → 0.5点</strong> になるよ
                    <span className="block text-xs text-slate-400">Hints are OK, but cost half a point</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">5</span>
                  <span>
                    せいげん時間以内に{MAX_MAIN}問ぜんぶクリアしたら、<strong>ボーナス{MAX_BONUS}問（+{MAX_BONUS}点）</strong>にちょうせんできる！最高{MAX_SCORE}点！
                    <span className="block text-xs text-slate-400">Clear all to unlock {MAX_BONUS} bonus questions</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">6</span>
                  <span>
                    テストは<strong>1回だけ</strong>。じゅんびができたらスタート！
                    <span className="block text-xs text-slate-400">You can take the test only once</span>
                  </span>
                </li>
              </ul>
              <Button onClick={start} className="w-full h-16 text-2xl font-bold bg-amber-500 hover:bg-amber-600 shadow-md gap-2">
                <Timer className="w-7 h-7" />
                テストをはじめる！ / Start!
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 結果画面（このタブでは1回だけ受験できる。受験済みなら常にこの画面）
  if (phase === "done" && summary) {
    const { score, mainCleared, bonusCleared, hintCount, timeSec, missCount: misses } = summary
    const perfect = mainCleared === MAX_MAIN && bonusCleared === MAX_BONUS
    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <LessonHeader />
        <SuccessOverlay show={true} message="" />
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-100 p-8 max-w-lg w-full text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              {perfect ? "パーフェクト！全問クリア！" : "テストおわり！おつかれさま！"}
            </h2>
            <p className="text-slate-600 mb-6 font-medium">きみの結果はこちら！ / Here are your results!</p>
            <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200 mb-6">
              <p className="text-amber-700 font-bold mb-1">とくてん / Score</p>
              <p className="text-5xl font-black text-amber-600">
                {score}<span className="text-xl font-bold text-amber-400"> / {MAX_SCORE}点</span>
              </p>
              <p className="text-xs text-amber-500 mt-1">（{MAX_MAIN}点満点＋ボーナス{MAX_BONUS}点）</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1 font-bold text-sm">
                  <ClipboardCheck className="w-4 h-4 text-green-500" />クリア
                </div>
                <div className="text-2xl font-black text-slate-800">{mainCleared}<span className="text-sm font-bold text-slate-400"> / {MAX_MAIN}問</span></div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-purple-500" />ボーナス
                </div>
                <div className="text-2xl font-black text-slate-800">{bonusCleared}<span className="text-sm font-bold text-slate-400"> / {MAX_BONUS}問</span></div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500" />ヒント
                </div>
                <div className="text-2xl font-black text-slate-800">{hintCount}<span className="text-sm font-bold text-slate-400"> 回</span></div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1 font-bold text-sm">
                  <Target className="w-4 h-4 text-red-500" />ミス
                </div>
                <div className="text-2xl font-black text-slate-800">{misses}<span className="text-sm font-bold text-slate-400"> 回</span></div>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-1">つかった時間：{Math.floor(timeSec / 60)}分{timeSec % 60}秒</p>
            <p className="text-sm text-slate-400 mb-4">
              ※ テストは1回だけだよ / You can take the test only once.
            </p>
            <Link href="/">
              <Button size="lg" className="w-full h-14 text-lg rounded-xl gap-2 font-bold bg-blue-600 hover:bg-blue-700">
                <Home className="w-5 h-5" />ホームへもどる
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ボーナス挑戦の確認画面（タイマーは動き続ける）
  if (phase === "bonusOffer") {
    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <LessonHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-sm tabular-nums",
              remainingSec <= 30 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-700"
            )}>
              <Timer className="w-4 h-4" />
              {formatRemaining(remainingSec)}
            </div>
          </div>
        </LessonHeader>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8 max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{MAX_MAIN}問クリア！すごい！</h2>
              <p className="text-slate-600 font-medium">
                のこり時間で<strong className="text-purple-600">ボーナス{MAX_BONUS}問（+{MAX_BONUS}点）</strong>にちょうせんする？
                <span className="block text-sm text-slate-400 mt-1">ちょっとむずかしいよ！ / Bonus round — a bit harder!</span>
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={startBonus} className="w-full h-14 text-xl font-bold gap-2 bg-purple-600 hover:bg-purple-700 shadow-md">
                <Sparkles className="w-6 h-6" />ちょうせんする！
              </Button>
              <Button onClick={() => finish()} variant="outline" className="w-full h-12 text-lg font-bold">
                ここでおわる（{calcScore(cleared)}点）
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 出題画面（本編 / ボーナス）
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <LessonHeader>
        <div className="flex justify-between items-center w-full px-2 gap-3">
          <div className={cn(
            "px-3 py-1 rounded-full font-bold text-[10px] shadow-sm tracking-wider whitespace-nowrap text-white",
            isBonus ? "bg-purple-600" : "bg-amber-500"
          )}>
            {isBonus ? `ボーナス ${qIndex + 1} / ${MAX_BONUS}` : `もんだい ${qIndex + 1} / ${MAX_MAIN}`}
          </div>
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300", isBonus ? "bg-purple-600" : "bg-amber-500")}
              style={{ width: `${(qIndex / (isBonus ? MAX_BONUS : MAX_MAIN)) * 100}%` }}
            />
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-sm tabular-nums shrink-0",
            remainingSec <= 30 ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-700"
          )}>
            <Timer className="w-4 h-4" />
            {formatRemaining(remainingSec)}
          </div>
          <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
            クリア {mainClearedCount + bonusClearedCount} ・ ミス {missCount}
          </div>
        </div>
      </LessonHeader>

      <div className="flex-1 flex flex-col items-center p-2 relative text-slate-800 min-h-0">
        <div className="w-full max-w-5xl flex flex-col h-full">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="text-center shrink-0 mb-2">
              <Character
                message={
                  isBonus ? (
                    <>
                      ボーナス問題！ちょっとむずかしいよ〜！
                      <span className="block text-xs text-slate-400 mt-1">Bonus round! +1 point each!</span>
                    </>
                  ) : (
                    <>
                      5分間でどこまでいけるかな？まちがえても何回でもチャレンジしてね！
                      <span className="block text-xs text-slate-400 mt-1">Convert to kanji, then press Enter (or the button)!</span>
                    </>
                  )
                }
                mood={isBonus ? "celebrating" : "happy"}
              />
            </div>

            <div className="flex-1 flex items-start justify-center pt-8">
              <div className="flex flex-col items-center justify-center py-5 shrink-0 bg-white/40 rounded-3xl mx-4 md:mx-10 border border-white shadow-inner w-full max-w-4xl px-4 md:px-8 overflow-hidden">
                <div className={cn(
                  "font-bold mb-5 text-slate-800 tracking-tight text-center w-full",
                  question.h.length > 14 ? "text-4xl md:text-5xl leading-snug" : "text-5xl md:text-6xl"
                )}>
                  {question.h}
                </div>

                <div className="flex flex-col md:flex-row w-full max-w-4xl gap-6 items-start justify-center">
                  <div className="flex-1 w-full max-w-2xl flex flex-col items-center">
                    <div className="relative w-full mb-4">
                      <input
                        key={`${isBonus ? "b" : "m"}-${qIndex}`}
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // 日本語入力の変換確定のEnterでは答え合わせしない
                            if (e.nativeEvent.isComposing) return
                            e.preventDefault()
                            submit()
                          } else if (e.key === "Escape") {
                            setUserInput("")
                          }
                        }}
                        placeholder="ここに漢字を入力..."
                        className={cn(
                          "w-full px-5 py-4 text-3xl font-bold text-center border-4 rounded-xl transition-all duration-200 bg-white text-slate-700",
                          wrongFlash
                            ? "border-red-500 bg-red-50 animate-pulse"
                            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        )}
                        autoFocus
                      />
                    </div>

                    {wrongFlash && (
                      <div className="w-full mb-3 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-2 text-center font-bold text-red-500">
                        おしい！なおして もういちど！ / Fix it and try again!
                      </div>
                    )}

                    <Button
                      onClick={submit}
                      disabled={!userInput.trim()}
                      className={cn(
                        "w-full h-14 text-2xl font-bold gap-3 mb-4 shadow-md",
                        isBonus ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      <CornerDownLeft className="w-7 h-7" />
                      こたえる！<span className="text-base font-bold opacity-80">（Enterキー）</span>
                    </Button>

                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => {
                          sounds?.playClick()
                          if (!showHint && !hintUsed) {
                            setHintUsed(true)
                            setHintTotal((t) => t + 1)
                          }
                          setShowHint(!showHint)
                        }}
                        className="px-5 py-2 text-lg bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Lightbulb className="w-5 h-5" />
                        {showHint ? "ヒントを隠す" : hintUsed ? "ヒントを見る" : "ヒントを見る（1点→0.5点）"}
                      </button>
                      <button
                        onClick={() => {
                          sounds?.playClick()
                          setUserInput("")
                        }}
                        className="px-5 py-2 text-lg bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                      >
                        クリア (Esc)
                      </button>
                    </div>

                    <div className="text-lg text-slate-600 text-center">
                      こたえは {question.k.length}文字
                      {hintUsed && <span className="ml-2 text-amber-600 font-bold">（ヒント使用中：この問題は0.5点）</span>}
                    </div>
                  </div>

                  {showHint && (
                    <div className="w-full md:w-64 shrink-0 bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 shadow-sm text-left">
                      <p className="text-base font-bold text-amber-800 mb-2">ヒント（かたまりで変換）:</p>
                      <div className="space-y-1">
                        {question.chunks.map((chunk, i) => (
                          <p key={i} className="text-sm font-medium text-amber-700">
                            {chunk.k} ({chunk.r.toUpperCase()})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
