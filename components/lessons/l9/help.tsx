"use client"

// L9 ミッション4：困ったとき
// スクリーンショットを撮って本当に貼り付ける／質問のしかた／アプリの切り替えと画面を並べる／
// オンライン会議のボタン／検索と翻訳ツールの使い方

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, ChoiceQuiz, Keys, MissionFrame, Ruby, Tip, Warn, useAward, useStepFlow } from "@/components/lesson/kit"
import { HoverIcon } from "@/components/lessons/l6/five-rules"
import { usePlatform } from "@/lib/platform"
import { Mic, MicOff, Video, VideoOff, ScreenShare, Hand, MessageSquare, PhoneOff, Image as ImageIcon, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, tx } from "@/lib/i18n"

const LESSON_ID = 10

const MEET_TASKS: { q: React.ReactNode; en: string; check: (s: MeetState) => boolean }[] = [
  { q: <>マイクをオフにしよう（ミュート）</>, en: tx("Turn off the microphone (mute)"), check: (s) => !s.mic },
  { q: <>カメラをオンにしよう</>, en: tx("Turn on the camera"), check: (s) => s.cam },
  { q: <><Ruby rt="しつもん">質問</Ruby>があるので、<Ruby rt="て">手</Ruby>を<Ruby rt="あ">挙</Ruby>げよう</>, en: tx("You have a question. Raise your hand"), check: (s) => s.hand },
  { q: <><Ruby rt="しりょう">資料</Ruby>を<Ruby rt="み">見</Ruby>せたいので、<Ruby rt="がめん">画面</Ruby>を<Ruby rt="きょうゆう">共有</Ruby>しよう</>, en: tx("You want to show a document. Share your screen"), check: (s) => s.share },
  { q: <><Ruby rt="かいぎ">会議</Ruby>が<Ruby rt="お">終</Ruby>わった。<Ruby rt="たいしゅつ">退出</Ruby>しよう</>, en: tx("The meeting is over. Leave the call"), check: (s) => s.left },
]
interface MeetState { mic: boolean; cam: boolean; hand: boolean; share: boolean; chat: boolean; left: boolean }

