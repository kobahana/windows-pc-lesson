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

type Word = { h: string; k: string; r: string; chunks?: { k: string; r: string }[] }
type Stage = { id: number; name: string; words: Word[] }

const stages: Stage[] = [
  { id: 1, name: "A1あいさつ", words: [
    { h: "きょうははれです。", k: "今日は晴れです。", r: "kyouhaharedesu.", chunks: [{ k: "今日は", r: "kyouha" }, { k: "晴れです。", r: "haredesu." }] }, 
    { h: "わたしはがくせいです。", k: "私は学生です。", r: "watasihagakuseidesu.", chunks: [{ k: "私は", r: "watasiha" }, { k: "学生です。", r: "gakuseidesu." }] },
    { h: "せんせいはげんきです。", k: "先生は元気です。", r: "senseihagenkidesu.", chunks: [{ k: "先生は", r: "senseiha" }, { k: "元気です。", r: "genkidesu." }] }, 
    { h: "きょうしつはしずかです。", k: "教室は静かです。", r: "kyousituhasizukadesu.", chunks: [{ k: "教室は", r: "kyousituha" }, { k: "静かです。", r: "sizukadesu." }] },
    { h: "わたしはいえにかえります。", k: "私は家に帰ります。", r: "watasihaienikaerimasu.", chunks: [{ k: "私は", r: "watasiha" }, { k: "家に", r: "ieni" }, { k: "帰ります。", r: "kaerimasu." }] }, 
    { h: "あしたはがっこうへいきます。", k: "明日は学校へ行きます。", r: "asitahagakkouheikimasu.", chunks: [{ k: "明日は", r: "asitaha" }, { k: "学校へ", r: "gakkouhe" }, { k: "行きます。", r: "ikimasu." }] },
  ]},
  { id: 2, name: "A1学校", words: [
    { h: "きょうはぱそこんのじゅぎょうです。", k: "今日はパソコンの授業です。", r: "kyouhapasokonnnojugyoudesu.", chunks: [{ k: "今日は", r: "kyouha" }, { k: "パソコンの", r: "pasokonnno" }, { k: "授業です。", r: "jugyoudesu." }] }, 
    { h: "ともだちととしょかんへいきます。", k: "友達と図書館へ行きます。", r: "tomodatitotosyokannheikimasu.", chunks: [{ k: "友達と", r: "tomodatito" }, { k: "図書館へ", r: "tosyokannhe" }, { k: "行きます。", r: "ikimasu." }] },
    { h: "じゅぎょうでにほんごをべんきょうします。", k: "授業で日本語を勉強します。", r: "jugyoudenihongowobenkyousimasu.", chunks: [{ k: "授業で", r: "jugyoude" }, { k: "日本語を", r: "nihongowo" }, { k: "勉強します。", r: "benkyousimasu." }] }, 
    { h: "きょうはしゅくだいをだします。", k: "今日は宿題を出します。", r: "kyouhasyukudaiwodasimasu.", chunks: [{ k: "今日は", r: "kyouha" }, { k: "宿題を", r: "syukudaiwo" }, { k: "出します。", r: "dasimasu." }] },
    { h: "せんせいにしつもんをします。", k: "先生に質問をします。", r: "senseinisitumonnwosimasu.", chunks: [{ k: "先生に", r: "senseini" }, { k: "質問を", r: "situmonnwo" }, { k: "します。", r: "simasu." }] }, 
    { h: "ひるやすみにこうていであそびます。", k: "昼休みに校庭で遊びます。", r: "hiruyasuminikouteideasobimasu.", chunks: [{ k: "昼休みに", r: "hiruyasumini" }, { k: "校庭で", r: "kouteide" }, { k: "遊びます。", r: "asobimasu." }] },
  ]},
  { id: 3, name: "A1生活", words: [
    { h: "まいあさしちじにおきます。", k: "毎朝七時に起きます。", r: "maiasasitiziniokimasu.", chunks: [{ k: "毎朝", r: "maiasa" }, { k: "七時に", r: "sitizini" }, { k: "起きます。", r: "okimasu." }] }, 
    { h: "よるはかぞくでばんごはんをたべます。", k: "夜は家族で晩ご飯を食べます。", r: "yoruhakazokudebangohanwotabemasu.", chunks: [{ k: "夜は", r: "yoruha" }, { k: "家族で", r: "kazokude" }, { k: "晩ご飯を", r: "bangohanwo" }, { k: "食べます。", r: "tabemasu." }] },
    { h: "にちようびにこうえんへいきます。", k: "日曜日に公園へ行きます。", r: "nitiyoubinikouenheikimasu.", chunks: [{ k: "日曜日に", r: "nitiyoubini" }, { k: "公園へ", r: "kouenhe" }, { k: "行きます。", r: "ikimasu." }] }, 
    { h: "きのうでんしゃでえきへいきました。", k: "昨日電車で駅へ行きました。", r: "kinoudensyadeekiheikimasita.", chunks: [{ k: "昨日", r: "kinou" }, { k: "電車で", r: "densyade" }, { k: "駅へ", r: "ekihe" }, { k: "行きました。", r: "ikimasita." }] },
    { h: "わたしはみずをにほんのみます。", k: "私は水を日本のみます。", r: "watasihamizuwonihonnnomimasu.", chunks: [{ k: "私は", r: "watasiha" }, { k: "水を", r: "mizuwo" }, { k: "日本の", r: "nihonnno" }, { k: "みます。", r: "mimasu." }] }, 
    { h: "こんばんへやをそうじします。", k: "今晩部屋を掃除します。", r: "konbannheyawosouzisimasu.", chunks: [{ k: "今晩", r: "konbann" }, { k: "部屋を", r: "heyawo" }, { k: "掃除します。", r: "souzisimasu." }] },
  ]},
  { id: 4, name: "N5時間", words: [
    { h: "けさはろくじにおきました。", k: "今朝は六時に起きました。", r: "kesaharokuziniokimasita.", chunks: [{ k: "今朝は", r: "kesaha" }, { k: "六時に", r: "rokuzini" }, { k: "起きました。", r: "okimasita." }] }, 
    { h: "ごごにしゅくだいをします。", k: "午後に宿題をします。", r: "gogonisyukudaiwosimasu.", chunks: [{ k: "午後に", r: "gogoni" }, { k: "宿題を", r: "syukudaiwo" }, { k: "します。", r: "simasu." }] },
    { h: "らいしゅうはてすとがあります。", k: "来週はテストがあります。", r: "raisyuuhatesutogaarimasu.", chunks: [{ k: "来週は", r: "raisyuuha" }, { k: "テストが", r: "tesutoga" }, { k: "あります。", r: "arimasu." }] }, 
    { h: "まいにちくじまでべんきょうします。", k: "毎日九時まで勉強します。", r: "mainitikuzimadebenkyousimasu.", chunks: [{ k: "毎日", r: "mainiti" }, { k: "九時まで", r: "kuzimade" }, { k: "勉強します。", r: "benkyousimasu." }] },
    { h: "きょうのよるははやくねます。", k: "今夜は早く寝ます。", r: "konnyahahayakunemasu.", chunks: [{ k: "今夜は", r: "konnyaha" }, { k: "早く", r: "hayaku" }, { k: "寝ます。", r: "nemasu." }] }, 
    { h: "しけんはらいげつです。", k: "試験は来月です。", r: "sikennharaigetudesu.", chunks: [{ k: "試験は", r: "sikennha" }, { k: "来月です。", r: "raigetudesu." }] },
  ]},
  { id: 5, name: "N5場所", words: [
    { h: "ぎんこうのまえでまちます。", k: "銀行の前で待ちます。", r: "ginkounomaedematimasu.", chunks: [{ k: "銀行の", r: "ginkounno" }, { k: "前で", r: "maede" }, { k: "待ちます。", r: "matimasu." }] }, 
    { h: "ゆうびんきょくでてがみをだします。", k: "郵便局で手紙を出します。", r: "yuubinkyokudetegamiwodasimasu.", chunks: [{ k: "郵便局で", r: "yuubinkyokude" }, { k: "手紙を", r: "tegamiwo" }, { k: "出します。", r: "dasimasu." }] },
    { h: "うちのちかくにこうえんがあります。", k: "家の近くに公園があります。", r: "utinotikakunikouenngaarimasu.", chunks: [{ k: "家の", r: "utino" }, { k: "近くに", r: "tikakuni" }, { k: "公園が", r: "kouennga" }, { k: "あります。", r: "arimasu." }] }, 
    { h: "えきのみぎにびょういんがあります。", k: "駅の右に病院があります。", r: "ekinomiginibyouinngaarimasu.", chunks: [{ k: "駅の", r: "ekino" }, { k: "右に", r: "migini" }, { k: "病院が", r: "byouinnga" }, { k: "あります。", r: "arimasu." }] },
    { h: "みせでのーとをかいました。", k: "店でノートを買いました。", r: "misedeno-towokaimasita.", chunks: [{ k: "店で", r: "misede" }, { k: "ノートを", r: "no-towo" }, { k: "買いました。", r: "kaimasita." }] }, 
    { h: "こうさてんでみちをわたります。", k: "交差点で道を渡ります。", r: "kousatendemitiwowatarimasu.", chunks: [{ k: "交差点で", r: "kousatende" }, { k: "道を", r: "mitiwo" }, { k: "渡ります。", r: "watarimasu." }] },
  ]},
  { id: 6, name: "促音（っ）", words: [
    { h: "がっこうできってをかいます。", k: "学校で切手を買います。", r: "gakkoudekittewokaimasu.", chunks: [{ k: "学校で", r: "gakkoude" }, { k: "切手を", r: "kittewo" }, { k: "買います。", r: "kaimasu." }] }, 
    { h: "きっぷをもってえきへいきます。", k: "切符を持って駅へ行きます。", r: "kippuwomotteekiheikimasu.", chunks: [{ k: "切符を", r: "kippuwo" }, { k: "持って", r: "motte" }, { k: "駅へ", r: "ekihe" }, { k: "行きます。", r: "ikimasu." }] },
    { h: "ざっしをかってよみます。", k: "雑誌を買って読みます。", r: "zassiwokatteyomimasu.", chunks: [{ k: "雑誌を", r: "zassiwo" }, { k: "買って", r: "katte" }, { k: "読みます。", r: "yomimasu." }] }, 
    { h: "きっさてんでけーきをたべました。", k: "喫茶店でケーキを食べました。", r: "kissatendeke-kiwotabemasita.", chunks: [{ k: "喫茶店で", r: "kissatende" }, { k: "ケーキを", r: "ke-kiwo" }, { k: "食べました。", r: "tabemasita." }] },
    { h: "まっすぐみちをすすみます。", k: "まっすぐ道を進みます。", r: "massugumitiwosusumimasu.", chunks: [{ k: "まっすぐ", r: "massugu" }, { k: "道を", r: "mitiwo" }, { k: "進みます。", r: "susumimasu." }] }, 
    { h: "やっとしゅくだいがおわりました。", k: "やっと宿題が終わりました。", r: "yattosyukudaigaowarimasita.", chunks: [{ k: "やっと", r: "yatto" }, { k: "宿題が", r: "syukudaiga" }, { k: "終わりました。", r: "owarimasita." }] },
  ]},
  { id: 7, name: "撥音（ん）", words: [
    { h: "しんぶんをよんでねます。", k: "新聞を読んで寝ます。", r: "sinbunnwoyondenemasu.", chunks: [{ k: "新聞を", r: "sinbunnwo" }, { k: "読んで", r: "yonde" }, { k: "寝ます。", r: "nemasu." }] }, 
    { h: "ほんをさんさつかいました。", k: "本を三冊買いました。", r: "honnwosansatukaimasita.", chunks: [{ k: "本を", r: "honnwo" }, { k: "三冊", r: "sansatu" }, { k: "買いました。", r: "kaimasita." }] },
    { h: "えんぴつをにほんつかいます。", k: "鉛筆を二本使います。", r: "ennpituwonihonntsukaimasu.", chunks: [{ k: "鉛筆を", r: "ennpituwo" }, { k: "二本", r: "nihonn" }, { k: "使います。", r: "tukaimasu." }] }, 
    { h: "しんかんせんでとうきょうへいきます。", k: "新幹線で東京へ行きます。", r: "sinkannsenndetoukyouheikimasu.", chunks: [{ k: "新幹線で", r: "sinkannsennde" }, { k: "東京へ", r: "toukyouhe" }, { k: "行きます。", r: "ikimasu." }] },
    { h: "てんきがいいのでさんぽします。", k: "天気がいいので散歩します。", r: "tennkigaiinodesannposimasu.", chunks: [{ k: "天気が", r: "tennkiga" }, { k: "いいので", r: "iinode" }, { k: "散歩します。", r: "sannposimasu." }] }, 
    { h: "にんじんをいっぽんかいます。", k: "人参を一本買います。", r: "ninnzinnwoipponnkaimasu.", chunks: [{ k: "人参を", r: "ninnzinnwo" }, { k: "一本", r: "ipponn" }, { k: "買います。", r: "kaimasu." }] },
  ]},
  { id: 8, name: "長音（ー）", words: [
    { h: "こうえんでこーひーをのみます。", k: "公園でコーヒーを飲みます。", r: "kouenndeko-hi-wonomimasu.", chunks: [{ k: "公園で", r: "kouennde" }, { k: "コーヒーを", r: "ko-hi-wo" }, { k: "飲みます。", r: "nomimasu." }] }, 
    { h: "すーぱーでちーずをかいます。", k: "スーパーでチーズを買います。", r: "su-pa-deti-zuwokaimasu.", chunks: [{ k: "スーパーで", r: "su-pa-de" }, { k: "チーズを", r: "ti-zuwo" }, { k: "買います。", r: "kaimasu." }] },
    { h: "げーむをいちじかんします。", k: "ゲームを一時間します。", r: "ge-muwoitizikannsimasu.", chunks: [{ k: "ゲームを", r: "ge-muwo" }, { k: "一時間", r: "itizikann" }, { k: "します。", r: "simasu." }] }, 
    { h: "せんせいにめーるをおくります。", k: "先生にメールを送ります。", r: "senseinime-ruwookurimasu.", chunks: [{ k: "先生に", r: "senseini" }, { k: "メールを", r: "me-ruwo" }, { k: "送ります。", r: "okurimasu." }] },
    { h: "こーとをきてがっこうへいきます。", k: "コートを着て学校へ行きます。", r: "ko-towokitegakkouheikimasu.", chunks: [{ k: "コートを", r: "ko-towo" }, { k: "着て", r: "kite" }, { k: "学校へ", r: "gakkouhe" }, { k: "行きます。", r: "ikimasu." }] }, 
    { h: "ろーまじでにゅうりょくします。", k: "ローマ字で入力します。", r: "ro-mazidenyuuryokusimasu.", chunks: [{ k: "ローマ字で", r: "ro-mazide" }, { k: "入力します。", r: "nyuuryokusimasu." }] },
  ]},
  { id: 9, name: "N5実用文", words: [
    { h: "あしたはとしょかんでべんきょうします。", k: "明日は図書館で勉強します。", r: "asitahatosyokanndebenkyousimasu.", chunks: [{ k: "明日は", r: "asitaha" }, { k: "図書館で", r: "tosyokannde" }, { k: "勉強します。", r: "benkyousimasu." }] }, 
    { h: "きょうのしゅくだいはかんたんです。", k: "今日の宿題は簡単です。", r: "kyounosyukudaihakanntanndesu.", chunks: [{ k: "今日の", r: "kyouno" }, { k: "宿題は", r: "syukudaiha" }, { k: "簡単です。", r: "kanntanndesu." }] },
    { h: "せんしゅうにほんごのてすとがありました。", k: "先週日本語のテストがありました。", r: "sensyuunihongonotesutogaarimasita.", chunks: [{ k: "先週", r: "sensyuu" }, { k: "日本語の", r: "nihongono" }, { k: "テストが", r: "tesutoga" }, { k: "ありました。", r: "arimasita." }] }, 
    { h: "まいにちかんじをれんしゅうします。", k: "毎日漢字を練習します。", r: "mainitikanziworensyuusimasu.", chunks: [{ k: "毎日", r: "mainiti" }, { k: "漢字を", r: "kanziwo" }, { k: "練習します。", r: "rensyuusimasu." }] },
    { h: "でんわばんごうをかくにんします。", k: "電話番号を確認します。", r: "dennwabangouwokakuninnsimasu.", chunks: [{ k: "電話番号を", r: "dennwabangouwo" }, { k: "確認します。", r: "kakuninnsimasu." }] }, 
    { h: "わたしはきょうだいとすんでいます。", k: "私は兄弟と住んでいます。", r: "watasihakyoudaitosunndeimasu.", chunks: [{ k: "私は", r: "watasiha" }, { k: "兄弟と", r: "kyoudaito" }, { k: "住んでいます。", r: "sunndeimasu." }] },
  ]},
  { id: 10, name: "まとめ", words: [
    { h: "きょうはぱそこんでさくぶんをかきます。", k: "今日はパソコンで作文を書きます。", r: "kyouhapasokonndesakubunnwokakimasu.", chunks: [{ k: "今日は", r: "kyouha" }, { k: "パソコンで", r: "pasokonnde" }, { k: "作文を", r: "sakubunnwo" }, { k: "書きます。", r: "kakimasu." }] }, 
    { h: "しゅうまつにかぞくでえいがをみました。", k: "週末に家族で映画を見ました。", r: "syuumatunikazokudeeigawomimasita.", chunks: [{ k: "週末に", r: "syuumatuni" }, { k: "家族で", r: "kazokude" }, { k: "映画を", r: "eigawo" }, { k: "見ました。", r: "mimasita." }] },
    { h: "がっこうのまえでともだちをまちます。", k: "学校の前で友達を待ちます。", r: "gakkounomaedetomodatiwomatimasu.", chunks: [{ k: "学校の", r: "gakkounno" }, { k: "前で", r: "maede" }, { k: "友達を", r: "tomodatiwo" }, { k: "待ちます。", r: "matimasu." }] }, 
    { h: "こうえんでぼーるをつかってあそびます。", k: "公園でボールを使って遊びます。", r: "kouenndebo-ruwotukatteasobimasu.", chunks: [{ k: "公園で", r: "kouennde" }, { k: "ボールを", r: "bo-ruwo" }, { k: "使って", r: "tukatte" }, { k: "遊びます。", r: "asobimasu." }] },
    { h: "しんぶんをよんでじゅぎょうのじゅんびをします。", k: "新聞を読んで授業の準備をします。", r: "sinbunnwoyondejugyounojunbiwosimasu.", chunks: [{ k: "新聞を", r: "sinbunnwo" }, { k: "読んで", r: "yonde" }, { k: "授業の", r: "jugyouno" }, { k: "準備を", r: "junbiwo" }, { k: "します。", r: "simasu." }] }, 
    { h: "らいしゅうのしけんにむけてれんしゅうします。", k: "来週の試験に向けて練習します。", r: "raisyuunosikennnimuketerensyuusimasu.", chunks: [{ k: "来週の", r: "raisyuuno" }, { k: "試験に", r: "sikennni" }, { k: "向けて", r: "mukete" }, { k: "練習します。", r: "rensyuusimasu." }] },
  ]},
]

