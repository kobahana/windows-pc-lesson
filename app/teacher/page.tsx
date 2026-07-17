"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Download, Trash2, ChevronDown, ChevronUp,
  CalendarDays, Users, CheckCircle2, Circle, GraduationCap, ClipboardCheck, Lock,
} from "lucide-react"
import {
  ACTIVITY_LABELS,
  LESSON_TITLES,
  activityToCsv,
  deleteStudent,
  loadStudents,
  localDateKey,
  todayKey,
  type ActivityEvent,
  type StudentRecord,
} from "@/lib/student-store"
import { isSheetSyncEnabled } from "@/lib/sheet-sync"
import { checkRemoteSettings, fetchTestEnabled, isTestEnabled, saveTestEnabled } from "@/lib/test-settings"

const LESSON_IDS = [1, 2, 3, 4, 5]

// 先生用ページのパスワード（生徒が誤って開かないための簡易ロック）
const TEACHER_PASSWORD = "hana90"
// ログイン状態はタブを閉じるまで有効（共有PCでも残らない）
const TEACHER_AUTH_KEY = "pclesson_teacher_auth_v1"

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function eventLabel(ev: ActivityEvent) {
  const lesson = LESSON_TITLES[ev.lessonId] ?? `Lesson ${ev.lessonId}`
  let text = `L${ev.lessonId} ${lesson}：${ACTIVITY_LABELS[ev.type]}`
  if (ev.detail) text += `（${ev.detail}）`
  const extras: string[] = []
  if (ev.timeSec != null) extras.push(`${ev.timeSec}秒`)
  if (ev.missCount != null) extras.push(`ミス${ev.missCount}回`)
  if (extras.length) text += ` — ${extras.join(" / ")}`
  return text
}

function TeacherLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    if (password === TEACHER_PASSWORD) {
      sessionStorage.setItem(TEACHER_AUTH_KEY, "1")
      onSuccess()
    } else {
      setError(true)
      setPassword("")
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">先生用ページ</h1>
          <p className="text-sm text-slate-500">パスワードを入力してください</p>
        </div>

        <div className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
            placeholder="パスワード"
            className="h-12 text-lg text-center tracking-widest"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 font-bold text-center">パスワードがちがいます</p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!password}
            className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700"
          >
            ひらく
          </Button>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-slate-400 underline hover:text-slate-600">
            ホームへもどる
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function TeacherPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [students, setStudents] = useState<Record<string, StudentRecord>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [testEnabled, setTestEnabledState] = useState(false)
  const [remoteStatus, setRemoteStatus] = useState<"ok" | "error" | "none" | null>(null)

  // ログイン確認（タブを閉じるまで有効）
  useEffect(() => {
    setAuthed(sessionStorage.getItem(TEACHER_AUTH_KEY) === "1")
  }, [])

  useEffect(() => {
    if (!authed) return
    setStudents(loadStudents())
    setTestEnabledState(isTestEnabled())
    setLoaded(true)
    // スプレッドシート側に保存された最新の設定と、一括切り替えが使えるかを確認
    void fetchTestEnabled().then(setTestEnabledState)
    void checkRemoteSettings().then(setRemoteStatus)
  }, [authed])

  const handleToggleTest = () => {
    const next = !testEnabled
    setTestEnabledState(next)
    void saveTestEnabled(next)
  }

  const studentList = useMemo(() => {
    const list = Object.values(students)
    list.sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt))
    return list
  }, [students])

  const today = todayKey()

  const todayActivity = useMemo(() => {
    return studentList
      .map((s) => ({
        student: s,
        events: s.activity.filter((ev) => localDateKey(ev.at) === today),
      }))
      .filter((entry) => entry.events.length > 0)
  }, [studentList, today])

  const handleExportCsv = () => {
    const csv = activityToCsv(students)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `学習記録_${today}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm(`学籍番号「${id}」の記録をすべて削除します。よろしいですか？`)) return
    deleteStudent(id)
    setStudents(loadStudents())
  }

  if (authed === null) {
    return <div className="min-h-screen bg-slate-100" />
  }

  if (!authed) {
    return <TeacherLogin onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
                <ArrowLeft className="w-4 h-4" /> ホームへ
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-slate-800">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-bold">先生用ページ — 学習記録</h1>
            </div>
          </div>
          <Button onClick={handleExportCsv} disabled={studentList.length === 0} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4" /> CSVダウンロード
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <div className="text-sm text-slate-500 bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <p>
            ※ このページには<strong>このパソコンで学習した記録</strong>が表示されます。
          </p>
          {isSheetSyncEnabled() ? (
            <p className="text-green-600 font-bold">
              ✅ スプレッドシート連携：オン — 全生徒の記録は先生のGoogleスプレッドシートに自動で集まります。
            </p>
          ) : (
            <p className="text-amber-600">
              ⚠️ スプレッドシート連携：未設定 — 設定すると、どのパソコンの記録も先生のGoogleスプレッドシートに自動で集まります。
              設定方法はリポジトリの <code className="bg-slate-100 px-1 rounded">docs/スプレッドシート連携の設定.md</code> を見てください。
            </p>
          )}
        </div>

        {/* まとめテストの表示切り替え */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${testEnabled ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}>
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">まとめテスト（漢字変換・5分間タイムアタック）</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                オンにすると、生徒のホーム画面に「まとめテスト」が表示されます。テストの時間だけオンにしてください。
              </p>
              {remoteStatus === "ok" && (
                <p className="text-xs text-green-600 font-bold mt-1">
                  ✅ 全端末一括切り替え：この1つのスイッチが、教室のすべてのパソコンに反映されます（各端末には20秒ほどで反映）。
                </p>
              )}
              {remoteStatus === "error" && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Apps Script が設定の読み書きに未対応です。<code className="bg-slate-100 px-1 rounded">docs/スプレッドシート連携の設定.md</code> の新しいコードを貼り直して再デプロイすると、全端末を一括で切り替えられます。それまでは<strong>このパソコンのみ</strong>に反映されます。
                </p>
              )}
              {remoteStatus === "none" && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ スプレッドシート連携が未設定のため、<strong>このパソコンのみ</strong>に反映されます。連携を設定すると、全端末を一括で切り替えられます。
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleToggleTest}
            role="switch"
            aria-checked={testEnabled}
            className={`shrink-0 flex items-center gap-3 pl-4 pr-2 py-2 rounded-full border-2 font-bold transition-colors ${
              testEnabled
                ? "bg-amber-50 border-amber-400 text-amber-700"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            {testEnabled ? "表示中" : "非表示"}
            <span
              className={`relative w-12 h-7 rounded-full transition-colors ${testEnabled ? "bg-amber-500" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${testEnabled ? "left-6" : "left-1"}`}
              />
            </span>
          </button>
        </section>

        {/* 今日の活動 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            今日の活動（{new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}）
          </h2>
          {!loaded ? null : todayActivity.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              今日の学習記録はまだありません
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {todayActivity.map(({ student, events }) => (
                <div key={student.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800">
                      {student.id}{student.name ? `（${student.name}）` : ""}
                    </span>
                    <span className="text-xs text-slate-400">{events.length}件</span>
                  </div>
                  <ul className="space-y-1.5">
                    {events.map((ev, i) => (
                      <li key={i} className="text-sm text-slate-600 flex gap-2">
                        <span className="text-slate-400 font-mono shrink-0">{formatTime(ev.at)}</span>
                        <span className={ev.type === "lesson_clear" ? "font-bold text-green-600" : ""}>
                          {eventLabel(ev)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 生徒一覧 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Users className="w-6 h-6 text-blue-600" />
            生徒一覧（{studentList.length}人）
          </h2>
          {!loaded ? null : studentList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              まだ誰もログインしていません。生徒がホーム画面で学籍番号を入力すると、ここに表示されます。
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-left">
                    <th className="px-4 py-3 font-bold">学籍番号</th>
                    <th className="px-4 py-3 font-bold">名前</th>
                    <th className="px-4 py-3 font-bold text-center">クリア状況（L1〜L5）</th>
                    <th className="px-4 py-3 font-bold">最終利用</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((s) => {
                    const expanded = expandedId === s.id
                    // 日付ごとにまとめる（新しい順）
                    const byDate = new Map<string, ActivityEvent[]>()
                    for (const ev of s.activity) {
                      const key = localDateKey(ev.at)
                      if (!byDate.has(key)) byDate.set(key, [])
                      byDate.get(key)!.push(ev)
                    }
                    const dates = [...byDate.keys()].sort().reverse()

                    return (
                      <Fragment key={s.id}>
                        <tr
                          className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                          onClick={() => setExpandedId(expanded ? null : s.id)}
                        >
                          <td className="px-4 py-3 font-bold text-slate-800">{s.id}</td>
                          <td className="px-4 py-3 text-slate-600">{s.name ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-1.5">
                              {LESSON_IDS.map((id) =>
                                s.completedLessons.includes(id) ? (
                                  <CheckCircle2 key={id} className="w-5 h-5 text-green-500" aria-label={`L${id} クリア`} />
                                ) : (
                                  <Circle key={id} className="w-5 h-5 text-slate-200" aria-label={`L${id} 未クリア`} />
                                )
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{formatDateTime(s.lastActiveAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(s.id) }}
                                className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                title="この生徒の記録を削除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-t border-slate-100 bg-slate-50/60">
                            <td colSpan={5} className="px-6 py-4">
                              {dates.length === 0 ? (
                                <p className="text-slate-400">活動記録はありません</p>
                              ) : (
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                  {dates.map((date) => (
                                    <div key={date}>
                                      <p className="font-bold text-slate-600 mb-1.5">
                                        {date}{date === today && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">今日</span>}
                                      </p>
                                      <ul className="space-y-1 pl-1">
                                        {byDate.get(date)!.map((ev, i) => (
                                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                                            <span className="text-slate-400 font-mono shrink-0">{formatTime(ev.at)}</span>
                                            <span className={ev.type === "lesson_clear" ? "font-bold text-green-600" : ""}>
                                              {eventLabel(ev)}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
