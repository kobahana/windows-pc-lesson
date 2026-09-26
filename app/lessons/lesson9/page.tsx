"use client"

import { MissionLesson } from "@/components/lesson/mission-lesson"
import { tx } from "@/lib/i18n"
import { Ruby } from "@/components/game/character"
import { FilesMission } from "@/components/lessons/l9/files"
import { EmailMission } from "@/components/lessons/l9/email"
import { SecurityMission } from "@/components/lessons/l9/security"
import { HelpMission } from "@/components/lessons/l9/help"

// レッスン9「仕事で困らないパソコン術」（lessonId 10）
export default function Lesson9Page() {
  return (
    <MissionLesson
      lessonId={10}
      missions={[
        {
          title: "ファイル",
          titleFull: <>ファイルとフォルダ</>,
          learned: <>ダウンロードフォルダ・<Ruby rt="かくちょうし">拡張子</Ruby>・フォルダ<Ruby rt="せいり">整理</Ruby>・ファイル<Ruby rt="めい">名</Ruby>の<Ruby rt="つ">付</Ruby>け<Ruby rt="かた">方</Ruby></>,
          learnedEn: tx("Downloads folder, file extensions, folders and good file names"),
          render: (done) => <FilesMission onComplete={done} />,
        },
        {
          title: "メール",
          titleFull: <>ビジネスメール</>,
          learned: <>To・CC・BCC、<Ruby rt="てんぷ">添付</Ruby>、<Ruby rt="そうしんまえ">送信前</Ruby>チェック、<Ruby rt="へんしん">返信</Ruby>と<Ruby rt="ぜんいん">全員</Ruby>に<Ruby rt="へんしん">返信</Ruby></>,
          learnedEn: tx("To, CC, BCC, attachments, check before sending, reply and reply all"),
          render: (done) => <EmailMission onComplete={done} />,
        },
        {
          title: "セキュリティ",
          titleFull: <>セキュリティ</>,
          learned: <><Ruby rt="さぎ">詐欺</Ruby>メールや<Ruby rt="にせ">偽</Ruby>サイトを<Ruby rt="みやぶ">見破</Ruby>る、パスワード、<Ruby rt="がめん">画面</Ruby>ロック</>,
          learnedEn: tx("Spot scam emails and fake sites, passwords, screen lock"),
          render: (done) => <SecurityMission onComplete={done} />,
        },
        {
          title: "困ったとき",
          titleFull: <><Ruby rt="こま">困</Ruby>ったとき</>,
          learned: <>スクリーンショット・<Ruby rt="しつもん">質問</Ruby>のしかた・<Ruby rt="がめん">画面</Ruby>を<Ruby rt="なら">並</Ruby>べる・オンライン<Ruby rt="かいぎ">会議</Ruby>・<Ruby rt="けんさく">検索</Ruby>と<Ruby rt="ほんやく">翻訳</Ruby></>,
          learnedEn: tx("Screenshots, how to ask questions, windows side by side, online meetings, search and translate"),
          render: (done) => <HelpMission onComplete={done} />,
        },
      ]}
    />
  )
}
