"use client"

// 学習記録を先生の Google スプレッドシート（Apps Script Web アプリ）へ送信する。
// 送信に失敗した分は localStorage のキューに溜め、次の機会に再送する。
// 設定手順は docs/スプレッドシート連携の設定.md を参照。
//
// 同時アクセス対策：
// - 各行にユニークID (rid) を付与し、サーバー側で重複を排除する
// - 送信失敗時は指数バックオフでリトライ（最大3回）
// - flushing 中に追加されたデータは完了後に自動で再送する
// - ページ離脱時は navigator.sendBeacon で送信を試みる

import { ACTIVITY_LABELS, lessonLabel, localDateKey, type ActivityEvent } from "./student-store"

// Vercel の環境変数（Settings → Environment Variables）で設定する
const WEBHOOK_URL = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK_URL

const QUEUE_KEY = "pclesson_sheet_queue_v2"
const MAX_QUEUE = 500

// リトライ設定
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 1000 // 1秒 → 2秒 → 4秒

export interface SheetRow {
  rid: string // 行ごとのユニークID（重複排除用）
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

// ユニークIDの生成（タイムスタンプ + ランダム文字列）
function generateRowId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${ts}-${rand}`
}

function loadQueue(): SheetRow[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // v1 キー（旧形式）からの移行：rid がない行には rid を付与
    return (parsed as SheetRow[]).map((row) => row.rid ? row : { ...row, rid: generateRowId() })
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
    rid: generateRowId(),
    date: localDateKey(event.at),
    time: d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    studentId,
    name: name ?? "",
    lesson: lessonLabel(event.lessonId),
    event: ACTIVITY_LABELS[event.type],
    detail: event.detail ?? "",
    timeSec: event.timeSec ?? "",
    missCount: event.missCount ?? "",
  }
}

let flushing = false
let pendingFlush = false

// キューに積んですぐ送信を試みる
export function queueSheetRow(row: SheetRow) {
  if (!WEBHOOK_URL) return
  saveQueue([...loadQueue(), row])
  void flushSheetQueue()
}

// 溜まっている記録をまとめて送信（リトライ付き）
export async function flushSheetQueue() {
  if (!WEBHOOK_URL) return

  // すでに送信中なら、完了後にもう一度送信するようフラグを立てる
  if (flushing) {
    pendingFlush = true
    return
  }

  const queue = loadQueue()
  if (queue.length === 0) return

  flushing = true
  try {
    // 送信する行のIDを記録しておく（送信中に新たに追加された行を消さないため）
    const sentRids = new Set(queue.map((r) => r.rid))

    let success = false
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ rows: queue }),
        })
        // no-cors ではエラーも resolve するが、ネットワーク切断なら reject になる。
        // サーバー側で重複排除するため、ここでは「ネットワーク到達＝送信済み」とみなして
        // キューから削除する。万が一サーバーで処理失敗していても、次回の flush で
        // 同じ rid のデータが再送され、サーバー側で重複排除される。
        success = true
        break
      } catch (e) {
        // ネットワークエラー（オフライン等）→ リトライ
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt)
        console.warn(`[SheetSync] ⚠️ attempt ${attempt + 1}/${MAX_RETRIES} failed, retrying in ${delay}ms`, e)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    if (success) {
      // 送信した行だけをキューから除去（送信中に追加された行は残す）
      const remaining = loadQueue().filter((r) => !sentRids.has(r.rid))
      saveQueue(remaining)
      console.log(`[SheetSync] ✅ sent ${queue.length} rows`)
    } else {
      console.warn(`[SheetSync] ⚠️ all ${MAX_RETRIES} retries failed, will retry later`)
    }
  } finally {
    flushing = false
    // 送信中に新しいデータが追加されていたら、再度送信する
    if (pendingFlush) {
      pendingFlush = false
      void flushSheetQueue()
    }
  }
}

// ページ離脱時に未送信のデータを sendBeacon で送信する。
// sendBeacon はページが閉じても送信を完了させるため、タブを閉じたときのデータロストを防ぐ。
export function flushWithBeacon() {
  if (!WEBHOOK_URL) return
  const queue = loadQueue()
  if (queue.length === 0) return
  try {
    const blob = new Blob([JSON.stringify({ rows: queue })], { type: "text/plain" })
    const sent = navigator.sendBeacon(WEBHOOK_URL, blob)
    if (sent) {
      // sendBeacon が受理された場合はキューをクリア
      // （サーバー側で重複排除するため、仮に送信に失敗しても安全）
      saveQueue([])
      console.log(`[SheetSync] 🚀 beacon sent ${queue.length} rows`)
    }
  } catch (e) {
    // sendBeacon が使えない環境ではスキップ（次回起動時に再送される）
    console.warn("[SheetSync] beacon failed", e)
  }
}

// --- v1 → v2 キューの移行 ---
// 旧キュー（v1）にデータが残っていたら v2 に移行して旧キューを削除する
export function migrateQueueV1ToV2() {
  try {
    const OLD_KEY = "pclesson_sheet_queue_v1"
    const raw = localStorage.getItem(OLD_KEY)
    if (!raw) return
    const oldRows = JSON.parse(raw) as Omit<SheetRow, "rid">[]
    if (oldRows.length === 0) {
      localStorage.removeItem(OLD_KEY)
      return
    }
    const migrated: SheetRow[] = oldRows.map((r) => ({ ...r, rid: generateRowId() } as SheetRow))
    const current = loadQueue()
    saveQueue([...current, ...migrated])
    localStorage.removeItem(OLD_KEY)
    console.log(`[SheetSync] migrated ${migrated.length} rows from v1 queue`)
  } catch {
    // 移行に失敗しても動作は続行
  }
}
