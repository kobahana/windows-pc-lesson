"use client"

// まとめテスト（漢字変換タイピングテスト）の表示設定
//
// スプレッドシート連携（Apps Script）が設定されていれば、設定はスプレッドシートの
// 「設定」シートに保存され、先生用ページのスイッチ1つで全生徒の端末に反映される。
// 各端末はページ表示時と一定間隔（約20秒）で最新の設定を取得する。
// 連携が未設定の場合は、この端末の localStorage のみで動作する（従来どおり）。

import { useEffect, useState } from "react"

const WEBHOOK_URL = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK_URL

const TEST_ENABLED_KEY = "pclesson_test_enabled_v1"

// 同一タブ内で表示状態の変更を伝えるイベント
export const TEST_TOGGLE_EVENT = "pclesson-test-toggle"

const POLL_INTERVAL_MS = 20000

// ローカルに保存された値（リモート取得までの初期値・オフライン時のフォールバック）
export function isTestEnabled(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(TEST_ENABLED_KEY) === "1"
}

function cacheTestEnabled(enabled: boolean) {
  try {
    localStorage.setItem(TEST_ENABLED_KEY, enabled ? "1" : "0")
  } catch (e) {
    console.error("Failed to save test setting", e)
  }
  window.dispatchEvent(new Event(TEST_TOGGLE_EVENT))
}

// スプレッドシートから設定を取得する（失敗時は例外）
async function fetchRemote(): Promise<boolean> {
  const res = await fetch(`${WEBHOOK_URL}?action=settings`, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.testEnabled === true
}

// 最新の表示設定を取得（連携未設定・取得失敗時はローカルの値を返す）
export async function fetchTestEnabled(): Promise<boolean> {
  if (!WEBHOOK_URL) return isTestEnabled()
  try {
    const enabled = await fetchRemote()
    if (enabled !== isTestEnabled()) cacheTestEnabled(enabled)
    return enabled
  } catch (e) {
    console.warn("[TestSettings] リモート設定の取得に失敗。ローカルの値を使います", e)
    return isTestEnabled()
  }
}

// 表示設定を保存する。連携済みなら全端末へ、未設定ならこの端末のみに反映される
export async function saveTestEnabled(enabled: boolean) {
  cacheTestEnabled(enabled)
  if (!WEBHOOK_URL) return
  try {
    // Apps Script は CORS プリフライトに応答できないため no-cors + text/plain で送信
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ setting: { testEnabled: enabled } }),
    })
  } catch (e) {
    console.warn("[TestSettings] リモート設定の保存に失敗", e)
  }
}

// 先生用ページ向け：全端末一括切り替えが使える状態かを確認する
// "ok"    … スプレッドシートから設定を読み書きできる
// "error" … 連携URLはあるが設定に未対応（Apps Script のコード更新が必要）
// "none"  … スプレッドシート連携が未設定
export async function checkRemoteSettings(): Promise<"ok" | "error" | "none"> {
  if (!WEBHOOK_URL) return "none"
  try {
    await fetchRemote()
    return "ok"
  } catch {
    return "error"
  }
}

// 表示設定を購読するフック。poll=true でリモート設定を定期的に確認する
export function useTestEnabled(poll = false): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    const apply = (v: boolean) => {
      if (active) setEnabled(v)
    }

    apply(isTestEnabled())
    const onToggle = () => apply(isTestEnabled())
    window.addEventListener(TEST_TOGGLE_EVENT, onToggle)

    const refresh = () => void fetchTestEnabled().then(apply)
    refresh()

    let timer: ReturnType<typeof setInterval> | undefined
    if (poll && WEBHOOK_URL) {
      timer = setInterval(refresh, POLL_INTERVAL_MS)
      window.addEventListener("focus", refresh)
    }

    return () => {
      active = false
      window.removeEventListener(TEST_TOGGLE_EVENT, onToggle)
      if (timer) clearInterval(timer)
      window.removeEventListener("focus", refresh)
    }
  }, [poll])

  return enabled
}
