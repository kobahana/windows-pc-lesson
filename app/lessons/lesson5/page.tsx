"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Character, Ruby } from "@/components/game/character"
import { SuccessOverlay } from "@/components/game/success-overlay"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, Clock, Target } from "lucide-react"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "@/components/providers/settings-provider"
import { sounds } from "@/lib/sounds"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

const fingerColors = {
  4: { bg: "bg-red-500", hex: "#ef4444", light: "bg-red-50", text: "text-red-600" },
  3: { bg: "bg-amber-400", hex: "#fbbf24", light: "bg-amber-50", text: "text-amber-600" },
  2: { bg: "bg-emerald-500", hex: "#10b981", light: "bg-emerald-50", text: "text-emerald-600" },
  1: { bg: "bg-purple-500", hex: "#a855f7", light: "bg-purple-50", text: "text-purple-600" },
  0: { bg: "bg-slate-500", hex: "#64748b", light: "bg-slate-50", text: "text-slate-600" },
}

const fingerMap: Record<string, { hand: "left" | "right"; finger: number }> = {
  q: { hand: "left", finger: 4 }, w: { hand: "left", finger: 3 }, e: { hand: "left", finger: 2 }, r: { hand: "left", finger: 1 }, t: { hand: "left", finger: 1 },
  y: { hand: "right", finger: 1 }, u: { hand: "right", finger: 1 }, i: { hand: "right", finger: 2 }, o: { hand: "right", finger: 3 }, p: { hand: "right", finger: 4 },
  a: { hand: "left", finger: 4 }, s: { hand: "left", finger: 3 }, d: { hand: "left", finger: 2 }, f: { hand: "left", finger: 1 }, g: { hand: "left", finger: 1 },
  h: { hand: "right", finger: 1 }, j: { hand: "right", finger: 1 }, k: { hand: "right", finger: 2 }, l: { hand: "right", finger: 3 }, ";": { hand: "right", finger: 4 },
  z: { hand: "left", finger: 4 }, x: { hand: "left", finger: 3 }, c: { hand: "left", finger: 2 }, v: { hand: "left", finger: 1 }, b: { hand: "left", finger: 1 },
  n: { hand: "right", finger: 1 }, m: { hand: "right", finger: 1 }, ",": { hand: "right", finger: 2 }, ".": { hand: "right", finger: 3 }, "/": { hand: "right", finger: 4 },
  "-": { hand: "right", finger: 4 }, " ": { hand: "right", finger: 0 },
}

const HandGuide = ({ activeHand, activeFinger }: { activeHand?: "left" | "right"; activeFinger?: number }) => {
  const renderHand = (side: "left" | "right") => {
    const isLeft = side === "left"
    return (
      <svg width="130" height="110" viewBox="0 0 200 180" className={cn("transition-all duration-300", activeHand === side ? "opacity-100" : "opacity-15")}>
        <path d={isLeft ? "M150,170 Q100,170 80,140 Q60,100 80,60" : "M50,170 Q100,170 120,140 Q140,100 120,60"} fill="none" stroke="#cbd5e1" strokeWidth="3" />
        {[0, 1, 2, 3, 4].map((f) => {
          const isActive = activeHand === side && activeFinger === f
          const config = fingerColors[f as keyof typeof fingerColors]
          const xBase = isLeft ? (f === 0 ? 120 : 160 - f * 28) : (f === 0 ? 80 : 40 + f * 28)
          const yBase = f === 0 ? 110 : 65 + Math.abs(2 - f) * 12
          return (
            <g key={f}>
              <rect x={xBase - 12} y={yBase - (f === 0 ? 25 : 45)} width={f === 0 ? 35 : 24} height={f === 0 ? 25 : 55} rx="12" fill={isActive ? config.hex : "#f1f5f9"} stroke={isActive ? config.hex : "#e2e8f0"} strokeWidth="2" />
            </g>
          )
        })}
      </svg>
    )
  }
  return (
    <div className="flex justify-center gap-12 py-1 shrink-0">
      <div className="text-center">{renderHand("left")}<p className="text-[9px] font-bold mt-1 text-slate-300 uppercase">Left</p></div>
      <div className="text-center">{renderHand("right")}<p className="text-[9px] font-bold mt-1 text-slate-300 uppercase">Right</p></div>
    </div>
  )
}

type Word = { h: string; k: string; r: string; chunks?: { h?: string; k: string; r: string }[] }
type Stage = { id: number; name: string; words: Word[] }

