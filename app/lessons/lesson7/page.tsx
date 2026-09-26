"use client"

import { MissionLesson } from "@/components/lesson/mission-lesson"
import { RealAppMission } from "@/components/lesson/real-app"
import { Card } from "@/components/lesson/kit"
import { Ruby } from "@/components/game/character"
import { IconReadingMission } from "@/components/lessons/l7/icon-reading"
import { SummarizeMission } from "@/components/lessons/l7/summarize"
import { BusinessDocMission } from "@/components/lessons/l7/business-doc"
import { T } from "@/lib/i18n"

const LESSON_ID = 8

// レッスン7「ビジネス文書をつくろう」（lessonId 8）
export default function Lesson7Page() {
  return (
    <MissionLesson
      lessonId={LESSON_ID}
      missions={[
        {
          title: "アイコン",
          titleFull: <>アイコンを<Ruby rt="よ">読</Ruby>もう</>,
          learned: <>アイコンの<Ruby rt="かたち">形</Ruby>から<Ruby rt="はたら">働</Ruby>きを<Ruby rt="よそう">予想</Ruby>する</>,
          render: (done) => <IconReadingMission onComplete={done} />,
        },
        {
          title: "要点",
          titleFull: <><Ruby rt="ようてん">要点</Ruby>を<Ruby rt="かじょうが">箇条書</Ruby>きに</>,
          learned: <><Ruby rt="ぶんしょう">文章</Ruby>から<Ruby rt="ようてん">要点</Ruby>を<Ruby rt="ひろ">拾</Ruby>って<Ruby rt="みじか">短</Ruby>く<Ruby rt="か">書</Ruby>く</>,
          render: (done) => <SummarizeMission onComplete={done} />,
        },
        {
          title: "文書",
          titleFull: <><Ruby rt="ぶんしょ">文書</Ruby>を<Ruby rt="ととの">整</Ruby>えよう</>,
          learned: <>そろえ・<Ruby rt="ふとじ">太字</Ruby>・<Ruby rt="もじ">文字</Ruby>サイズ・<Ruby rt="かじょうが">箇条書</Ruby>きをボタンで<Ruby rt="ととの">整</Ruby>える</>,
          render: (done) => <BusinessDocMission onComplete={done} />,
        },
        {
          title: "本物",
          titleFull: <><Ruby rt="ほんもの">本物</Ruby>で<Ruby rt="しあ">仕上</Ruby>げ</>,
          learned: <>Googleドキュメントで<Ruby rt="つく">作</Ruby>って、PDF・<Ruby rt="きょうゆう">共有</Ruby>する</>,
          render: (done) => (
            <RealAppMission
              onComplete={done}
              config={{
                lessonId: LESSON_ID,
                appName: "Googleドキュメント",
                openUrl: "https://docs.new",
                linkPrefix: "https://docs.google.com/document/",
                checklist: [
                  <>ファイル<Ruby rt="めい">名</Ruby>を「<Ruby rt="しんしょうひんせつめいかい">新商品説明会</Ruby>のご<Ruby rt="あんない">案内</Ruby>」にした</>,
                  <>ミッション3と<Ruby rt="おな">同</Ruby>じ<Ruby rt="ぶんしょう">文章</Ruby>を<Ruby rt="にゅうりょく">入力</Ruby>した（<Ruby rt="ひづけ">日付</Ruby>・あて<Ruby rt="さき">先</Ruby>・<Ruby rt="さしだしにん">差出人</Ruby>・<Ruby rt="けんめい">件名</Ruby>・<Ruby rt="ほんぶん">本文</Ruby>・<Ruby rt="き">記</Ruby>・<Ruby rt="いじょう">以上</Ruby>）</>,
                  <><Ruby rt="ひづけ">日付</Ruby>・<Ruby rt="さしだしにん">差出人</Ruby>・<Ruby rt="けいぐ">敬具</Ruby>・<Ruby rt="いじょう">以上</Ruby>を<Ruby rt="みぎ">右</Ruby>そろえにした（スペースではなくボタンで！）</>,
                  <><Ruby rt="けんめい">件名</Ruby>と「<Ruby rt="き">記</Ruby>」を<Ruby rt="ちゅうおう">中央</Ruby>そろえにした</>,
                  <><Ruby rt="けんめい">件名</Ruby>を<Ruby rt="ふとじ">太字</Ruby>にして、<Ruby rt="もじ">文字</Ruby>を<Ruby rt="おお">大</Ruby>きくした</>,
                  <><Ruby rt="にちじ">日時</Ruby>・<Ruby rt="ばしょ">場所</Ruby>・<Ruby rt="も">持</Ruby>ち<Ruby rt="もの">物</Ruby>を<Ruby rt="かじょうが">箇条書</Ruby>きにした</>,
                  <>PDFでダウンロードして、ダウンロードフォルダにあるのを<Ruby rt="たし">確</Ruby>かめた</>,
                ],
                extra: (
                  <Card className="space-y-2">
                    <p className="font-bold text-slate-800">PDFにする<Ruby rt="ほうほう">方法</Ruby> / <T>Save as PDF</T></p>
                    <p className="text-slate-700">
                      「ファイル」→「ダウンロード」→「PDF ドキュメント（.pdf）」
                    </p>
                    <p className="text-sm text-slate-500">
                      <Ruby rt="しょくば">職場</Ruby>で「PDFにして<Ruby rt="おく">送</Ruby>ってください」とよく<Ruby rt="い">言</Ruby>われるよ。PDFは、どのパソコン・スマホで<Ruby rt="ひら">開</Ruby>いても<Ruby rt="み">見</Ruby>た<Ruby rt="め">目</Ruby>が<Ruby rt="か">変</Ruby>わらないファイルなんだ。
                    </p>
                  </Card>
                ),
              }}
            />
          ),
        },
      ]}
    />
  )
}
