"use client"

// L10 ミッション2：初めて見る予約アプリ「RoomBook」
// ・予約：日付を切り替えて、空いている枠を選ぶ（ルール1）
// ・変更：自分の予約を開いて ✎ アイコン（ルール2）、時間は ▼ から選ぶ
// ・設定：右上の ⚙（ルール4）

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, MissionFrame, RuleBadge, Ruby, Warn, useStepFlow } from "@/components/lesson/kit"
import { HoverIcon } from "@/components/lessons/l6/five-rules"
import { CalendarDays, Settings, Menu, Bell, Pencil, Trash2, X, Lightbulb, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { T } from "@/lib/i18n"

const GOALS: { goal: React.ReactNode; rule: number }[] = [
  { goal: <><b><Ruby rt="あした">明日</Ruby></b>の <b>14:00</b> に <b><Ruby rt="かいぎしつ">会議室</Ruby>A</b> を、<Ruby rt="けんめい">件名</Ruby>「<Ruby rt="めんだん">面談</Ruby>」で<Ruby rt="よやく">予約</Ruby>しよう</>, rule: 1 },
  { goal: <><Ruby rt="よやく">予約</Ruby>した<Ruby rt="じかん">時間</Ruby>を <b>15:00</b> に<Ruby rt="へんこう">変更</Ruby>しよう</>, rule: 2 },
  { goal: <>メールの<Ruby rt="つうち">通知</Ruby>をオフにしよう</>, rule: 4 },
]

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17]
const ROOMS = ["A", "B"]
interface Booking { day: 0 | 1; room: string; hour: number; title: string; mine: boolean }

