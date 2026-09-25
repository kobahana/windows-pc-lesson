"use client"

// L9 ミッション2：ビジネスメール（Gmail風）
// 宛先/CC/BCC・件名・あいさつと結び・添付・送信前の確認・返信と全員に返信

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, ChoiceQuiz, MissionFrame, Ruby, Tip, useStepFlow } from "@/components/lesson/kit"
import { halfWidthProblem } from "@/lib/input-check"
import { Paperclip, Send, X, File, Reply, ReplyAll, Forward, Mail, Minus, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

const TO = "yamada@sakura.example.jp"
const CC = "sato@gurn.example.jp"
const RIGHT_FILE = "請求書_さくら商事_10月.pdf"
const FILES = ["請求書_さくら商事_10月.pdf", "請求書_ふじ物産_10月.pdf", "履歴書.pdf"]
const BODY_TEMPLATE = "株式会社さくら商事\n山田様\n\n（ここに あいさつ）\nグエン貿易のグエンです。\n\n10月分の請求書をお送りします。\nご確認のほど、\n（ここに 結び）\n\n――――――――――\nグエン貿易株式会社　営業部\nグエン・ヴァン・アン"

function MailHeader({ from, to, cc, subject }: { from: string; to: string; cc?: string; subject: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-1">
      <p className="font-bold text-base">{subject}</p>
      <p><span className="text-slate-400 w-12 inline-block">差出人</span>{from}</p>
      <p><span className="text-slate-400 w-12 inline-block">宛先</span>{to}</p>
      {cc && <p><span className="text-slate-400 w-12 inline-block">CC</span>{cc}</p>}
      <div className="flex gap-2 pt-2">
        <span className="flex items-center gap-1 border rounded-full px-3 py-1"><Reply className="w-4 h-4" />返信</span>
        <span className="flex items-center gap-1 border rounded-full px-3 py-1"><ReplyAll className="w-4 h-4" />全員に返信</span>
        <span className="flex items-center gap-1 border rounded-full px-3 py-1"><Forward className="w-4 h-4" />転送</span>
      </div>
    </div>
  )
}

export function EmailMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(3, onComplete)
  const [to, setTo] = useState("")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [showCc, setShowCc] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState(BODY_TEMPLATE)
  const [attachments, setAttachments] = useState<string[]>([])
  const [picker, setPicker] = useState(false)
  const [problems, setProblems] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)
  const [confirmChecks, setConfirmChecks] = useState([false, false, false])
  useEffect(() => { setProblems([]) }, [step])

  const trySend = () => {
    const p: string[] = []
    const toHw = halfWidthProblem(to)
    if (!to.trim()) p.push("宛先（To）が空っぽだよ")
    else if (toHw) p.push(`宛先：${toHw}`)
    else if (to.trim() !== TO) p.push("宛先のメールアドレスがちがうよ。1文字でもちがうと届かない！")
    if (cc.trim() !== CC) p.push(`上司の佐藤さん（${CC}）を CC に入れよう`)
    if (bcc.trim()) p.push("今回は BCC は使わないよ")
    if (!subject.trim()) p.push("件名が空っぽだよ。件名がないメールは読まれにくい！")
    else if (!(/請求書/.test(subject) && /10月/.test(subject))) p.push("件名に「10月」と「請求書」を入れて、内容がすぐわかるようにしよう")
    if (/（ここに/.test(body)) p.push("本文の「（ここに …）」を書きかえよう")
    if (!/お世話になっております/.test(body)) p.push("最初のあいさつ「いつもお世話になっております。」を入れよう")
    if (!/よろしくお願い(いた)?します/.test(body)) p.push("最後の結び「よろしくお願いいたします。」を入れよう")
    if (attachments.length === 0) p.push("⚠ 添付を忘れているよ！本文に「請求書をお送りします」と書いてあるのに、ファイルがない（とても多いミス）")
    else if (attachments.some((a) => a !== RIGHT_FILE)) p.push("ちがうファイルが添付されているよ！ほかの会社の請求書を送ると、大きな問題になる")
    setProblems(p)
    if (p.length === 0) setConfirming(true)
  }

  const messages: React.ReactNode[] = [
    <>メールの「<Ruby rt="あてさき">宛先</Ruby>（To）」「CC」「BCC」のちがいを<Ruby rt="おぼ">覚</Ruby>えよう！<span className="block text-sm text-muted-foreground mt-1">Learn To, CC and BCC.</span></>,
    <><Ruby rt="とりひきさき">取引先</Ruby>に<Ruby rt="せいきゅうしょ">請求書</Ruby>をメールで<Ruby rt="おく">送</Ruby>ろう。<Ruby rt="した">下</Ruby>の<Ruby rt="しじ">指示</Ruby>を<Ruby rt="よ">読</Ruby>んで、メールを<Ruby rt="つく">作</Ruby>ってね。<span className="block text-sm text-muted-foreground mt-1">Write an email with an invoice attached.</span></>,
    <>「<Ruby rt="へんしん">返信</Ruby>」と「<Ruby rt="ぜんいん">全員</Ruby>に<Ruby rt="へんしん">返信</Ruby>」、どっちを<Ruby rt="つか">使</Ruby>う？<span className="block text-sm text-muted-foreground mt-1">Reply or Reply all?</span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={3} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-4">
          <Card className="grid md:grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-sky-50"><p className="font-bold text-sky-800">To（<Ruby rt="あてさき">宛先</Ruby>）</p><p className="text-sm text-slate-600">メールを<Ruby rt="よ">読</Ruby>んで、<Ruby rt="なに">何</Ruby>かしてほしい<Ruby rt="ひと">人</Ruby></p></div>
            <div className="p-3 rounded-xl bg-violet-50"><p className="font-bold text-violet-800">CC</p><p className="text-sm text-slate-600">「<Ruby rt="し">知</Ruby>っておいてね」の<Ruby rt="ひと">人</Ruby>（<Ruby rt="じょうし">上司</Ruby>など）。<Ruby rt="みんな">みんな</Ruby>に<Ruby rt="み">見</Ruby>える</p></div>
            <div className="p-3 rounded-xl bg-slate-100"><p className="font-bold text-slate-800">BCC</p><p className="text-sm text-slate-600"><Ruby rt="ほか">他</Ruby>の<Ruby rt="ひと">人</Ruby>には<Ruby rt="み">見</Ruby>えない<Ruby rt="あてさき">宛先</Ruby>。たくさんのお<Ruby rt="きゃく">客</Ruby>さまに<Ruby rt="いっせい">一斉</Ruby>に<Ruby rt="おく">送</Ruby>るとき</p></div>
          </Card>
          <ChoiceQuiz
            key="tocc"
            questions={[
              { q: <><Ruby rt="とりひきさき">取引先</Ruby>の<Ruby rt="やまだ">山田</Ruby>さんに<Ruby rt="しつもん">質問</Ruby>したい。<Ruby rt="じょうし">上司</Ruby>の<Ruby rt="さとう">佐藤</Ruby>さんにも<Ruby rt="ないよう">内容</Ruby>を<Ruby rt="し">知</Ruby>らせたい。</>, choices: [
                { label: "To：山田さん　CC：佐藤さん", ok: true, why: "答えてほしい人が To、知っておいてほしい人が CC" },
                { label: "To：佐藤さん　CC：山田さん", ok: false, why: "質問に答えてほしいのは山田さんだね" },
                { label: "To：山田さん　BCC：佐藤さん", ok: false, why: "BCC だと山田さんから見えない。上司にかくれて送っているように見えることがあるよ" },
              ] },
              { q: <>100<Ruby rt="にん">人</Ruby>のお<Ruby rt="きゃく">客</Ruby>さまに、セールのお<Ruby rt="し">知</Ruby>らせを<Ruby rt="いっせい">一斉</Ruby>に<Ruby rt="おく">送</Ruby>る。</>, choices: [
                { label: "全員を To に入れる", ok: false, why: "全員のメールアドレスが、ほかのお客さまに見えてしまう！個人情報の事故になるよ" },
                { label: "全員を CC に入れる", ok: false, why: "CC もみんなに見えるよ" },
                { label: "全員を BCC に入れる", ok: true, why: "BCC なら、ほかの人のアドレスは見えない。個人情報を守れるね" },
              ] },
            ]}
            onDone={() => succeed("To・CC・BCC、わかった！")}
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card className="bg-sky-50 border-sky-200 space-y-1 text-slate-700">
            <p className="font-bold text-sky-800"><Ruby rt="しじ">指示</Ruby> / Task</p>
            <p>・さくら<Ruby rt="しょうじ">商事</Ruby>の<Ruby rt="やまだ">山田</Ruby>さん（<span className="font-mono">{TO}</span>）に<Ruby rt="おく">送</Ruby>る</p>
            <p>・<Ruby rt="じょうし">上司</Ruby>の<Ruby rt="さとう">佐藤</Ruby>さん（<span className="font-mono">{CC}</span>）を CC に<Ruby rt="い">入</Ruby>れる</p>
            <p>・<Ruby rt="けんめい">件名</Ruby>：10<Ruby rt="がつぶん">月分</Ruby>の<Ruby rt="せいきゅうしょ">請求書</Ruby>を<Ruby rt="おく">送</Ruby>ることがわかるように</p>
            <p>・<Ruby rt="ほんぶん">本文</Ruby>の「（ここに…）」を、あいさつと<Ruby rt="むす">結</Ruby>びに<Ruby rt="か">書</Ruby>きかえる</p>
            <p>・10<Ruby rt="がつ">月</Ruby>のさくら<Ruby rt="しょうじ">商事</Ruby>の<Ruby rt="せいきゅうしょ">請求書</Ruby>を<Ruby rt="てんぷ">添付</Ruby>する</p>
          </Card>

          <div className="rounded-2xl border-2 border-slate-300 overflow-hidden bg-white shadow-md relative">
            <div className="bg-slate-800 text-white px-4 py-2 flex items-center text-sm">
              <span>新規メッセージ</span>
              <span className="ml-auto flex gap-3"><Minus className="w-4 h-4" /><Maximize2 className="w-4 h-4" /><X className="w-4 h-4" /></span>
            </div>
            <div className="divide-y divide-slate-200">
              <div className="flex items-center px-4">
                <span className="text-sm text-slate-500 w-12">To</span>
                <input value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 py-2 outline-none" aria-label="宛先" />
                {!showCc && <button onClick={() => setShowCc(true)} className="text-sm text-slate-600 hover:underline">Cc Bcc</button>}
              </div>
              {showCc && (
                <>
                  <div className="flex items-center px-4"><span className="text-sm text-slate-500 w-12">Cc</span><input value={cc} onChange={(e) => setCc(e.target.value)} className="flex-1 py-2 outline-none" aria-label="Cc" /></div>
                  <div className="flex items-center px-4"><span className="text-sm text-slate-500 w-12">Bcc</span><input value={bcc} onChange={(e) => setBcc(e.target.value)} className="flex-1 py-2 outline-none" aria-label="Bcc" /></div>
                </>
              )}
              <div className="flex items-center px-4"><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="件名" className="flex-1 py-2 outline-none" aria-label="件名" /></div>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="border-0 rounded-none min-h-64 text-base focus-visible:ring-0" aria-label="本文" />
            </div>
            {attachments.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <span key={a} className="flex items-center gap-2 bg-slate-100 rounded px-3 py-1.5 text-sm">
                    <File className="w-4 h-4 text-red-600" />{a}
                    <button onClick={() => setAttachments(attachments.filter((x) => x !== a))} aria-label="添付を外す"><X className="w-4 h-4" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-200">
              <button onClick={trySend} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 py-2">送信 <Send className="w-4 h-4" /></button>
              <button onClick={() => setPicker(true)} className="p-2 rounded-full hover:bg-slate-100" title="ファイルを添付"><Paperclip className="w-5 h-5" /></button>
            </div>

            {picker && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                <div className="bg-white rounded-xl shadow-2xl w-96 max-w-[90%]">
                  <div className="px-4 py-3 border-b font-bold flex items-center">ファイルを開く — ダウンロード <button className="ml-auto" onClick={() => setPicker(false)}><X className="w-4 h-4" /></button></div>
                  <div className="p-2">
                    {FILES.map((f) => (
                      <button key={f} onDoubleClick={() => { setAttachments((a) => (a.includes(f) ? a : [...a, f])); setPicker(false) }} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-sky-50 focus:bg-sky-100 outline-none">
                        <File className="w-4 h-4 text-red-600" />{f}
                      </button>
                    ))}
                    <p className="text-xs text-slate-400 px-3 pt-2">ダブルクリックで<Ruby rt="えら">選</Ruby>ぶ / Double-click to attach</p>
                  </div>
                </div>
              </div>
            )}

            {confirming && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                <div className="bg-white rounded-xl shadow-2xl w-[28rem] max-w-[92%] p-5 space-y-3">
                  <p className="font-bold text-lg flex items-center gap-2"><Mail className="w-5 h-5" /> <Ruby rt="そうしんまえ">送信前</Ruby>チェック</p>
                  {["宛先の名前とアドレスは合っている？", "添付ファイルは正しい？（開いて中身を確認）", "敬語・誤字はない？"].map((c, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={confirmChecks[i]} onCheckedChange={(v) => setConfirmChecks(confirmChecks.map((x, j) => (j === i ? v === true : x)))} className="w-5 h-5" />
                      {c}
                    </label>
                  ))}
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" onClick={() => setConfirming(false)}>もどる</Button>
                    <Button disabled={!confirmChecks.every(Boolean)} onClick={() => { setConfirming(false); succeed("送信完了！") }}>送信する</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {problems.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-900 space-y-1">
              <p className="font-bold">送る前に直そう / Fix before sending</p>
              {problems.map((p, i) => <p key={i}>・{p}</p>)}
            </div>
          )}
          <Tip>メールは<Ruby rt="おく">送</Ruby>ったら<Ruby rt="と">取</Ruby>り<Ruby rt="け">消</Ruby>せないよ。<Ruby rt="そうしん">送信</Ruby>ボタンを<Ruby rt="お">押</Ruby>す<Ruby rt="まえ">前</Ruby>に、<Ruby rt="あてさき">宛先</Ruby>・<Ruby rt="てんぷ">添付</Ruby>・<Ruby rt="けいご">敬語</Ruby>を<Ruby rt="かなら">必</Ruby>ず<Ruby rt="み">見</Ruby><Ruby rt="なお">直</Ruby>そう。</Tip>
        </div>
      )}

      {step === 2 && (
        <ChoiceQuiz
          key="reply"
          questions={[
            {
              q: <><Ruby rt="さとう">佐藤</Ruby>さんから<Ruby rt="しりょう">資料</Ruby>をもらった。<Ruby rt="さとう">佐藤</Ruby>さんにだけ、お<Ruby rt="れい">礼</Ruby>を<Ruby rt="い">言</Ruby>いたい。</>,
              visual: <MailHeader from="佐藤（上司）" to="あなた" cc="田中、鈴木、高橋" subject="来週の会議資料" />,
              choices: [
                { label: <span className="flex items-center gap-2"><Reply className="w-5 h-5" />返信</span>, ok: true, why: "「返信」は差出人（佐藤さん）だけに送るよ" },
                { label: <span className="flex items-center gap-2"><ReplyAll className="w-5 h-5" />全員に返信</span>, ok: false, why: "CC の田中さんたちにも届いてしまうよ。お礼だけなら必要ないね" },
                { label: <span className="flex items-center gap-2"><Forward className="w-5 h-5" />転送</span>, ok: false, why: "「転送」は、ほかの人にこのメールを送るときに使うよ" },
              ],
            },
            {
              q: <><Ruby rt="かいぎ">会議</Ruby>に<Ruby rt="さんか">参加</Ruby>できないことを、このメールの<Ruby rt="ぜんいん">全員</Ruby>に<Ruby rt="し">知</Ruby>らせたい。</>,
              visual: <MailHeader from="佐藤（上司）" to="あなた" cc="田中、鈴木、高橋" subject="来週の会議の日程" />,
              choices: [
                { label: <span className="flex items-center gap-2"><Reply className="w-5 h-5" />返信</span>, ok: false, why: "佐藤さんにしか届かないよ" },
                { label: <span className="flex items-center gap-2"><ReplyAll className="w-5 h-5" />全員に返信</span>, ok: true, why: "To と CC の全員に届くよ。みんなに関係がある内容のときに使おう" },
                { label: <span className="flex items-center gap-2"><Forward className="w-5 h-5" />転送</span>, ok: false, why: "転送は宛先を自分で入れ直す必要があるよ" },
              ],
            },
            {
              q: <><Ruby rt="とりひきさき">取引先</Ruby>から<Ruby rt="き">来</Ruby>たメールを、<Ruby rt="とうじしゃ">当事者</Ruby>ではない<Ruby rt="どうりょう">同僚</Ruby>の<Ruby rt="きむら">木村</Ruby>さんにも<Ruby rt="み">見</Ruby>せたい。</>,
              choices: [
                { label: "返信", ok: false, why: "取引先に届いてしまうよ" },
                { label: "全員に返信", ok: false, why: "取引先にも届いてしまうよ" },
                { label: "転送", ok: true, why: "「転送」で木村さんのアドレスを入れて送ろう" },
              ],
            },
          ]}
          onDone={() => succeed("メール名人！")}
        />
      )}
    </MissionFrame>
  )
}
