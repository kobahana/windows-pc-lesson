"use client"

// L7 ミッション3：ビジネス文書を整えよう
// 練習用エディタで、社外文書の書式をボタンで整える。チェックリストは自動で判定。

import { useEffect, useMemo, useState } from "react"
import { Card, MissionFrame, Ruby, Tip, Warn, useStepFlow } from "@/components/lesson/kit"
import { DEFAULT_SIZE, DocEditor, hasAnyFmt, isAllBold, makePara, type Para } from "./doc-editor"
import { CheckCircle2, Circle, AlignRight, AlignCenter, Bold, Plus, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx, useT } from "@/lib/i18n"

const INITIAL: Para[] = [
  makePara("2026年10月1日"),
  makePara("株式会社さくら商事"),
  makePara("総務部　山田太郎様"),
  makePara("グエン貿易株式会社"),
  makePara("営業部　グエン・ヴァン・アン"),
  makePara("新商品説明会のご案内"),
  makePara("拝啓　時下ますますご清栄のこととお慶び申し上げます。さて、このたび弊社では新商品の説明会を下記のとおり開催いたします。ご多忙のところ恐縮ですが、ぜひご出席くださいますようお願い申し上げます。"),
  makePara("敬具"),
  makePara("記"),
  makePara("日時：10月20日（火）14:00〜15:30"),
  makePara("場所：本社3階　大会議室"),
  makePara("持ち物：名刺"),
  makePara("以上"),
]

const P = { date: 0, to1: 1, to2: 2, from1: 3, from2: 4, subject: 5, body: 6, keigu: 7, ki: 8, item1: 9, item2: 10, item3: 11, ijo: 12 }
const TITLE = "新商品説明会のご案内"
const RIGHT = [P.date, P.from1, P.from2, P.keigu, P.ijo]
const CENTER = [P.subject, P.ki]
const BULLET = [P.item1, P.item2, P.item3]

interface Task {
  label: React.ReactNode
  en: string
  icon?: React.ReactNode
  done: (doc: Para[], title: string) => boolean
}

