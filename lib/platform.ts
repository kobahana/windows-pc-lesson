"use client"

import { useEffect, useState } from "react"

// OS ごとのキー表記。SSR とのハイドレーション不一致を避けるため hook で判定する
export function usePlatform() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  return {
    isMac,
    // ショートカットの修飾キー（Windows: Ctrl / Mac: ⌘）
    modKey: isMac ? "⌘" : "Ctrl",
    // 日本語入力の切り替えキー
    imeKey: isMac ? "かな" : "半角/全角",
  }
}
