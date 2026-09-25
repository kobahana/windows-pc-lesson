"use client"

// Googleスプレッドシート風の練習用シート。
// - セルをクリックしてそのまま入力（日本語入力にも対応）、Enter で確定して下へ、Tab で右へ
// - 数式の入力中に別のセルをクリックすると、そのセル番地が式に入る（本物と同じ）
// - ドラッグで範囲選択、右下の■（フィルハンドル）を引っぱってオートフィル
// - ツールバー：元に戻す・やり直し・通貨・太字・罫線・セル結合・配置・関数
// - skin="excel" で Excel 風の見た目にもなる（L10 で使う）

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Undo2, Redo2, Printer, JapaneseYen, Percent, Bold, Grid3x3, TableCellsMerge, AlignLeft, AlignCenter, AlignRight,
  Sigma, ChevronDown, Sheet as SheetIcon, Star, Lock, FileSpreadsheet,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Cell, type CellFmt, type SheetState, colName, display, evaluate, formulaProblem, isError, key, mergeAt, shiftFormula,
} from "./sheet-engine"

export type SheetTool =
  | "undo" | "redo" | "print" | "currency" | "percent" | "bold" | "bordersAll" | "bordersNone"
  | "merge" | "unmerge" | "alignLeft" | "alignCenter" | "alignRight" | "sum" | "average"

interface Sel { r0: number; c0: number; r1: number; c1: number }
const norm = (s: Sel): Sel => ({ r0: Math.min(s.r0, s.r1), c0: Math.min(s.c0, s.c1), r1: Math.max(s.r0, s.r1), c1: Math.max(s.c0, s.c1) })

function clone(s: SheetState): SheetState {
  return {
    cells: Object.fromEntries(Object.entries(s.cells).map(([k, v]) => [k, { raw: v.raw, fmt: v.fmt ? { ...v.fmt } : undefined }])),
    merges: s.merges.map((m) => ({ ...m })),
    borders: { ...s.borders },
  }
}

function ToolBtn({
  name, icon, onClick, dropdown, active,
}: { name: string; icon: React.ReactNode; onClick: () => void; dropdown?: boolean; active?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={name}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn("flex items-center p-1.5 rounded text-slate-700 hover:bg-slate-200", active && "bg-sky-100")}
      >
        {icon}
        {dropdown && <ChevronDown className="w-3 h-3 ml-0.5" />}
      </button>
      {hover && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-40 whitespace-nowrap bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded pointer-events-none">
          {name}
        </span>
      )}
    </span>
  )
}

function Dropdown({ open, items, onPick, onClose }: {
  open: boolean
  items: { id: SheetTool; label: string; icon?: React.ReactNode }[]
  onPick: (id: SheetTool) => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-30" onMouseDown={onClose} />
      <div className="absolute left-0 top-full z-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-44 text-sm">
        {items.map((it) => (
          <button key={it.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(it.id); onClose() }} className="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-blue-50">
            {it.icon}{it.label}
          </button>
        ))}
      </div>
    </>
  )
}

