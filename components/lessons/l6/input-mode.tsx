"use client"

// L6 ミッション1：入力モード（半角/全角・カタカナ）
// 画面のボタンではなく、本物の「半角/全角」キーを押さないと進めない。
// 入力された文字の種類を見て、間違いの種類ごとに声をかける。

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, Keys, Key, MissionFrame, Ruby, Tip, Warn, useAward, useStepFlow } from "@/components/lesson/kit"
import { halfWidthProblem, katakanaProblem } from "@/lib/input-check"
import { usePlatform } from "@/lib/platform"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx } from "@/lib/i18n"

const LESSON_ID = 7

type FieldKind = "half" | "kana"

interface FieldDef {
  key: string
  label: React.ReactNode
  en: string
  kind: FieldKind
  answer: string
  hint: React.ReactNode
}

// 1つの入力欄：変換中は注意を出さない。正解なら緑のチェック
function PracticeField({
  field,
  value,
  onChange,
  onTab,
  autoFocus,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
  onTab?: () => void
  autoFocus?: boolean
}) {
  const [composing, setComposing] = useState(false)
  const ok = value.trim() === field.answer
  // 半角の欄で変換中（下線つきの文字）なら、日本語モードのまま打っている
  const problem = !value || ok
    ? null
    : field.kind === "half"
      ? (composing ? `日本語モードになっているよ。「半角/全角」キーを押して、英語モードにしてね / ${tx("Switch to English mode")}` : halfWidthProblem(value))
      : (composing ? null : katakanaProblem(value))
  const wrongText = !problem && !composing && value.trim().length >= field.answer.length && !ok

  return (
    <div className="space-y-1.5">
      <label className="flex items-center justify-between gap-2 font-bold text-slate-700">
        <span>
          {field.label} <span className="text-xs font-normal text-slate-400"><T>{field.en}</T></span>
        </span>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          field.kind === "half" ? "bg-sky-100 text-sky-700" : "bg-pink-100 text-pink-700",
        )}>
          {field.kind === "half" ? "半角 A" : "カタカナ あ"}
        </span>
      </label>
      <div className="relative">
        <Input
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          onKeyDown={(e) => { if (e.key === "Tab" && !e.shiftKey) onTab?.() }}
          className={cn(
            "h-14 text-2xl pr-12",
            ok && "border-success bg-success/5",
            (problem || wrongText) && "border-amber-400",
          )}
        />
        {ok && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 text-success" />}
      </div>
      <p className="text-sm text-slate-500">お<Ruby rt="てほん">手本</Ruby>：<span className="font-bold text-slate-700 text-lg">{field.hint}</span></p>
      <Warn>{problem ?? (wrongText ? `お手本とちがうところがあるよ。よく見てね / ${tx("Check the example")}` : null)}</Warn>
    </div>
  )
}

