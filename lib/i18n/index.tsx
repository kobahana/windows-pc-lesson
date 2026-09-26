"use client"

// 補助の言語（日本語の下に小さく出す説明）の切り替え。
//
// 画面の日本語はそのまま（日本語で操作できるようになるのがこのアプリの目的）。
// 日本語に添えている英語の説明を、生徒が選んだ言語に差し替える。
//
// 書き方:
//   <T>Choose a course to start!</T>              … 文字だけ
//   <T s="Press the {key} key." v={{ key: <kbd>…</kbd> }} />  … 途中に部品や値が入る
//   t("Name")                                      … 文字列が必要なところ（placeholder など）
//   tx("Copy")                                     … データの中の英語（表示するときに t() に通す）
// 英語の文そのものが訳文ファイル（lib/i18n/<言語>.ts）のキーになる。
// 英語を変えたら `node scripts/i18n-check.mjs` で訳の抜けを確かめる。

import { Fragment, type ReactNode } from "react"
import { useSettings } from "@/components/providers/settings-provider"
import { LANGUAGES, type Lang } from "./languages"
import vi from "./vi"
import ne from "./ne"
import my from "./my"
import si from "./si"
import ta from "./ta"
import sw from "./sw"
import uz from "./uz"

export { LANGUAGES, type Lang } from "./languages"

const DICTS: Record<Exclude<Lang, "en">, Record<string, string>> = { vi, ne, my, si, ta, sw, uz }

// JSX の改行・字下げは1つの空白にまとめる（訳文ファイルのキーと合わせるため）
function normalize(s: string) {
  return s.replace(/\s+/g, " ").trim()
}

export function translate(lang: Lang, en: string): string {
  const key = normalize(en)
  if (lang === "en") return key
  return DICTS[lang][key] ?? key
}

function fill(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

export { tx } from "./tx"

export function useLang(): Lang {
  return useSettings().lang
}

export function useT() {
  const lang = useLang()
  return (en: string, vars?: Record<string, string | number>) => fill(translate(lang, en), vars)
}

// 「日本語 / English」の形の文（lib の中の案内文など）の、「/」のあとの英語だけを訳す
export function useTJaEn() {
  const t = useT()
  return (s: string) => {
    const i = s.lastIndexOf(" / ")
    return i < 0 ? s : s.slice(0, i + 3) + t(s.slice(i + 3))
  }
}

export function T({ children, s, v }: { children?: string; s?: string; v?: Record<string, ReactNode> }) {
  const lang = useLang()
  const text = translate(lang, s ?? children ?? "")
  const parts = v
    ? text.split(/(\{\w+\})/).map((part, i) => {
        const m = /^\{(\w+)\}$/.exec(part)
        return <Fragment key={i}>{m && m[1] in v ? v[m[1]] : part}</Fragment>
      })
    : text
  if (lang === "en") return <>{parts}</>
  const info = LANGUAGES.find((l) => l.code === lang)
  return <span lang={lang} dir={info?.dir}>{parts}</span>
}
