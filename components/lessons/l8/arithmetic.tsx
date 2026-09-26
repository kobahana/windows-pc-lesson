"use client"

// L8 ミッション1：四則計算（数で入れる / セルで入れる）
// ミッション2：セルで入れる理由（単価を変えると、セルの式だけ答えが変わる）

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, Key, MissionFrame, Ruby, Tip, Warn, useStepFlow } from "@/components/lesson/kit"
import { Sheet } from "./sheet"
import { type SheetState, evaluate, usesCellRef, usesOnlyNumbers } from "./sheet-engine"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { T } from "@/lib/i18n"

interface Target {
  cell: string
  label: React.ReactNode
  expect: number
  op: string
  mode: "number" | "cell"
  example: string
}

function checkTarget(s: SheetState, t: Target): boolean {
  const raw = s.cells[t.cell]?.raw ?? ""
  const v = evaluate(s, t.cell)
  const modeOk = t.mode === "number" ? usesOnlyNumbers(raw) : usesCellRef(raw)
  return modeOk && raw.includes(t.op) && v === t.expect
}

function TargetList({ state, targets, showExample }: { state: SheetState | null; targets: Target[]; showExample: boolean }) {
  return (
    <Card className="p-4 space-y-2">
      {targets.map((t) => {
        const ok = !!state && checkTarget(state, t)
        return (
          <div key={t.cell} className={cn("flex items-center gap-2", ok ? "text-success" : "text-slate-700")}>
            {ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Circle className="w-5 h-5 shrink-0 text-slate-300" />}
            <span className="font-mono font-bold w-8">{t.cell}</span>
            <span>{t.label}</span>
            {showExample && !ok && <span className="ml-auto text-xs text-slate-400 font-mono">{t.example}</span>}
          </div>
        )
      })}
    </Card>
  )
}

const NUM_SHEET: SheetState = {
  cells: {
    A1: { raw: "計算", fmt: { bold: true } }, B1: { raw: "答え（ここに式）", fmt: { bold: true } },
    A2: { raw: "100 + 200" }, A3: { raw: "500 − 120" }, A4: { raw: "100 × 3" }, A5: { raw: "600 ÷ 3" },
  },
  merges: [],
  borders: {},
}
const NUM_TARGETS: Target[] = [
  { cell: "B2", label: <>たし<Ruby rt="ざん">算</Ruby>（+）</>, expect: 300, op: "+", mode: "number", example: "=100+200" },
  { cell: "B3", label: <>ひき<Ruby rt="ざん">算</Ruby>（-）</>, expect: 380, op: "-", mode: "number", example: "=500-120" },
  { cell: "B4", label: <>かけ<Ruby rt="ざん">算</Ruby>（*）</>, expect: 300, op: "*", mode: "number", example: "=100*3" },
  { cell: "B5", label: <>わり<Ruby rt="ざん">算</Ruby>（/）</>, expect: 200, op: "/", mode: "number", example: "=600/3" },
]

const CELL_SHEET: SheetState = {
  cells: {
    A1: { raw: "数A", fmt: { bold: true } }, B1: { raw: "数B", fmt: { bold: true } },
    C1: { raw: "たし算", fmt: { bold: true } }, D1: { raw: "ひき算", fmt: { bold: true } },
    E1: { raw: "かけ算", fmt: { bold: true } }, F1: { raw: "わり算", fmt: { bold: true } },
    A2: { raw: "600" }, B2: { raw: "3" },
  },
  merges: [],
  borders: {},
}
const CELL_TARGETS: Target[] = [
  { cell: "C2", label: <>A2 たす B2</>, expect: 603, op: "+", mode: "cell", example: "=A2+B2" },
  { cell: "D2", label: <>A2 ひく B2</>, expect: 597, op: "-", mode: "cell", example: "=A2-B2" },
  { cell: "E2", label: <>A2 かける B2</>, expect: 1800, op: "*", mode: "cell", example: "=A2*B2" },
  { cell: "F2", label: <>A2 わる B2</>, expect: 200, op: "/", mode: "cell", example: "=A2/B2" },
]