export function Sheet({
  initial,
  rows,
  cols,
  colWidths,
  title,
  onTitleChange,
  onChange,
  onMessage,
  highlight = [],
  skin = "google",
  appName,
}: {
  initial: SheetState
  rows: number
  cols: number
  colWidths?: number[]
  title?: string
  onTitleChange?: (v: string) => void
  onChange?: (s: SheetState, info: { lastTool?: SheetTool; filled?: boolean }) => void
  onMessage?: (m: React.ReactNode) => void
  highlight?: string[]
  skin?: "google" | "excel"
  appName?: string
}) {
  const [state, setState] = useState<SheetState>(() => clone(initial))
  const undoRef = useRef<SheetState[]>([])
  const redoRef = useRef<SheetState[]>([])
  const stateRef = useRef(state)
  stateRef.current = state
  const infoRef = useRef<{ lastTool?: SheetTool; filled?: boolean }>({})
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [sel, setSel] = useState<Sel>({ r0: 0, c0: 0, r1: 0, c1: 0 })
  const [active, setActive] = useState({ r: 0, c: 0 })
  const [editing, setEditing] = useState<"cell" | "bar" | null>(null)
  const [editValue, setEditValue] = useState("")
  const [menu, setMenu] = useState<string | null>(null)
  const [fillTo, setFillToState] = useState<{ r: number; c: number } | null>(null)
  const fillToRef = useRef<{ r: number; c: number } | null>(null)
  const setFillTo = (v: { r: number; c: number } | null) => {
    fillToRef.current = v
    setFillToState(v)
  }
  const draggingRef = useRef(false)
  const fillingRef = useRef(false)
  const composingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const barRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onChangeRef.current?.(state, infoRef.current)
    infoRef.current = {}
  }, [state])

  const commitState = useCallback((next: SheetState, info: { lastTool?: SheetTool; filled?: boolean } = {}) => {
    undoRef.current.push(stateRef.current)
    redoRef.current = []
    infoRef.current = info
    setState(next)
  }, [])

  const focusCell = () => setTimeout(() => inputRef.current?.focus(), 0)

  const selectCell = (r: number, c: number, extend = false) => {
    const m = mergeAt(stateRef.current, r, c)
    if (extend) {
      setSel((s) => ({ ...s, r1: m ? m.r1 : r, c1: m ? m.c1 : c }))
    } else {
      setActive({ r: m ? m.r0 : r, c: m ? m.c0 : c })
      setSel(m ? { r0: m.r0, c0: m.c0, r1: m.r1, c1: m.c1 } : { r0: r, c0: c, r1: r, c1: c })
    }
  }

  const activeKey = key(active.r, active.c)
  const activeRaw = state.cells[activeKey]?.raw ?? ""

  const commitEdit = (value: string, move: "down" | "right" | "none" = "down") => {
    const next = clone(stateRef.current)
    const cell: Cell = next.cells[activeKey] ?? { raw: "" }
    cell.raw = value
    next.cells[activeKey] = cell
    if ((stateRef.current.cells[activeKey]?.raw ?? "") !== value) commitState(next)
    setEditing(null)
    setEditValue("")
    const problem = formulaProblem(value)
    onMessage?.(problem)
    if (!problem && value.trim().startsWith("=")) {
      const v = evaluate(next, activeKey)
      if (isError(v)) onMessage?.(`計算できないよ（${v.error}）。式をもう一度見てみよう / The formula has an error`)
    }
    const m = mergeAt(next, active.r, active.c)
    if (move === "down") selectCell(Math.min(rows - 1, (m ? m.r1 : active.r) + 1), active.c)
    if (move === "right") selectCell(active.r, Math.min(cols - 1, (m ? m.c1 : active.c) + 1))
    focusCell()
  }

  const tool = (id: SheetTool) => {
    const s = norm(sel)
    const next = clone(stateRef.current)
    const forEach = (fn: (k: string) => void) => {
      for (let r = s.r0; r <= s.r1; r++) for (let c = s.c0; c <= s.c1; c++) fn(key(r, c))
    }
    const setFmt = (patch: (f: CellFmt) => CellFmt) => forEach((k) => {
      const cell = next.cells[k] ?? { raw: "" }
      cell.fmt = patch({ ...(cell.fmt ?? {}) })
      next.cells[k] = cell
    })
    switch (id) {
      case "undo": {
        const prev = undoRef.current.pop()
        if (!prev) return onMessage?.("これ以上は戻せないよ / Nothing to undo")
        redoRef.current.push(stateRef.current)
        infoRef.current = { lastTool: "undo" }
        setState(prev)
        return
      }
      case "redo": {
        const nx = redoRef.current.pop()
        if (!nx) return onMessage?.("やり直すものがないよ / Nothing to redo")
        undoRef.current.push(stateRef.current)
        infoRef.current = { lastTool: "redo" }
        setState(nx)
        return
      }
      case "currency": {
        const on = !next.cells[key(s.r0, s.c0)]?.fmt?.currency
        setFmt((f) => ({ ...f, currency: on }))
        break
      }
      case "bold": {
        const on = !next.cells[key(s.r0, s.c0)]?.fmt?.bold
        setFmt((f) => ({ ...f, bold: on }))
        break
      }
      case "alignLeft": setFmt((f) => ({ ...f, align: "left" })); break
      case "alignCenter": setFmt((f) => ({ ...f, align: "center" })); break
      case "alignRight": setFmt((f) => ({ ...f, align: "right" })); break
      case "bordersAll": forEach((k) => { next.borders[k] = true }); break
      case "bordersNone": forEach((k) => { delete next.borders[k] }); break
      case "merge": {
        if (s.r0 === s.r1 && s.c0 === s.c1) return onMessage?.("結合するセルを、ドラッグで2つ以上選んでね（ルール1） / Select 2+ cells first")
        next.merges = next.merges.filter((m) => m.r1 < s.r0 || m.r0 > s.r1 || m.c1 < s.c0 || m.c0 > s.c1)
        // 左上以外のセルの中身は消える（本物と同じ）
        forEach((k) => { if (k !== key(s.r0, s.c0)) delete next.cells[k] })
        next.merges.push({ ...s })
        setActive({ r: s.r0, c: s.c0 })
        break
      }
      case "unmerge":
        next.merges = next.merges.filter((m) => m.r1 < s.r0 || m.r0 > s.r1 || m.c1 < s.c0 || m.c0 > s.c1)
        break
      case "sum":
      case "average": {
        setEditing("cell")
        setEditValue(`=${id === "sum" ? "SUM" : "AVERAGE"}(`)
        onMessage?.("続けて、合計したいセルをドラッグで選ぶか、D6:D9 のように入力して、最後に ) と Enter / Select the range, then ) and Enter")
        focusCell()
        return
      }
      default:
        return onMessage?.("このボタンは、今回の練習では使わないよ / Not used in this practice")
    }
    onMessage?.(null)
    commitState(next, { lastTool: id })
    focusCell()
  }

  // マウス操作（ドラッグ選択・フィルハンドル）
  useEffect(() => {
    const up = () => {
      draggingRef.current = false
      if (fillingRef.current) {
        fillingRef.current = false
        const target = fillToRef.current
        setFillTo(null)
        if (target) applyFill(target)
      }
    }
    window.addEventListener("pointerup", up)
    return () => window.removeEventListener("pointerup", up)
  })

  const applyFill = (target: { r: number; c: number }) => {
    const s = norm(sel)
    const next = clone(stateRef.current)
    const h = s.r1 - s.r0 + 1
    const w = s.c1 - s.c0 + 1
    let changed = false
    if (target.r > s.r1) {
      for (let r = s.r1 + 1; r <= target.r; r++) {
        const sr = s.r0 + ((r - s.r0) % h)
        for (let c = s.c0; c <= s.c1; c++) {
          const src = next.cells[key(sr, c)]
          next.cells[key(r, c)] = { raw: shiftFormula(src?.raw ?? "", r - sr, 0), fmt: src?.fmt ? { ...src.fmt } : undefined }
          changed = true
        }
      }
      setSel({ ...s, r1: target.r })
    } else if (target.c > s.c1) {
      for (let c = s.c1 + 1; c <= target.c; c++) {
        const sc = s.c0 + ((c - s.c0) % w)
        for (let r = s.r0; r <= s.r1; r++) {
          const src = next.cells[key(r, sc)]
          next.cells[key(r, c)] = { raw: shiftFormula(src?.raw ?? "", 0, c - sc), fmt: src?.fmt ? { ...src.fmt } : undefined }
          changed = true
        }
      }
      setSel({ ...s, c1: target.c })
    }
    if (changed) commitState(next, { filled: true })
  }

  const onCellPointerDown = (e: React.PointerEvent, r: number, c: number) => {
    if (e.button !== 0) return
    // 数式の入力中にクリック → セル番地を式に入れる
    if (editing && editValue.trim().startsWith("=") && !(r === active.r && c === active.c)) {
      e.preventDefault()
      setEditValue((v) => v + key(r, c))
      ;(editing === "bar" ? barRef : inputRef).current?.focus()
      return
    }
    if (editing) commitEdit(editValue, "none")
    e.preventDefault()
    draggingRef.current = true
    selectCell(r, c, e.shiftKey)
    focusCell()
  }

  const onCellPointerEnter = (r: number, c: number) => {
    if (fillingRef.current) {
      const s = norm(sel)
      if (r > s.r1) setFillTo({ r, c: s.c1 })
      else if (c > s.c1) setFillTo({ r: s.r1, c })
      else setFillTo(null)
      return
    }
    if (draggingRef.current && !editing) selectCell(r, c, true)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || composingRef.current) return
    const mod = e.ctrlKey || e.metaKey
    if (mod && !editing) {
      const k = e.key.toLowerCase()
      if (k === "z") { e.preventDefault(); tool(e.shiftKey ? "redo" : "undo"); return }
      if (k === "y") { e.preventDefault(); tool("redo"); return }
      if (k === "b") { e.preventDefault(); tool("bold"); return }
      return
    }
    if (editing) {
      if (e.key === "Enter") { e.preventDefault(); commitEdit(editValue, "down") }
      else if (e.key === "Tab") { e.preventDefault(); commitEdit(editValue, "right") }
      else if (e.key === "Escape") { setEditing(null); setEditValue(""); focusCell() }
      return
    }
    const move = (dr: number, dc: number) => {
      e.preventDefault()
      const r = Math.max(0, Math.min(rows - 1, (e.shiftKey ? sel.r1 : active.r) + dr))
      const c = Math.max(0, Math.min(cols - 1, (e.shiftKey ? sel.c1 : active.c) + dc))
      selectCell(r, c, e.shiftKey)
    }
    switch (e.key) {
      case "ArrowDown": return move(1, 0)
      case "ArrowUp": return move(-1, 0)
      case "ArrowLeft": return move(0, -1)
      case "ArrowRight": return move(0, 1)
      case "Tab": return move(0, e.shiftKey ? -1 : 1)
      case "Enter":
        e.preventDefault()
        setEditing("cell")
        setEditValue(activeRaw)
        return
      case "Delete":
      case "Backspace": {
        e.preventDefault()
        const s = norm(sel)
        const next = clone(stateRef.current)
        for (let r = s.r0; r <= s.r1; r++) for (let c = s.c0; c <= s.c1; c++) {
          const cell = next.cells[key(r, c)]
          if (cell) cell.raw = ""
        }
        commitState(next)
        return
      }
    }
  }

  const s = norm(sel)
  const inSel = (r: number, c: number) => r >= s.r0 && r <= s.r1 && c >= s.c0 && c <= s.c1
  const fillPreview = fillTo
    ? (r: number, c: number) => (fillTo.r > s.r1 ? r > s.r1 && r <= fillTo.r && c >= s.c0 && c <= s.c1 : c > s.c1 && c <= fillTo.c && r >= s.r0 && r <= s.r1)
    : () => false
  const excel = skin === "excel"

  return (
    <div className={cn("rounded-2xl border-2 overflow-hidden bg-white shadow-md select-none", excel ? "border-emerald-700" : "border-slate-300")}>
      {/* 上部 */}
      {excel ? (
        <div className="bg-emerald-700 text-white px-3 py-1.5 flex items-center gap-2 text-sm">
          <FileSpreadsheet className="w-5 h-5" />
          <span className="font-bold">{title ?? "Book1"} - {appName ?? "表計算"}</span>
          <span className="ml-auto flex gap-3 opacity-90">
            {["ファイル", "ホーム", "挿入", "数式", "データ"].map((m) => <span key={m}>{m}</span>)}
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2 px-3 pt-2">
          <SheetIcon className="w-9 h-9 text-green-600 fill-green-100 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {onTitleChange ? (
                <input
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  aria-label="スプレッドシートの名前"
                  className="text-lg px-1.5 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-72 max-w-full select-text"
                />
              ) : (
                <span className="text-lg px-1.5">{title}</span>
              )}
              <Star className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex flex-wrap text-sm text-slate-700">
              {["ファイル", "編集", "表示", "挿入", "表示形式", "データ", "ツール"].map((m) => (
                <button key={m} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onMessage?.("メニューは、今回の練習では使わないよ。ツールバーのボタンを使おう")} className="px-1.5 py-0.5 rounded hover:bg-slate-200">{m}</button>
              ))}
            </div>
          </div>
          <span className="hidden md:flex items-center gap-1.5 bg-[#c2e7ff] text-slate-800 rounded-full px-4 py-2 text-sm font-bold shrink-0">
            <Lock className="w-4 h-4" /> 共有
          </span>
        </div>
      )}

      {/* ツールバー */}
      <div className={cn("mx-3 my-2 flex flex-wrap items-center gap-0.5 px-3 py-1", excel ? "bg-emerald-50 rounded-md border border-emerald-200" : "bg-[#edf2fa] rounded-full")}>
        <ToolBtn name="元に戻す（Ctrl+Z）" icon={<Undo2 className="w-[18px] h-[18px]" />} onClick={() => tool("undo")} />
        <ToolBtn name="やり直し（Ctrl+Y）" icon={<Redo2 className="w-[18px] h-[18px]" />} onClick={() => tool("redo")} />
        <ToolBtn name="印刷（Ctrl+P）" icon={<Printer className="w-[18px] h-[18px]" />} onClick={() => tool("print")} />
        <span className="w-px h-5 bg-slate-300 mx-1.5" />
        <ToolBtn name="通貨形式（¥）" icon={<JapaneseYen className="w-[18px] h-[18px]" />} onClick={() => tool("currency")} />
        <ToolBtn name="パーセント形式" icon={<Percent className="w-[18px] h-[18px]" />} onClick={() => tool("percent")} />
        <span className="w-px h-5 bg-slate-300 mx-1.5" />
        <ToolBtn name="太字（Ctrl+B）" icon={<Bold className="w-[18px] h-[18px]" />} onClick={() => tool("bold")} active={!!state.cells[activeKey]?.fmt?.bold} />
        <span className="relative inline-flex">
          <ToolBtn name="枠線" icon={<Grid3x3 className="w-[18px] h-[18px]" />} dropdown onClick={() => setMenu(menu === "border" ? null : "border")} />
          <Dropdown open={menu === "border"} onClose={() => setMenu(null)} onPick={tool} items={[
            { id: "bordersAll", label: "すべての枠線", icon: <Grid3x3 className="w-4 h-4" /> },
            { id: "bordersNone", label: "枠線なし", icon: <span className="w-4 h-4 border border-dashed border-slate-300 inline-block" /> },
          ]} />
        </span>
        <span className="relative inline-flex">
          <ToolBtn name="セルを結合" icon={<TableCellsMerge className="w-[18px] h-[18px]" />} dropdown onClick={() => setMenu(menu === "merge" ? null : "merge")} />
          <Dropdown open={menu === "merge"} onClose={() => setMenu(null)} onPick={tool} items={[
            { id: "merge", label: "すべて結合" },
            { id: "unmerge", label: "結合を解除" },
          ]} />
        </span>
        <span className="w-px h-5 bg-slate-300 mx-1.5" />
        <span className="relative inline-flex">
          <ToolBtn name="水平方向の配置" icon={<AlignLeft className="w-[18px] h-[18px]" />} dropdown onClick={() => setMenu(menu === "align" ? null : "align")} />
          <Dropdown open={menu === "align"} onClose={() => setMenu(null)} onPick={tool} items={[
            { id: "alignLeft", label: "左", icon: <AlignLeft className="w-4 h-4" /> },
            { id: "alignCenter", label: "中央", icon: <AlignCenter className="w-4 h-4" /> },
            { id: "alignRight", label: "右", icon: <AlignRight className="w-4 h-4" /> },
          ]} />
        </span>
        <span className="relative inline-flex">
          <ToolBtn name="関数" icon={<Sigma className="w-[18px] h-[18px]" />} dropdown onClick={() => setMenu(menu === "fn" ? null : "fn")} />
          <Dropdown open={menu === "fn"} onClose={() => setMenu(null)} onPick={tool} items={[
            { id: "sum", label: "SUM（合計）" },
            { id: "average", label: "AVERAGE（平均）" },
          ]} />
        </span>
      </div>

      {/* 数式バー */}
      <div className="flex items-center border-y border-slate-200 text-sm">
        <span className="w-16 text-center font-mono text-slate-600 border-r border-slate-200 py-1.5">{activeKey}</span>
        <span className="px-2 text-slate-400 italic font-serif">fx</span>
        <input
          ref={barRef}
          aria-label="数式バー"
          value={editing ? editValue : activeRaw}
          onFocus={() => { if (!editing) { setEditing("bar"); setEditValue(activeRaw) } }}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => { composingRef.current = true }}
          onCompositionEnd={() => { composingRef.current = false }}
          className="flex-1 px-2 py-1.5 outline-none font-mono select-text"
        />
      </div>

      {/* グリッド */}
      <div className="overflow-auto max-h-[460px]">
        <table className="border-collapse text-[15px] table-fixed">
          <colgroup>
            <col style={{ width: 40 }} />
            {Array.from({ length: cols }, (_, c) => <col key={c} style={{ width: colWidths?.[c] ?? 100 }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="bg-slate-100 border border-slate-300 sticky top-0 z-10" />
              {Array.from({ length: cols }, (_, c) => (
                <th key={c} className={cn("bg-slate-100 border border-slate-300 font-normal text-slate-600 text-xs py-1 sticky top-0 z-10", c >= s.c0 && c <= s.c1 && "bg-sky-100 text-sky-800")}>
                  {colName(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r} style={{ height: 30 }}>
                <th className={cn("bg-slate-100 border border-slate-300 font-normal text-slate-600 text-xs", r >= s.r0 && r <= s.r1 && "bg-sky-100 text-sky-800")}>{r + 1}</th>
                {Array.from({ length: cols }, (_, c) => {
                  const m = mergeAt(state, r, c)
                  if (m && (m.r0 !== r || m.c0 !== c)) return null
                  const k = key(r, c)
                  const cell = state.cells[k]
                  const shown = display(state, k)
                  const v = evaluate(state, k)
                  const isNum = typeof v === "number"
                  const isActive = active.r === r && active.c === c
                  const bottomRight = r === (mergeAt(state, s.r1, s.c1)?.r0 ?? s.r1) && c === (mergeAt(state, s.r1, s.c1)?.c0 ?? s.c1)
                  const align = cell?.fmt?.align ?? (isNum ? "right" : "left")
                  return (
                    <td
                      key={c}
                      colSpan={m ? m.c1 - m.c0 + 1 : undefined}
                      rowSpan={m ? m.r1 - m.r0 + 1 : undefined}
                      onPointerDown={(e) => onCellPointerDown(e, r, c)}
                      onPointerEnter={() => onCellPointerEnter(r, c)}
                      onDoubleClick={() => { setEditing("cell"); setEditValue(cell?.raw ?? ""); focusCell() }}
                      className={cn(
                        "relative px-1.5 whitespace-nowrap cursor-cell",
                        isActive ? "overflow-visible" : "overflow-hidden",
                        state.borders[k] ? "border border-slate-900" : "border border-slate-200",
                        inSel(r, c) && !isActive && "bg-sky-100/70",
                        fillPreview(r, c) && "bg-sky-50 outline-dashed outline-1 outline-sky-500 -outline-offset-2",
                        highlight.includes(k) && !inSel(r, c) && "bg-yellow-100",
                        cell?.fmt?.bold && "font-bold",
                        isError(v) && "text-red-600",
                      )}
                      style={{ textAlign: align }}
                    >
                      {isActive && <span className="absolute inset-0 border-2 border-blue-600 pointer-events-none z-[5]" />}
                      {shown}
                      {isActive && (
                        <input
                          ref={inputRef}
                          autoFocus
                          aria-label={`セル ${k}`}
                          value={editing === "cell" ? editValue : ""}
                          onChange={(e) => {
                            if (editing !== "cell") setEditing("cell")
                            setEditValue(e.target.value)
                          }}
                          onKeyDown={onKeyDown}
                          onCompositionStart={() => { composingRef.current = true; if (editing !== "cell") { setEditing("cell"); setEditValue("") } }}
                          onCompositionEnd={() => { composingRef.current = false }}
                          className={cn(
                            "absolute left-0 top-0 h-full min-w-full px-1.5 outline-none z-10 font-[inherit] select-text",
                            editing === "cell" ? "bg-white border-2 border-blue-600 w-auto" : "opacity-0 w-full caret-transparent",
                          )}
                          style={{ width: editing === "cell" ? Math.max(100, editValue.length * 16 + 24) : undefined }}
                        />
                      )}
                      {bottomRight && !editing && (
                        <span
                          aria-label="フィルハンドル"
                          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); fillingRef.current = true }}
                          className="absolute right-0 bottom-0 w-3 h-3 bg-blue-600 border border-white z-20 cursor-crosshair"
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
