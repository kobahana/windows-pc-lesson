"use client"

// L7 ミッション2：文章から要点を拾って、短い箇条書きにする
// ① 型を知る → ② 大事な言葉をクリックで選ぶ → ③ 長い文と短い要点を結ぶ → ④ 自分で書く

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, MissionFrame, Ruby, Tip, Warn, useStepFlow } from "@/components/lesson/kit"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx } from "@/lib/i18n"

// ===== ステップ1：大事な言葉を選ぶ =====
type KeyKind = "when" | "where" | "bring"
type Seg = string | { t: string; k?: KeyKind }
const NOTICE: Seg[][] = [
  [{ t: "来週の会議について" }, "お知らせします。"],
  ["会議は", { t: "10月3日（金）の午後3時から", k: "when" }, "始まります。"],
  ["場所は", { t: "3階の会議室", k: "where" }, "です。"],
  [{ t: "今回はみなさんの意見を" }, "聞きたいと思っています。"],
  [{ t: "資料は各自で印刷して", k: "bring" }, "持ってきてください。"],
  [{ t: "よろしくお願いします。" }],
]
const KEY_LABEL: Record<KeyKind, string> = { when: "日時", where: "場所", bring: "持ち物" }

// ===== ステップ2：短い形を選ぶ =====
const MATCH = [
  { long: "会議は10月3日（金）の午後3時から始まります。", choices: ["会議は10月3日の午後3時から始まります", "日時：10/3（金）15:00〜", "日時：来週"], answer: 1 },
  { long: "場所は3階の会議室です。", choices: ["場所は会議室です。", "3階です", "場所：3階 会議室"], answer: 2 },
  { long: "資料は各自で印刷して持ってきてください。", choices: ["持ち物：資料（各自印刷）", "資料", "持ち物：印刷してください"], answer: 0 },
  { long: "参加できない人は、前日までに山田さんにメールしてください。", choices: ["山田さん", "欠席連絡：前日までに山田さんへメール", "欠席する人はメールをしてください。"], answer: 1 },
]

// ===== ステップ3：自分で書く =====
const HEALTH_TEXT = "来月の健康診断についてお知らせします。健康診断は11月12日（木）の午前9時から行います。場所は1階の保健室です。当日は朝ごはんを食べないで来てください。また、保険証を必ず持ってきてください。"
const WRITE_FIELDS: { key: string; label: string; check: (v: string) => boolean; hint: string; model: string }[] = [
  { key: "when", label: "日時", check: (v) => /11/.test(v) && /12/.test(v) && /9|９|九/.test(v), hint: "何月何日・何時か", model: "11/12（木）9:00〜" },
  { key: "where", label: "場所", check: (v) => /保健室/.test(v), hint: "どこで", model: "1階 保健室" },
  { key: "note", label: "注意", check: (v) => /(朝|あさ)/.test(v) && /(食べない|たべない|ぬき|抜き|なし|禁止|×)/.test(v), hint: "当日に気をつけること", model: "朝食ぬき" },
  { key: "bring", label: "持ち物", check: (v) => /保険証/.test(v), hint: "持っていくもの", model: "保険証" },
]

function styleProblem(v: string): string | null {
  if (/(です|ます|ください)。?$/.test(v.trim())) return "「です・ます・ください」は取って、短くしよう"
  if (v.trim().length > 20) return "もっと短くしよう（20文字まで）"
  return null
}

