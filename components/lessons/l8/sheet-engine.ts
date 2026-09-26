// 練習用スプレッドシートの計算エンジン（小さな数式パーサー）
// 対応：数値、セル参照（A1）、範囲（A1:B3）、+ - * /、かっこ、SUM / AVERAGE / MAX / MIN

import { tx } from "@/lib/i18n/tx"

export interface CellFmt {
  bold?: boolean
  align?: "left" | "center" | "right"
  currency?: boolean
}
export interface Cell {
  raw: string
  fmt?: CellFmt
}
export interface Merge { r0: number; c0: number; r1: number; c1: number }
export interface SheetState {
  cells: Record<string, Cell>
  merges: Merge[]
  borders: Record<string, boolean>
}

export const colName = (c: number) => String.fromCharCode(65 + c)
export const key = (r: number, c: number) => `${colName(c)}${r + 1}`
export function parseKey(k: string): { r: number; c: number } | null {
  const m = /^([A-Z])(\d+)$/.exec(k.toUpperCase())
  if (!m) return null
  return { c: m[1].charCodeAt(0) - 65, r: Number(m[2]) - 1 }
}

export type Value = number | string | { error: string }
export const isError = (v: Value): v is { error: string } => typeof v === "object"

// 数式の入力ミスの声かけ（数式として計算する前に確認）
export function formulaProblem(raw: string): string | null {
  const t = raw.trim()
  if (t.startsWith("＝")) return `「＝」が全角だよ。「半角/全角」キーで半角にしてから「=」を打とう / ${tx("Use half-width =")}`
  if (!t.startsWith("=")) {
    if (/^[0-9０-９.]+\s*[+\-*/×÷＋－＊／]\s*[0-9０-９.]+/.test(t)) return `計算するときは、最初に「=」を付けよう / ${tx("Start with =")}`
    if (/^[A-Za-z]\d+\s*[+\-*/×÷]/.test(t)) return `計算するときは、最初に「=」を付けよう / ${tx("Start with =")}`
    return null
  }
  if (t.includes("×") || /\d\s*[xX]\s*\d/.test(t)) return `かけ算は「×」ではなく「*」（Shift＋け）を使うよ / ${tx("Use * for ×")}`
  if (t.includes("÷")) return `わり算は「÷」ではなく「/」（「め」のキー）を使うよ / ${tx("For ÷, use 「/」")}`
  if (/[０-９Ａ-Ｚａ-ｚ＋－＊／（）：]/.test(t)) return `式の中に全角の文字があるよ。半角で入力しよう / ${tx("Use half-width characters")}`
  return null
}

type Tok = { t: "num"; v: number } | { t: "ref"; v: string } | { t: "op"; v: string } | { t: "fn"; v: string }

function tokenize(src: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) { i++; continue }
    const num = /^\d+(\.\d+)?/.exec(src.slice(i))
    if (num) { toks.push({ t: "num", v: Number(num[0]) }); i += num[0].length; continue }
    const fn = /^([A-Za-z]{2,})\s*\(/.exec(src.slice(i))
    if (fn) { toks.push({ t: "fn", v: fn[1].toUpperCase() }); i += fn[0].length; continue }
    const ref = /^\$?([A-Za-z])\$?(\d+)/.exec(src.slice(i))
    if (ref) { toks.push({ t: "ref", v: `${ref[1].toUpperCase()}${ref[2]}` }); i += ref[0].length; continue }
    if ("+-*/():,".includes(ch)) { toks.push({ t: "op", v: ch }); i++; continue }
    throw new Error("bad char")
  }
  return toks
}

