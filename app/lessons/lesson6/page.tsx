"use client"

import { MissionLesson } from "@/components/lesson/mission-lesson"
import { Ruby } from "@/components/game/character"
import { InputModeMission } from "@/components/lessons/l6/input-mode"
import { ClipboardMission } from "@/components/lessons/l6/clipboard"
import { BrowserMission } from "@/components/lessons/l6/browser"
import { FiveRulesMission } from "@/components/lessons/l6/five-rules"

// レッスン6「毎日つかう基本ワザ」（lessonId 7）
export default function Lesson6Page() {
  return (
    <MissionLesson
      lessonId={7}
      missions={[
        {
          title: "入力モード",
          titleFull: <><Ruby rt="はんかく">半角</Ruby>・<Ruby rt="ぜんかく">全角</Ruby></>,
          learned: <><Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby>の<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えとカタカナ<Ruby rt="へんかん">変換</Ruby></>,
          render: (done) => <InputModeMission onComplete={done} />,
        },
        {
          title: "コピペ",
          titleFull: <>コピー＆ペースト</>,
          learned: <>コピー・<Ruby rt="き">切</Ruby>り<Ruby rt="と">取</Ruby>り・<Ruby rt="はりつ">貼り付</Ruby>け（クリップボード）</>,
          render: (done) => <ClipboardMission onComplete={done} />,
        },
        {
          title: "ブラウザ",
          titleFull: <>ブラウザの<Ruby rt="きほん">基本</Ruby></>,
          learned: <><Ruby rt="もど">戻</Ruby>る・リロード・タブ・ページ<Ruby rt="ない">内</Ruby><Ruby rt="けんさく">検索</Ruby></>,
          render: (done) => <BrowserMission onComplete={done} />,
        },
        {
          title: "5つのルール",
          titleFull: <>5つのルール</>,
          learned: <>どのアプリでも<Ruby rt="つか">使</Ruby>える5つのルール</>,
          render: (done) => <FiveRulesMission onComplete={done} />,
        },
      ]}
    />
  )
}