export function ArithmeticMission({ onComplete }: { onComplete: () => void }) {
  const { step, setStep, succeed, showSuccess, successMsg } = useStepFlow(3, onComplete)
  const [msg, setMsg] = useState<React.ReactNode>(null)
  const [state, setState] = useState<SheetState | null>(null)
  const [showExample, setShowExample] = useState(false)

  const onSheet = (targets: Target[], success: string) => (s: SheetState) => {
    setState(s)
    if (targets.every((t) => checkTarget(s, t))) succeed(success)
  }

  const messages: React.ReactNode[] = [
    <>スプレッドシートで<Ruby rt="けいさん">計算</Ruby>するときは、<b><Ruby rt="さいしょ">最初</Ruby>に「=」</b>！<Ruby rt="きごう">記号</Ruby>は、ふだんの<Ruby rt="さんすう">算数</Ruby>と<Ruby rt="すこ">少</Ruby>しちがうよ。<span className="block text-sm text-muted-foreground mt-1"><T>Start every formula with =.</T></span></>,
    <>まずは<b><Ruby rt="かず">数</Ruby></b>で<Ruby rt="しき">式</Ruby>を<Ruby rt="い">入</Ruby>れよう。<Ruby rt="きいろ">黄色</Ruby>のセルをクリックして、<Ruby rt="う">打</Ruby>って、<Key>Enter</Key>！<span className="block text-sm text-muted-foreground mt-1"><T>Type formulas with numbers in the yellow cells.</T></span></>,
    <><Ruby rt="こんど">今度</Ruby>は<b>セル</b>で<Ruby rt="しき">式</Ruby>を<Ruby rt="い">入</Ruby>れよう。「=」を<Ruby rt="う">打</Ruby>ったあと、A2 のセルを<b>クリック</b>すると、セルの<Ruby rt="なまえ">名前</Ruby>が<Ruby rt="しき">式</Ruby>に<Ruby rt="はい">入</Ruby>るよ！<span className="block text-sm text-muted-foreground mt-1"><T>Now use cell names. Click a cell to add it to the formula.</T></span></>,
  ]

  return (
    <MissionFrame wide message={messages[step]} step={step} total={3} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-4">
          <Card>
            <table className="w-full text-center text-lg">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="py-2"><Ruby rt="けいさん">計算</Ruby></th><th><Ruby rt="さんすう">算数</Ruby></th><th>スプレッドシート</th><th>キー</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-t [&>tr]:border-slate-100">
                <tr><td className="py-3">たし<Ruby rt="ざん">算</Ruby></td><td>+</td><td className="font-mono font-bold text-2xl">+</td><td><Key>Shift</Key>+<Key>れ</Key></td></tr>
                <tr><td className="py-3">ひき<Ruby rt="ざん">算</Ruby></td><td>−</td><td className="font-mono font-bold text-2xl">-</td><td><Key>ほ</Key></td></tr>
                <tr className="bg-amber-50"><td className="py-3">かけ<Ruby rt="ざん">算</Ruby></td><td>×</td><td className="font-mono font-bold text-2xl text-amber-700">*</td><td><Key>Shift</Key>+<Key>け</Key></td></tr>
                <tr className="bg-amber-50"><td className="py-3">わり<Ruby rt="ざん">算</Ruby></td><td>÷</td><td className="font-mono font-bold text-2xl text-amber-700">/</td><td><Key>め</Key></td></tr>
              </tbody>
            </table>
          </Card>
          <Tip>
            <p><Ruby rt="しき">式</Ruby>は <b><Ruby rt="はんかく">半角</Ruby></b>で<Ruby rt="う">打</Ruby>とう。「＝」（<Ruby rt="ぜんかく">全角</Ruby>）だと<Ruby rt="けいさん">計算</Ruby>されないよ。<span className="block text-sm text-slate-500"><T>Type formulas in half-width. Full-width 「＝」 does not calculate.</T></span></p>
            <p className="mt-1"><Ruby rt="れい">例</Ruby>：<span className="font-mono font-bold">=100*3</span> → <b>300</b></p>
          </Tip>
          <div className="text-center">
            <Button size="lg" className="text-lg px-10" onClick={() => setStep(1)}>わかった！ / <T>Got it</T></Button>
          </div>
        </div>
      )}

      {(step === 1 || step === 2) && (
        <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="space-y-3 min-w-0">
            <Sheet
              key={step}
              initial={step === 1 ? NUM_SHEET : CELL_SHEET}
              rows={6}
              cols={6}
              colWidths={step === 1 ? [140, 160, 90, 90, 90, 90] : undefined}
              title={step === 1 ? "計算の練習" : "セルで計算"}
              highlight={(step === 1 ? NUM_TARGETS : CELL_TARGETS).map((t) => t.cell)}
              onChange={onSheet(step === 1 ? NUM_TARGETS : CELL_TARGETS, step === 1 ? "計算できた！" : "セル名人！")}
              onMessage={setMsg}
            />
            <Warn>{msg}</Warn>
          </div>
          <div className="space-y-3">
            <TargetList state={state} targets={step === 1 ? NUM_TARGETS : CELL_TARGETS} showExample={showExample} />
            {!showExample && (
              <button className="text-sm text-slate-500 underline" onClick={() => setShowExample(true)}><Ruby rt="こた">答</Ruby>えの<Ruby rt="れい">例</Ruby>を<Ruby rt="み">見</Ruby>る / <T>Show examples</T></button>
            )}
          </div>
        </div>
      )}
    </MissionFrame>
  )
}

// ===== ミッション2：セルで入れる理由 =====

