"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Character } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, Clock, Target, Lightbulb, Home, ClipboardCheck } from "lucide-react"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { sounds } from "@/lib/sounds"
import { useTestEnabled } from "@/lib/test-settings"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

type Question = { h: string; k: string; chunks: { k: string; r: string }[] }

// Lesson 1〜5 の内容から出題（PC用語 / 促音・撥音・長音 / 日常文 / ビジネス日本語）
const questions: Question[] = [
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
  { h: "ざっしをかいました。", k: "雑誌を買いました。", chunks: [{ k: "雑誌を", r: "zassiwo" }, { k: "買いました。", r: "kaimasita." }] },
  { h: "まっすぐすすみます。", k: "まっすぐ進みます。", chunks: [{ k: "まっすぐ", r: "massugu" }, { k: "進みます。", r: "susumimasu." }] },
  // Lesson 4: 日常の文
  { h: "きょうははれです。", k: "今日は晴れです。", chunks: [{ k: "今日は", r: "kyouha" }, { k: "晴れです。", r: "haredesu." }] },
  { h: "わたしはがくせいです。", k: "私は学生です。", chunks: [{ k: "私は", r: "watasiha" }, { k: "学生です。", r: "gakuseidesu." }] },
  { h: "あしたはやすみです。", k: "明日は休みです。", chunks: [{ k: "明日は", r: "asitaha" }, { k: "休みです。", r: "yasumidesu." }] },
  { h: "まいあさしちじにおきます。", k: "毎朝七時に起きます。", chunks: [{ k: "毎朝", r: "maiasa" }, { k: "七時に", r: "sitizini" }, { k: "起きます。", r: "okimasu." }] },
  { h: "でんしゃでえきへいきます。", k: "電車で駅へ行きます。", chunks: [{ k: "電車で", r: "densyade" }, { k: "駅へ", r: "ekihe" }, { k: "行きます。", r: "ikimasu." }] },
  { h: "としょかんでべんきょうします。", k: "図書館で勉強します。", chunks: [{ k: "図書館で", r: "tosyokannde" }, { k: "勉強します。", r: "benkyousimasu." }] },
  { h: "へやをそうじします。", k: "部屋を掃除します。", chunks: [{ k: "部屋を", r: "heyawo" }, { k: "掃除します。", r: "souzisimasu." }] },
  { h: "てがみをだします。", k: "手紙を出します。", chunks: [{ k: "手紙を", r: "tegamiwo" }, { k: "出します。", r: "dasimasu." }] },
  { h: "えいがをみました。", k: "映画を見ました。", chunks: [{ k: "映画を", r: "eigawo" }, { k: "見ました。", r: "mimasita." }] },
  { h: "かんじをれんしゅうします。", k: "漢字を練習します。", chunks: [{ k: "漢字を", r: "kanziwo" }, { k: "練習します。", r: "rensyuusimasu." }] },
  { h: "でんわばんごうをかきます。", k: "電話番号を書きます。", chunks: [{ k: "電話番号を", r: "dennwabangouwo" }, { k: "書きます。", r: "kakimasu." }] },
  { h: "らいしゅうてすとがあります。", k: "来週テストがあります。", chunks: [{ k: "来週", r: "raisyuu" }, { k: "テストが", r: "tesutoga" }, { k: "あります。", r: "arimasu." }] },
  // Lesson 5: ビジネス日本語
  { h: "おつかれさまです。", k: "お疲れ様です。", chunks: [{ k: "お疲れ様です。", r: "otukaresamadesu." }] },
  { h: "よろしくおねがいします。", k: "よろしくお願いします。", chunks: [{ k: "よろしく", r: "yorosiku" }, { k: "お願いします。", r: "onegaisimasu." }] },
  { h: "しょうちいたしました。", k: "承知いたしました。", chunks: [{ k: "承知", r: "syouti" }, { k: "いたしました。", r: "itasimasita." }] },
  { h: "かいぎのしりょうをつくります。", k: "会議の資料を作ります。", chunks: [{ k: "会議の", r: "kaigino" }, { k: "資料を", r: "siryouwo" }, { k: "作ります。", r: "tukurimasu." }] },
  { h: "めーるをかくにんします。", k: "メールを確認します。", chunks: [{ k: "メールを", r: "me-ruwo" }, { k: "確認します。", r: "kakuninnsimasu." }] },
  { h: "ごれんらくおまちしております。", k: "ご連絡お待ちしております。", chunks: [{ k: "ご連絡", r: "gorennraku" }, { k: "お待ちしております。", r: "omatisiteorimasu." }] },
]

// 得点：正解2点、ヒントを見た問題の正解は1点
const POINT_FULL = 2
const POINT_WITH_HINT = 1
const MAX_SCORE = questions.length * POINT_FULL

