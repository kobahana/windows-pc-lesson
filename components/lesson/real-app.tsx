"use client"

// 「本物のアプリで仕上げ」ミッション（L7 Googleドキュメント / L8 Googleスプレッドシート）。
// 本物のアプリの中はアプリから判定できないので、チェックリストで自己確認し、
// 最後に共有リンクを貼って先生に提出する（学習記録に URL が残る）。

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, MissionFrame, Ruby, Tip, Warn, useStepFlow } from "@/components/lesson/kit"
import { useSettings } from "@/components/providers/settings-provider"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RealAppConfig {
  lessonId: number
  appName: string
  openUrl: string // 例: https://docs.new
  linkPrefix: string // 共有リンクの先頭（例: https://docs.google.com/document/）
  checklist: React.ReactNode[]
  extra?: React.ReactNode // 手順の図解など
}

const SHARE_CHOICES = [
  { label: "閲覧者", ruby: "えつらんしゃ", note: "見るだけ。書き換えられない", ok: true },
  { label: "閲覧者（コメント可）", ruby: "えつらんしゃ（コメントか）", note: "見る＋コメントを書ける", ok: true },
  { label: "編集者", ruby: "へんしゅうしゃ", note: "だれでも書き換えられる！", ok: false },
]

export function RealAppMission({ config, onComplete }: { config: RealAppConfig; onComplete: () => void }) {
  const { step, setStep, succeed, showSuccess, successMsg } = useStepFlow(2, onComplete)
  const { recordEvent } = useSettings()
  const [checks, setChecks] = useState<boolean[]>(config.checklist.map(() => false))
  const [sharePick, setSharePick] = useState<number | null>(null)
  const [link, setLink] = useState("")
  const [warn, setWarn] = useState<React.ReactNode>(null)
  useEffect(() => { setWarn(null) }, [step])

  const submit = () => {
    const url = link.trim()
    if (!url.startsWith(config.linkPrefix)) {
      setWarn(<>{config.appName}の<Ruby rt="きょうゆう">共有</Ruby>リンクではないみたい。「{config.linkPrefix}…」で<Ruby rt="はじ">始</Ruby>まるリンクをコピーしてね</>)
      return
    }
    recordEvent(config.lessonId, "stage_clear", `提出リンク：${url}`)
    succeed("提出できた！")
  }

  const messages: React.ReactNode[] = [
    <>いよいよ<Ruby rt="ほんもの">本物</Ruby>の{config.appName}で<Ruby rt="つく">作</Ruby>ってみよう！できたら、<Ruby rt="した">下</Ruby>のチェックリストに<Ruby rt="じぶん">自分</Ruby>でチェックしてね。<span className="block text-sm text-muted-foreground mt-1">Now make it in the real {config.appName}. Check each item yourself.</span></>,
    <><Ruby rt="さいご">最後</Ruby>に<Ruby rt="せんせい">先生</Ruby>に<Ruby rt="ていしゅつ">提出</Ruby>しよう。<Ruby rt="みぎうえ">右上</Ruby>の「<Ruby rt="きょうゆう">共有</Ruby>」ボタンからリンクをコピーして、ここに<Ruby rt="はりつ">貼り付</Ruby>けてね。<span className="block text-sm text-muted-foreground mt-1">Share it: copy the link and paste it here.</span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={2} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-4">
          <Card className="text-center space-y-2">
            <a href={config.openUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="text-lg gap-2">
                {config.appName}を<Ruby rt="ひら">開</Ruby>く <ExternalLink className="w-5 h-5" />
              </Button>
            </a>
            <p className="text-sm text-slate-500"><Ruby rt="あたら">新</Ruby>しいタブで<Ruby rt="ひら">開</Ruby>くよ。このタブと<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えながら<Ruby rt="すす">進</Ruby>めよう（<Ruby rt="がめん">画面</Ruby>を<Ruby rt="さゆう">左右</Ruby>に<Ruby rt="なら">並</Ruby>べると<Ruby rt="らく">楽</Ruby>！）</p>
          </Card>
          <Card className="space-y-2">
            <p className="font-bold text-slate-800">チェックリスト</p>
            {config.checklist.map((item, i) => (
              <label key={i} className={cn("flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-50", checks[i] && "text-success")}>
                <Checkbox
                  checked={checks[i]}
                  onCheckedChange={(v) => setChecks(checks.map((c, j) => (j === i ? v === true : c)))}
                  className="mt-0.5 w-5 h-5"
                />
                <span>{item}</span>
              </label>
            ))}
            <div className="text-center pt-2">
              <Button size="lg" disabled={!checks.every(Boolean)} onClick={() => setStep(1)}>
                <Ruby rt="ぜんぶ">全部</Ruby>できた！ / All done
              </Button>
            </div>
          </Card>
          {config.extra}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <p className="font-bold text-slate-800">Q. <Ruby rt="せんせい">先生</Ruby>に<Ruby rt="み">見</Ruby>てもらうだけ（<Ruby rt="か">書</Ruby>き<Ruby rt="か">換</Ruby>えられたくない）。どの<Ruby rt="けんげん">権限</Ruby>にする？</p>
            <div className="grid md:grid-cols-3 gap-3">
              {SHARE_CHOICES.map((c, i) => (
                <button
                  key={c.label}
                  onClick={() => setSharePick(i)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-colors",
                    sharePick === i ? (c.ok ? "border-success bg-success/10" : "border-red-400 bg-red-50") : "border-slate-200 hover:border-slate-400",
                  )}
                >
                  <p className="font-bold"><Ruby rt={c.ruby}>{c.label}</Ruby></p>
                  <p className="text-sm text-slate-500">{c.note}</p>
                </button>
              ))}
            </div>
            {sharePick !== null && (
              <p className={cn("font-bold", SHARE_CHOICES[sharePick].ok ? "text-success" : "text-red-600")}>
                {SHARE_CHOICES[sharePick].ok
                  ? "正解！見てもらうだけなら「閲覧者」でOK。"
                  : "あぶない！「編集者」にすると、リンクを知っている人がだれでも書き換えられるよ。"}
              </p>
            )}
          </Card>
          {sharePick !== null && SHARE_CHOICES[sharePick].ok && (
            <Card className="space-y-3 animate-fade-in">
              <ol className="list-decimal pl-6 space-y-1 text-slate-700">
                <li><Ruby rt="みぎうえ">右上</Ruby>の「<Ruby rt="きょうゆう">共有</Ruby>」ボタンを<Ruby rt="お">押</Ruby>す</li>
                <li>「<Ruby rt="いっぱん">一般</Ruby>的なアクセス」を「リンクを<Ruby rt="し">知</Ruby>っている<Ruby rt="ぜんいん">全員</Ruby>」にして、<Ruby rt="けんげん">権限</Ruby>を「<Ruby rt="えつらんしゃ">閲覧者</Ruby>」にする</li>
                <li>「リンクをコピー」を<Ruby rt="お">押</Ruby>す → <Ruby rt="した">下</Ruby>に <b>Ctrl+V</b></li>
              </ol>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder={`${config.linkPrefix}…`} className="h-12 text-base" />
              <Warn>{warn}</Warn>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button size="lg" onClick={submit} disabled={!link.trim()}><Ruby rt="ていしゅつ">提出</Ruby>する / Submit</Button>
                <Button size="lg" variant="ghost" className="text-slate-500" onClick={() => succeed("おつかれさま！")}>
                  <Ruby rt="せんせい">先生</Ruby>の<Ruby rt="しじ">指示</Ruby>で<Ruby rt="ていしゅつ">提出</Ruby>しない / Skip
                </Button>
              </div>
              <Tip title={<><Ruby rt="ちゅうい">注意</Ruby> / Be careful</>}>
                「リンクを<Ruby rt="し">知</Ruby>っている<Ruby rt="ぜんいん">全員</Ruby>」にすると、リンクが<Ruby rt="ほか">他</Ruby>の<Ruby rt="ひと">人</Ruby>に<Ruby rt="わた">渡</Ruby>ったら<Ruby rt="だれ">誰</Ruby>でも<Ruby rt="み">見</Ruby>られるよ。<Ruby rt="こじんじょうほう">個人情報</Ruby>が<Ruby rt="はい">入</Ruby>った<Ruby rt="ぶんしょ">文書</Ruby>は、<Ruby rt="あいて">相手</Ruby>のメールアドレスを<Ruby rt="い">入</Ruby>れて<Ruby rt="きょうゆう">共有</Ruby>しよう。
              </Tip>
            </Card>
          )}
        </div>
      )}
    </MissionFrame>
  )
}
