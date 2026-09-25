"use client"

// L8 ミッション3：請求書をつくろう
// タイトル・セル結合・数式（掛け算/オートフィル/SUM/消費税/合計）・罫線・通貨表示。
// 書式はすべてツールバーのボタンで行い、チェックリストで自動判定する。

import { useEffect, useMemo, useState } from "react"
import { Card, MissionFrame, Ruby, Tip, Warn, useStepFlow } from "@/components/lesson/kit"
import { Sheet } from "./sheet"
import { type SheetState, evaluate, usesCellRef } from "./sheet-engine"
import { CheckCircle2, Circle, TableCellsMerge, AlignCenter, Grid3x3, JapaneseYen, Sigma } from "lucide-react"
import { cn } from "@/lib/utils"

const FILE_NAME = "請求書_さくら商事"

const INITIAL: SheetState = {
  cells: {
    A3: { raw: "株式会社さくら商事 御中" },
    D3: { raw: "2026/10/31", fmt: { align: "right" } },
    A5: { raw: "品名", fmt: { bold: true } }, B5: { raw: "単価", fmt: { bold: true } }, C5: { raw: "数量", fmt: { bold: true } }, D5: { raw: "金額", fmt: { bold: true } },
    A6: { raw: "ノート" }, B6: { raw: "150" }, C6: { raw: "10" },
    A7: { raw: "ボールペン" }, B7: { raw: "100" }, C7: { raw: "20" },
    A8: { raw: "クリアファイル" }, B8: { raw: "200" }, C8: { raw: "5" },
    A9: { raw: "付せん" }, B9: { raw: "250" }, C9: { raw: "4" },
    C10: { raw: "小計" }, C11: { raw: "消費税（10%）" }, C12: { raw: "合計", fmt: { bold: true } },
  },
  merges: [],
  borders: {},
}

interface Task {
  label: React.ReactNode
  icon?: React.ReactNode
  cells?: string[]
  done: (s: SheetState, title: string) => boolean
}

const ref = (s: SheetState, k: string) => s.cells[k]?.raw ?? ""