export function SummarizeMission({ onComplete }: { onComplete: () => void }) {
  const { step, setStep, succeed, showSuccess, successMsg } = useStepFlow(4, onComplete)
  const [warn, setWarn] = useState<React.ReactNode>(null)
  useEffect(() => { setWarn(null) }, [step])

  // ステップ1
  const [found, setFound] = useState<KeyKind[]>([])
  const pickSeg = (seg: Exclude<Seg, string>) => {
    if (!seg.k) {
      setWarn(<>「{seg.t}」は、なくても<Ruby rt="い">意</Ruby><Ruby rt="み">味</Ruby>がわかるね。<Ruby rt="いつ">いつ</Ruby>・どこ・<Ruby rt="なに">何</Ruby>を<Ruby rt="も">持</Ruby>つ？を<Ruby rt="さが">探</Ruby>そう</>)
      return
    }
    setWarn(null)
    if (found.includes(seg.k)) return
    const next = [...found, seg.k]
    setFound(next)
    if (next.length === 3) setTimeout(() => succeed("大事な情報を見つけた！"), 500)
  }

  // ステップ2
  const [mi, setMi] = useState(0)
  const [mPicked, setMPicked] = useState<number | null>(null)
  const pickMatch = (i: number) => {
    if (mPicked !== null) return
    setMPicked(i)
    if (i !== MATCH[mi].answer) {
      setWarn("おしい！ラベル＋短い言葉になっているのはどれかな？")
      setTimeout(() => { setMPicked(null) }, 1200)
      return
    }
    setWarn(null)
    setTimeout(() => {
      setMPicked(null)
      if (mi + 1 >= MATCH.length) succeed("短くまとめる名人！")
      else setMi(mi + 1)
    }, 900)
  }

  // ステップ3
  const [vals, setVals] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const results = WRITE_FIELDS.map((f) => {
    const v = vals[f.key] ?? ""
    const style = v ? styleProblem(v) : null
    return { f, v, ok: !!v && f.check(v) && !style, style }
  })
  const checkWrite = () => {
    setChecked(true)
    if (results.every((r) => r.ok)) succeed("箇条書きの達人！")
    else setWarn(`赤いところを直してみよう / ${tx("Fix the red fields")}`)
  }

  const messages: React.ReactNode[] = [
    <><Ruby rt="しごと">仕事</Ruby>では、<Ruby rt="なが">長</Ruby>い<Ruby rt="ぶんしょう">文章</Ruby>を<Ruby rt="よ">読</Ruby>んで「<Ruby rt="ようてん">要点</Ruby>」だけを<Ruby rt="か">書</Ruby>くことが<Ruby rt="おお">多</Ruby>いよ。まずは<Ruby rt="かた">型</Ruby>を<Ruby rt="おぼ">覚</Ruby>えよう！<span className="block text-sm text-muted-foreground mt-1"><T>Learn the pattern for bullet points.</T></span></>,
    <>お<Ruby rt="し">知</Ruby>らせを<Ruby rt="よ">読</Ruby>んで、<b>いつ・どこ・<Ruby rt="なに">何</Ruby>を<Ruby rt="も">持</Ruby>っていく</b>かが<Ruby rt="か">書</Ruby>いてあるところをクリックしよう。<span className="block text-sm text-muted-foreground mt-1"><T>Click the important parts: when, where, what to bring.</T></span></>,
    <><Ruby rt="なが">長</Ruby>い<Ruby rt="ぶん">文</Ruby>を<Ruby rt="ようてん">要点</Ruby>にすると、どれがいちばんいい？<span className="block text-sm text-muted-foreground mt-1"><T>Pick the best short version.</T></span></>,
    <><Ruby rt="こんど">今度</Ruby>は<Ruby rt="じぶん">自分</Ruby>で<Ruby rt="か">書</Ruby>いてみよう！<Ruby rt="けんこうしんだん">健康診断</Ruby>のお<Ruby rt="し">知</Ruby>らせを<Ruby rt="よ">読</Ruby>んで、<Ruby rt="ようてん">要点</Ruby>を<Ruby rt="みじか">短</Ruby>く<Ruby rt="か">書</Ruby>いてね。<span className="block text-sm text-muted-foreground mt-1"><T>Now write the points yourself.</T></span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={4} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 items-stretch">
            <Card className="border-slate-300">
              <p className="text-sm font-bold text-slate-400 mb-2"><Ruby rt="ぶんしょう">文章</Ruby> / <T>Sentences</T></p>
              <p className="leading-loose text-slate-700">会議は10月3日（金）の午後3時から始まります。場所は3階の会議室です。資料は各自で印刷して持ってきてください。</p>
            </Card>
            <Card className="border-success">
              <p className="text-sm font-bold text-success mb-2"><Ruby rt="かじょうが">箇条書</Ruby>き / <T>Bullet points</T></p>
              <ul className="space-y-1 text-lg font-bold text-slate-800">
                <li>● 日時：10/3（金）15:00〜</li>
                <li>● 場所：3階 会議室</li>
                <li>● 持ち物：資料（各自印刷）</li>
              </ul>
            </Card>
          </div>
          <Card className="space-y-2">
            <p className="font-bold text-slate-800"><Ruby rt="かじょうが">箇条書</Ruby>きの<Ruby rt="かた">型</Ruby>（4つのルール）</p>
            <ol className="list-decimal pl-6 space-y-1 text-slate-700">
              <li>1<Ruby rt="ぎょう">行</Ruby>に1つだけ<Ruby rt="か">書</Ruby>く</li>
              <li>「<b>日時：</b>」「<b>場所：</b>」のように<b>ラベル</b>をつける</li>
              <li>「です・ます・ください」は<Ruby rt="と">取</Ruby>る（<Ruby rt="めいし">名詞</Ruby>で<Ruby rt="お">終</Ruby>わる）</li>
              <li><Ruby rt="すうじ">数字</Ruby>は<Ruby rt="みじか">短</Ruby>く（<Ruby rt="ごご">午後</Ruby>3<Ruby rt="じ">時</Ruby> → 15:00）</li>
            </ol>
          </Card>
          <div className="text-center">
            <Button size="lg" className="text-lg px-10" onClick={() => setStep(1)}>わかった！ / <T>Got it</T></Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card className="space-y-2 text-lg leading-loose">
            {NOTICE.map((line, li) => (
              <p key={li}>
                {line.map((seg, si) => typeof seg === "string" ? (
                  <span key={si}>{seg}</span>
                ) : (
                  <button
                    key={si}
                    onClick={() => pickSeg(seg)}
                    className={cn(
                      "rounded px-0.5 border-b-2 border-dashed border-slate-300 hover:bg-yellow-100 transition-colors",
                      seg.k && found.includes(seg.k) && "bg-yellow-200 border-yellow-500 font-bold",
                    )}
                  >
                    {seg.t}
                  </button>
                ))}
              </p>
            ))}
          </Card>
          <div className="grid grid-cols-3 gap-3">
            {(["when", "where", "bring"] as KeyKind[]).map((k) => (
              <div key={k} className={cn("rounded-xl border-2 p-3 text-center font-bold", found.includes(k) ? "border-success bg-success/10 text-success" : "border-dashed border-slate-300 text-slate-400")}>
                {found.includes(k) && <CheckCircle2 className="inline w-5 h-5 mr-1" />}{KEY_LABEL[k]}
              </div>
            ))}
          </div>
          <Warn>{warn}</Warn>
        </div>
      )}

      {step === 2 && (
        <Card className="space-y-4">
          <p className="text-sm text-slate-400 text-center">{mi + 1} / {MATCH.length}</p>
          <p className="text-xl font-bold text-slate-800 bg-slate-50 rounded-xl p-4">{MATCH[mi].long}</p>
          <p className="text-center text-2xl text-slate-300">↓</p>
          <div className="grid gap-3">
            {MATCH[mi].choices.map((c, i) => (
              <Button
                key={i}
                variant="outline"
                size="lg"
                onClick={() => pickMatch(i)}
                className={cn(
                  "text-lg h-auto py-3 justify-start whitespace-normal text-left",
                  mPicked === i && i === MATCH[mi].answer && "border-success bg-success/10",
                  mPicked === i && i !== MATCH[mi].answer && "border-amber-400 bg-amber-50",
                )}
              >
                ● {c}
              </Button>
            ))}
          </div>
          <Warn>{warn}</Warn>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm font-bold text-slate-400 mb-1">お<Ruby rt="し">知</Ruby>らせ / <T>Notice</T></p>
            <p className="text-lg leading-loose text-slate-700">{HEALTH_TEXT}</p>
          </Card>
          <Card className="space-y-3">
            {results.map(({ f, v, ok, style }) => (
              <div key={f.key} className="flex items-center gap-2">
                <span className="text-xl">●</span>
                <span className="font-bold text-lg w-20 shrink-0">{f.label}：</span>
                <div className="flex-1 space-y-1">
                  <Input
                    value={v}
                    onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
                    placeholder={f.hint}
                    className={cn("h-12 text-lg", checked && !ok && "border-red-400 bg-red-50", ok && "border-success")}
                  />
                  {checked && style && <p className="text-sm text-red-600 font-bold">{style}</p>}
                  {checked && !ok && !style && v && <p className="text-sm text-red-600 font-bold">お知らせをもう一度読んでみよう</p>}
                </div>
                {ok && <CheckCircle2 className="w-6 h-6 text-success shrink-0" />}
              </div>
            ))}
            <div className="text-center pt-2">
              <Button size="lg" className="text-lg px-10" onClick={checkWrite}>チェック / <T>Check</T></Button>
            </div>
            <Warn>{warn}</Warn>
          </Card>
          {checked && (
            showModel ? (
              <Tip>
                <Ruby rt="こた">答</Ruby>えの<Ruby rt="れい">例</Ruby>：{WRITE_FIELDS.map((f) => `${f.label}：${f.model}`).join(" ／ ")}
                <span className="block text-xs text-slate-500 mt-1">（<Ruby rt="ことば">言葉</Ruby>はちがってもOK）</span>
              </Tip>
            ) : (
              <p className="text-center">
                <button className="text-sm text-slate-500 underline" onClick={() => setShowModel(true)}><Ruby rt="こた">答</Ruby>えの<Ruby rt="れい">例</Ruby>を<Ruby rt="み">見</Ruby>る / <T>Show example</T></button>
              </p>
            )
          )}
        </div>
      )}
    </MissionFrame>
  )
}
