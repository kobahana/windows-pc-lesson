"use client"

// Googleドキュメント風の練習用エディタ。
// 文字は打たず、「選ぶ → ツールバーのボタン」で書式を整える練習に特化している。
// - 文字単位：太字・斜体・下線
// - 段落単位：揃え・文字サイズ・箇条書き/番号付きリスト
// - 元に戻す / やり直し（ボタンと Ctrl+Z / Ctrl+Y）

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Undo2, Redo2, Printer, Bold, Italic, Underline, Baseline, Link2, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, List, ListOrdered, RemoveFormatting, Minus, Plus, FileText, Star, MessageSquare, Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type Align = "left" | "center" | "right" | "justify"
export type ListKind = "none" | "bullet" | "number"
export interface CharFmt { b: boolean; i: boolean; u: boolean }
export interface Para {
  text: string
  align: Align
  size: number
  list: ListKind
  fmt: CharFmt[]
}

export const DEFAULT_SIZE = 11
export const SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36]

export function makePara(text: string, opts: Partial<Omit<Para, "text" | "fmt">> = {}): Para {
  return {
    text,
    align: opts.align ?? "left",
    size: opts.size ?? DEFAULT_SIZE,
    list: opts.list ?? "none",
    fmt: Array.from(text, () => ({ b: false, i: false, u: false })),
  }
}

export const isAllBold = (p: Para) => p.fmt.length > 0 && p.fmt.every((f) => f.b)
export const hasAnyFmt = (p: Para) => p.fmt.some((f) => f.b || f.i || f.u)

// ===== ツールバーの定義（Googleドキュメントと同じ並び） =====

export type ToolId =
  | "undo" | "redo" | "print" | "sizeDown" | "sizeUp" | "bold" | "italic" | "underline" | "color" | "link"
  | "alignLeft" | "alignCenter" | "alignRight" | "alignJustify" | "numbered" | "bulleted" | "clear"

export const TOOLS: { id: ToolId; name: string; icon: React.ReactNode; group: number }[] = [
  { id: "undo", name: "元に戻す（Ctrl+Z）", icon: <Undo2 className="w-[18px] h-[18px]" />, group: 0 },
  { id: "redo", name: "やり直し（Ctrl+Y）", icon: <Redo2 className="w-[18px] h-[18px]" />, group: 0 },
  { id: "print", name: "印刷（Ctrl+P）", icon: <Printer className="w-[18px] h-[18px]" />, group: 0 },
  { id: "sizeDown", name: "フォントサイズを小さくする", icon: <Minus className="w-[18px] h-[18px]" />, group: 1 },
  { id: "sizeUp", name: "フォントサイズを大きくする", icon: <Plus className="w-[18px] h-[18px]" />, group: 1 },
  { id: "bold", name: "太字（Ctrl+B）", icon: <Bold className="w-[18px] h-[18px]" />, group: 2 },
  { id: "italic", name: "斜体（Ctrl+I）", icon: <Italic className="w-[18px] h-[18px]" />, group: 2 },
  { id: "underline", name: "下線（Ctrl+U）", icon: <Underline className="w-[18px] h-[18px]" />, group: 2 },
  { id: "color", name: "テキストの色", icon: <Baseline className="w-[18px] h-[18px]" />, group: 2 },
  { id: "link", name: "リンクを挿入", icon: <Link2 className="w-[18px] h-[18px]" />, group: 3 },
  { id: "alignLeft", name: "左揃え", icon: <AlignLeft className="w-[18px] h-[18px]" />, group: 4 },
  { id: "alignCenter", name: "中央揃え", icon: <AlignCenter className="w-[18px] h-[18px]" />, group: 4 },
  { id: "alignRight", name: "右揃え", icon: <AlignRight className="w-[18px] h-[18px]" />, group: 4 },
  { id: "alignJustify", name: "両端揃え", icon: <AlignJustify className="w-[18px] h-[18px]" />, group: 4 },
  { id: "numbered", name: "番号付きリスト", icon: <ListOrdered className="w-[18px] h-[18px]" />, group: 5 },
  { id: "bulleted", name: "箇条書き", icon: <List className="w-[18px] h-[18px]" />, group: 5 },
  { id: "clear", name: "書式をクリア", icon: <RemoveFormatting className="w-[18px] h-[18px]" />, group: 6 },
]

function ToolButton({
  tool,
  onAction,
  active,
  flash,
}: {
  tool: (typeof TOOLS)[number]
  onAction: (id: ToolId) => void
  active?: boolean
  flash?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={tool.name}
        // ボタンを押しても文字の選択が外れないようにする
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onAction(tool.id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          "p-1.5 rounded text-slate-700 hover:bg-slate-200 transition-colors",
          active && "bg-sky-100 text-sky-800",
          flash && "ring-4 ring-success bg-success/20",
        )}
      >
        {tool.icon}
      </button>
      {hover && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-40 whitespace-nowrap bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded pointer-events-none">
          {tool.name}
        </span>
      )}
    </span>
  )
}