const TASKS: Task[] = [
  { label: <>ファイル<Ruby rt="めい">名</Ruby>を「{TITLE}」にする（<Ruby rt="ひだりうえ">左上</Ruby>の「<Ruby rt="むだい">無題</Ruby>のドキュメント」）</>, en: tx("Name the file 「新商品説明会のご案内」 (「無題のドキュメント」 at the top left)"), done: (_d, t) => t.trim() === TITLE },
  { label: <><Ruby rt="ひづけ">日付</Ruby>を<Ruby rt="みぎ">右</Ruby>そろえ</>, en: tx("Right-align the date"), icon: <AlignRight className="w-4 h-4" />, done: (d) => d[P.date].align === "right" },
  { label: <><Ruby rt="さしだしにん">差出人</Ruby>（グエン<Ruby rt="ぼうえき">貿易</Ruby>・<Ruby rt="えいぎょうぶ">営業部</Ruby>の2<Ruby rt="ぎょう">行</Ruby>）を<Ruby rt="みぎ">右</Ruby>そろえ</>, en: tx("Right-align the sender (the 2 lines: グエン貿易 and 営業部)"), icon: <AlignRight className="w-4 h-4" />, done: (d) => d[P.from1].align === "right" && d[P.from2].align === "right" },
  { label: <><Ruby rt="けんめい">件名</Ruby>（{TITLE}）を<Ruby rt="ちゅうおう">中央</Ruby>そろえ</>, en: tx("Center the subject (新商品説明会のご案内)"), icon: <AlignCenter className="w-4 h-4" />, done: (d) => d[P.subject].align === "center" },
  { label: <><Ruby rt="けんめい">件名</Ruby>を<Ruby rt="ふとじ">太字</Ruby>にする（<Ruby rt="もじ">文字</Ruby>をなぞって<Ruby rt="えら">選</Ruby>ぶ）</>, en: tx("Make the subject bold (select the text first)"), icon: <Bold className="w-4 h-4" />, done: (d) => isAllBold(d[P.subject]) },
  { label: <><Ruby rt="けんめい">件名</Ruby>の<Ruby rt="もじ">文字</Ruby>を<Ruby rt="おお">大</Ruby>きくする（14<Ruby rt="いじょう">以上</Ruby>）</>, en: tx("Make the subject bigger (14 or more)"), icon: <Plus className="w-4 h-4" />, done: (d) => d[P.subject].size >= 14 },
  { label: <>「<Ruby rt="けいぐ">敬具</Ruby>」を<Ruby rt="みぎ">右</Ruby>そろえ</>, en: tx("Right-align 「敬具」"), icon: <AlignRight className="w-4 h-4" />, done: (d) => d[P.keigu].align === "right" },
  { label: <>「<Ruby rt="き">記</Ruby>」を<Ruby rt="ちゅうおう">中央</Ruby>そろえ</>, en: tx("Center 「記」"), icon: <AlignCenter className="w-4 h-4" />, done: (d) => d[P.ki].align === "center" },
  { label: <><Ruby rt="にちじ">日時</Ruby>・<Ruby rt="ばしょ">場所</Ruby>・<Ruby rt="も">持</Ruby>ち<Ruby rt="もの">物</Ruby>を<Ruby rt="かじょうが">箇条書</Ruby>きにする</>, en: tx("Make 日時, 場所 and 持ち物 into bullet points"), icon: <List className="w-4 h-4" />, done: (d) => BULLET.every((p) => d[p].list === "bullet") },
  { label: <>「<Ruby rt="いじょう">以上</Ruby>」を<Ruby rt="みぎ">右</Ruby>そろえ</>, en: tx("Right-align 「以上」"), icon: <AlignRight className="w-4 h-4" />, done: (d) => d[P.ijo].align === "right" },
]

// 指示にない書式が付いていないかを調べる（行番号つきで返す）
function extraFormatting(doc: Para[], t: (en: string, v?: Record<string, string>) => string): string[] {
  const problems: string[] = []
  doc.forEach((p, pid) => {
    const head = `「${p.text.slice(0, 8)}${p.text.length > 8 ? "…" : ""}」`
    const expectedAlign = RIGHT.includes(pid) ? "right" : CENTER.includes(pid) ? "center" : "left"
    const pending = expectedAlign !== "left" && p.align === "left"
    const bodyJustify = pid === P.body && p.align === "justify"
    if (p.align !== expectedAlign && !pending && !bodyJustify) problems.push(`${head}のそろえ方がちがうよ / ${t("The alignment of {head} is wrong", { head })}`)
    if (p.list !== "none" && !BULLET.includes(pid)) problems.push(`${head}は箇条書きにしないよ / ${t("{head} should not be a bullet point", { head })}`)
    if (BULLET.includes(pid) && p.list === "number") problems.push(`${head}は番号ではなく「●」の箇条書きだよ / ${t("{head} should use ● bullets, not numbers", { head })}`)
    if (pid !== P.subject && p.size !== DEFAULT_SIZE) problems.push(`${head}の文字サイズは変えないよ / ${t("Don't change the font size of {head}", { head })}`)
    if (pid !== P.subject && hasAnyFmt(p)) problems.push(`${head}に太字などが付いているよ / ${t("{head} has bold or other styles", { head })}`)
    if (pid === P.subject && p.fmt.some((f) => f.i || f.u)) problems.push(`${head}は太字だけにしよう（斜体・下線はなし） / ${t("{head}: bold only (no italic or underline)", { head })}`)
  })
  return problems
}