export default function Lesson4Page() {
  const [currentStage, setCurrentStage] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [missCount, setMissCount] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const { markLessonCompleted } = useSettings()

  const currentWord = stages[currentStage].words[wordIndex]
  const isCorrect = userInput.trim() === currentWord.k.trim()

const splitIntoChunks = (text: string, romanji: string) => {
  const particles = ['の', 'で', 'を', 'に', 'へ', 'と', 'が', 'は', 'も', 'から', 'まで', 'より']
  const chunks: { k: string; r: string }[] = []
  
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
          markLessonCompleted(4)
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
              <Character message="ひらがなを見て、漢字に変換して入力しよう！" mood="happy" />
            </div>

            <div className="flex-1 flex items-start justify-center pt-8">
              <div className="flex flex-col items-center justify-center py-3 shrink-0 bg-white/40 rounded-3xl mx-10 border border-white shadow-inner">
              <div className="text-6xl font-bold mb-5 text-slate-800 tracking-tight text-center px-2">{currentWord.h}</div>
              
              <div className="w-full max-w-2xl mb-4">
                <div className="relative">
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
        setCurrentStage(prev => prev + 1)
        setWordIndex(0)
      } else {
        const end = Date.now()
        setElapsedTime(startTime ? Math.floor((end - startTime) / 1000) : 0)
        sounds?.playClear()
        setShowSuccess(true)
        markLessonCompleted(4)
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

            {showHint && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-4 py-3 mb-3">
    <p className="text-lg font-bold text-amber-800 mb-2">ヒント（かたまりで変換）:</p>
    <div className="space-y-1">
      {chunks.map((chunk, i) => (
        <p key={i} className="text-base text-amber-700">
          {chunk.k} ({chunk.r.toUpperCase()})
        </p>
      ))}
    </div>
  </div>
)}

            <div className="text-lg text-slate-600 text-center">
              Enterで送信 • Escでクリア • {currentWord.k.length}文字
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}