export function HelpMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(5, onComplete)
  const award = useAward(LESSON_ID)
  const { isMac } = usePlatform()
  const [warn, setWarn] = useState<React.ReactNode>(null)
  useEffect(() => { setWarn(null) }, [step])

  // ステップ0：スクリーンショットを貼り付け
  const [shot, setShot] = useState<string | null>(null)
  const onPasteShot = (e: React.ClipboardEvent) => {
    const item = [...e.clipboardData.items].find((i) => i.type.startsWith("image/"))
    if (!item) {
      setWarn(`画像ではないみたい。スクリーンショットを撮ってから貼り付けてね / ${tx("That is not an image")}`)
      return
    }
    const file = item.getAsFile()
    if (!file) return
    e.preventDefault()
    setShot(URL.createObjectURL(file))
    award("screenshot")
    setTimeout(() => succeed("スクショ名人！"), 1200)
  }
  useEffect(() => () => { if (shot) URL.revokeObjectURL(shot) }, [shot])

  // ステップ2：Alt+Tab と画面を並べる
  const [switched, setSwitched] = useState(false)
  const [snapped, setSnapped] = useState(false)
  const blurredRef = useRef(false)
  useEffect(() => {
    if (step !== 2) return
    const onBlur = () => { blurredRef.current = true }
    const onFocus = () => {
      if (blurredRef.current) {
        setSwitched(true)
        award("alttab")
      }
    }
    const checkSnap = () => {
      if (window.outerWidth < window.screen.availWidth * 0.62) {
        setSnapped(true)
        award("snap")
      }
    }
    window.addEventListener("blur", onBlur)
    window.addEventListener("focus", onFocus)
    window.addEventListener("resize", checkSnap)
    return () => {
      window.removeEventListener("blur", onBlur)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("resize", checkSnap)
    }
  }, [step, award])
  useEffect(() => {
    if (step === 2 && switched && snapped) succeed("画面の達人！")
  }, [step, switched, snapped, succeed])

  // ステップ3：オンライン会議
  const [meet, setMeet] = useState<MeetState>({ mic: true, cam: false, hand: false, share: false, chat: false, left: false })
  const [mi, setMi] = useState(0)
  const pressMeet = (patch: Partial<MeetState>) => {
    const next = { ...meet, ...patch }
    setMeet(next)
    if (MEET_TASKS[mi].check(next)) {
      setWarn(null)
      if (mi + 1 >= MEET_TASKS.length) succeed("会議もバッチリ！")
      else setMi(mi + 1)
    } else {
      setWarn(`そのボタンじゃないみたい。マウスを乗せて名前を確かめよう（ルール2） / ${tx("Not that button. Put the mouse on it to check the name (Rule 2)")}`)
    }
  }

  const messages: React.ReactNode[] = [
    <><Ruby rt="こま">困</Ruby>ったときは、<Ruby rt="がめん">画面</Ruby>の<Ruby rt="しゃしん">写真</Ruby>（スクリーンショット）を<Ruby rt="と">撮</Ruby>って<Ruby rt="み">見</Ruby>せると、すぐに<Ruby rt="つた">伝</Ruby>わるよ！<Ruby rt="ほんとう">本当</Ruby>に<Ruby rt="と">撮</Ruby>って、<Ruby rt="した">下</Ruby>に<Ruby rt="は">貼</Ruby>り<Ruby rt="つ">付</Ruby>けてみよう。<span className="block text-sm text-muted-foreground mt-1"><T>Take a real screenshot and paste it below.</T></span></>,
    <><Ruby rt="せんせい">先生</Ruby>や<Ruby rt="じょうし">上司</Ruby>に<Ruby rt="しつもん">質問</Ruby>するとき、どう<Ruby rt="き">聞</Ruby>けばすぐ<Ruby rt="たす">助</Ruby>けてもらえるかな？<span className="block text-sm text-muted-foreground mt-1"><T>How to ask for help.</T></span></>,
    <><Ruby rt="しごと">仕事</Ruby>では、2つのアプリを<Ruby rt="み">見</Ruby>ながら<Ruby rt="さぎょう">作業</Ruby>することが<Ruby rt="おお">多</Ruby>いよ。アプリの<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えと、<Ruby rt="がめん">画面</Ruby>を<Ruby rt="なら">並</Ruby>べる<Ruby rt="ほうほう">方法</Ruby>をやってみよう。<span className="block text-sm text-muted-foreground mt-1"><T>Switch apps and snap windows side by side.</T></span></>,
    <>オンライン<Ruby rt="かいぎ">会議</Ruby>（Google Meet・Zoom）のボタンも、アイコンを<Ruby rt="み">見</Ruby>ればわかるよ！<Ruby rt="めんせつ">面接</Ruby>でも<Ruby rt="つか">使</Ruby>うから、<Ruby rt="な">慣</Ruby>れておこう。<span className="block text-sm text-muted-foreground mt-1"><T>Online meeting buttons.</T></span></>,
    <><Ruby rt="さいご">最後</Ruby>に、<Ruby rt="しら">調</Ruby>べる<Ruby rt="ちから">力</Ruby>！<Ruby rt="けんさく">検索</Ruby>と<Ruby rt="ほんやく">翻訳</Ruby>ツールの<Ruby rt="じょうず">上手</Ruby>な<Ruby rt="つか">使</Ruby>い<Ruby rt="かた">方</Ruby>だよ。<span className="block text-sm text-muted-foreground mt-1"><T>Searching and translating well.</T></span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={5} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-4">
          <Card className="space-y-2">
            <p className="text-lg font-bold">① <Keys k="Win+Shift+S" /> を<Ruby rt="お">押</Ruby>す<span className="block text-sm font-normal text-slate-500"><T>① Press these keys</T></span></p>
            <p className="text-slate-600"><Ruby rt="がめん">画面</Ruby>が<Ruby rt="か">変</Ruby>わったら、<Ruby rt="と">撮</Ruby>りたいところをマウスで<Ruby rt="かこ">囲</Ruby>む{isMac && <>（Mac は Ctrl も<Ruby rt="いっしょ">一緒</Ruby>に<Ruby rt="お">押</Ruby>すとクリップボードに<Ruby rt="はい">入</Ruby>るよ）</>}<span className="block text-sm text-slate-500"><T>When the screen changes, drag the mouse around the part you want.</T></span>{isMac && <span className="block text-sm text-slate-500"><T>On a Mac, also hold Ctrl to put it on the clipboard.</T></span>}</p>
            <p className="text-lg font-bold">② <Ruby rt="した">下</Ruby>の<Ruby rt="はこ">箱</Ruby>をクリックして <Keys k="Mod+V" /><span className="block text-sm font-normal text-slate-500"><T>② Click the box below and paste</T></span></p>
          </Card>
          <div
            tabIndex={0}
            onPaste={onPasteShot}
            className="rounded-2xl border-4 border-dashed border-sky-300 bg-sky-50 min-h-48 flex items-center justify-center p-4 outline-none focus:border-sky-500 cursor-pointer"
          >
            {shot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot} alt="貼り付けたスクリーンショット" className="max-h-72 rounded-lg shadow" />
            ) : (
              <p className="text-sky-700 font-bold flex items-center gap-2"><ImageIcon className="w-6 h-6" /> ここをクリックして <Keys k="Mod+V" /> <span className="text-sm font-normal"><T>Click here and paste</T></span></p>
            )}
          </div>
          <Warn>{warn}</Warn>
          <p className="text-center">
            <button className="text-sm text-slate-400 underline" onClick={() => succeed("次へ進もう")}>この<Ruby rt="きょうしつ">教室</Ruby>のパソコンでは<Ruby rt="と">撮</Ruby>れない（スキップ） / <T>Skip</T></button>
          </p>
        </div>
      )}

      {step === 1 && (
        <ChoiceQuiz
          key="ask"
          onDone={() => succeed("質問上手！")}
          questions={[
            { q: "いちばん早く助けてもらえる質問は？", en: tx("Which question gets help the fastest?"), choices: [
              { label: "「パソコンが動きません」", ok: false, why: "何をして、何が起きたのか、わからないね", whyEn: tx("We don't know what you did or what happened") },
              { label: "（スクショ付きで）「請求書を保存しようとしたら、この画面が出て保存できません。エラーの意味を教えてください」", ok: true, why: "①何をしたか ②何が起きたか ③画面の写真 の3つがそろっているよ", whyEn: tx("It has all three: ① what you did ② what happened ③ a picture of the screen") },
              { label: "「わかりません。やってください」", ok: false, why: "何がわからないかを伝えよう。自分でできるようになるのが大切だよ", whyEn: tx("Say what you don't understand. Learning to do it yourself is important.") },
            ] },
            { q: "エラーが出た。まず何をする？", en: tx("An error appeared. What do you do first?"), choices: [
              { label: "すぐにパソコンの電源を切る", ok: false, why: "保存していないデータが消えるかも。まずは落ち着こう", whyEn: tx("Data you haven't saved might be lost. First, stay calm.") },
              { label: "エラーのメッセージを読む・スクショを撮る", ok: true, why: "メッセージに原因が書いてあることが多いよ。わからなければ、その言葉で検索したり、スクショで質問したりしよう", whyEn: tx("The message often tells you the cause. If you don't understand, search those words or ask with a screenshot.") },
              { label: "何回もクリックする", ok: false, why: "同じ操作が何回も実行されてしまうことがあるよ", whyEn: tx("The same action may run many times") },
            ] },
          ]}
        />
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className={cn("flex items-start gap-3", switched && "text-success")}>
              {switched ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <Circle className="w-6 h-6 shrink-0 text-slate-300" />}
              <div>
                <p className="text-lg font-bold">① <Keys k="Alt+Tab" /> でほかのアプリに<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えて、また<Ruby rt="もど">戻</Ruby>ってくる<span className="block text-sm font-normal text-slate-500"><T>① Switch to another app with Alt+Tab, then come back</T></span></p>
                <p className="text-sm text-slate-500"><Keys k="Alt" /> を<Ruby rt="お">押</Ruby>したまま <Keys k="Tab" /> を<Ruby rt="お">押</Ruby>すと、<Ruby rt="ひら">開</Ruby>いているアプリが<Ruby rt="なら">並</Ruby>ぶよ<span className="block"><T>Hold Alt and press Tab to see the open apps</T></span></p>
              </div>
            </div>
            <div className={cn("flex items-start gap-3", snapped && "text-success")}>
              {snapped ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <Circle className="w-6 h-6 shrink-0 text-slate-300" />}
              <div>
                <p className="text-lg font-bold">② <Keys k="Win+←/→" /> でブラウザを<Ruby rt="がめん">画面</Ruby>の<Ruby rt="はんぶん">半分</Ruby>にする<span className="block text-sm font-normal text-slate-500"><T>② Make the browser half of the screen with Win+← or →</T></span></p>
                <p className="text-sm text-slate-500"><Ruby rt="はんたいがわ">反対側</Ruby>に<Ruby rt="ほか">他</Ruby>のアプリを<Ruby rt="えら">選</Ruby>ぶと、<Ruby rt="さゆう">左右</Ruby>に<Ruby rt="なら">並</Ruby>ぶよ。<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>すときは <Keys k="Win+↑" /><span className="block"><T>Choose another app on the other side and they sit side by side. To go back, press Win+↑.</T></span></p>
              </div>
            </div>
          </Card>
          <Tip>メールを<Ruby rt="み">見</Ruby>ながら<Ruby rt="せいきゅうしょ">請求書</Ruby>を<Ruby rt="つく">作</Ruby>る、<Ruby rt="しりょう">資料</Ruby>を<Ruby rt="み">見</Ruby>ながらメモする…<Ruby rt="なら">並</Ruby>べると<Ruby rt="さぎょう">作業</Ruby>がとても<Ruby rt="はや">速</Ruby>くなるよ。<span className="block text-sm text-slate-500 mt-1"><T>Make an invoice while reading an email, take notes while reading a document... side by side, work gets much faster.</T></span></Tip>
          <p className="text-center">
            <button className="text-sm text-slate-400 underline" onClick={() => succeed("次へ進もう")}>このパソコンではできない（スキップ） / <T>Skip</T></button>
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <Card className="text-center">
            <p className="text-sm text-slate-400">{mi + 1} / {MEET_TASKS.length}</p>
            <p className="text-xl font-bold">{MEET_TASKS[mi].q}</p>
            <p className="text-sm text-slate-400"><T>{MEET_TASKS[mi].en}</T></p>
          </Card>
          <div className="rounded-2xl bg-slate-900 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-video rounded-xl bg-slate-700 flex items-center justify-center text-white relative">
                <span className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-xl font-bold">先</span>
                <span className="absolute bottom-2 left-3 text-xs">先生</span>
              </div>
              <div className={cn("aspect-video rounded-xl flex items-center justify-center text-white relative", meet.cam ? "bg-gradient-to-br from-sky-600 to-indigo-700" : "bg-slate-700")}>
                {meet.cam ? <span className="text-4xl">🙂</span> : <span className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-xl font-bold">私</span>}
                <span className="absolute bottom-2 left-3 text-xs flex items-center gap-1">あなた {!meet.mic && <MicOff className="w-3 h-3" />}</span>
                {meet.hand && <span className="absolute top-2 right-3 text-2xl">✋</span>}
                {meet.share && <span className="absolute top-2 left-3 text-xs bg-blue-600 px-2 py-0.5 rounded">画面を共有中</span>}
              </div>
            </div>
            <div className="flex justify-center gap-2 [&_button]:bg-slate-700 [&_button]:text-white [&_button]:rounded-full [&_button]:p-3 [&_button:hover]:bg-slate-600">
              <HoverIcon icon={meet.mic ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-400" />} name={meet.mic ? "マイクをオフ" : "マイクをオン"} onClick={() => pressMeet({ mic: !meet.mic })} />
              <HoverIcon icon={meet.cam ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-red-400" />} name={meet.cam ? "カメラをオフ" : "カメラをオン"} onClick={() => pressMeet({ cam: !meet.cam })} />
              <HoverIcon icon={<Hand className="w-5 h-5" />} name="挙手" onClick={() => pressMeet({ hand: !meet.hand })} />
              <HoverIcon icon={<ScreenShare className="w-5 h-5" />} name="画面を共有" onClick={() => pressMeet({ share: !meet.share })} />
              <HoverIcon icon={<MessageSquare className="w-5 h-5" />} name="チャット" onClick={() => pressMeet({ chat: !meet.chat })} />
              <HoverIcon icon={<PhoneOff className="w-5 h-5" />} name="通話から退出" onClick={() => pressMeet({ left: true })} className="!bg-red-600" />
            </div>
          </div>
          <Warn>{warn}</Warn>
          <Tip><Ruby rt="はな">話</Ruby>さないときはミュート！<Ruby rt="ざつおん">雑音</Ruby>が<Ruby rt="はい">入</Ruby>らないようにするのがマナーだよ。<Ruby rt="めんせつ">面接</Ruby>の<Ruby rt="まえ">前</Ruby>には、カメラとマイクのテストをしよう。<span className="block text-sm text-slate-500 mt-1"><T>Mute when you are not speaking! Keeping out noise is good manners. Before an interview, test your camera and microphone.</T></span></Tip>
        </div>
      )}

      {step === 4 && (
        <ChoiceQuiz
          key="search"
          onDone={() => succeed("調べる力、ばっちり！")}
          questions={[
            { q: "スプレッドシートで合計の出し方を調べたい。検索する言葉は？", en: tx("You want to find how to get a total in a spreadsheet. What words do you search?"), choices: [
              { label: "「すみません、スプレッドシートで合計を出したいのですが、どうすればいいですか」", ok: false, why: "長い文より、大事な言葉だけのほうが見つかりやすいよ", whyEn: tx("Only the important words find results more easily than a long sentence") },
              { label: "「スプレッドシート 合計 やり方」", ok: true, why: "大事な言葉を スペース でつなげよう。「エラーの言葉」をそのまま検索するのも効果的だよ", whyEn: tx("Join the important words with spaces. Searching the exact error words also works well.") },
              { label: "「合計」", ok: false, why: "短すぎて、ほかの意味の結果がたくさん出てくるね", whyEn: tx("Too short. You get many results with other meanings.") },
            ] },
            {
              q: "在留カードの手続きを調べた。どれを開く？", en: tx("You searched about the residence card (在留カード) procedure. Which one do you open?"),
              visual: (
                <div className="space-y-2 text-sm">
                  <div className="rounded-lg border p-3"><p className="text-xs text-slate-500"><b>スポンサー</b> · visa-kantan.example.com</p><p className="text-blue-700 font-bold">在留カード更新 代行！最短1日 格安</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-slate-500">www.moj.go.jp</p><p className="text-blue-700 font-bold">在留カードとは？｜出入国在留管理庁</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-slate-500">matome-blog.example.net</p><p className="text-blue-700 font-bold">【体験談】在留カード更新してみた</p></div>
                </div>
              ),
              choices: [
                { label: "いちばん上（スポンサー）", ok: false, why: "「スポンサー」「広告」は、お金を払って上に出している広告だよ", whyEn: tx("\"Sponsored\" and \"Ad\" are ads that paid to be at the top") },
                { label: "まん中（go.jp）", ok: true, why: "go.jp は日本の役所の公式サイト。手続きは必ず公式サイトで確認しよう", whyEn: tx("go.jp is an official Japanese government site. Always check procedures on the official site.") },
                { label: "いちばん下（ブログ）", ok: false, why: "個人のブログは古い情報や間違いがあることも。参考にするだけにしよう", whyEn: tx("Personal blogs can have old or wrong information. Use them only for reference.") },
              ],
            },
            { q: "上司へのメールを翻訳ツールで日本語にした。そのあとは？", en: tx("You translated an email to your boss into Japanese with a translation tool. What next?"), choices: [
              { label: "そのまま送る", ok: false, why: "翻訳ツールは、敬語や言葉の選び方をまちがえることがあるよ", whyEn: tx("Translation tools can get polite language and word choice wrong") },
              { label: "自分で読んで、敬語やおかしいところを直してから送る", ok: true, why: "翻訳ツールは「下書き」を作る道具。最後は自分の目で確認しよう", whyEn: tx("A translation tool makes a draft. In the end, check it with your own eyes.") },
              { label: "英語のまま送る", ok: false, why: "日本の会社では、日本語で送るのが基本だよ", whyEn: tx("At Japanese companies, you usually write in Japanese") },
            ] },
          ]}
        />
      )}
    </MissionFrame>
  )
}