export function evaluate(state: SheetState, k: string, seen: Set<string> = new Set()): Value {
  const raw = state.cells[k]?.raw ?? ""
  const t = raw.trim()
  if (t === "") return ""
  if (!t.startsWith("=")) {
    const n = Number(t.replace(/,/g, ""))
    return t !== "" && !Number.isNaN(n) ? n : raw
  }
  if (seen.has(k)) return { error: "#REF!" }
  const nextSeen = new Set(seen).add(k)
  let toks: Tok[]
  try {
    toks = tokenize(t.slice(1))
  } catch {
    return { error: "#ERROR!" }
  }
  let pos = 0
  const peek = () => toks[pos]
  const eat = (v?: string) => {
    const tk = toks[pos]
    if (v && (!tk || tk.t !== "op" || tk.v !== v)) throw new Error("expected " + v)
    pos++
    return tk
  }
  const cellNum = (ref: string): number => {
    const v = evaluate(state, ref, nextSeen)
    if (isError(v)) throw v
    if (v === "") return 0
    if (typeof v === "string") throw { error: "#VALUE!" }
    return v
  }
  const rangeVals = (a: string, b: string): number[] => {
    const pa = parseKey(a)!, pb = parseKey(b)!
    const vals: number[] = []
    for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) {
      for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) {
        const v = evaluate(state, key(r, c), nextSeen)
        if (isError(v)) throw v
        if (typeof v === "number") vals.push(v)
      }
    }
    return vals
  }
  const expr = (): number => {
    let v = term()
    while (peek()?.t === "op" && (peek()!.v === "+" || peek()!.v === "-")) {
      const op = eat()!.v
      const r = term()
      v = op === "+" ? v + r : v - r
    }
    return v
  }
  const term = (): number => {
    let v = factor()
    while (peek()?.t === "op" && (peek()!.v === "*" || peek()!.v === "/")) {
      const op = eat()!.v
      const r = factor()
      if (op === "/" && r === 0) throw { error: "#DIV/0!" }
      v = op === "*" ? v * r : v / r
    }
    return v
  }
  const factor = (): number => {
    const tk = peek()
    if (!tk) throw new Error("eof")
    if (tk.t === "num") { pos++; return tk.v as number }
    if (tk.t === "ref") { pos++; return cellNum(tk.v as string) }
    if (tk.t === "op" && tk.v === "-") { pos++; return -factor() }
    if (tk.t === "op" && tk.v === "(") { pos++; const v = expr(); eat(")"); return v }
    if (tk.t === "fn") {
      pos++
      const vals: number[] = []
      while (!(peek()?.t === "op" && peek()!.v === ")")) {
        const a = peek()
        if (a?.t === "ref" && toks[pos + 1]?.t === "op" && toks[pos + 1].v === ":") {
          pos += 2
          const b = eat()
          if (!b || b.t !== "ref") throw new Error("range")
          vals.push(...rangeVals(a.v as string, b.v as string))
        } else {
          vals.push(expr())
        }
        if (peek()?.t === "op" && peek()!.v === ",") pos++
        else break
      }
      eat(")")
      switch (tk.v) {
        case "SUM": return vals.reduce((s, n) => s + n, 0)
        case "AVERAGE": if (!vals.length) throw { error: "#DIV/0!" }; return vals.reduce((s, n) => s + n, 0) / vals.length
        case "MAX": return vals.length ? Math.max(...vals) : 0
        case "MIN": return vals.length ? Math.min(...vals) : 0
        default: throw { error: "#NAME?" }
      }
    }
    throw new Error("unexpected")
  }
  try {
    const v = expr()
    if (pos < toks.length) return { error: "#ERROR!" }
    return Math.round(v * 1e9) / 1e9
  } catch (e) {
    if (e && typeof e === "object" && "error" in (e as object)) return e as { error: string }
    return { error: "#ERROR!" }
  }
}

export function display(state: SheetState, k: string): string {
  const v = evaluate(state, k)
  if (isError(v)) return v.error
  if (typeof v === "number") {
    if (state.cells[k]?.fmt?.currency) return `¥${Math.round(v).toLocaleString("ja-JP")}`
    return String(v)
  }
  return v
}

// オートフィル用：数式の相対参照をずらす（$ が付いた部分は固定）
export function shiftFormula(raw: string, dr: number, dc: number): string {
  if (!raw.trim().startsWith("=")) return raw
  return raw.replace(/(\$?)([A-Za-z])(\$?)(\d+)(?![A-Za-z(])/g, (m, d1, col, d2, row, offset, str) => {
    // 関数名の一部（SUM など）はずらさない
    const before = str[offset - 1]
    if (before && /[A-Za-z]/.test(before)) return m
    const c = d1 ? col.toUpperCase().charCodeAt(0) - 65 : col.toUpperCase().charCodeAt(0) - 65 + dc
    const r = d2 ? Number(row) : Number(row) + dr
    if (c < 0 || r < 1) return "#REF!"
    return `${d1}${String.fromCharCode(65 + c)}${d2}${r}`
  })
}

export function mergeAt(state: SheetState, r: number, c: number): Merge | undefined {
  return state.merges.find((m) => r >= m.r0 && r <= m.r1 && c >= m.c0 && c <= m.c1)
}

// 数式がセル参照を使っているか（「セルで入れる」の判定）
export const usesCellRef = (raw: string) => /^=/.test(raw.trim()) && /[A-Za-z]\d+/.test(raw.replace(/[A-Za-z]{2,}\(/g, ""))
// 数式が数字だけで書かれているか（「数で入れる」の判定）
export const usesOnlyNumbers = (raw: string) => /^=/.test(raw.trim()) && !/[A-Za-z]/.test(raw)