type QuestionResult = { correct: boolean; hint: boolean }
type Phase = "intro" | "question" | "retry" | "reveal" | "done"

export default function TestPage() {
  const { recordEvent, ready } = useSettings()
  // 先生の切り替えを定期的に確認（テスト開始後は最後まで解けるよう、入口だけを制御する）
  const enabled = useTestEnabled(true)
  const [phase, setPhase] = useState<Phase>("intro")
  const [qIndex, setQIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [missCount, setMissCount] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const question = questions[qIndex]
  const correctCount = results.filter((r) => r.correct).length

  const calcScore = (list: QuestionResult[]) =>
    list.reduce((sum, r) => sum + (r.correct ? (r.hint ? POINT_WITH_HINT : POINT_FULL) : 0), 0)

  const finish = (finalResults: QuestionResult[]) => {
    const secs = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
    setElapsedTime(secs)
    sounds?.playClear()
    setPhase("done")
    const correct = finalResults.filter((r) => r.correct).length
    const hintCount = finalResults.filter((r) => r.hint).length
    const score = calcScore(finalResults)
    recordEvent(
      6,
      "test_clear",
      `得点${score}/${MAX_SCORE}点・正解${correct}/${questions.length}問・ヒント${hintCount}回`,
      { timeSec: secs, missCount }
    )
  }

  const advance = (correct: boolean) => {
    const newResults = [...results, { correct, hint: hintUsed }]
    setResults(newResults)
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
      setUserInput("")
      setShowHint(false)
      setHintUsed(false)
      setPhase("question")
      inputRef.current?.focus()
    } else {
      finish(newResults)
    }
  }

  const submit = () => {
    if (!userInput.trim() || phase === "reveal") return
    if (userInput.trim() === question.k.trim()) {
      sounds?.playSuccess()
      advance(true)
    } else {
      sounds?.playError()
      setMissCount((m) => m + 1)
      setUserInput("")
      if (phase === "question") {
        // 1回目のミス：もう一度だけチャレンジできる
        setPhase("retry")
      } else {
        // 2回連続ミス：正解を見せてから次へ
        setPhase("reveal")
      }
    }
  }

  // 正解表示ののち自動で次の問題へ
  useEffect(() => {
    if (phase !== "reveal") return
    const t = setTimeout(() => advance(false), 2500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const start = () => {
    sounds?.playClick()
    setStartTime(Date.now())
    setPhase("question")
    if (ready) recordEvent(6, "start")
  }

  const handleRetryAll = () => {
    sounds?.playClick()
    setQIndex(0)
    setUserInput("")
    setShowHint(false)
    setHintUsed(false)
    setResults([])
    setMissCount(0)
    setStartTime(null)
    setElapsedTime(0)
    setPhase("intro")
  }

  if (enabled === null && phase === "intro") {
    return <div className="min-h-screen bg-slate-50" />
  }

  // 先生がテストをオフにしている場合（開始前のみ。開始後は最後まで解ける）
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
            まとめテスト：漢字変換 全{questions.length}問
          </div>
        </LessonHeader>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            <Character
              message={
                <>
                  Lesson 1〜5でならったことのテストだよ！ひらがなを漢字に変換して入力してね。
                  <span className="block text-sm text-muted-foreground mt-1">
                    Final test! Type each sentence and convert it to kanji.
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
                    ぜんぶで <strong>{questions.length}問</strong>。正解すると <strong>2点</strong>（満点{MAX_SCORE}点）
                    <span className="block text-xs text-slate-400">{questions.length} questions, 2 points each</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                  <span>
                    まちがえたら、<strong>もういちどだけ</strong>チャレンジできる。2回まちがえたら、つぎの問題へすすむよ
                    <span className="block text-xs text-slate-400">If you make a mistake, you get one more try</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                  <span>
                    こまったら「ヒント」を見てもOK。でも、ヒントを見た問題は <strong>2点 → 1点</strong> になるよ
                    <span className="block text-xs text-slate-400">Hints are OK, but a hint costs 1 point</span>
                  </span>
                </li>
              </ul>
              <Button onClick={start} className="w-full h-16 text-2xl font-bold bg-amber-500 hover:bg-amber-600 shadow-md">
                テストをはじめる！ / Start!
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 結果画面
  if (phase === "done") {
    const score = calcScore(results)
    const hintCount = results.filter((r) => r.hint).length
    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <LessonHeader />
        <SuccessOverlay show={true} message="" />
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-100 p-8 max-w-lg w-full text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">テストおわり！おつかれさま！</h2>
            <p className="text-slate-600 mb-6 font-medium">きみの結果はこちら！ / Here are your results!</p>
            <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200 mb-6">
              <p className="text-amber-700 font-bold mb-1">とくてん / Score</p>
              <p className="text-5xl font-black text-amber-600">
                {score}<span className="text-xl font-bold text-amber-400"> / {MAX_SCORE}点</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1 font-bold text-sm">
                  <ClipboardCheck className="w-4 h-4 text-green-500" />正解
                </div>
                <div className="text-2xl font-black text-slate-800">{correctCount}<span className="text-sm font-bold text-slate-400"> / {questions.length}問</span></div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500" />ヒント
                </div>
                <div className="text-2xl font-black text-slate-800">{hintCount}<span className="text-sm font-bold text-slate-400"> 回</span></div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1 font-bold text-sm">
                  <Clock className="w-4 h-4 text-blue-500" />時間
                </div>
                <div className="text-2xl font-black text-slate-800">{elapsedTime}<span className="text-sm font-bold text-slate-400"> 秒</span></div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1 font-bold text-sm">
                  <Target className="w-4 h-4 text-red-500" />ミス
                </div>
                <div className="text-2xl font-black text-slate-800">{missCount}<span className="text-sm font-bold text-slate-400"> 回</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRetryAll} size="lg" className="flex-1 h-14 text-lg rounded-xl gap-2 font-bold bg-amber-500 hover:bg-amber-600">
                <RotateCcw className="w-5 h-5" />もういちど
              </Button>
              <Link href="/" className="flex-1">
                <Button size="lg" variant="outline" className="w-full h-14 text-lg rounded-xl gap-2 font-bold">
                  <Home className="w-5 h-5" />ホームへ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 出題画面
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <LessonHeader>
        <div className="flex justify-between items-center w-full px-2 gap-3">
          <div className="bg-amber-500 text-white px-3 py-1 rounded-full font-bold text-[10px] shadow-sm tracking-wider whitespace-nowrap">
            まとめテスト {qIndex + 1} / {questions.length}
          </div>
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${(qIndex / questions.length) * 100}%` }}
            />
          </div>
          <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
            正解 {correctCount} ・ ミス {missCount}
          </div>
        </div>
      </LessonHeader>

      <div className="flex-1 flex flex-col items-center p-2 relative text-slate-800 min-h-0">
        <div className="w-full max-w-5xl flex flex-col h-full">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="text-center shrink-0 mb-2">
              <Character
                message={
                  phase === "retry" ? (
                    <>
                      おしい！もういちどだけチャレンジできるよ！
                      <span className="block text-xs text-slate-400 mt-1">Almost! You have one more try!</span>
                    </>
                  ) : (
                    <>
                      ひらがなを漢字に変換して、Enterでこたえてね！
                      <span className="block text-xs text-slate-400 mt-1">Convert to kanji (Space), then press Enter!</span>
                    </>
                  )
                }
                mood={phase === "retry" ? "encouraging" : "happy"}
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

                {phase === "reveal" ? (
                  <div className="w-full max-w-2xl bg-red-50 border-4 border-red-200 rounded-xl px-6 py-6 text-center space-y-2">
                    <p className="text-lg font-bold text-red-500">ざんねん…！つぎの問題にすすむよ</p>
                    <p className="text-3xl font-black text-slate-800">
                      正解：<span className="text-red-600">{question.k}</span>
                    </p>
                    <p className="text-xs text-slate-400">The correct answer is shown above. Moving on!</p>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row w-full max-w-4xl gap-6 items-start justify-center">
                    <div className="flex-1 w-full max-w-2xl flex flex-col items-center">
                      {phase === "retry" && (
                        <div className="w-full mb-3 bg-amber-100 border-2 border-amber-300 rounded-xl px-4 py-2 text-center font-bold text-amber-700">
                          ラストチャンス！もういちどだけ入力できるよ / One more try!
                        </div>
                      )}
                      <div className="relative w-full mb-4">
                        <input
                          ref={inputRef}
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              submit()
                            } else if (e.key === "Escape") {
                              setUserInput("")
                            }
                          }}
                          placeholder="ここに漢字を入力..."
                          className={cn(
                            "w-full px-5 py-4 text-3xl font-bold text-center border-4 rounded-xl transition-all duration-200 bg-white text-slate-700",
                            phase === "retry"
                              ? "border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                              : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          )}
                          autoFocus
                        />
                      </div>

                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => {
                            sounds?.playClick()
                            setShowHint(!showHint)
                            if (!showHint) setHintUsed(true)
                          }}
                          className="px-5 py-2 text-lg bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Lightbulb className="w-5 h-5" />
                          {showHint ? "ヒントを隠す" : hintUsed ? "ヒントを見る" : "ヒントを見る（2点→1点）"}
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
                        Enterでこたえる • {question.k.length}文字
                        {hintUsed && <span className="ml-2 text-amber-600 font-bold">（ヒント使用中：この問題は1点）</span>}
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
