"use client"

// L9 ミッション3：情報セキュリティ
// 怪しいメール・SMS／偽ログイン画面／パスワード／画面ロック

import { useState } from "react"
import { Card, ChoiceQuiz, Keys, MissionFrame, Ruby, Tip, Warn, useAward, useStepFlow } from "@/components/lesson/kit"
import { Lock, ShieldAlert, MessageSquare, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const LESSON_ID = 10

function Message({ kind, from, children }: { kind: "mail" | "sms"; from: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border p-4 text-sm space-y-1", kind === "sms" ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200")}>
      <p className="flex items-center gap-2 text-slate-500">
        {kind === "sms" ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
        {from}
      </p>
      <div className="text-slate-800 text-base leading-relaxed">{children}</div>
    </div>
  )
}

const SAFE = { label: "安全そう" }
const DANGER = { label: "あやしい！" }

export function SecurityMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(4, onComplete)
  const award = useAward(LESSON_ID)
  const [warn, setWarn] = useState<React.ReactNode>(null)
  const [foundUrl, setFoundUrl] = useState(false)

  const messages: React.ReactNode[] = [
    <><Ruby rt="りゅうがくせい">留学生</Ruby>をねらった<Ruby rt="さぎ">詐欺</Ruby>メール・SMS が<Ruby rt="おお">多</Ruby>いよ。<Ruby rt="あんぜん">安全</Ruby>か、あやしいか、<Ruby rt="み">見</Ruby><Ruby rt="わ">分</Ruby>けよう！<span className="block text-sm text-muted-foreground mt-1">Spot the scam messages.</span></>,
    <>メールのリンクを<Ruby rt="ひら">開</Ruby>いたら、ログイン<Ruby rt="がめん">画面</Ruby>が<Ruby rt="で">出</Ruby>た。<Ruby rt="ほんもの">本物</Ruby>そうだけど…あやしいところをクリックしてね。<span className="block text-sm text-muted-foreground mt-1">This login page looks real. Click the suspicious part.</span></>,
    <>パスワードの<Ruby rt="まも">守</Ruby>り<Ruby rt="かた">方</Ruby>を<Ruby rt="おぼ">覚</Ruby>えよう。<span className="block text-sm text-muted-foreground mt-1">Protect your passwords.</span></>,
    <><Ruby rt="せき">席</Ruby>を<Ruby rt="はな">離</Ruby>れるときは、<Ruby rt="がめん">画面</Ruby>をロック！<span className="block text-sm text-muted-foreground mt-1">Lock your screen when you leave your desk.</span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={4} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <ChoiceQuiz
          key="phish"
          columns={2}
          onDone={() => succeed("詐欺を見破った！")}
          questions={[
            {
              q: "このメールは？",
              visual: <Message kind="mail" from="Amazon セキュリティ <info@amaz0n-security.xyz>">【<Ruby rt="きんきゅう">緊急</Ruby>】お<Ruby rt="しはら">支払</Ruby>い<Ruby rt="ほうほう">方法</Ruby>に<Ruby rt="もんだい">問題</Ruby>があります。24<Ruby rt="じかんいない">時間以内</Ruby>に<Ruby rt="いか">以下</Ruby>から<Ruby rt="かくにん">確認</Ruby>しないと、アカウントが<Ruby rt="と">止</Ruby>まります。<br /><span className="text-blue-600 underline">http://amaz0n-security.xyz/login</span></Message>,
              choices: [
                { label: SAFE.label, ok: false, why: "よく見て！アドレスが amaz0n（ゼロ）になっているよ" },
                { label: DANGER.label, ok: true, why: "①「24時間以内」と急がせる ② アドレスが amaz0n（数字の0）③ 本物は .co.jp。リンクは押さず、公式アプリで確認しよう" },
              ],
            },
            {
              q: "この SMS は？",
              visual: <Message kind="sms" from="+81 80-XXXX-XXXX">お<Ruby rt="にもつ">荷物</Ruby>をお<Ruby rt="とど">届</Ruby>けにあがりましたが、<Ruby rt="ふざい">不在</Ruby>のため<Ruby rt="も">持</Ruby>ち<Ruby rt="かえ">帰</Ruby>りました。<Ruby rt="かくにん">確認</Ruby>はこちら <span className="text-blue-600 underline">http://sagawa-xp.top</span></Message>,
              choices: [
                { label: SAFE.label, ok: false, why: "宅配便のふりをした詐欺SMSはとても多いよ" },
                { label: DANGER.label, ok: true, why: "宅配会社は SMS でリンクを送ってこないことがほとんど。.top など見慣れないアドレスも注意。不在票（紙）や公式アプリで確認しよう" },
              ],
            },
            {
              q: "このメールは？",
              visual: <Message kind="mail" from="日本語学校 事務室 <office@school.example.jp>"><Ruby rt="らいしゅう">来週</Ruby>の<Ruby rt="じかんわり">時間割</Ruby>が<Ruby rt="か">変</Ruby>わりました。くわしくは<Ruby rt="きょうしつ">教室</Ruby>の<Ruby rt="けいじばん">掲示板</Ruby>を<Ruby rt="み">見</Ruby>てください。</Message>,
              choices: [
                { label: SAFE.label, ok: true, why: "いつもの学校のアドレスで、急がせたり、お金や個人情報を聞いたりしていないね。でも、心配なら先生に直接聞こう" },
                { label: DANGER.label, ok: false, why: "いつものアドレスで、リンクもなく、お金や個人情報も聞いていないね" },
              ],
            },
            {
              q: "この SMS は？",
              visual: <Message kind="sms" from="当選事務局">おめでとうございます！10<Ruby rt="まんえん">万円</Ruby>が<Ruby rt="とうせん">当選</Ruby>しました。<Ruby rt="う">受</Ruby>け<Ruby rt="と">取</Ruby>るには、<Ruby rt="ぎんこう">銀行</Ruby>の<Ruby rt="こうざばんごう">口座番号</Ruby>と<Ruby rt="あんしょうばんごう">暗証番号</Ruby>を<Ruby rt="へんしん">返信</Ruby>してください。</Message>,
              choices: [
                { label: SAFE.label, ok: false, why: "応募していないのに当選はおかしいね" },
                { label: DANGER.label, ok: true, why: "暗証番号を聞くのは100%詐欺！銀行も警察も、暗証番号は絶対に聞かないよ" },
              ],
            },
          ]}
        />
      )}

      {step === 1 && (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-300 overflow-hidden bg-white shadow-md">
            <button
              onClick={() => { setFoundUrl(true); setWarn(null); setTimeout(() => succeed("偽物を見破った！"), 1500) }}
              className={cn("w-full bg-slate-100 px-3 py-2 flex items-center gap-2 text-left", foundUrl && "ring-4 ring-red-400")}
            >
              <span className="text-slate-400 text-sm">← → ⟳</span>
              <span className="flex-1 bg-white rounded-full px-4 py-1.5 text-sm text-slate-700">https://accounts.goog1e-login.com/signin</span>
            </button>
            <div className="py-10 flex justify-center">
              <div className="w-80 border border-slate-200 rounded-xl p-6 space-y-4 text-center">
                <p className="text-2xl font-bold"><span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></p>
                <p className="text-lg">ログイン</p>
                <button onClick={() => setWarn("まって！入力する前に、どこかおかしいところがないか確認しよう")} className="w-full border rounded px-3 py-2 text-left text-slate-400 text-sm">メールアドレス</button>
                <button onClick={() => setWarn("パスワードを入れる前に、アドレスバーを見て！")} className="w-full border rounded px-3 py-2 text-left text-slate-400 text-sm">パスワード</button>
                <button onClick={() => setWarn("ロゴは本物そっくりにまねできる。ほかのところを見よう")} className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm">次へ</button>
              </div>
            </div>
          </div>
          <Warn>{warn}</Warn>
          {foundUrl && (
            <Card className="border-red-300 bg-red-50 animate-fade-in">
              <p className="font-bold text-red-700 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> goog<b className="text-2xl">1</b>e（<Ruby rt="すうじ">数字</Ruby>の1）！<Ruby rt="ほんもの">本物</Ruby>は accounts.google.com</p>
              <p className="text-slate-700 mt-1">パスワードを<Ruby rt="い">入</Ruby>れる<Ruby rt="まえ">前</Ruby>に、<b>アドレスバー</b>を<Ruby rt="かなら">必</Ruby>ず<Ruby rt="み">見</Ruby>よう。<Ruby rt="み">見</Ruby>た<Ruby rt="め">目</Ruby>はいくらでもまねできるよ。</p>
            </Card>
          )}
        </div>
      )}

      {step === 2 && (
        <ChoiceQuiz
          key="password"
          onDone={() => succeed("パスワード名人！")}
          questions={[
            { q: "いちばん安全なパスワードは？", choices: [
              { label: "20050415（誕生日）", ok: false, why: "誕生日は SNS などからすぐわかるよ" },
              { label: "password123", ok: false, why: "よく使われるパスワードは、最初にためされるよ" },
              { label: "Sakura!Bus7Ramen", ok: true, why: "長くて、大文字・小文字・数字・記号がまざっている。関係ない言葉をつなげると覚えやすいよ" },
            ] },
            { q: "学校と銀行とSNS。パスワードはどうする？", choices: [
              { label: "全部同じにする（覚えやすい）", ok: false, why: "1つもれたら、全部のアカウントに入られてしまう！" },
              { label: "全部ちがうものにする", ok: true, why: "使い回しはしない。覚えられなければ、パスワード管理アプリを使おう" },
            ] },
            { q: "友だちに「パスワード教えて。代わりにログインしてあげる」と言われた。", choices: [
              { label: "友だちだから教える", ok: false, why: "パスワードは家族や友だちにも教えないのがルールだよ" },
              { label: "教えない", ok: true, why: "先生・会社の人・銀行も、パスワードは聞かないよ。聞いてくる人は疑おう" },
            ] },
          ]}
        />
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Card className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-40 h-28 rounded-xl bg-gradient-to-br from-sky-700 to-indigo-900 flex flex-col items-center justify-center text-white shrink-0">
              <Lock className="w-8 h-8" />
              <span className="text-sm mt-1">ロック<Ruby rt="ちゅう">中</Ruby></span>
            </div>
            <div className="space-y-2 text-slate-700">
              <p className="text-2xl font-bold"><Keys k="Win+L" /></p>
              <p>Windowsキー（<Ruby rt="ひだりした">左下</Ruby>の <span className="font-bold">⊞</span>）を<Ruby rt="お">押</Ruby>しながら <b>L</b>。<Ruby rt="いっしゅん">一瞬</Ruby>でロックできるよ。<Ruby rt="もど">戻</Ruby>るときはパスワードかPINを<Ruby rt="い">入</Ruby>れる。</p>
            </div>
          </Card>
          <ChoiceQuiz
            key="lock"
            onDone={() => { award("lock"); succeed("セキュリティ名人！") }}
            questions={[
              { q: "トイレに行くため、5分だけ席を離れる。パソコンは？", choices: [
                { label: "5分だけだから、そのまま", ok: false, why: "その5分で、メールを送られたり、情報を見られたりすることがあるよ" },
                { label: "Windows + L でロック", ok: true, why: "短い時間でも必ずロック。会社ではこれがルールのところが多いよ" },
                { label: "電源を切る", ok: false, why: "安全だけど、作業中のファイルが消えるかも。ロックで十分だよ" },
              ] },
              { q: "駅で USB メモリを拾った。中身が気になる…", choices: [
                { label: "自分のパソコンにさして中身を見る", ok: false, why: "ウイルスが入っているかもしれない！知らない USB は絶対にささないで" },
                { label: "さわらずに、駅の人に届ける", ok: true, why: "落とし物として届けよう。会社のパソコンに知らない機器をつなぐのも禁止だよ" },
              ] },
            ]}
          />
          <Tip>このキーはブラウザではためせないので、<Ruby rt="きょうしつ">教室</Ruby>で<Ruby rt="ほんもの">本物</Ruby>のパソコンで<Ruby rt="ため">試</Ruby>してみよう（<Ruby rt="まえ">前</Ruby>もってパスワードを<Ruby rt="かくにん">確認</Ruby>してね）。</Tip>
        </div>
      )}
    </MissionFrame>
  )
}
