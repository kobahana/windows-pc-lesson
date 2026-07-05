"use client"

// 学習記録を先生の Google スプレッドシート（Apps Script Web アプリ）へ送信する。
// 送信に失敗した分は localStorage のキューに溜め、次の機会に再送する。
// 設定手順は docs/スプレッドシート連携の設定.md を参照。

import { ACTIVITY_LABELS, LESSON_TITLES, localDateKey, type ActivityEvent } from "./student-store"

// Vercel の環境変数（Settings → Environment Variables）で設定する
const WEBHOOK_URL = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK_URL

const QUEUE_KEY = "pclesson_sheet_queue_v1"
const MAX_QUEUE = 500

export interface SheetRow {
  date: string
  time: string
  studentId: string
  name: string
  lesson: string
  event: string
  detail: string
  timeSec: number | ""
  missCount: number | ""
}

export function isSheetSyncEnabled(): boolean {
  return !!WEBHOOK_URL
}

function loadQueue(): SheetRow[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveQueue(queue: SheetRow[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)))
  } catch (e) {
    console.error("Failed to save sheet queue", e)
  }
}

export function buildSheetRow(studentId: string, name: string | undefined, event: ActivityEvent): SheetRow {
  const d = new Date(event.at)
  return {
    date: localDateKey(event.at),
    time: d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    studentId,
    name: name ?? "",
    lesson: `L${event.lessonId} ${LESSON_TITLES[event.lessonId] ?? ""}`,
    event: ACTIVITY_LABELS[event.type],
    detail: event.detail ?? "",
    timeSec: event.timeSec ?? "",
    missCount: event.missCount ?? "",
  }
}

let flushing = false

// キューに積んですぐ送信を試みる
export function queueSheetRow(row: SheetRow) {
  if (!WEBHOOK_URL) return
  saveQueue([...loadQueue(), row])
  void flushSheetQueue()
}

// 溜まっている記録をまとめて送信（成功したらキューを空にする）
export async function flushSheetQueue() {
  if (!WEBHOOK_URL || flushing) return
  const queue = loadQueue()
  if (queue.length === 0) return

  flushing = true
  try {
    // Apps Script は CORS プリフライトに応答できないため、
    // no-cors + text/plain で送信する（レスポンスは読めないが送信はできる）
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ rows: queue }),
    })
    // fetch が成功（ネットワーク到達）したら送信済みとみなす
    const remaining = loadQueue().slice(queue.length)
    saveQueue(remaining)
    console.log(`[SheetSync] ✅ sent ${queue.length} rows`)
  } catch (e) {
    // オフライン等。キューは残して次回再送
    console.warn("[SheetSync] ⚠️ send failed, will retry later", e)
  } finally {
    flushing = false
  }
}