export function BookingAppMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(GOALS.length, onComplete)
  const [warn, setWarn] = useState<React.ReactNode>(null)
  const [showHint, setShowHint] = useState(false)
  const [day, setDay] = useState<0 | 1>(0)
  const [bookings, setBookings] = useState<Booking[]>([
    { day: 0, room: "B", hour: 10, title: "営業会議", mine: false },
    { day: 1, room: "A", hour: 11, title: "研修", mine: false },
    { day: 1, room: "B", hour: 14, title: "来客", mine: false },
  ])
  const [dialog, setDialog] = useState<{ room: string; hour: number; title: string; editing?: Booking } | null>(null)
  const [detail, setDetail] = useState<Booking | null>(null)
  const [settings, setSettings] = useState(false)
  const [notify, setNotify] = useState(true)
  const [sideMenu, setSideMenu] = useState(false)

  useEffect(() => { setWarn(null); setShowHint(false) }, [step])

  const clickSlot = (room: string, hour: number) => {
    const b = bookings.find((x) => x.day === day && x.room === room && x.hour === hour)
    if (b) {
      if (b.mine) setDetail(b)
      else setWarn(`そこは「${b.title}」で使われているよ`)
      return
    }
    setDialog({ room, hour, title: "" })
  }

  // 予約を保存したあとに、目標を達成したかを調べる
  const checkGoal = (bs: Booking[], last: Booking) => {
    if (step === 0) {
      if (bs.some((b) => b.mine && b.day === 1 && b.room === "A" && b.hour === 14 && b.title === "面談")) return succeed("予約できた！")
      const why = last.day !== 1 ? "今日ではなく「明日」だよ" : last.room !== "A" ? "会議室Aだよ" : last.hour !== 14 ? "14:00 だよ" : "件名は「面談」にしよう"
      setWarn(<>おしい！{why}。<Ruby rt="よやく">予約</Ruby>をクリックすると、<Ruby rt="へんこう">変更</Ruby>や<Ruby rt="さくじょ">削除</Ruby>ができるよ</>)
    }
    if (step === 1) {
      if (bs.some((b) => b.mine && b.day === 1 && b.room === "A" && b.hour === 15)) return succeed("変更できた！")
      setWarn("15:00 に変更しよう")
    }
  }

  const saveDialog = () => {
    if (!dialog) return
    if (!dialog.title.trim()) {
      setWarn("件名を入れてね")
      return
    }
    const ed = dialog.editing
    const target: Booking = ed
      ? { ...ed, hour: dialog.hour, title: dialog.title.trim() }
      : { day, room: dialog.room, hour: dialog.hour, title: dialog.title.trim(), mine: true }
    if (bookings.some((b) => b !== ed && b.day === target.day && b.room === target.room && b.hour === target.hour)) {
      setWarn("その時間はほかの予約があるよ")
      return
    }
    const next = ed ? bookings.map((b) => (b === ed ? target : b)) : [...bookings, target]
    setBookings(next)
    setDialog(null)
    checkGoal(next, target)
  }

  const mine = bookings.filter((b) => b.mine)

  return (
    <MissionFrame
      wide
      message={<><Ruby rt="かいぎしつ">会議室</Ruby>の<Ruby rt="よやく">予約</Ruby>アプリだよ。<Ruby rt="はじ">初</Ruby>めてでも、アイコンとルールでわかるはず！<span className="block text-sm text-muted-foreground mt-1"><T>A room booking app. Figure it out with the rules.</T></span></>}
      step={step}
      total={GOALS.length}
      showSuccess={showSuccess}
      successMsg={successMsg}
    >
      <div className="space-y-4">
        <Card className="flex flex-col md:flex-row md:items-center gap-3 border-indigo-300 bg-indigo-50/50">
          <p className="text-xl font-bold text-slate-800 flex-1">🎯 {GOALS[step].goal}</p>
          {showHint ? <RuleBadge n={GOALS[step].rule} /> : (
            <button onClick={() => setShowHint(true)} className="flex items-center gap-1.5 text-sm font-bold text-indigo-700 border-2 border-indigo-200 rounded-full px-4 py-1.5 bg-white hover:bg-indigo-50">
              <Lightbulb className="w-4 h-4" /> <Ruby rt="こま">困</Ruby>ったらヒント
            </button>
          )}
        </Card>

        <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-teal-600 bg-white select-none">
          <div className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white [&_button]:text-white [&_button:hover]:bg-teal-700">
            <HoverIcon icon={<Menu className="w-5 h-5" />} name="メニュー" onClick={() => setSideMenu(!sideMenu)} />
            <CalendarDays className="w-5 h-5" />
            <span className="font-bold">RoomBook</span>
            <div className="ml-auto flex items-center gap-1">
              <HoverIcon icon={<Bell className="w-5 h-5" />} name="お知らせ" onClick={() => setWarn("お知らせはありません")} />
              <HoverIcon icon={<Settings className="w-5 h-5" />} name="設定" onClick={() => setSettings(true)} />
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 border-b">
            {(["今日", "明日"] as const).map((d, i) => (
              <button key={d} onClick={() => setDay(i as 0 | 1)} className={cn("px-4 py-1.5 rounded-full text-sm font-bold border-2", day === i ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 text-slate-600 hover:border-teal-400")}>
                {d}
              </button>
            ))}
            <span className="text-sm text-slate-400 ml-2">{day === 0 ? "10月21日（水）" : "10月22日（木）"}</span>
          </div>

          <div className="p-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-16" />
                  {ROOMS.map((r) => <th key={r} className="py-1 text-slate-600">会議室{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h}>
                    <td className="text-right pr-2 text-slate-400 font-mono">{h}:00</td>
                    {ROOMS.map((r) => {
                      const b = bookings.find((x) => x.day === day && x.room === r && x.hour === h)
                      return (
                        <td key={r} className="border border-slate-100 p-0.5">
                          <button
                            onClick={() => clickSlot(r, h)}
                            className={cn(
                              "w-full h-8 rounded text-xs font-bold",
                              b ? (b.mine ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-500") : "hover:bg-teal-50",
                            )}
                          >
                            {b?.title}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sideMenu && (
            <div className="absolute left-0 top-10 z-20 w-48 bg-white border shadow-xl rounded-br-xl py-1 text-sm">
              {["使い方", "予約の一覧", "ログアウト"].map((m) => <button key={m} onClick={() => { setSideMenu(false); setWarn(`「${m}」ではないよ`) }} className="w-full text-left px-4 py-2 hover:bg-teal-50">{m}</button>)}
            </div>
          )}

          {detail && (
            <div className="absolute inset-0 bg-black/20 z-20 flex items-center justify-center" onClick={() => setDetail(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-72 p-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <p className="font-bold text-lg flex-1">{detail.title}</p>
                  <HoverIcon icon={<Pencil className="w-4 h-4" />} name="編集" onClick={() => { setDialog({ room: detail.room, hour: detail.hour, title: detail.title, editing: detail }); setDetail(null) }} />
                  <HoverIcon icon={<Trash2 className="w-4 h-4" />} name="削除" onClick={() => { setBookings((bs) => bs.filter((b) => b !== detail)); setDetail(null); setWarn("削除しちゃった！もう一度予約しよう") }} />
                  <HoverIcon icon={<X className="w-4 h-4" />} name="閉じる" onClick={() => setDetail(null)} />
                </div>
                <p className="text-sm text-slate-600">会議室{detail.room}・{detail.day === 1 ? "明日" : "今日"} {detail.hour}:00〜{detail.hour + 1}:00</p>
              </div>
            </div>
          )}

          {dialog && (
            <div className="absolute inset-0 bg-black/20 z-20 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-2xl w-80 p-5 space-y-3">
                <p className="font-bold text-lg">{dialog.editing ? "予約の編集" : "新しい予約"}</p>
                <p className="text-sm text-slate-500">会議室{dialog.room}・{(dialog.editing?.day ?? day) === 1 ? "明日" : "今日"}</p>
                <Input autoFocus value={dialog.title} onChange={(e) => setDialog({ ...dialog, title: e.target.value })} placeholder="件名" />
                <label className="flex items-center gap-2 text-sm">
                  開始
                  <span className="relative">
                    <select value={dialog.hour} onChange={(e) => setDialog({ ...dialog, hour: Number(e.target.value) })} className="appearance-none border rounded px-3 py-1.5 pr-8 bg-white">
                      {HOURS.map((h) => <option key={h} value={h}>{h}:00</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </span>
                </label>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setDialog(null)} className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100">キャンセル</button>
                  <button onClick={saveDialog} className="px-4 py-2 rounded bg-teal-600 text-white font-bold">{dialog.editing ? "保存" : "予約する"}</button>
                </div>
              </div>
            </div>
          )}

          {settings && (
            <div className="absolute inset-y-0 right-0 z-20 w-72 bg-white border-l shadow-2xl p-5 space-y-4">
              <div className="flex items-center"><p className="font-bold text-lg flex-1">設定</p><HoverIcon icon={<X className="w-4 h-4" />} name="閉じる" onClick={() => setSettings(false)} /></div>
              {[
                { label: "メール通知", on: notify, toggle: () => { setNotify(!notify); if (step === 2 && notify) succeed("設定も見つけた！") } },
                { label: "ダークモード", on: false, toggle: () => setWarn("ダークモードではないよ") },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span>{row.label}</span>
                  <button role="switch" aria-checked={row.on} onClick={row.toggle} className={cn("w-11 h-6 rounded-full relative transition-colors", row.on ? "bg-teal-600" : "bg-slate-300")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", row.on ? "left-5" : "left-0.5")} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {mine.length > 0 && <p className="text-sm text-slate-500">あなたの<Ruby rt="よやく">予約</Ruby>：{mine.map((b) => `${b.day === 1 ? "明日" : "今日"} ${b.hour}:00 会議室${b.room}「${b.title}」`).join("、")}</p>}
        <Warn>{warn}</Warn>
      </div>
    </MissionFrame>
  )
}
