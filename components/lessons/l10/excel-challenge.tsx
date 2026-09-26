"use client"

// L10 ミッション3：Excel風の表計算にチャレンジ
// 見た目は違っても、Googleスプレッドシートで覚えたこと（式・結合・罫線・¥）がそのまま使える。

import { useEffect, useMemo, useState } from "react"
import { Card, MissionFrame, Ruby, Tip, Warn, useStepFlow } from "@/components/lesson/kit"
import { Sheet } from "@/components/lessons/l8/sheet"
import { type SheetState, evaluate, usesCellRef } from "@/components/lessons/l8/sheet-engine"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx } from "@/lib/i18n"

const INITIAL: SheetState = {
  cells: {
    A1: { raw: "10月の交通費", fmt: { bold: true } },
    A3: { raw: "日付", fmt: { bold: true } }, B3: { raw: "行き先", fmt: { bold: true } }, C3: { raw: "金額", fmt: { bold: true } },
    A4: { raw: "10/3" }, B4: { raw: "新宿（面接）" }, C4: { raw: "420" },
    A5: { raw: "10/8" }, B5: { raw: "渋谷（説明会）" }, C5: { raw: "380" },
    A6: { raw: "10/15" }, B6: { raw: "池袋（面接）" }, C6: { raw: "520" },
    A7: { raw: "10/22" }, B7: { raw: "横浜（研修）" }, C7: { raw: "1100" },
    A8: { raw: "10/29" }, B8: { raw: "品川（説明会）" }, C8: { raw: "460" },
    B9: { raw: "合計", fmt: { bold: true, align: "right" } },
  },
  merges: [],
  borders: {},
}
const TOTAL = 420 + 380 + 520 + 1100 + 460

const GOALS: { label: React.ReactNode; en: string; done: (s: SheetState) => boolean }[] = [
  { label: <>C9 に<Ruby rt="ごうけい">合計</Ruby>を<Ruby rt="しき">式</Ruby>で<Ruby rt="だ">出</Ruby>す</>, en: tx("Get the total in C9 with a formula"), done: (s) => usesCellRef(s.cells.C9?.raw ?? "") && evaluate(s, "C9") === TOTAL },
  { label: <>タイトル（A1）を A1〜C1 の<Ruby rt="まん">真ん</Ruby><Ruby rt="なか">中</Ruby>にする</>, en: tx("Put the title (A1) in the center of A1 to C1"), done: (s) => s.merges.some((m) => m.r0 === 0 && m.c0 === 0 && m.r1 === 0 && m.c1 >= 2) && s.cells.A1?.fmt?.align === "center" },
  { label: <><Ruby rt="ひょう">表</Ruby>（A3〜C9）に<Ruby rt="けいせん">罫線</Ruby></>, en: tx("Add borders to the table (A3 to C9)"), done: (s) => [3, 4, 5, 6, 7, 8, 9].every((r) => ["A", "B", "C"].every((c) => s.borders[`${c}${r}`])) },
  { label: <><Ruby rt="きんがく">金額</Ruby>（C4〜C9）を ¥ の<Ruby rt="ひょうじ">表示</Ruby>に</>, en: tx("Show the amounts (C4 to C9) in ¥"), done: (s) => [4, 5, 6, 7, 8, 9].every((r) => s.cells[`C${r}`]?.fmt?.currency) },
]

export function ExcelChallengeMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(1, onComplete)
  const [state, setState] = useState<SheetState>(INITIAL)
  const [msg, setMsg] = useState<React.ReactNode>(null)
  const status = useMemo(() => GOALS.map((g) => g.done(state)), [state])
  useEffect(() => {
    if (status.every(Boolean)) succeed("どんなアプリでも使える！")
  }, [status, succeed])

  return (
    <MissionFrame
      wide
      message={<><Ruby rt="かいしゃ">会社</Ruby>では Excel を<Ruby rt="つか">使</Ruby>うことも<Ruby rt="おお">多</Ruby>いよ。<Ruby rt="み">見</Ruby>た<Ruby rt="め">目</Ruby>はちがうけど…<Ruby rt="おぼ">覚</Ruby>えたことがそのまま<Ruby rt="つか">使</Ruby>えるかな？<Ruby rt="やりかた">やり方</Ruby>は<Ruby rt="おし">教</Ruby>えないよ！<span className="block text-sm text-muted-foreground mt-1"><T>An Excel-style app. Same skills, different look.</T></span></>}
      step={step}
      total={1}
      showSuccess={showSuccess}
      successMsg={successMsg}
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="space-y-3 min-w-0">
          <Sheet initial={INITIAL} rows={10} cols={4} colWidths={[110, 170, 120, 80]} title="交通費_10月" skin="excel" appName="表計算" onChange={setState} onMessage={setMsg} />
          <Warn>{msg}</Warn>
        </div>
        <div className="space-y-3">
          <Card className="p-4 space-y-2">
            <p className="font-bold text-slate-800">🎯 <Ruby rt="もくひょう">目標</Ruby>（{status.filter(Boolean).length}/{GOALS.length}）</p>
            {GOALS.map((g, i) => (
              <p key={i} className={cn("flex gap-2 items-start text-sm", status[i] ? "text-success" : "text-slate-700")}>
                {status[i] ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Circle className="w-5 h-5 shrink-0 text-slate-300" />}
                <span>{g.label}<span className="block text-xs text-slate-400"><T>{g.en}</T></span></span>
              </p>
            ))}
          </Card>
          <Tip title="ヒント">アイコンにマウスを<Ruby rt="の">乗</Ruby>せてみよう。<Ruby rt="かたち">形</Ruby>はGoogleスプレッドシートとほとんど<Ruby rt="おな">同</Ruby>じだよ。<span className="block text-sm text-slate-500 mt-1"><T>Put the mouse on the icons. The shapes are almost the same as Google Sheets.</T></span></Tip>
        </div>
      </div>
    </MissionFrame>
  )
}