const WHY_SHEET: SheetState = {
  cells: {
    A1: { raw: "品名", fmt: { bold: true } }, B1: { raw: "単価", fmt: { bold: true } }, C1: { raw: "数量", fmt: { bold: true } },
    D1: { raw: "数で入れた式", fmt: { bold: true } }, E1: { raw: "セルで入れた式", fmt: { bold: true } },
    A2: { raw: "ノート" }, B2: { raw: "120" }, C2: { raw: "3" },
  },
  merges: [],
  borders: {},
}

export function WhyCellsMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(3, onComplete)
  const [msg, setMsg] = useState<React.ReactNode>(null)
  const [state, setState] = useState<SheetState>(WHY_SHEET)

  const d2 = state.cells.D2?.raw ?? ""
  const e2 = state.cells.E2?.raw ?? ""
  const d2ok = usesOnlyNumbers(d2) && d2.includes("*") && evaluate(state, "D2") === 360
  const e2ok = usesCellRef(e2) && e2.includes("*") && /B2/i.test(e2) && /C2/i.test(e2)
  const priceChanged = evaluate(state, "B2") === 150

  const onChange = (s: SheetState) => {
    setState(s)
    const sd2 = s.cells.D2?.raw ?? ""
    const se2 = s.cells.E2?.raw ?? ""
    if (step === 0 && usesOnlyNumbers(sd2) && evaluate(s, "D2") === 360 && usesCellRef(se2) && evaluate(s, "E2") === 360) succeed("どちらも360！")
    if (step === 1 && evaluate(s, "B2") === 150) succeed("答えはどうなった？")
  }

  const messages: React.ReactNode[] = [
    <>ノートの<Ruby rt="きんがく">金額</Ruby>を2つの<Ruby rt="ほうほう">方法</Ruby>で<Ruby rt="けいさん">計算</Ruby>してみよう。D2 は<b><Ruby rt="かず">数</Ruby></b>で（=120*3）、E2 は<b>セル</b>で（=B2*C2）！<span className="block text-sm text-muted-foreground mt-1"><T>D2 with numbers, E2 with cells.</T></span></>,
    <>たいへん！ノートの<Ruby rt="たんか">単価</Ruby>が <b>150<Ruby rt="えん">円</Ruby></b> に<Ruby rt="あ">上</Ruby>がった！B2 を 150 に<Ruby rt="か">変</Ruby>えてみよう。<span className="block text-sm text-muted-foreground mt-1"><T>The price went up! Change B2 to 150.</T></span></>,
    <>D2 と E2、どうなった？<span className="block text-sm text-muted-foreground mt-1"><T>What happened to D2 and E2?</T></span></>,
  ]

  return (
    <MissionFrame wide message={messages[step]} step={step} total={3} showSuccess={showSuccess} successMsg={successMsg}>
      <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="space-y-3 min-w-0">
          <Sheet
            initial={WHY_SHEET}
            rows={4}
            cols={5}
            colWidths={[100, 80, 80, 140, 140]}
            title="ノートの金額"
            highlight={step === 0 ? ["D2", "E2"] : ["B2"]}
            onChange={onChange}
            onMessage={setMsg}
          />
          <Warn>{msg}</Warn>
        </div>
        <Card className="p-4 space-y-2">
          {step === 0 && (
            <>
              <p className={cn("flex gap-2", d2ok ? "text-success" : "text-slate-700")}>{d2ok ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-slate-300" />} D2：=120*3</p>
              <p className={cn("flex gap-2", e2ok ? "text-success" : "text-slate-700")}>{e2ok ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-slate-300" />} E2：=B2*C2</p>
            </>
          )}
          {step === 1 && <p className={cn("flex gap-2", priceChanged ? "text-success" : "text-slate-700")}><Circle className="w-5 h-5 text-slate-300" /> B2 を 150 に</p>}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-red-600 font-bold">D2（<Ruby rt="かず">数</Ruby>）：{String(evaluate(state, "D2"))} のまま… ✕<span className="block text-sm font-normal"><T>D2 (numbers): did not change</T></span></p>
              <p className="text-success font-bold">E2（セル）：{String(evaluate(state, "E2"))} に<Ruby rt="か">変</Ruby>わった！ ◯<span className="block text-sm font-normal"><T>E2 (cells): changed!</T></span></p>
              <p className="text-slate-700 text-sm">セルで<Ruby rt="い">入</Ruby>れると、<Ruby rt="すうじ">数字</Ruby>を<Ruby rt="か">変</Ruby>えたときに<Ruby rt="こた">答</Ruby>えも<Ruby rt="じどう">自動</Ruby>で<Ruby rt="か">変</Ruby>わる。<Ruby rt="しごと">仕事</Ruby>では<b><Ruby rt="かなら">必</Ruby>ずセルで<Ruby rt="い">入</Ruby>れよう</b>！<span className="block text-sm text-slate-500 mt-1"><T>With cells, the answer changes by itself when you change a number. At work, always use cells!</T></span></p>
              <Button className="w-full" onClick={() => succeed("セルで入れる理由、わかった！")}>わかった！ / <T>Got it</T></Button>
            </div>
          )}
        </Card>
      </div>
    </MissionFrame>
  )
}
