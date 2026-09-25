"use client"

import { MissionLesson } from "@/components/lesson/mission-lesson"
import { RealAppMission } from "@/components/lesson/real-app"
import { Ruby } from "@/components/game/character"
import { ArithmeticMission, WhyCellsMission } from "@/components/lessons/l8/arithmetic"
import { InvoiceMission } from "@/components/lessons/l8/invoice"

const LESSON_ID = 9

// レッスン8「請求書をつくろう」（lessonId 9）
export default function Lesson8Page() {
  return (
    <MissionLesson
      lessonId={LESSON_ID}
      missions={[
        {
          title: "計算",
          titleFull: <><Ruby rt="しそくけいさん">四則計算</Ruby></>,
          learned: <>+ - * / の<Ruby rt="しき">式</Ruby>を、<Ruby rt="かず">数</Ruby>とセルの<Ruby rt="りょうほう">両方</Ruby>で<Ruby rt="い">入</Ruby>れる</>,
          render: (done) => <ArithmeticMission onComplete={done} />,
        },
        {
          title: "セル",
          titleFull: <>セルで<Ruby rt="い">入</Ruby>れる<Ruby rt="りゆう">理由</Ruby></>,
          learned: <>セルで<Ruby rt="い">入</Ruby>れると、<Ruby rt="すうじ">数字</Ruby>を<Ruby rt="か">変</Ruby>えても<Ruby rt="じどう">自動</Ruby>で<Ruby rt="けいさん">計算</Ruby>される</>,
          render: (done) => <WhyCellsMission onComplete={done} />,
        },
        {
          title: "請求書",
          titleFull: <><Ruby rt="せいきゅうしょ">請求書</Ruby></>,
          learned: <><Ruby rt="けつごう">結合</Ruby>・オートフィル・SUM・<Ruby rt="けいせん">罫線</Ruby>・¥<Ruby rt="ひょうじ">表示</Ruby>で<Ruby rt="せいきゅうしょ">請求書</Ruby>を<Ruby rt="つく">作</Ruby>る</>,
          render: (done) => <InvoiceMission onComplete={done} />,
        },
        {
          title: "本物",
          titleFull: <><Ruby rt="ほんもの">本物</Ruby>で<Ruby rt="しあ">仕上</Ruby>げ</>,
          learned: <>Googleスプレッドシートで<Ruby rt="せいきゅうしょ">請求書</Ruby>を<Ruby rt="つく">作</Ruby>って<Ruby rt="きょうゆう">共有</Ruby>する</>,
          render: (done) => (
            <RealAppMission
              onComplete={done}
              config={{
                lessonId: LESSON_ID,
                appName: "Googleスプレッドシート",
                openUrl: "https://sheets.new",
                linkPrefix: "https://docs.google.com/spreadsheets/",
                checklist: [
                  <>ファイル<Ruby rt="めい">名</Ruby>を「<Ruby rt="せいきゅうしょ">請求書</Ruby>_さくら<Ruby rt="しょうじ">商事</Ruby>」にした</>,
                  <>ミッション3と<Ruby rt="おな">同</Ruby>じ<Ruby rt="ひょう">表</Ruby>を<Ruby rt="にゅうりょく">入力</Ruby>した（あて<Ruby rt="さき">先</Ruby>・<Ruby rt="ひづけ">日付</Ruby>・<Ruby rt="ひんめい">品名</Ruby>・<Ruby rt="たんか">単価</Ruby>・<Ruby rt="すうりょう">数量</Ruby>）</>,
                  <>A1〜D1 を<Ruby rt="けつごう">結合</Ruby>して「<Ruby rt="せいきゅうしょ">請求書</Ruby>」を<Ruby rt="ちゅうおう">中央</Ruby>にした</>,
                  <><Ruby rt="きんがく">金額</Ruby>は <b>=B6*C6</b> のようにセルで<Ruby rt="い">入</Ruby>れて、オートフィルした</>,
                  <><Ruby rt="しょうけい">小計</Ruby>（SUM）・<Ruby rt="しょうひぜい">消費税</Ruby>・<Ruby rt="ごうけい">合計</Ruby>を<Ruby rt="しき">式</Ruby>で<Ruby rt="い">入</Ruby>れた（<Ruby rt="ごうけい">合計</Ruby>6,050<Ruby rt="えん">円</Ruby>）</>,
                  <><Ruby rt="けいせん">罫線</Ruby>と ¥ の<Ruby rt="ひょうじ">表示</Ruby>をつけた（「<Ruby rt="ひょうじけいしき">表示形式</Ruby>」→「<Ruby rt="すうじ">数字</Ruby>」→「<Ruby rt="つうか">通貨</Ruby>」でもOK）</>,
                ],
              }}
            />
          ),
        },
      ]}
    />
  )
}