const TASKS: Task[] = [
  { label: <>ファイル<Ruby rt="めい">名</Ruby>を「{FILE_NAME}」にする</>, done: (_s, t) => t.trim() === FILE_NAME },
  { label: <>A1 に「<Ruby rt="せいきゅうしょ">請求書</Ruby>」と<Ruby rt="にゅうりょく">入力</Ruby></>, cells: ["A1"], done: (s) => ref(s, "A1").trim() === "請求書" },
  { label: <>A1〜D1 を<Ruby rt="けつごう">結合</Ruby>する</>, icon: <TableCellsMerge className="w-4 h-4" />, done: (s) => s.merges.some((m) => m.r0 === 0 && m.c0 === 0 && m.r1 === 0 && m.c1 >= 3) },
  { label: <>「<Ruby rt="せいきゅうしょ">請求書</Ruby>」を<Ruby rt="ちゅうおう">中央</Ruby>に<Ruby rt="はいち">配置</Ruby></>, icon: <AlignCenter className="w-4 h-4" />, done: (s) => s.cells.A1?.fmt?.align === "center" },
  { label: <>D6 に<Ruby rt="きんがく">金額</Ruby>の<Ruby rt="しき">式</Ruby>（<Ruby rt="たんか">単価</Ruby>×<Ruby rt="すうりょう">数量</Ruby>をセルで）</>, cells: ["D6"], done: (s) => usesCellRef(ref(s, "D6")) && /B6/i.test(ref(s, "D6")) && /C6/i.test(ref(s, "D6")) && evaluate(s, "D6") === 1500 },
  { label: <>D6 の■を D9 まで<Ruby rt="ひ">引</Ruby>っぱる（オートフィル）</>, cells: ["D7", "D8", "D9"], done: (s) => [7, 8, 9].every((r, i) => usesCellRef(ref(s, `D${r}`)) && new RegExp(`B${r}`, "i").test(ref(s, `D${r}`)) && evaluate(s, `D${r}`) === [2000, 1000, 1000][i]) },
  { label: <>D10 に<Ruby rt="しょうけい">小計</Ruby>（SUM）</>, icon: <Sigma className="w-4 h-4" />, cells: ["D10"], done: (s) => /SUM\(/i.test(ref(s, "D10")) && evaluate(s, "D10") === 5500 },
  { label: <>D11 に<Ruby rt="しょうひぜい">消費税</Ruby>（<Ruby rt="しょうけい">小計</Ruby>×0.1）</>, cells: ["D11"], done: (s) => usesCellRef(ref(s, "D11")) && /D10/i.test(ref(s, "D11")) && evaluate(s, "D11") === 550 },
  { label: <>D12 に<Ruby rt="ごうけい">合計</Ruby>（<Ruby rt="しょうけい">小計</Ruby>＋<Ruby rt="しょうひぜい">消費税</Ruby>）</>, cells: ["D12"], done: (s) => usesCellRef(ref(s, "D12")) && evaluate(s, "D12") === 6050 },
  { label: <>A5〜D9 に<Ruby rt="けいせん">罫線</Ruby>（すべての<Ruby rt="わくせん">枠線</Ruby>）</>, icon: <Grid3x3 className="w-4 h-4" />, done: (s) => [5, 6, 7, 8, 9].every((r) => ["A", "B", "C", "D"].every((c) => s.borders[`${c}${r}`])) },
  { label: <>D6〜D12 を<Ruby rt="えん">円</Ruby>（¥）の<Ruby rt="ひょうじ">表示</Ruby>に</>, icon: <JapaneseYen className="w-4 h-4" />, done: (s) => [6, 7, 8, 9, 10, 11, 12].every((r) => s.cells[`D${r}`]?.fmt?.currency) },
]

export function InvoiceMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(1, onComplete)
  const [state, setState] = useState<SheetState>(INITIAL)
  const [title, setTitle] = useState("無題のスプレッドシート")
  const [msg, setMsg] = useState<React.ReactNode>(null)

  const status = useMemo(() => TASKS.map((t) => t.done(state, title)), [state, title])
  const allDone = status.every(Boolean)
  useEffect(() => {
    if (allDone) succeed("りっぱな請求書！")
  }, [allDone, succeed])

  const nextTask = TASKS.findIndex((_, i) => !status[i])
  const highlight = nextTask >= 0 ? TASKS[nextTask].cells ?? [] : []

  return (
    <MissionFrame
      wide
      message={<><Ruby rt="せいきゅうしょ">請求書</Ruby>を<Ruby rt="つく">作</Ruby>ろう！<Ruby rt="みぎ">右</Ruby>のチェックリストを<Ruby rt="うえ">上</Ruby>から<Ruby rt="じゅん">順</Ruby>にやってみてね。<Ruby rt="まちが">間違</Ruby>えても <b>Ctrl+Z</b> で<Ruby rt="もど">戻</Ruby>せるよ。<span className="block text-sm text-muted-foreground mt-1">Make an invoice. Follow the checklist.</span></>}
      step={step}
      total={1}
      showSuccess={showSuccess}
      successMsg={successMsg}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="space-y-3 min-w-0">
          <Sheet
            initial={INITIAL}
            rows={13}
            cols={5}
            colWidths={[170, 90, 130, 120, 80]}
            title={title}
            onTitleChange={setTitle}
            highlight={highlight}
            onChange={(s) => setState(s)}
            onMessage={setMsg}
          />
          <Warn>{msg}</Warn>
        </div>
        <div className="space-y-3 lg:sticky lg:top-2">
          <Card className="p-4 space-y-2">
            <p className="font-bold text-slate-800">チェックリスト（{status.filter(Boolean).length}/{TASKS.length}）</p>
            <ul className="space-y-1.5 text-sm">
              {TASKS.map((t, i) => (
                <li key={i} className={cn("flex gap-2 items-start", status[i] ? "text-success" : i === nextTask ? "text-slate-900 font-bold" : "text-slate-600")}>
                  {status[i] ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Circle className="w-5 h-5 shrink-0 text-slate-300" />}
                  <span>{t.label} {t.icon && <span className="inline-flex align-middle text-slate-500 border border-slate-200 rounded p-0.5 ml-0.5">{t.icon}</span>}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Tip>
            <p>・<Ruby rt="けつごう">結合</Ruby>・<Ruby rt="けいせん">罫線</Ruby>・¥ は、<Ruby rt="さき">先</Ruby>にセルを<b>ドラッグで<Ruby rt="えら">選</Ruby>んでから</b>ボタン（ルール1）</p>
            <p>・<Ruby rt="しき">式</Ruby>の<Ruby rt="とちゅう">途中</Ruby>でセルをクリックすると、セルの<Ruby rt="なまえ">名前</Ruby>が<Ruby rt="はい">入</Ruby>るよ</p>
            <p>・オートフィル：D6 を<Ruby rt="えら">選</Ruby>んで、<Ruby rt="みぎした">右下</Ruby>の<Ruby rt="あお">青</Ruby>い■を<Ruby rt="した">下</Ruby>へドラッグ</p>
          </Tip>
        </div>
      </div>
    </MissionFrame>
  )
}