export function DocToolbar({
  onAction,
  size,
  active = {},
  flash,
}: {
  onAction: (id: ToolId) => void
  size?: number | null
  active?: Partial<Record<ToolId, boolean>>
  flash?: ToolId
}) {
  const groups = [...new Set(TOOLS.map((t) => t.group))]
  return (
    <div className="flex flex-wrap items-center gap-0.5 bg-[#edf2fa] rounded-full px-3 py-1">
      {groups.map((g, gi) => (
        <div key={g} className="flex items-center gap-0.5">
          {gi > 0 && <span className="w-px h-5 bg-slate-300 mx-1.5" />}
          {TOOLS.filter((t) => t.group === g).map((t) => (
            <span key={t.id} className="inline-flex items-center">
              <ToolButton tool={t} onAction={onAction} active={active[t.id]} flash={flash === t.id} />
              {t.id === "sizeDown" && (
                <span className="w-9 text-center text-sm border border-slate-300 rounded bg-white mx-0.5 py-0.5 tabular-nums">
                  {size ?? ""}
                </span>
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// ドキュメントの上部（アイコン・ファイル名・メニュー）
export function DocHeader({
  title,
  onTitleChange,
  onMenu,
}: {
  title?: string
  onTitleChange?: (v: string) => void
  onMenu?: (name: string) => void
}) {
  return (
    <div className="flex items-start gap-2 px-3 pt-2">
      <FileText className="w-9 h-9 text-blue-600 fill-blue-100 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {onTitleChange ? (
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onFocus={(e) => e.target.select()}
              aria-label="ドキュメントの名前"
              className="text-lg px-1.5 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none min-w-0 w-72 max-w-full"
            />
          ) : (
            <span className="text-lg px-1.5">{title}</span>
          )}
          <Star className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="flex flex-wrap text-sm text-slate-700">
          {["ファイル", "編集", "表示", "挿入", "表示形式", "ツール", "ヘルプ"].map((m) => (
            <button key={m} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onMenu?.(m)} className="px-1.5 py-0.5 rounded hover:bg-slate-200">
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <MessageSquare className="w-5 h-5 text-slate-500" />
        <span className="flex items-center gap-1.5 bg-[#c2e7ff] text-slate-800 rounded-full px-4 py-2 text-sm font-bold">
          <Lock className="w-4 h-4" /> 共有
        </span>
      </div>
    </div>
  )
}

// ===== エディタ本体 =====

interface SelInfo {
  startPid: number
  startOff: number
  endPid: number
  endOff: number
  collapsed: boolean
}

// 段落内の文字位置を数える（箇条書きの記号などは data-text の外にあるので数えない）
function offsetIn(textEl: Element, node: Node, offset: number): number {
  if (!textEl.contains(node)) {
    // 段落の前後（記号の上など）をクリックした場合
    const pos = textEl.compareDocumentPosition(node)
    return pos & Node.DOCUMENT_POSITION_FOLLOWING ? (textEl.textContent ?? "").length : 0
  }
  const r = document.createRange()
  r.setStart(textEl, 0)
  r.setEnd(node, offset)
  return r.toString().length
}

function readSelection(root: HTMLElement): SelInfo | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null
  const paraOf = (n: Node) => (n.nodeType === 1 ? (n as Element) : n.parentElement)?.closest("[data-pid]")
  const sp = paraOf(range.startContainer)
  const ep = paraOf(range.endContainer)
  if (!sp || !ep) return null
  const st = sp.querySelector("[data-text]")!
  const et = ep.querySelector("[data-text]")!
  return {
    startPid: Number(sp.getAttribute("data-pid")),
    startOff: offsetIn(st, range.startContainer, range.startOffset),
    endPid: Number(ep.getAttribute("data-pid")),
    endOff: offsetIn(et, range.endContainer, range.endOffset),
    collapsed: range.collapsed,
  }
}

export interface EditorApi {
  doc: Para[]
  selInfo: SelInfo | null
}

export function useDocEditor(initial: Para[]) {
  const [doc, setDoc] = useState<Para[]>(initial)
  const undoRef = useRef<Para[][]>([])
  const redoRef = useRef<Para[][]>([])
  const docRef = useRef(doc)
  docRef.current = doc

  const commit = useCallback((next: Para[]) => {
    undoRef.current.push(docRef.current)
    redoRef.current = []
    setDoc(next)
  }, [])
  const undo = useCallback(() => {
    const prev = undoRef.current.pop()
    if (!prev) return false
    redoRef.current.push(docRef.current)
    setDoc(prev)
    return true
  }, [])
  const redo = useCallback(() => {
    const next = redoRef.current.pop()
    if (!next) return false
    undoRef.current.push(docRef.current)
    setDoc(next)
    return true
  }, [])
  const reset = useCallback((d: Para[]) => {
    undoRef.current = []
    redoRef.current = []
    setDoc(d)
  }, [])
  return { doc, commit, undo, redo, reset }
}

export type ToolResult = { ok: true } | { ok: false; reason: "noSelection" | "unused" | "empty" }

// ボタンの操作を文書に適用する
export function applyTool(doc: Para[], id: ToolId, sel: SelInfo | null): { doc?: Para[]; result: ToolResult } {
  if (!sel) return { result: { ok: false, reason: "noSelection" } }
  const pids: number[] = []
  for (let p = sel.startPid; p <= sel.endPid; p++) pids.push(p)
  const next = doc.map((p) => ({ ...p, fmt: p.fmt.map((f) => ({ ...f })) }))

  const paraTool = (fn: (p: Para) => void) => {
    pids.forEach((pid) => fn(next[pid]))
    return { doc: next, result: { ok: true } as ToolResult }
  }

  switch (id) {
    case "alignLeft": return paraTool((p) => { p.align = "left" })
    case "alignCenter": return paraTool((p) => { p.align = "center" })
    case "alignRight": return paraTool((p) => { p.align = "right" })
    case "alignJustify": return paraTool((p) => { p.align = "justify" })
    case "bulleted": {
      const allOn = pids.every((pid) => next[pid].list === "bullet")
      return paraTool((p) => { p.list = allOn ? "none" : "bullet" })
    }
    case "numbered": {
      const allOn = pids.every((pid) => next[pid].list === "number")
      return paraTool((p) => { p.list = allOn ? "none" : "number" })
    }
    case "sizeUp": return paraTool((p) => { p.size = SIZES.find((s) => s > p.size) ?? p.size })
    case "sizeDown": return paraTool((p) => { p.size = [...SIZES].reverse().find((s) => s < p.size) ?? p.size })
    case "clear": return paraTool((p) => {
      p.align = "left"; p.size = DEFAULT_SIZE; p.list = "none"
      p.fmt = p.fmt.map(() => ({ b: false, i: false, u: false }))
    })
    case "bold":
    case "italic":
    case "underline": {
      // 文字の書式は、文字を選んでいないと何も起きない（ルール1）
      if (sel.collapsed) return { result: { ok: false, reason: "noSelection" } }
      const key = id === "bold" ? "b" : id === "italic" ? "i" : "u"
      const ranges = pids.map((pid) => {
        const start = pid === sel.startPid ? sel.startOff : 0
        const end = pid === sel.endPid ? sel.endOff : next[pid].text.length
        return { pid, start, end }
      })
      const chars = ranges.flatMap(({ pid, start, end }) => next[pid].fmt.slice(start, end))
      if (chars.length === 0) return { result: { ok: false, reason: "empty" } }
      const allOn = chars.every((f) => f[key])
      ranges.forEach(({ pid, start, end }) => {
        for (let i = start; i < end; i++) next[pid].fmt[i][key] = !allOn
      })
      return { doc: next, result: { ok: true } }
    }
    default:
      return { result: { ok: false, reason: "unused" } }
  }
}

function renderRuns(p: Para) {
  if (p.text.length === 0) return "​"
  const runs: { text: string; f: CharFmt }[] = []
  Array.from(p.text).forEach((ch, i) => {
    const f = p.fmt[i]
    const last = runs[runs.length - 1]
    if (last && last.f.b === f.b && last.f.i === f.i && last.f.u === f.u) last.text += ch
    else runs.push({ text: ch, f })
  })
  return runs.map((r, i) => (
    <span key={i} className={cn(r.f.b && "font-bold", r.f.i && "italic", r.f.u && "underline")}>{r.text}</span>
  ))
}

// 用紙（A4風）の上に段落を表示する
export function DocPage({
  doc,
  pageRef,
  currentPid,
  onCaret,
}: {
  doc: Para[]
  pageRef: React.RefObject<HTMLDivElement | null>
  currentPid: number | null
  onCaret: () => void
}) {
  let num = 0
  return (
    <div className="bg-[#f9fbfd] px-2 md:px-6 py-6 overflow-x-auto">
      <div
        ref={pageRef}
        onMouseUp={onCaret}
        onKeyUp={onCaret}
        className="mx-auto bg-white shadow-md border border-slate-200 w-full max-w-[680px] min-h-[520px] px-8 md:px-16 py-12 text-slate-900 cursor-text select-text"
        style={{ fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif" }}
      >
        {doc.map((p, pid) => {
          num = p.list === "number" ? num + 1 : 0
          return (
            <div
              key={pid}
              data-pid={pid}
              className={cn(
                "flex gap-2 py-0.5 rounded-sm min-h-[1.6em]",
                currentPid === pid && "bg-sky-50/80",
                p.list !== "none" && "pl-4",
              )}
              style={{ fontSize: `${(p.size / DEFAULT_SIZE) * 15}px`, lineHeight: 1.6 }}
            >
              {p.list !== "none" && (
                <span className="select-none shrink-0 w-5 text-right" contentEditable={false}>
                  {p.list === "bullet" ? "●" : `${num}.`}
                </span>
              )}
              <span
                data-text
                className="flex-1 block whitespace-pre-wrap"
                style={{ textAlign: p.align }}
              >
                {renderRuns(p)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// エディタ全体（ヘッダー＋ツールバー＋用紙）。書式の判定は呼び出し側で行う
export function DocEditor({
  initial,
  title,
  onTitleChange,
  onDocChange,
  onMessage,
  flash,
}: {
  initial: Para[]
  title?: string
  onTitleChange?: (v: string) => void
  onDocChange?: (doc: Para[], lastTool: ToolId | null) => void
  onMessage?: (msg: React.ReactNode) => void
  flash?: ToolId
}) {
  const { doc, commit, undo, redo } = useDocEditor(initial)
  const pageRef = useRef<HTMLDivElement>(null)
  const [currentPid, setCurrentPid] = useState<number | null>(null)
  const lastToolRef = useRef<ToolId | null>(null)
  const onDocChangeRef = useRef(onDocChange)
  onDocChangeRef.current = onDocChange

  useEffect(() => {
    onDocChangeRef.current?.(doc, lastToolRef.current)
  }, [doc])

  const updateCaret = () => {
    if (!pageRef.current) return
    const s = readSelection(pageRef.current)
    setCurrentPid(s ? s.startPid : null)
  }

  const handle = useCallback((id: ToolId) => {
    lastToolRef.current = id
    if (id === "undo") {
      if (!undo()) onMessage?.("これ以上は戻せないよ / Nothing to undo")
      return
    }
    if (id === "redo") {
      if (!redo()) onMessage?.("やり直すものがないよ / Nothing to redo")
      return
    }
    const sel = pageRef.current ? readSelection(pageRef.current) : null
    const { doc: next, result } = applyTool(doc, id, sel)
    if (result.ok && next) {
      commit(next)
      onMessage?.(null)
    } else if (!result.ok) {
      if (result.reason === "unused") onMessage?.("このボタンは、今回の練習では使わないよ / Not used in this practice")
      else if (result.reason === "noSelection") {
        onMessage?.(
          id === "bold" || id === "italic" || id === "underline"
            ? "先に文字をマウスでなぞって選んでね（ルール1） / Select the text first"
            : "先に、変えたい行をクリックしてね（ルール1） / Click the line first",
        )
      }
    }
  }, [doc, commit, undo, redo, onMessage])

  // Ctrl+Z / Ctrl+Y / Ctrl+B なども使えるようにする（入力欄にいるときは除く）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (!(e.ctrlKey || e.metaKey)) return
      const k = e.key.toLowerCase()
      const map: Record<string, ToolId> = { z: e.shiftKey ? "redo" : "undo", y: "redo", b: "bold", i: "italic", u: "underline" }
      if (map[k]) {
        e.preventDefault()
        handle(map[k])
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handle])

  const cur = currentPid != null ? doc[currentPid] : null
  const active: Partial<Record<ToolId, boolean>> = cur
    ? {
        alignLeft: cur.align === "left",
        alignCenter: cur.align === "center",
        alignRight: cur.align === "right",
        alignJustify: cur.align === "justify",
        bulleted: cur.list === "bullet",
        numbered: cur.list === "number",
      }
    : {}

  return (
    <div className="rounded-2xl border-2 border-slate-300 overflow-hidden bg-white shadow-md">
      <DocHeader title={title} onTitleChange={onTitleChange} onMenu={() => onMessage?.("メニューは、今回の練習では使わないよ。ツールバーのボタンを使おう / Use the toolbar buttons")} />
      <div className="px-3 py-2">
        <DocToolbar onAction={handle} size={cur?.size ?? null} active={active} flash={flash} />
      </div>
      <DocPage doc={doc} pageRef={pageRef} currentPid={currentPid} onCaret={updateCaret} />
    </div>
  )
}
