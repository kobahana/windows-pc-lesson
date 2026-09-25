"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Character, Ruby } from "@/components/game/character"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Monitor, Keyboard, Languages, PenTool, Briefcase, IdCard, LogOut, UserRound, ClipboardCheck, MousePointerClick, FileText, Sheet, ShieldCheck, AppWindow } from "lucide-react"

import { useSettings } from "@/components/providers/settings-provider"
import { SettingsDropdown } from "@/components/layout/settings-dropdown"
import { loadStudents, type StudentRecord } from "@/lib/student-store"
import { useTestEnabled } from "@/lib/test-settings"
import { CheckCircle2 } from "lucide-react"
import { STUDENT_ID_EXAMPLE, halfWidthProblem, katakanaProblem, normalizeStudentId, toKatakana } from "@/lib/input-check"

const GUEST_KEY = "pclesson_guest"

function LoginCard() {
  const { login } = useSettings()
  const [idInput, setIdInput] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [recentStudents, setRecentStudents] = useState<StudentRecord[]>([])
  const [, forceUpdate] = useState(0)
  // 変換中（IMEで入力中）は、ひらがなが見えていても注意を出さない
  const [nameComposing, setNameComposing] = useState(false)
  const [idError, setIdError] = useState("")
  const [triedLogin, setTriedLogin] = useState(false)

  // 入力中にすぐ気づけるよう、半角/全角の間違いはその場で知らせる（自動では直さない＝練習の機会にする）
  const idHint = halfWidthProblem(idInput)
  const nameHint = nameComposing ? null : katakanaProblem(nameInput)

  useEffect(() => {
    const students = Object.values(loadStudents())
    students.sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt))
    setRecentStudents(students.slice(0, 12))
  }, [])

  const handleLogin = () => {
    if (!idInput.trim()) return
    setTriedLogin(true)
    // 全角・日本語モードのままなら、自分で切り替えてもらう
    if (idHint) {
      setIdError(idHint)
      return
    }
    const id = normalizeStudentId(idInput)
    if (id.error) {
      setIdError(id.error)
      return
    }
    if (nameHint) return
    setIdError("")
    login(id.value!, toKatakana(nameInput.trim()) || undefined)
  }

  const startAsGuest = () => {
    sessionStorage.setItem(GUEST_KEY, "1")
    forceUpdate(n => n + 1)
    // 親コンポーネントが sessionStorage を読むイベントを発火
    window.dispatchEvent(new Event("pclesson-guest"))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Character
        message={
          <>
            <Ruby rt="がくせきばんごう">学籍番号</Ruby>を<Ruby rt="い">入</Ruby>れてスタート！
            <span className="block text-sm text-muted-foreground mt-1">Enter your Student ID to start!</span>
          </>
        }
        mood="happy"
      />

      <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-blue-100 space-y-6">
        <div className="flex items-center justify-center gap-3 text-blue-600">
          <IdCard className="w-10 h-10" />
          <h2 className="text-2xl font-bold">ログイン / Login</h2>
        </div>

        <div className="space-y-2">
          <label className="block font-bold text-slate-700">
            <Ruby rt="がくせきばんごう">学籍番号</Ruby> <span className="text-sm font-normal text-slate-400">Student ID</span>
          </label>
          <Input
            value={idInput}
            onChange={(e) => { setIdInput(e.target.value); setIdError("") }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleLogin() }}
            placeholder={`例: ${STUDENT_ID_EXAMPLE}`}
            className={`h-16 text-3xl text-center font-bold tracking-widest ${idHint || idError ? "border-amber-400 focus-visible:ring-amber-300" : ""}`}
            autoFocus
            autoComplete="off"
          />
          {(idHint || (triedLogin && idError)) ? (
            <p className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              ⚠️ {idHint ?? idError}
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              <Ruby rt="はんかく">半角</Ruby>（はんかく）で<Ruby rt="にゅうりょく">入力</Ruby> / Half-width
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block font-bold text-slate-700">
            なまえ <span className="text-sm font-normal text-slate-400">Name（なくてもOK / optional）</span>
          </label>
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onCompositionStart={() => setNameComposing(true)}
            onCompositionEnd={() => setNameComposing(false)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleLogin() }}
            placeholder="例: グエン"
            className={`h-12 text-xl text-center ${nameHint ? "border-amber-400 focus-visible:ring-amber-300" : ""}`}
            autoComplete="off"
          />
          {nameHint ? (
            <p className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">⚠️ {nameHint}</p>
          ) : (
            <p className="text-xs text-slate-400">
              <Ruby rt="ぜんかく">全角</Ruby>カタカナで<Ruby rt="にゅうりょく">入力</Ruby> / Katakana
            </p>
          )}
        </div>

        <Button
          onClick={handleLogin}
          disabled={!idInput.trim()}
          className="w-full h-16 text-2xl font-bold bg-blue-600 hover:bg-blue-700 shadow-md"
        >
          はじめる！ / Start!
        </Button>

        {recentStudents.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm font-bold text-slate-500 mb-3">
              <Ruby rt="まえ">前</Ruby>につかった<Ruby rt="ひと">人</Ruby>はタップ！ <span className="font-normal text-slate-400">Tap your ID</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {recentStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => login(s.id)}
                  className="px-4 py-2 bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-full font-bold text-slate-700 transition-colors flex items-center gap-2"
                >
                  <UserRound className="w-4 h-4 text-blue-500" />
                  {s.id}{s.name ? `（${s.name}）` : ""}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-slate-400 px-2">
        <button onClick={startAsGuest} className="underline hover:text-slate-600">
          とうろくしないで つかう / Skip
        </button>
        <Link href="/teacher" className="underline hover:text-slate-600">
          先生用ページ
        </Link>
      </div>
    </div>
  )
}

