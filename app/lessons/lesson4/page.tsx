"use client"

import { useState, useEffect, useCallback } from "react"
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

type Word = { h: string; r: string }
type Stage = { id: number; name: string; words: Word[] }

const stages: Stage[] = [
  { id: 1, name: "A1あいさつ", words: [
    { h: "きょうははれです。", r: "kyouhaharedesu." }, { h: "わたしはがくせいです。", r: "watashihagakuseidesu." },
    { h: "せんせいはげんきです。", r: "senseihagenkidesu." }, { h: "きょうしつはしずかです。", r: "kyoushitsuhashizukadesu." },
    { h: "わたしはいえにかえります。", r: "watashihaienikaerimasu." }, { h: "あしたはがっこうへいきます。", r: "ashitahagakkouheikimasu." },
  ]},
  { id: 2, name: "A1学校", words: [
    { h: "きょうはぱそこんのじゅぎょうです。", r: "kyouhapasokonnnojugyoudesu." }, { h: "ともだちととしょかんへいきます。", r: "tomodachitotoshokanheikimasu." },
    { h: "じゅぎょうでにほんごをべんきょうします。", r: "jugyoudenihongowobenkyoushimasu." }, { h: "きょうはしゅくだいをだします。", r: "kyouhashukudaiwodashimasu." },
    { h: "せんせいにしつもんをします。", r: "senseinishitsumonwoshimasu." }, { h: "ひるやすみにこうていであそびます。", r: "hiruyasuminikouteideasobimasu." },
  ]},
  { id: 3, name: "A1生活", words: [
    { h: "まいあさしちじにおきます。", r: "maiasashichijiniokimasu." }, { h: "よるはかぞくでばんごはんをたべます。", r: "yoruhakazokudebangohanwotabemasu." },
    { h: "にちようびにこうえんへいきます。", r: "nichiyoubinikouenheikimasu." }, { h: "きのうでんしゃでえきへいきました。", r: "kinoudenshadeekiheikimashita." },
    { h: "わたしはみずをにほんのみます。", r: "watashihamizuwonihonnnomimasu." }, { h: "こんばんへやをそうじします。", r: "konbanheyawosoujishimasu." },
  ]},
  { id: 4, name: "N5時間", words: [
    { h: "けさはろくじにおきました。", r: "kesaharokujiniokimashita." }, { h: "ごごにしゅくだいをします。", r: "gogoshukudaiwoshimasu." },
    { h: "らいしゅうはてすとがあります。", r: "raishuuhatesutogaarimasu." }, { h: "まいにちくじまでべんきょうします。", r: "mainichikujimadebenkyoushimasu." },
    { h: "きょうのよるははやくねます。", r: "kyounoyoruhahayakunemasu." }, { h: "しけんはらいげつです。", r: "shikenharaigetsudesu." },
  ]},
  { id: 5, name: "N5場所", words: [
    { h: "ぎんこうのまえでまちます。", r: "ginkounomaedemachimasu." }, { h: "ゆうびんきょくでてがみをだします。", r: "yuubinkyokudeteagamiwodashimasu." },
    { h: "うちのちかくにこうえんがあります。", r: "uchinochikakunikouengaarimasu." }, { h: "えきのみぎにびょういんがあります。", r: "ekinomiginibyouingaarimasu." },
    { h: "みせでのーとをかいました。", r: "misedeno-towokaimashita." }, { h: "こうさてんでみちをわたります。", r: "kousatendemichiwowatarimasu." },
  ]},
  { id: 6, name: "促音（っ）", words: [
    { h: "がっこうできってをかいます。", r: "gakkoudekittewokaimasu." }, { h: "きっぷをもってえきへいきます。", r: "kippuwomotteekiheikimasu." },
    { h: "ざっしをかってよみます。", r: "zasshiwokatteyomimasu." }, { h: "きっさてんでけーきをたべました。", r: "kissatendeke-kiwotabemashita." },
    { h: "まっすぐみちをすすみます。", r: "massugumichiwosusumimasu." }, { h: "やっとしゅくだいがおわりました。", r: "yattoshukudaigaowarimashita." },
  ]},
  { id: 7, name: "撥音（ん）", words: [
    { h: "しんぶんをよんでねます。", r: "shimbunwoyondenemasu." }, { h: "ほんをさんさつかいました。", r: "honwosansatsukaimashita." },
    { h: "えんぴつをにほんつかいます。", r: "enpitsuwonihontsukaimasu." }, { h: "しんかんせんでとうきょうへいきます。", r: "shinkansendetoukyouheikimasu." },
    { h: "てんきがいいのでさんぽします。", r: "tenkigaiinodesanposhimasu." }, { h: "にんじんをいっぽんかいます。", r: "ninjinwoipponkaimasu." },
  ]},
  { id: 8, name: "長音（ー）", words: [
    { h: "こうえんでこーひーをのみます。", r: "kouendeko-hi-wonomimasu." }, { h: "すーぱーでちーずをかいます。", r: "su-pa-dechi-zuwokaimasu." },
    { h: "げーむをいちじかんします。", r: "ge-muwoichijikanshimasu." }, { h: "せんせいにめーるをおくります。", r: "senseinime-ruwookurimasu." },
    { h: "こーとをきてがっこうへいきます。", r: "ko-towokitegakkouheikimasu." }, { h: "ろーまじでにゅうりょくします。", r: "ro-majidenyuuryokushimasu." },
  ]},
  { id: 9, name: "N5実用文", words: [
    { h: "あしたはとしょかんでべんきょうします。", r: "ashitahatoshokandebenkyoushimasu." }, { h: "きょうのしゅくだいはかんたんです。", r: "kyounoshukudaihakantandesu." },
    { h: "せんしゅうにほんごのてすとがありました。", r: "senshuunihongonotesutogaarimashita." }, { h: "まいにちかんじをれんしゅうします。", r: "mainichikanjiworenshuushimasu." },
    { h: "でんわばんごうをかくにんします。", r: "denwabangouwokakuninnshimasu." }, { h: "わたしはきょうだいとすんでいます。", r: "watashihakyoudaitosundeimasu." },
  ]},
  { id: 10, name: "まとめ", words: [
    { h: "きょうはぱそこんでさくぶんをかきます。", r: "kyouhapasokondesakubunwokakimasu." }, { h: "しゅうまつにかぞくでえいがをみました。", r: "shuumatsunikazokudeeigawomimashita." },
    { h: "がっこうのまえでともだちをまちます。", r: "gakkounomaedetomodachiwomachimasu." }, { h: "こうえんでぼーるをつかってあそびます。", r: "kouendebo-ruwotsukatteasobimasu." },
    { h: "しんぶんをよんでじゅぎょうのじゅんびをします。", r: "shimbunwoyondejugyounojunbiwoshimasu." }, { h: "らいしゅうのしけんにむけてれんしゅうします。", r: "raishuunoshikennimuketerenshuushimasu." },
  ]},
]

