// ショートカット・パスポート：習得してほしい操作の一覧。
// レッスンやウォームアップで合格すると、生徒ごとにスタンプが押される。
// keys の "Mod" は Windows では Ctrl、Mac では ⌘ として表示する。

import { tx } from "@/lib/i18n/tx"

export type SkillLevel = 1 | 2 | 3

export interface Skill {
  id: string
  label: string // 画面表示（日本語）
  ruby?: string // ふりがな（label 全体）
  en: string
  keys: string // 例: "Mod+C"
  level: SkillLevel
  // 練習できるレッスンのミッション。ウォームアップで練習できるものは書かない（パスポートからはウォームアップへ飛ぶ）
  lesson?: { href: string; mission: number }
}

export const SKILLS: Skill[] = [
  // ★1 まずはこれだけ
  { id: "copy", label: "コピー", en: tx("Copy"), keys: "Mod+C", level: 1 },
  { id: "paste", label: "貼り付け", ruby: "はりつけ", en: tx("Paste"), keys: "Mod+V", level: 1 },
  { id: "undo", label: "元に戻す", ruby: "もとにもどす", en: tx("Undo"), keys: "Mod+Z", level: 1 },
  { id: "selectall", label: "全部選ぶ", ruby: "ぜんぶえらぶ", en: tx("Select all"), keys: "Mod+A", level: 1 },
  { id: "halfwidth", label: "半角で入力", ruby: "はんかくでにゅうりょく", en: tx("Half-width input"), keys: "半角/全角", level: 1 },
  { id: "katakana", label: "カタカナに変換", ruby: "カタカナにへんかん", en: tx("Convert to katakana"), keys: "Space", level: 1 },
  { id: "back", lesson: { href: "/lessons/lesson6", mission: 3 }, label: "前のページに戻る", ruby: "まえのページにもどる", en: tx("Go back"), keys: "←ボタン", level: 1 },
  { id: "reload", lesson: { href: "/lessons/lesson6", mission: 3 }, label: "ページを新しくする", ruby: "ページをあたらしくする", en: tx("Reload"), keys: "⟳ボタン", level: 1 },
  // ★2 仕事がはやくなる
  { id: "cut", label: "切り取り", ruby: "きりとり", en: tx("Cut"), keys: "Mod+X", level: 2 },
  { id: "redo", label: "やり直し", ruby: "やりなおし", en: tx("Redo"), keys: "Mod+Y", level: 2 },
  { id: "save", label: "保存", ruby: "ほぞん", en: tx("Save"), keys: "Mod+S", level: 2 },
  { id: "find", label: "ページ内を検索", ruby: "ページないをけんさく", en: tx("Find"), keys: "Mod+F", level: 2 },
  { id: "tab", label: "次の欄へ移動", ruby: "つぎのらんへいどう", en: tx("Next field"), keys: "Tab", level: 2 },
  { id: "rightclick", label: "右クリック", ruby: "みぎクリック", en: tx("Right-click"), keys: "右クリック", level: 2 },
  { id: "reloadkey", lesson: { href: "/lessons/lesson6", mission: 3 }, label: "リロード（キー）", en: tx("Reload (key)"), keys: "Mod+R", level: 2 },
  { id: "backkey", lesson: { href: "/lessons/lesson6", mission: 3 }, label: "戻る（キー）", ruby: "もどる（キー）", en: tx("Back (key)"), keys: "Alt+←", level: 2 },
  // ★3 できたら上級者
  { id: "print", label: "印刷", ruby: "いんさつ", en: tx("Print"), keys: "Mod+P", level: 3 },
  { id: "newtab", lesson: { href: "/lessons/lesson6", mission: 3 }, label: "新しいタブ", ruby: "あたらしいタブ", en: tx("New tab"), keys: "Mod+T", level: 3 },
  { id: "alttab", lesson: { href: "/lessons/lesson9", mission: 4 }, label: "アプリの切り替え", ruby: "アプリのきりかえ", en: tx("Switch apps"), keys: "Alt+Tab", level: 3 },
  { id: "snap", lesson: { href: "/lessons/lesson9", mission: 4 }, label: "画面を左右に並べる", ruby: "がめんをさゆうにならべる", en: tx("Snap windows"), keys: "Win+←/→", level: 3 },
  { id: "screenshot", lesson: { href: "/lessons/lesson9", mission: 4 }, label: "スクリーンショット", en: tx("Screenshot"), keys: "Win+Shift+S", level: 3 },
  { id: "lock", lesson: { href: "/lessons/lesson9", mission: 3 }, label: "画面をロック", ruby: "がめんをロック", en: tx("Lock screen"), keys: "Win+L", level: 3 },
]

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]))

// 表示用のキー表記（Mod → Ctrl / ⌘、Win → Windows / ⌘ など）
export function formatKeys(keys: string, isMac: boolean): string {
  let k = keys.replace(/Mod/g, isMac ? "⌘" : "Ctrl")
  if (isMac) {
    k = k
      .replace("Alt+←", "⌘+[")
      .replace("Alt+Tab", "⌘+Tab")
      .replace("Win+Shift+S", "⌘+Ctrl+Shift+4")
      .replace("Win+L", "⌘+Ctrl+Q")
      .replace("Win+←/→", "緑ボタン長押し")
      .replace("半角/全角", "英数 / かな")
      .replace("⌘+Y", "⌘+Shift+Z")
  }
  return k
}