export function InputModeMission({ onComplete }: { onComplete: () => void }) {
  const { step, setStep, succeed, showSuccess, successMsg } = useStepFlow(4, onComplete)
  const { isMac, imeKey } = usePlatform()
  const award = useAward(LESSON_ID)
  const [values, setValues] = useState<Record<string, string>>({})
  const usedTabRef = useRef(false)

  const setValue = (key: string, v: string, fields: FieldDef[]) => {
    const next = { ...values, [key]: v }
    setValues(next)
    if (fields.every((f) => (next[f.key] ?? "").trim() === f.answer)) {
      if (fields.some((f) => f.kind === "half")) award("halfwidth")
      if (fields.some((f) => f.kind === "kana")) award("katakana")
      if (fields.length > 2 && usedTabRef.current) award("tab")
      succeed(fields.length > 2 ? "かんぺき！切り替え名人！" : "できたね！")
    }
  }

  const idField: FieldDef[] = [
    { key: "id1", label: <><Ruby rt="がくせきばんごう">学籍番号</Ruby></>, en: tx("Student ID"), kind: "half", answer: "2025a123", hint: "2025a123" },
  ]
  const nameField: FieldDef[] = [
    { key: "name1", label: <><Ruby rt="なまえ">名前</Ruby></>, en: tx("Name"), kind: "kana", answer: "グエン", hint: <>グエン <span className="text-sm font-normal text-slate-400">（guen → スペース）</span></> },
  ]
  const formFields: FieldDef[] = [
    { key: "f-id", label: <><Ruby rt="がくせきばんごう">学籍番号</Ruby></>, en: tx("Student ID"), kind: "half", answer: "2025b045", hint: "2025b045" },
    { key: "f-name", label: <><Ruby rt="なまえ">名前</Ruby></>, en: tx("Name"), kind: "kana", answer: "マリア", hint: <>マリア <span className="text-sm font-normal text-slate-400">（maria → スペース）</span></> },
    { key: "f-mail", label: "メールアドレス", en: tx("Email"), kind: "half", answer: "maria@example.com", hint: "maria@example.com" },
    { key: "f-tel", label: <><Ruby rt="でんわばんごう">電話番号</Ruby></>, en: tx("Phone"), kind: "half", answer: "090-1234-5678", hint: "090-1234-5678" },
  ]

  const messages: React.ReactNode[] = [
    <>パソコンの<Ruby rt="もじ">文字</Ruby>には「<Ruby rt="はんかく">半角</Ruby>」と「<Ruby rt="ぜんかく">全角</Ruby>」があるよ。<Ruby rt="み">見</Ruby>た<Ruby rt="め">目</Ruby>は<Ruby rt="に">似</Ruby>ているけど、パソコンは<Ruby rt="ちが">違</Ruby>うものだと<Ruby rt="おも">思</Ruby>うんだ！<span className="block text-sm text-muted-foreground mt-1"><T>Half-width and full-width look similar, but they are different.</T></span></>,
    <><Ruby rt="がくせきばんごう">学籍番号</Ruby>は<Ruby rt="はんかく">半角</Ruby>で<Ruby rt="い">入</Ruby>れよう。「{imeKey}」キーで<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えてね！<span className="block text-sm text-muted-foreground mt-1"><T>Type your ID in half-width.</T></span></>,
    <><Ruby rt="がいこく">外国</Ruby>の<Ruby rt="なまえ">名前</Ruby>はカタカナで<Ruby rt="か">書</Ruby>くよ。ローマ<Ruby rt="じ">字</Ruby>で<Ruby rt="う">打</Ruby>って、<Key>スペース</Key>で<Ruby rt="へんかん">変換</Ruby>！<span className="block text-sm text-muted-foreground mt-1"><T>Type in romaji, then press Space to get katakana.</T></span></>,
    <>アルバイトの<Ruby rt="おうぼ">応募</Ruby>フォームだよ。<Ruby rt="らん">欄</Ruby>ごとに<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えが<Ruby rt="ひつよう">必要</Ruby>！<Key>Tab</Key>キーで<Ruby rt="つぎ">次</Ruby>の<Ruby rt="らん">欄</Ruby>へ<Ruby rt="すす">進</Ruby>めるよ。<span className="block text-sm text-muted-foreground mt-1"><T>Switch the mode for each field. Tab moves to the next field.</T></span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={4} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="text-center border-sky-300">
              <p className="font-bold text-sky-700 mb-2"><Ruby rt="はんかく">半角</Ruby>（はんかく）</p>
              <p className="text-4xl font-mono tracking-wider">2025a123</p>
              <p className="text-sm text-slate-500 mt-2"><Ruby rt="がくせきばんごう">学籍番号</Ruby>・メール・<Ruby rt="でんわばんごう">電話番号</Ruby>・パスワード<span className="block text-xs text-slate-400"><T>Student ID, email, phone number, password</T></span></p>
            </Card>
            <Card className="text-center border-pink-300">
              <p className="font-bold text-pink-700 mb-2"><Ruby rt="ぜんかく">全角</Ruby>（ぜんかく）</p>
              <p className="text-4xl tracking-wider">２０２５ａ１２３</p>
              <p className="text-sm text-slate-500 mt-2"><Ruby rt="にほんご">日本語</Ruby>の<Ruby rt="ぶんしょう">文章</Ruby>・<Ruby rt="なまえ">名前</Ruby>（カタカナ）<span className="block text-xs text-slate-400"><T>Japanese sentences, names (katakana)</T></span></p>
            </Card>
          </div>
          <Card className="flex flex-col md:flex-row items-center gap-5">
            <div className="shrink-0 text-center">
              <div className="inline-grid grid-cols-3 gap-1 p-2 bg-slate-800 rounded-xl">
                <span className="w-16 h-12 rounded-md bg-yellow-400 text-slate-900 text-[10px] font-bold flex items-center justify-center leading-tight ring-4 ring-yellow-300 animate-pulse-gentle">
                  {isMac ? "英数/かな" : <>半角/<br />全角</>}
                </span>
                <span className="w-12 h-12 rounded-md bg-slate-600 text-white text-sm flex items-center justify-center">1</span>
                <span className="w-12 h-12 rounded-md bg-slate-600 text-white text-sm flex items-center justify-center">2</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{isMac ? "スペースの左右" : "キーボードの左上"}</p>
            </div>
            <div className="space-y-2 text-slate-700">
              <p>「<b>{imeKey}</b>」キーを<Ruby rt="お">押</Ruby>すたびに、<b>あ</b>（<Ruby rt="にほんご">日本語</Ruby>）と <b>A</b>（<Ruby rt="えいご">英語</Ruby>・<Ruby rt="はんかく">半角</Ruby>）が<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>わるよ。<span className="block text-sm text-slate-500 mt-1"><T s="Each time you press the {key} key, it switches between あ (Japanese) and A (English, half-width)." v={{ key: imeKey }} /></span></p>
              <p>{isMac ? "画面の右上" : "画面の右下（時計の近く）"}に、<Ruby rt="いま">今</Ruby>のモード「<b>あ</b>」か「<b>A</b>」が<Ruby rt="で">出</Ruby>ているよ。<Ruby rt="う">打</Ruby>つ<Ruby rt="まえ">前</Ruby>に<Ruby rt="み">見</Ruby>るくせをつけよう！<span className="block text-sm text-slate-500 mt-1"><T>The current mode (あ or A) is shown at the corner of the screen. Always check it before you type!</T></span></p>
            </div>
          </Card>
          <Tip title={<>なぜ<Ruby rt="たいせつ">大切</Ruby>？ / <T>Why?</T></>}>
            <Ruby rt="ぜんかく">全角</Ruby>の「２０２５ａ１２３」で<Ruby rt="にゅうりょく">入力</Ruby>すると、パソコンは<Ruby rt="べつ">別</Ruby>の<Ruby rt="ひと">人</Ruby>だと<Ruby rt="おも">思</Ruby>ってしまうよ。ネットの<Ruby rt="もうしこ">申し込</Ruby>みで「<Ruby rt="ただ">正</Ruby>しくありません」と<Ruby rt="で">出</Ruby>る<Ruby rt="げんいん">原因</Ruby>の<Ruby rt="おお">多</Ruby>くはこれ！<span className="block text-sm text-slate-500 mt-1"><T>If you type your ID in full-width, the computer thinks it is a different person. This is a common reason for "not correct" errors in online forms!</T></span>
          </Tip>
          <div className="text-center">
            <Button size="lg" className="text-lg px-10" onClick={() => setStep(1)}>わかった！ / <T>Got it</T></Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <Card className="max-w-xl mx-auto">
          <PracticeField field={idField[0]} value={values.id1 ?? ""} onChange={(v) => setValue("id1", v, idField)} autoFocus />
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4 max-w-xl mx-auto">
          <Card>
            <PracticeField field={nameField[0]} value={values.name1 ?? ""} onChange={(v) => setValue("name1", v, nameField)} autoFocus />
          </Card>
          <Tip>
            <p>① 「あ」モードにする → ② <b>guen</b> と<Ruby rt="う">打</Ruby>つ（ぐえん） → ③ <Key>スペース</Key>で「グエン」を<Ruby rt="えら">選</Ruby>ぶ → ④ <Key>Enter</Key>で<Ruby rt="かくてい">確定</Ruby></p><span className="block text-sm text-slate-500 mt-1"><T>① Switch to あ mode → ② Type guen → ③ Press Space and choose グエン → ④ Press Enter</T></span>
            <p className="text-xs text-slate-500 mt-1">「ゲ」「ヴ」など<Ruby rt="むずか">難</Ruby>しい<Ruby rt="おと">音</Ruby>は、<Key>スペース</Key>を<Ruby rt="なんかい">何回</Ruby>か<Ruby rt="お">押</Ruby>して<Ruby rt="こうほ">候補</Ruby>から<Ruby rt="えら">選</Ruby>ぼう。<span className="block"><T>For difficult sounds like 「ゲ」 or 「ヴ」, press Space a few times and choose from the list.</T></span></p>
          </Tip>
        </div>
      )}

      {step === 3 && (
        <Card className="max-w-2xl mx-auto space-y-5">
          <p className="text-center font-bold text-lg text-slate-700">アルバイト<Ruby rt="おうぼ">応募</Ruby>フォーム <span className="text-sm font-normal text-slate-400"><T>Job application</T></span></p>
          {formFields.map((f, i) => (
            <PracticeField
              key={f.key}
              field={f}
              value={values[f.key] ?? ""}
              onChange={(v) => setValue(f.key, v, formFields)}
              onTab={() => { usedTabRef.current = true }}
              autoFocus={i === 0}
            />
          ))}
          <p className="text-sm text-center text-slate-500">
            <Keys k="Tab" /> で<Ruby rt="つぎ">次</Ruby>の<Ruby rt="らん">欄</Ruby>へ ／ <Keys k="Shift+Tab" /> で<Ruby rt="まえ">前</Ruby>の<Ruby rt="らん">欄</Ruby>へ
            <span className="block text-xs text-slate-400"><T>Tab: next field / Shift+Tab: previous field</T></span>
          </p>
        </Card>
      )}
    </MissionFrame>
  )
}