export default function Home() {
  const { ready, completedLessons, student, logout } = useSettings()
  const [guestMode, setGuestMode] = useState(false)
  // 先生の切り替えを定期的に確認し、「まとめテスト」の表示を反映する
  const testEnabled = useTestEnabled(true) ?? false

  useEffect(() => {
    setGuestMode(sessionStorage.getItem(GUEST_KEY) === "1")
    const onGuest = () => setGuestMode(sessionStorage.getItem(GUEST_KEY) === "1")
    window.addEventListener("pclesson-guest", onGuest)
    return () => window.removeEventListener("pclesson-guest", onGuest)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem(GUEST_KEY)
    setGuestMode(false)
    logout()
  }

  const lessons = [
    {
      id: 1,
      num: 1,
      course: "basic",
      title: "Windowsの基本操作",
      ruby: "Windowsのきほんそうさ",
      description: "マウス操作、Wi-Fi、保存、シャットダウンを覚えよう！",
      en: "Mouse, Wi-Fi, Save & Shut down",
      icon: <Monitor className="w-10 h-10 text-blue-500" />,
      link: "/lessons/lesson1",
      available: true,
    },
    {
      id: 2,
      num: 2,
      course: "basic",
      title: "ホームポジションに慣れよう",
      ruby: "ホームポジションになれよう",
      description: "正しい指の置き方を覚えて、タイピングの準備をしよう！",
      en: "Learn the home position",
      icon: <Keyboard className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson2",
      available: true,
    },
    {
      id: 3,
      num: 3,
      course: "basic",
      title: "日本語をローマ字入力しよう",
      ruby: "にほんごをローマじにゅうりょくしよう",
      description: "「ん」や「っ」など、難しい打ち方を練習しよう！",
      en: "Type Japanese in romaji",
      icon: <Languages className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson3",
      available: true,
    },
    {
      id: 4,
      num: 4,
      course: "basic",
      title: "漢字変換マスターになろう",
      ruby: "かんじへんかんマスターになろう",
      description: "正しい漢字を選んで、文章を完成させよう！",
      en: "Convert to kanji",
      icon: <PenTool className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson4",
      available: true,
    },
    {
      id: 5,
      num: 5,
      course: "basic",
      title: "ビジネス日本語をマスターしよう",
      ruby: "ビジネスにほんごをマスターしよう",
      description: "よく使うビジネス用語をタイピングして覚えよう！",
      en: "Business Japanese typing",
      icon: <Briefcase className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson5",
      available: true,
    },
      {
      id: 7,
      num: 6,
      course: "work",
      title: "毎日つかう基本ワザ",
      ruby: "まいにちつかうきほんワザ",
      description: "半角/全角、コピペ、戻る・リロード、5つのルール！",
      en: "Input mode, copy & paste, browser basics",
      icon: <MousePointerClick className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson6",
      available: true,
    },
    {
      id: 8,
      num: 7,
      course: "work",
      title: "ビジネス文書をつくろう",
      ruby: "ビジネスぶんしょをつくろう",
      description: "要点を箇条書きに。ボタンで文書を整えよう！",
      en: "Business documents (Google Docs)",
      icon: <FileText className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson7",
      available: false,
    },
    {
      id: 9,
      num: 8,
      course: "work",
      title: "請求書をつくろう",
      ruby: "せいきゅうしょをつくろう",
      description: "計算式、セル結合、罫線で請求書を作ろう！",
      en: "Invoices (Google Sheets)",
      icon: <Sheet className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson8",
      available: false,
    },
    {
      id: 10,
      num: 9,
      course: "work",
      title: "仕事で困らないパソコン術",
      ruby: "しごとでこまらないパソコンじゅつ",
      description: "ファイル整理、メール、セキュリティ、困ったとき！",
      en: "Files, email, security, getting help",
      icon: <ShieldCheck className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson9",
      available: false,
    },
    {
      id: 11,
      num: 10,
      course: "work",
      title: "初めて見るアプリにチャレンジ",
      ruby: "はじめてみるアプリにチャレンジ",
      description: "5つのルールで、知らないアプリも使いこなそう！",
      en: "Challenge: apps you have never seen",
      icon: <AppWindow className="w-10 h-10 text-slate-400" />,
      link: "/lessons/lesson10",
      available: false,
    },
  ]

  if (!ready) {
    return <div className="min-h-screen bg-slate-50" />
  }

  if (!student && !guestMode) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative">
        <div className="absolute top-6 right-6 md:top-12 md:right-12">
          <SettingsDropdown />
        </div>
        <LoginCard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative">
      <div className="absolute top-6 right-6 md:top-12 md:right-12 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white border-2 border-blue-100 rounded-full pl-4 pr-2 py-1 shadow-sm">
          <UserRound className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-slate-700 text-sm">
            {student ? `${student.id}${student.name ? `（${student.name}）` : ""}` : "ゲスト"}
          </span>
          <button
            onClick={handleLogout}
            title="ログアウト / Log out"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <SettingsDropdown />
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        <Character
          message={
            <>
              こんにちは{student?.name ? `、${student.name}さん` : ""}！どの練習（れんしゅう）からはじめる？好きなコースをえらんでね！
              <span className="block text-sm text-muted-foreground mt-1">Choose a course to start!</span>
            </>
          }
          mood="happy"
        />

        {([
          { key: "basic", title: "きほんコース", en: "Basic course — mouse, typing, Japanese input" },
          { key: "work", title: "しごとコース", en: "Work course — skills for your future job" },
        ] as const).map((course) => (
        <section key={course.key} className="space-y-4">
          <div className="flex items-baseline gap-3 px-1">
            <h2 className="text-2xl font-bold text-slate-800">{course.title}</h2>
            <span className="text-sm text-slate-400">{course.en}</span>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lessons.filter((l) => l.course === course.key).map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id)

            return (
              <div
                key={lesson.id}
                className={`relative bg-white rounded-3xl p-8 shadow-sm border-2 transition-all ${
                  lesson.available
                  ? "border-transparent hover:border-blue-400 hover:shadow-xl cursor-pointer"
                  : "border-slate-100 opacity-60"
                } ${isCompleted ? "ring-4 ring-success/20 border-success/30" : ""}`}
              >
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl shrink-0 ${isCompleted ? "bg-success/10 text-success" : "bg-slate-50 text-slate-400"}`}>
                    {lesson.icon}
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-blue-500 block">Lesson {lesson.num}</span>
                      {isCompleted && (
                        <span className="bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> CLEAR!
                        </span>
                      )}
                    </div>

                    {/* タイトルの重複を解消し、ルビを綺麗に配置 */}
                    <h2 className="text-2xl font-bold text-slate-800 leading-relaxed">
                      <Ruby rt={lesson.ruby}>{lesson.title}</Ruby>
                    </h2>

                    <p className="text-slate-500 leading-relaxed pt-2">
                      {lesson.description}
                      <span className="block text-xs text-slate-400 mt-1">{lesson.en}</span>
                    </p>

                    {lesson.available ? (
                      <Link href={lesson.link}>
                        <Button className={`mt-4 w-full text-lg h-12 shadow-md ${isCompleted ? "bg-success hover:bg-success/90" : "bg-blue-600 hover:bg-blue-700"}`}>
                          {isCompleted ? "もう一度プレイ" : "スタート！"}
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="mt-4 w-full bg-slate-100 text-slate-400">
                        準備中（じゅんびちゅう）
                      </Button>
                    )}
                  </div>
                </div>
                {!lesson.available && (
                  <div className="absolute top-4 right-4 bg-slate-100 text-slate-400 text-[10px] px-3 py-1 rounded-full font-bold">
                    COMING SOON
                  </div>
                )}
              </div>
            )
          })}
        </div>
        </section>
        ))}

        {testEnabled && (
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-md border-2 border-amber-300 hover:border-amber-400 hover:shadow-xl transition-all">
            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wider animate-pulse">
              テスト開催中！
            </div>
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-2xl shrink-0 bg-amber-100 text-amber-600">
                <ClipboardCheck className="w-10 h-10" />
              </div>
              <div className="space-y-3 flex-1">
                <span className="text-sm font-bold text-amber-600 block">Final Test</span>
                <h2 className="text-2xl font-bold text-slate-800 leading-relaxed">
                  まとめテスト
                </h2>
                <p className="text-slate-500 leading-relaxed pt-2">
                  5分間でどれだけクリアできるかな？全問クリアでボーナス問題もあるよ！
                  <span className="block text-xs text-slate-400 mt-1">5-minute time attack — clear all for a bonus round!</span>
                </p>
                <Link href="/test">
                  <Button className="mt-4 w-full text-lg h-12 shadow-md bg-amber-500 hover:bg-amber-600">
                    テストにちょうせん！
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
