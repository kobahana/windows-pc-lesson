"use client"

import { MissionLesson } from "@/components/lesson/mission-lesson"
import { tx } from "@/lib/i18n"
import { Ruby } from "@/components/game/character"
import { MemoAppMission } from "@/components/lessons/l10/memo-app"
import { BookingAppMission } from "@/components/lessons/l10/booking-app"
import { ExcelChallengeMission } from "@/components/lessons/l10/excel-challenge"

// レッスン10「初めて見るアプリにチャレンジ」（lessonId 11）
export default function Lesson10Page() {
  return (
    <MissionLesson
      lessonId={11}
      missions={[
        {
          title: "メモアプリ",
          titleFull: <>メモアプリ</>,
          learned: <><Ruby rt="はじ">初</Ruby>めてのメモアプリで、<Ruby rt="ふとじ">太字</Ruby>・<Ruby rt="ほぞん">保存</Ruby>・<Ruby rt="さくじょ">削除</Ruby>・<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>す</>,
          learnedEn: tx("A new memo app: bold, save, delete, undo"),
          render: (done) => <MemoAppMission onComplete={done} />,
        },
        {
          title: "予約アプリ",
          titleFull: <><Ruby rt="よやく">予約</Ruby>アプリ</>,
          learned: <><Ruby rt="はじ">初</Ruby>めての<Ruby rt="よやく">予約</Ruby>アプリで、<Ruby rt="よやく">予約</Ruby>・<Ruby rt="へんこう">変更</Ruby>・<Ruby rt="せってい">設定</Ruby></>,
          learnedEn: tx("A new booking app: book, change, settings"),
          render: (done) => <BookingAppMission onComplete={done} />,
        },
        {
          title: "Excel風",
          titleFull: <>Excel<Ruby rt="ふう">風</Ruby>の<Ruby rt="ひょうけいさん">表計算</Ruby></>,
          learned: <><Ruby rt="み">見</Ruby>た<Ruby rt="め">目</Ruby>がちがっても、<Ruby rt="おな">同</Ruby>じワザが<Ruby rt="つか">使</Ruby>える</>,
          learnedEn: tx("Even if an app looks different, the same skills work"),
          render: (done) => <ExcelChallengeMission onComplete={done} />,
        },
      ]}
    />
  )
}