const stages: Stage[] = [
  { id: 1, name: "挨拶・基本", words: [
    { h: "いつもおせわになっております。", k: "いつもお世話になっております。", r: "itumooSewaninatteorimasu.", chunks: [{ h: "いつも", k: "いつも", r: "itumo" }, { h: "おせわに", k: "お世話に", r: "osewani" }, { h: "なっております。", k: "なっております。", r: "natteorimasu." }] },
    { h: "よろしくおねがいいたします。", k: "よろしくお願いいたします。", r: "yorosikuonegaiitasimasu.", chunks: [{ h: "よろしく", k: "よろしく", r: "yorosiku" }, { h: "おねがいいたします。", k: "お願いいたします。", r: "onegaiitasimasu." }] },
    { h: "おつかれさまです。", k: "お疲れ様です。", r: "otukaresamadesu.", chunks: [{ h: "おつかれさまです。", k: "お疲れ様です。", r: "otukaresamadesu." }] },
    { h: "もうしわけございません。", k: "申し訳ございません。", r: "mousiwakegozaimasen.", chunks: [{ h: "もうしわけ", k: "申し訳", r: "mousiwake" }, { h: "ございません。", k: "ございません。", r: "gozaimasen." }] },
    { h: "ありがとうございます。", k: "ありがとうございます。", r: "arigatougozaimasu.", chunks: [{ h: "ありがとうございます。", k: "ありがとうございます。", r: "arigatougozaimasu." }] },
    { h: "しょうちいたしました。", k: "承知いたしました。", r: "syoutititasimasita.", chunks: [{ h: "しょうち", k: "承知", r: "syouti" }, { h: "いたしました。", k: "いたしました。", r: "itasimasita." }] },
  ]},
  { id: 2, name: "電話・応対", words: [
    { h: "おでんわありがとうございます。", k: "お電話ありがとうございます。", r: "odenwaarigatougozaimasu.", chunks: [{ h: "おでんわ", k: "お電話", r: "odenwa" }, { h: "ありがとうございます。", k: "ありがとうございます。", r: "arigatougozaimasu." }] },
    { h: "せきをはずしております。", k: "席を外しております。", r: "sekiwohazusiteorimasu.", chunks: [{ h: "せきを", k: "席を", r: "sekiwo" }, { h: "はずしております。", k: "外しております。", r: "hazusiteorimasu." }] },
    { h: "のちほどおりかえします。", k: "後ほど折り返します。", r: "notihodoorikaesimasu.", chunks: [{ h: "のちほど", k: "後ほど", r: "notihodo" }, { h: "おりかえします。", k: "折り返します。", r: "orikaesimasu." }] },
    { h: "でんごんをおねがいできますか。", k: "伝言をお願いできますか。", r: "dengonnwoonegaidekimasuka.", chunks: [{ h: "でんごんを", k: "伝言を", r: "dengonnwo" }, { h: "おねがいできますか。", k: "お願いできますか。", r: "onegaidekimasuka." }] },
    { h: "おまちしております。", k: "お待ちしております。", r: "omatisiteorimasu.", chunks: [{ h: "おまちしております。", k: "お待ちしております。", r: "omatisiteorimasu." }] },
    { h: "ほんじつはきゅうかをとっております。", k: "本日は休暇を取っております。", r: "honzituhakyuukawototteorimasu.", chunks: [{ h: "ほんじつは", k: "本日は", r: "honzituha" }, { h: "きゅうかを", k: "休暇を", r: "kyuukawo" }, { h: "とっております。", k: "取っております。", r: "totteorimasu." }] },
  ]},
  { id: 3, name: "メール・連絡", words: [
    { h: "てんぷふぁいるをごかくにんください。", k: "添付ファイルをご確認ください。", r: "tennpufairuwogokakuninnkudasai.", chunks: [{ h: "てんぷふぁいるを", k: "添付ファイルを", r: "tennpufairuwo" }, { h: "ごかくにんください。", k: "ご確認ください。", r: "gokakuninnkudasai." }] },
    { h: "めーるじゅしんのけん、しょうちいたしました。", k: "メール受信の件、承知いたしました。", r: "me-rujusinnnoken,syoutititasimasita.", chunks: [{ h: "めーる", k: "メール", r: "me-ru" }, { h: "じゅしんのけん、", k: "受信の件、", r: "jusinnnoken," }, { h: "しょうちいたしました。", k: "承知いたしました。", r: "syoutititasimasita." }] },
    { h: "とりいそぎ、ごれんらくまで。", k: "取り急ぎ、ご連絡まで。", r: "toriisogi,gorennrakumade.", chunks: [{ h: "とりいそぎ、", k: "取り急ぎ、", r: "toriisogi," }, { h: "ごれんらくまで。", k: "ご連絡まで。", r: "gorennrakumade." }] },
    { h: "ごへんしんおまちしております。", k: "ご返信お待ちしております。", r: "gohennsinnomatisiteorimasu.", chunks: [{ h: "ごへんしん", k: "ご返信", r: "gohennsinn" }, { h: "おまちしております。", k: "お待ちしております。", r: "omatisiteorimasu." }] },
    { h: "めーるをおくりいたしました。", k: "メールをお送りいたしました。", r: "me-ruwookuriitasimasita.", chunks: [{ h: "めーるを", k: "メールを", r: "me-ruwo" }, { h: "おおくりいたしました。", k: "お送りいたしました。", r: "ookuriitasimasita." }] },
    { h: "しょうさいにつきましては、おってごれんらくいたします。", k: "詳細につきましては、追ってご連絡いたします。", r: "syousainitukimasiteha,ottegorennrakuitasimasu.", chunks: [{ h: "しょうさいに", k: "詳細に", r: "syousaini" }, { h: "つきましては、", k: "つきましては、", r: "tukimasiteha," }, { h: "おって", k: "追って", r: "otte" }, { h: "ごれんらくいたします。", k: "ご連絡いたします。", r: "gorennrakuitasimasu." }] },
  ]},
  { id: 4, name: "会議・報告", words: [
    { h: "かいぎのしりょうをさくせいします。", k: "会議の資料を作成します。", r: "kaiginosiryouwosakuseisimasu.", chunks: [{ h: "かいぎの", k: "会議の", r: "kaigino" }, { h: "しりょうを", k: "資料を", r: "siryouwo" }, { h: "さくせいします。", k: "作成します。", r: "sakuseisimasu." }] },
    { h: "しんちょくじょうきょうをほうこくします。", k: "進捗状況を報告します。", r: "sintyokujoukyouwohoukokusimasu.", chunks: [{ h: "しんちょく", k: "進捗", r: "sintyoku" }, { h: "じょうきょうを", k: "状況を", r: "joukyouwo" }, { h: "ほうこくします。", k: "報告します。", r: "houkokusimasu." }] },
    { h: "らいしゅうのすけじゅーるをかくにんします。", k: "来週のスケジュールを確認します。", r: "raisyuunosukeju-ruwokakuninnsimasu.", chunks: [{ h: "らいしゅうの", k: "来週の", r: "raisyuuno" }, { h: "すけじゅーるを", k: "スケジュールを", r: "sukeju-ruwo" }, { h: "かくにんします。", k: "確認します。", r: "kakuninnsimasu." }] },
    { h: "あしたのあさまでにすませます。", k: "明日の朝までに済ませます。", r: "asitanoasamadeniSumasemasu.", chunks: [{ h: "あしたの", k: "明日の", r: "asitano" }, { h: "あさまでに", k: "朝までに", r: "asamadeni" }, { h: "すませます。", k: "済ませます。", r: "sumasemasu." }] },
    { h: "ぎじろくをきょうゆういたします。", k: "議事録を共有いたします。", r: "gizirokuwokyouyuuitasimasu.", chunks: [{ h: "ぎじろくを", k: "議事録を", r: "gizirokuwo" }, { h: "きょうゆういたします。", k: "共有いたします。", r: "kyouyuuitasimasu." }] },
    { h: "もんだいてんをごしてきください。", k: "問題点をご指摘ください。", r: "mondaitennwogositekikudasai.", chunks: [{ h: "もんだいてんを", k: "問題点を", r: "mondaitennwo" }, { h: "ごしてきください。", k: "ご指摘ください。", r: "gositekikudasai." }] },
  ]},
  { id: 5, name: "敬語・謙譲語", words: [
    { h: "そちらへおうかがいします。", k: "そちらへお伺いします。", r: "sotiraheoukagaisimasu.", chunks: [{ h: "そちらへ", k: "そちらへ", r: "sotirahe" }, { h: "おうかがいします。", k: "お伺いします。", r: "oukagaisimasu." }] },
    { h: "ごけんとうのほど、よろしくおねがいします。", k: "ご検討のほど、よろしくお願いします。", r: "gokentounohodo,yorosikuonegaisimasu.", chunks: [{ h: "ごけんとうのほど、", k: "ご検討のほど、", r: "gokentounohodo," }, { h: "よろしく", k: "よろしく", r: "yorosiku" }, { h: "おねがいします。", k: "お願いします。", r: "onegaisimasu." }] },
    { h: "おめにかかれてこうえいです。", k: "お目にかかれて光栄です。", r: "omenikakareteKoueidesu.", chunks: [{ h: "おめに", k: "お目に", r: "omeni" }, { h: "かかれて", k: "かかれて", r: "kakarete" }, { h: "こうえいです。", k: "光栄です。", r: "koueidesu." }] },
    { h: "ごらんになりましたでしょうか。", k: "ご覧になりましたでしょうか。", r: "gorannninarimasitadesyouka.", chunks: [{ h: "ごらんに", k: "ご覧に", r: "gorannni" }, { h: "なりました", k: "なりました", r: "narimasita" }, { h: "でしょうか。", k: "でしょうか。", r: "desyouka." }] },
    { h: "はいけんいたしました。", k: "拝見いたしました。", r: "haikennitasimasita.", chunks: [{ h: "はいけん", k: "拝見", r: "haikenn" }, { h: "いたしました。", k: "いたしました。", r: "itasimasita." }] },
    { h: "ごあんないいたします。", k: "ご案内いたします。", r: "goannnaiitasimasu.", chunks: [{ h: "ごあんない", k: "ご案内", r: "goannnai" }, { h: "いたします。", k: "いたします。", r: "itasimasu." }] },
  ]},
  { id: 6, name: "謝罪・依頼", words: [
    { h: "ごめいわくをおかけしました。", k: "ご迷惑をおかけしました。", r: "gomeiwakuwookakesimasita.", chunks: [{ h: "ごめいわくを", k: "ご迷惑を", r: "gomeiwakuwo" }, { h: "おかけしました。", k: "おかけしました。", r: "okakesimasita." }] },
    { h: "おてすうですが、よろしくおねがいします。", k: "お手数ですが、よろしくお願いします。", r: "otesuudesuga,yorosikuonegaisimasu.", chunks: [{ h: "おてすうですが、", k: "お手数ですが、", r: "otesuudesuga," }, { h: "よろしく", k: "よろしく", r: "yorosiku" }, { h: "おねがいします。", k: "お願いします。", r: "onegaisimasu." }] },
    { h: "まことにもうしわけございません。", k: "誠に申し訳ございません。", r: "makotonimousiwakegozaimasen.", chunks: [{ h: "まことに", k: "誠に", r: "makotoni" }, { h: "もうしわけ", k: "申し訳", r: "mousiwake" }, { h: "ございません。", k: "ございません。", r: "gozaimasen." }] },
    { h: "きゅうなごれんらくとなり、すみません。", k: "急なご連絡となり、すみません。", r: "kyuunagorennrakutonari,sumimasen.", chunks: [{ h: "きゅうな", k: "急な", r: "kyuuna" }, { h: "ごれんらくと", k: "ご連絡と", r: "gorennrakuto" }, { h: "なり、", k: "なり、", r: "nari," }, { h: "すみません。", k: "すみません。", r: "sumimasen." }] },
    { h: "ごたいおういただけますでしょうか。", k: "ご対応いただけますでしょうか。", r: "gotaiouitadakemasudesyouka.", chunks: [{ h: "ごたいおう", k: "ご対応", r: "gotaiou" }, { h: "いただけます", k: "いただけます", r: "itadakemasu" }, { h: "でしょうか。", k: "でしょうか。", r: "desyouka." }] },
    { h: "さっそくのたいおう、かんしゃいたします。", k: "早速の対応、感謝いたします。", r: "sassokunotaiou,kansyaitasimasu.", chunks: [{ h: "さっそくの", k: "早速の", r: "sassokuno" }, { h: "たいおう、", k: "対応、", r: "taiou," }, { h: "かんしゃ", k: "感謝", r: "kansya" }, { h: "いたします。", k: "いたします。", r: "itasimasu." }] },
  ]},
]

