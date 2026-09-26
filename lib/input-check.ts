// 入力モード（半角/全角・ひらがな/カタカナ）のチェックと声かけ文。
// ログイン画面・まとめテスト・レッスン6などで共通に使う。

// 学籍番号の形式：数字4つ＋ローマ字1つ＋数字3つ（例: 2024k001）
import { tx } from "@/lib/i18n/tx"

export const STUDENT_ID_RE = /^[0-9]{4}[a-z][0-9]{3}$/
export const STUDENT_ID_EXAMPLE = "2024k001"

// 全角の英数字・記号を半角に直す（２０２４ｋ００１ → 2024k001）
export function toHalfWidth(s: string): string {
  return s
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ")
}

// ひらがなをカタカナに直す（たなか → タナカ）
export function toKatakana(s: string): string {
  return s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
}

export const hasFullWidthAlnum = (s: string) => /[Ａ-Ｚａ-ｚ０-９＠．－＿]/.test(s)
export const hasHalfKana = (s: string) => /[ｦ-ﾟ]/.test(s)
export const hasHiragana = (s: string) => /[ぁ-ゖ]/.test(s)
export const hasKatakana = (s: string) => /[ァ-ヶ]/.test(s)
export const hasLatin = (s: string) => /[A-Za-z]/.test(s)
export const hasKanji = (s: string) => /[一-龥]/.test(s)

// 半角で入れるべき欄（学籍番号・メール・電話など）の声かけ。問題なければ null
export function halfWidthProblem(value: string): string | null {
  if (hasFullWidthAlnum(value)) return `全角（ぜんかく）になっているよ。「半角/全角」キーを押して、半角で入れてね / ${tx("Switch to half-width")}`
  if (hasHiragana(value) || hasKatakana(value) || hasKanji(value)) return `日本語モードになっているよ。「半角/全角」キーを押して、英語モードにしてね / ${tx("Switch to English mode")}`
  return null
}

// 全角カタカナで入れるべき欄（外国の名前など）の声かけ。問題なければ null
export function katakanaProblem(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  if (hasHalfKana(v)) return `半角カタカナになっているよ。全角カタカナにしてね（スペースで変換して選ぶ） / ${tx("Use full-width katakana")}`
  if (hasLatin(v) || /[Ａ-Ｚａ-ｚ]/.test(v)) return `英語モードのままだよ。「半角/全角」キーで日本語モードにしてね / ${tx("Switch to Japanese mode")}`
  if (hasHiragana(v)) return `ひらがなのままだよ。スペースキーで変換して、カタカナを選んでね / ${tx("Press Space to convert to katakana")}`
  if (!/^[ァ-ヶー・ 　]+$/.test(v)) return `カタカナで入れてね / ${tx("Please use katakana")}`
  return null
}

// 学籍番号を正規化して返す。形式がおかしければエラーメッセージを返す
export function normalizeStudentId(raw: string): { value?: string; error?: string } {
  const v = toHalfWidth(raw.trim()).toLowerCase()
  if (!v) return { error: `学籍番号を入力してね / ${tx("Enter your student ID")}` }
  if (!STUDENT_ID_RE.test(v)) {
    return { error: `学籍番号の形がちがうよ。「${STUDENT_ID_EXAMPLE}」のように、半角の数字4つ＋ローマ字1つ＋数字3つで入力してね` }
  }
  return { value: v }
}

// 名前を正規化して返す。カタカナ以外が入っていればエラーメッセージを返す
export function normalizeStudentName(raw: string): { value?: string; error?: string } {
  const v = toKatakana(raw.trim().replace(/　/g, " ").replace(/\s+/g, " "))
  if (!v) return { error: `名前（カタカナ）を入力してね / ${tx("Enter your name in katakana")}` }
  if (hasHalfKana(v)) return { error: "半角カタカナはつかえないよ。全角カタカナで入力してね（例：タナカ タロウ）" }
  if (!/^[ァ-ヶー・ ]+$/.test(v)) return { error: "名前は全角カタカナで入力してね（例：タナカ タロウ）" }
  return { value: v }
}
