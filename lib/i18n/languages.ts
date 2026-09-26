// 選べる補助の言語。name はその言語での名前（生徒が自分の言語を見つけやすいように）
export type Lang = "en" | "vi" | "ne" | "my" | "si" | "ta" | "sw" | "uz"

export const LANGUAGES: { code: Lang; name: string; ja: string; dir?: "ltr" | "rtl" }[] = [
  { code: "en", name: "English", ja: "英語" },
  { code: "vi", name: "Tiếng Việt", ja: "ベトナム語" },
  { code: "ne", name: "नेपाली", ja: "ネパール語" },
  { code: "my", name: "မြန်မာ", ja: "ミャンマー語" },
  { code: "si", name: "සිංහල", ja: "シンハラ語" },
  { code: "ta", name: "தமிழ்", ja: "タミル語" },
  { code: "sw", name: "Kiswahili", ja: "スワヒリ語" },
  { code: "uz", name: "Oʻzbekcha", ja: "ウズベク語" },
]

export function isLang(value: unknown): value is Lang {
  return LANGUAGES.some((l) => l.code === value)
}