export function BusinessDocMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(1, onComplete)
  const [doc, setDoc] = useState<Para[]>(INITIAL)
  const [title, setTitle] = useState("無題のドキュメント")
  const [msg, setMsg] = useState<React.ReactNode>(null)

  const status = useMemo(() => TASKS.map((t) => t.done(doc, title)), [doc, title])
  const t = useT()
  const extras = useMemo(() => extraFormatting(doc, t), [doc, t])
  const allDone = status.every(Boolean) && extras.length === 0

  useEffect(() => {
    if (allDone) succeed("りっぱなビジネス文書！")
  }, [allDone, succeed])

  return (
    <MissionFrame
      wide
      message={<>ビジネス<Ruby rt="ぶんしょ">文書</Ruby>を<Ruby rt="ととの">整</Ruby>えよう！<Ruby rt="もじ">文字</Ruby>は<Ruby rt="う">打</Ruby>たなくていいよ。<b><Ruby rt="えら">選</Ruby>んでから → ボタン</b>で、<Ruby rt="みぎ">右</Ruby>のチェックリストを<Ruby rt="ぜんぶ">全部</Ruby>クリアしよう。<span className="block text-sm text-muted-foreground mt-1"><T>Format the letter with the toolbar buttons. Complete the checklist.</T></span></>}
      step={step}
      total={1}
      showSuccess={showSuccess}
      successMsg={successMsg}
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="space-y-3 min-w-0">
          <DocEditor initial={INITIAL} title={title} onTitleChange={setTitle} onDocChange={(d) => setDoc(d)} onMessage={setMsg} />
          <Warn>{msg}</Warn>
        </div>
        <div className="space-y-3 lg:sticky lg:top-2">
          <Card className="p-4 space-y-2">
            <p className="font-bold text-slate-800">チェックリスト（{status.filter(Boolean).length}/{TASKS.length}）</p>
            <ul className="space-y-1.5 text-sm">
              {TASKS.map((t, i) => (
                <li key={i} className={cn("flex gap-2 items-start", status[i] ? "text-success" : "text-slate-700")}>
                  {status[i] ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Circle className="w-5 h-5 shrink-0 text-slate-300" />}
                  <span>{t.label} {t.icon && <span className="inline-flex align-middle text-slate-500 border border-slate-200 rounded p-0.5 ml-0.5">{t.icon}</span>}<span className="block text-xs text-slate-400"><T>{t.en}</T></span></span>
                </li>
              ))}
            </ul>
          </Card>
          {extras.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 text-sm text-amber-800 space-y-1">
              <p className="font-bold">⚠️ <Ruby rt="なお">直</Ruby>すところ（Ctrl+Z で<Ruby rt="もど">戻</Ruby>せるよ）<span className="block font-normal"><T>To fix (you can undo with Ctrl+Z)</T></span></p>
              {extras.slice(0, 4).map((e, i) => <p key={i}>・{e}</p>)}
            </div>
          )}
          <Tip>
            <p>① <Ruby rt="か">変</Ruby>えたい<Ruby rt="ぎょう">行</Ruby>をクリック（<Ruby rt="ふくすう">複数</Ruby>の<Ruby rt="ぎょう">行</Ruby>はなぞって<Ruby rt="えら">選</Ruby>ぶ）</p>
            <span className="block text-sm text-slate-500"><T>① Click the line you want to change (drag to select several lines)</T></span>
            <p>② ツールバーのボタンを<Ruby rt="お">押</Ruby>す</p>
            <span className="block text-sm text-slate-500"><T>② Press a button on the toolbar</T></span>
            <p className="mt-1 text-slate-500"><Ruby rt="ほんもの">本物</Ruby>の<Ruby rt="ぶんしょ">文書</Ruby>では、スペースを<Ruby rt="れんだ">連打</Ruby>して<Ruby rt="いち">位置</Ruby>を<Ruby rt="あ">合</Ruby>わせないでね。<Ruby rt="かなら">必</Ruby>ずそろえボタンを<Ruby rt="つか">使</Ruby>おう！<span className="block"><T>In real documents, don't press Space many times to move text. Always use the align buttons!</T></span></p>
          </Tip>
        </div>
      </div>
    </MissionFrame>
  )
}