export default function Lesson4Page() {
  const [currentStage, setCurrentStage] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [missCount, setMissCount] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const { markLessonCompleted } = useSettings()

  const currentWord = stages[currentStage].words[wordIndex]
  const targetChar = currentWord.r[charIndex]
  const activeFingerInfo = fingerMap[targetChar]

  useEffect(() => {
    if (!showSuccess && !startTime) setStartTime(Date.now())
  }, [showSuccess, startTime])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showSuccess) return
    const pressedKey = e.key.toLowerCase()
    if (e.metaKey || e.ctrlKey || e.altKey || pressedKey.length > 1) return

    if (pressedKey === targetChar) {
      sounds?.playClick()
      if (charIndex + 1 < currentWord.r.length) {
        setCharIndex((prev) => prev + 1)
      } else if (wordIndex + 1 < stages[currentStage].words.length) {
        sounds?.playSuccess()
        setWordIndex((prev) => prev + 1)
        setCharIndex(0)
      } else if (currentStage + 1 < stages.length) {
        sounds?.playSuccess()
        setCurrentStage((prev) => prev + 1)
        setWordIndex(0)
        setCharIndex(0)
      } else {
        const end = Date.now()
        setElapsedTime(startTime ? Math.floor((end - startTime) / 1000) : 0)
        sounds?.playClear()
        setShowSuccess(true)
        markLessonCompleted(4)
      }
    } else {
      sounds?.playError()
      setMissCount((prev) => prev + 1)
    }
  }, [targetChar, charIndex, currentWord.r.length, wordIndex, currentStage, showSuccess, startTime, markLessonCompleted])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const handleRetry = () => {
    sounds?.playClick()
    setCurrentStage(0)
    setWordIndex(0)
    setCharIndex(0)
    setMissCount(0)
    setStartTime(null)
    setElapsedTime(0)
    setShowSuccess(false)
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
            <p className="text-slate-600 mb-8 font-medium">漢字変換マスターの文を最後まで打てたね！</p>
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
                onClick={() => { sounds?.playClick(); setCurrentStage(i); setWordIndex(0); setCharIndex(0) }}
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
          <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
            <div className="text-center shrink-0">
              <Character message="文を見て、下のローマ字を順に打とう！" mood="happy" />
            </div>

            <div className="flex flex-col items-center justify-center py-5 shrink-0 bg-white/40 rounded-3xl mx-10 border border-white shadow-inner">
              <div className="text-5xl font-bold mb-3 text-slate-800 tracking-tight text-center px-2">{currentWord.h}</div>
              <div className="flex gap-1.5 flex-wrap justify-center px-2">
                {currentWord.r.split("").map((letter, i) => (
                  <div key={i} className={cn(
                    "text-2xl font-mono font-black w-8 h-11 flex items-center justify-center border-b-4 transition-all duration-150",
                    i < charIndex ? "text-green-500 border-green-500 opacity-40" : i === charIndex ? "text-blue-600 border-blue-600 scale-110 shadow-sm" : "text-slate-200 border-slate-100"
                  )}>
                    {letter === " " ? "_" : letter.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-center">
              <div className="space-y-1 mb-3 w-full max-w-[650px]">
                {rows.map((row, i) => (
                  <div key={i} className="flex justify-center gap-1">
                    {row.map((key) => {
                      const info = fingerMap[key]
                      const color = info ? fingerColors[info.finger as keyof typeof fingerColors] : undefined
                      const isActive = key === targetChar
                      return (
                        <div key={key} className={cn(
                          "w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all duration-150",
                          isActive && color ? `${color.bg} text-white scale-115 shadow-xl z-20 border-white ring-2 ring-slate-100` : `${color?.light || "bg-slate-50"} border-slate-100 ${color?.text || "text-slate-300"} opacity-20`
                        )}>{key.toUpperCase()}</div>
                      )
                    })}
                  </div>
                ))}
              </div>
              <HandGuide activeHand={activeFingerInfo?.hand} activeFinger={activeFingerInfo?.finger} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