export default function Lesson5Page() {
  const [currentStage, setCurrentStage] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [missCount, setMissCount] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const { markLessonCompleted, recordEvent } = useSettings()
  const startRecordedRef = useRef(false)

  // レッスン開始を1回だけ記録
  useEffect(() => {
    if (!startRecordedRef.current) {
      startRecordedRef.current = true
      recordEvent(5, "start")
    }
  }, [recordEvent])

  const currentWord = stages[currentStage].words[wordIndex]
  const isCorrect = userInput.trim() === currentWord.k.trim()

const splitIntoChunks = (text: string, romanji: string): { h?: string; k: string; r: string }[] => {
  const particles = ['の', 'で', 'を', 'に', 'へ', 'と', 'が', 'は', 'も', 'から', 'まで', 'より']
  const chunks: { h?: string; k: string; r: string }[] = []
  
  let currentIndex = 0
  let lastParticleIndex = -1
  
  for (let i = 0; i < text.length; i++) {
    const isParticle = particles.some(p => text.startsWith(p, i))
    
    if (isParticle) {
      const chunk = text.substring(lastParticleIndex + 1, i + 1)
      if (chunk) {
        chunks.push({ k: chunk, r: '' })
      }
      lastParticleIndex = i
    }
  }
  
  const lastChunk = text.substring(lastParticleIndex + 1)
  if (lastChunk) {
    chunks.push({ k: lastChunk, r: '' })
  }
  
  // 簡易的にローマ字を割り当て
  let romanjiIndex = 0
  return chunks.map(chunk => {
    const chunkLength = chunk.k.length
    const romanjiChunk = romanji.substring(romanjiIndex, romanjiIndex + chunkLength * 3)
    romanjiIndex += chunkLength * 3
    return { k: chunk.k, r: romanjiChunk }
  })
}

const chunks = currentWord.chunks || splitIntoChunks(currentWord.k, currentWord.r)

  useEffect(() => {
    setUserInput("")
    setShowHint(false)
  }, [wordIndex, currentStage])
  
  useEffect(() => {
    if (!showSuccess && !startTime) setStartTime(Date.now())
  }, [showSuccess, startTime])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showSuccess) return
    
    if (e.key === 'Enter') {
      if (isCorrect) {
        sounds?.playSuccess()
        if (wordIndex + 1 < stages[currentStage].words.length) {
          setWordIndex(prev => prev + 1)
          setUserInput("")
          setShowHint(false)
        } else if (currentStage + 1 < stages.length) {
          setCurrentStage(prev => prev + 1)
          setWordIndex(0)
          setUserInput("")
          setShowHint(false)
        } else {
          const end = Date.now()
          setElapsedTime(startTime ? Math.floor((end - startTime) / 1000) : 0)
          sounds?.playClear()
          setShowSuccess(true)
          markLessonCompleted(5)
        }
      } else {
        sounds?.playError()
        setMissCount(prev => prev + 1)
        setUserInput("")
      }
    } else if (e.key === 'Escape') {
      setUserInput("")
      setShowHint(false)
    }
  }, [isCorrect, wordIndex, stages, currentStage, showSuccess, startTime, markLessonCompleted])

 

  const handleRetry = () => {
    sounds?.playClick()
    setCurrentStage(0)
    setWordIndex(0)
    setUserInput("")
    setMissCount(0)
    setStartTime(null)
    setElapsedTime(0)
    setShowSuccess(false)
    setShowHint(false)
  }

  const rows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ]

  if (showSuccess) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <LessonHeader />
        <SuccessOverlay show={true} message="" />
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-green-100 p-8 max-w-lg w-full text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">クリアおめでとう！</h2>
            <p className="text-slate-600 mb-8 font-medium">ビジネス日本語の文を最後まで打てたね！</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 font-bold"><Target className="w-5 h-5 text-red-500" />ミス</div>
                <div className="text-3xl font-black text-slate-800">{missCount}<span className="text-base font-bold text-slate-400"> 回</span></div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-2 font-bold"><Clock className="w-5 h-5 text-blue-500" />時間</div>
                <div className="text-3xl font-black text-slate-800">{elapsedTime}<span className="text-base font-bold text-slate-400"> 秒</span></div>
              </div>
            </div>
            <Button onClick={handleRetry} size="lg" className="w-full h-14 text-xl rounded-xl gap-2 font-bold bg-green-600 hover:bg-green-700">
              <RotateCcw className="w-6 h-6" />もう一度あそぶ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <LessonHeader>
        <div className="flex justify-between items-center w-full px-2">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-[10px] shadow-sm tracking-wider mr-2 whitespace-nowrap">
            STAGE {currentStage + 1}: {stages[currentStage].name}
          </div>
          <div className="flex justify-between gap-1 flex-1">
            {stages.map((stage, i) => (
              <button
                key={stage.id}
                onClick={() => { sounds?.playClick(); setCurrentStage(i); setWordIndex(0); setUserInput(""); setShowHint(false) }}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-300",
                  i < currentStage ? "bg-green-500" : i === currentStage ? "bg-blue-600 ring-2 ring-blue-100 scale-y-125 shadow-sm" : "bg-slate-200 hover:bg-slate-300"
                )}
              />
            ))}
          </div>
        </div>
      </LessonHeader>

      <div className="flex-1 flex flex-col items-center p-2 relative text-slate-800 min-h-0">
        <div className="w-full max-w-5xl flex flex-col h-full">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="text-center shrink-0 mb-2">
              <Character
                message={
                  <>
                    ビジネスで使う日本語をタイピングしよう！
                    <span className="block text-xs text-slate-400 mt-1">Type business Japanese, convert to kanji (Space), then press Enter!</span>
                  </>
                }
                mood="happy"
              />
            </div>

            <div className="flex-1 flex items-start justify-center pt-8">
              <div className="flex flex-col items-center justify-center py-5 shrink-0 bg-white/40 rounded-3xl mx-4 md:mx-10 border border-white shadow-inner w-full max-w-4xl px-4 md:px-8 overflow-hidden">
              <div className={cn(
                "font-bold mb-5 text-slate-800 tracking-tight text-center w-full flex flex-wrap justify-center gap-y-2",
                currentWord.h.length > 14 ? "text-4xl md:text-5xl leading-snug" : "text-5xl md:text-6xl"
              )}>
                {chunks.map((chunk, i) => (
                  <span key={i} className="inline-block whitespace-nowrap">
                    {chunk.h || chunk.k}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-col md:flex-row w-full max-w-4xl gap-6 items-start justify-center">
                <div className="flex-1 w-full max-w-2xl flex flex-col items-center">
                  <div className="relative w-full mb-4">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                     onKeyDown={(e) => {
                   if (e.key === 'Enter') {
        e.preventDefault()
          if (isCorrect) {
            sounds?.playSuccess()
          if (wordIndex + 1 < stages[currentStage].words.length) {
          setWordIndex(prev => prev + 1)
        } else if (currentStage + 1 < stages.length) {
          recordEvent(5, "stage_clear", stages[currentStage].name)
          setCurrentStage(prev => prev + 1)
          setWordIndex(0)
        } else {
          const end = Date.now()
          const secs = startTime ? Math.floor((end - startTime) / 1000) : 0
          setElapsedTime(secs)
          sounds?.playClear()
          setShowSuccess(true)
          markLessonCompleted(5)
          recordEvent(5, "lesson_clear", undefined, { timeSec: secs, missCount })
        }
      } else {
        sounds?.playError()
        setMissCount(prev => prev + 1)
      }
    } else if (e.key === 'Escape') {
      setUserInput("")
      setShowHint(false)
    }
    }}
                      placeholder="ここに漢字を入力..."
                      className={cn(
                        "w-full px-5 py-4 text-3xl font-bold text-center border-4 rounded-xl transition-all duration-200",
                        isCorrect && userInput.length > 0
                          ? "border-green-500 bg-green-50 text-green-700"
                          : userInput.length > 0
                          ? "border-red-500 bg-red-50 text-red-700 animate-pulse"
                          : "border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      )}
                      autoFocus
                    />
                    {userInput.length > 0 && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isCorrect ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        sounds?.playClick()
                        setShowHint(!showHint)
                      }}
                      className="px-5 py-2 text-lg bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors"
                    >
                      {showHint ? "ヒントを隠す" : "ヒントを見る"}
                    </button>
                    <button
                      onClick={() => {
                        sounds?.playClick()
                        setUserInput("")
                      }}
                      className="px-5 py-2 text-lg bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                      クリア (Esc)
                    </button>
                  </div>

                  <div className="text-lg text-slate-600 text-center">
                    Enterで送信 • Escでクリア • {currentWord.k.length}文字
                  </div>
                </div>

                {showHint && (
                  <div className="w-full md:w-64 shrink-0 bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 shadow-sm text-left">
                    <p className="text-base font-bold text-amber-800 mb-2">ヒント（かたまりで変換）:</p>
                    <div className="space-y-1">
                      {chunks.map((chunk, i) => (
                        <p key={i} className="text-sm font-medium text-amber-700">
                          {chunk.k} ({chunk.r.toUpperCase()})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}