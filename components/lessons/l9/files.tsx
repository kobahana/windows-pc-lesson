"use client"

// L9 ミッション1：ファイルとフォルダ
// ダウンロードフォルダ・拡張子・フォルダ作成と整理（ドラッグ＆ドロップ）・ファイル名の付け方

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, ChoiceQuiz, MissionFrame, Ruby, Tip, Warn, useAward, useStepFlow } from "@/components/lesson/kit"
import {
  Monitor, Download, FileText, Image as ImageIcon, Folder, FolderPlus, FileSpreadsheet, FileArchive, File, ChevronRight, HardDrive,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { T } from "@/lib/i18n"

const LESSON_ID = 10

type Place = "desktop" | "downloads" | "documents" | "pictures"
const PLACES: { id: Place; label: string; icon: React.ReactNode }[] = [
  { id: "desktop", label: "デスクトップ", icon: <Monitor className="w-4 h-4 text-sky-600" /> },
  { id: "downloads", label: "ダウンロード", icon: <Download className="w-4 h-4 text-emerald-600" /> },
  { id: "documents", label: "ドキュメント", icon: <FileText className="w-4 h-4 text-slate-600" /> },
  { id: "pictures", label: "ピクチャ", icon: <ImageIcon className="w-4 h-4 text-amber-600" /> },
]

function fileIcon(name: string, big = false) {
  const cls = big ? "w-12 h-12" : "w-5 h-5"
  if (name.endsWith(".xlsx")) return <FileSpreadsheet className={cn(cls, "text-green-600")} />
  if (name.endsWith(".docx")) return <FileText className={cn(cls, "text-blue-600")} />
  if (name.endsWith(".pdf")) return <File className={cn(cls, "text-red-600")} />
  if (name.endsWith(".jpg") || name.endsWith(".png")) return <ImageIcon className={cn(cls, "text-amber-500")} />
  if (name.endsWith(".zip")) return <FileArchive className={cn(cls, "text-yellow-600")} />
  if (!name.includes(".")) return <Folder className={cn(cls, "text-yellow-500 fill-yellow-200")} />
  return <File className={cn(cls, "text-slate-500")} />
}

const PLACE_FILES: Record<Place, string[]> = {
  desktop: ["メモ.txt"],
  downloads: ["時間割.pdf", "IMG_2031.jpg", "申込書.docx"],
  documents: ["日本語の作文.docx", "履歴書.docx"],
  pictures: ["旅行1.jpg", "旅行2.jpg"],
}

function ExplorerFrame({ place, onPlace, children, path }: { place: Place; onPlace: (p: Place) => void; children: React.ReactNode; path: string[] }) {
  return (
    <div className="rounded-2xl border-2 border-slate-300 overflow-hidden bg-white shadow-md select-none">
      <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 text-sm border-b border-slate-200">
        <Folder className="w-4 h-4 text-yellow-500 fill-yellow-200" />
        <span className="font-bold">エクスプローラー</span>
        <div className="ml-3 flex-1 flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1 text-slate-600">
          <HardDrive className="w-4 h-4" />
          {path.map((p, i) => (
            <span key={i} className="flex items-center gap-1"><ChevronRight className="w-3 h-3" />{p}</span>
          ))}
        </div>
      </div>
      <div className="flex min-h-64">
        <div className="w-40 md:w-48 border-r border-slate-200 bg-slate-50 py-2 text-sm">
          {PLACES.map((p) => (
            <button
              key={p.id}
              onClick={() => onPlace(p.id)}
              className={cn("w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-200", place === p.id && "bg-sky-100 font-bold")}
            >
              {p.icon}{p.label}
            </button>
          ))}
        </div>
        <div className="flex-1 p-3">{children}</div>
      </div>
    </div>
  )
}

export function FilesMission({ onComplete }: { onComplete: () => void }) {
  const { step, succeed, showSuccess, successMsg } = useStepFlow(4, onComplete)
  const award = useAward(LESSON_ID)
  const [warn, setWarn] = useState<React.ReactNode>(null)
  const [place, setPlace] = useState<Place>("desktop")
  useEffect(() => { setWarn(null) }, [step])

  // ステップ0：ダウンロードしたファイルを探す
  const openFile = (name: string) => {
    if (name === "時間割.pdf") succeed("見つけた！")
    else setWarn(<>それは「{name}」だよ。「<Ruby rt="じかんわり">時間割</Ruby>.pdf」を<Ruby rt="さが">探</Ruby>してね</>)
  }

  // ステップ2：フォルダを作って整理
  const [files, setFiles] = useState<string[]>(["シフト表.xlsx", "給料明細_10月.pdf", "日本語の作文.docx"])
  const [folder, setFolder] = useState<{ name: string; items: string[]; naming: boolean } | null>(null)
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const FOLDER_NAME = "2026_アルバイト"
  const makeFolder = () => {
    setCtx(null)
    if (folder) return
    setFolder({ name: "新しいフォルダー", items: [], naming: true })
  }
  const dropInto = (name: string) => {
    if (!folder || folder.naming) return
    setFiles((f) => f.filter((x) => x !== name))
    const items = [...folder.items, name]
    setFolder({ ...folder, items })
    if (name === "日本語の作文.docx") setWarn(<>「<Ruby rt="にほんご">日本語</Ruby>の<Ruby rt="さくぶん">作文</Ruby>」はアルバイトのファイルじゃないね。<Ruby rt="まちが">間違</Ruby>えたら <b>Ctrl+Z</b>…ここでは<Ruby rt="した">下</Ruby>の「<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>す」で<Ruby rt="もど">戻</Ruby>そう</>)
    else if (items.includes("シフト表.xlsx") && items.includes("給料明細_10月.pdf") && !items.includes("日本語の作文.docx")) succeed("整理できた！")
  }
  const undoMove = () => {
    if (!folder) return
    setFolder({ ...folder, items: folder.items.filter((x) => x !== "日本語の作文.docx") })
    setFiles((f) => (f.includes("日本語の作文.docx") ? f : [...f, "日本語の作文.docx"]))
    setWarn(null)
    if (folder.items.includes("シフト表.xlsx") && folder.items.includes("給料明細_10月.pdf")) succeed("整理できた！")
  }

  // ステップ3：ファイル名を自分でつける
  const [myName, setMyName] = useState("")
  const [nameChecked, setNameChecked] = useState(false)
  const nameOk = /(20261105|1105|11月5日|11-05)/.test(myName) && /作文/.test(myName) && !/\s/.test(myName.trim())
  const [nameQuizDone, setNameQuizDone] = useState(false)

  const messages: React.ReactNode[] = [
    <><Ruby rt="せんせい">先生</Ruby>からメールで「<Ruby rt="じかんわり">時間割</Ruby>.pdf」が<Ruby rt="とど">届</Ruby>いて、ダウンロードしたよ。どこにあるかな？<Ruby rt="さが">探</Ruby>して、ダブルクリックで<Ruby rt="ひら">開</Ruby>こう！<span className="block text-sm text-muted-foreground mt-1"><T>Where did the downloaded file go? Find it and double-click.</T></span></>,
    <>ファイル<Ruby rt="めい">名</Ruby>の<Ruby rt="さいご">最後</Ruby>の「.pdf」「.xlsx」を<b><Ruby rt="かくちょうし">拡張子</Ruby></b>というよ。ファイルの<Ruby rt="しゅるい">種類</Ruby>がわかるんだ。<span className="block text-sm text-muted-foreground mt-1"><T>The extension tells you the file type.</T></span></>,
    <>アルバイトのファイルをまとめよう！「ドキュメント」の<Ruby rt="なか">中</Ruby>に「{FOLDER_NAME}」フォルダを<Ruby rt="つく">作</Ruby>って、アルバイトのファイルだけをドラッグで<Ruby rt="い">入</Ruby>れてね。<span className="block text-sm text-muted-foreground mt-1"><T>Make a folder and drag the work files into it.</T></span></>,
    <>ファイル<Ruby rt="めい">名</Ruby>は「<b><Ruby rt="ひづけ">日付</Ruby>_<Ruby rt="ないよう">内容</Ruby>_<Ruby rt="あいて">相手</Ruby></b>」にすると、あとで<Ruby rt="さが">探</Ruby>しやすいよ。<span className="block text-sm text-muted-foreground mt-1"><T>Name files like: date_content_partner.</T></span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={4} showSuccess={showSuccess} successMsg={successMsg}>
      {step === 0 && (
        <div className="space-y-3">
          <ExplorerFrame place={place} onPlace={(p) => { setPlace(p); setWarn(null) }} path={["PC", PLACES.find((p) => p.id === place)!.label]}>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {PLACE_FILES[place].map((f) => (
                <button key={f} onDoubleClick={() => openFile(f)} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-sky-50 focus:bg-sky-100 outline-none">
                  {fileIcon(f, true)}
                  <span className="text-xs text-center break-all">{f}</span>
                </button>
              ))}
            </div>
            {place !== "downloads" && <p className="text-sm text-slate-400 mt-6 text-center">ここにはないみたい… / <T>Not here</T></p>}
          </ExplorerFrame>
          <Warn>{warn}</Warn>
          <Tip>インターネットからダウンロードしたファイルは、ほとんど「<b>ダウンロード</b>」フォルダに<Ruby rt="はい">入</Ruby>るよ。「ファイルがない！」と<Ruby rt="おも">思</Ruby>ったら、まずここを<Ruby rt="み">見</Ruby>よう。</Tip>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              {[
                { ext: ".docx", name: "Word（文書）" },
                { ext: ".xlsx", name: "Excel（表）" },
                { ext: ".pdf", name: "PDF" },
                { ext: ".jpg", name: "写真" },
                { ext: ".zip", name: "まとめたファイル" },
              ].map((e) => (
                <div key={e.ext} className="flex flex-col items-center gap-1 p-2">
                  {fileIcon(`a${e.ext}`, true)}
                  <span className="font-mono font-bold">{e.ext}</span>
                  <span className="text-xs text-slate-500">{e.name}</span>
                </div>
              ))}
            </div>
          </Card>
          <ChoiceQuiz
            key="ext"
            onDone={() => succeed("拡張子マスター！")}
            columns={3}
            questions={[
              { q: <><Ruby rt="じょうし">上司</Ruby>に「Excelのファイルを<Ruby rt="おく">送</Ruby>って」と<Ruby rt="い">言</Ruby>われた。どれ？</>, choices: [
                { label: "売上.docx", ok: false, why: ".docx は Word（文書）のファイルだよ" },
                { label: "売上.xlsx", ok: true, why: ".xlsx が Excel。Googleスプレッドシートからもこの形でダウンロードできるよ" },
                { label: "売上.pdf", ok: false, why: ".pdf は PDF。表の数字は書き換えられないよ" },
              ] },
              { q: <>「<Ruby rt="か">書</Ruby>き<Ruby rt="か">換</Ruby>えられない<Ruby rt="かたち">形</Ruby>で<Ruby rt="おく">送</Ruby>って」と<Ruby rt="い">言</Ruby>われた。どれ？</>, choices: [
                { label: "見積書.xlsx", ok: false, why: "Excel は相手が書き換えられるよ" },
                { label: "見積書.zip", ok: false, why: ".zip はファイルをまとめたもの。中身の形は変わらないよ" },
                { label: "見積書.pdf", ok: true, why: "PDF は見た目が変わらず、書き換えにくい。請求書や見積書はPDFで送ることが多いよ" },
              ] },
              { q: <><Ruby rt="しゃしん">写真</Ruby>のファイルはどれ？</>, choices: [
                { label: "IMG_2031.jpg", ok: true, why: ".jpg（.jpeg）や .png は画像のファイルだよ" },
                { label: "IMG_2031.docx", ok: false, why: ".docx は文書だよ" },
                { label: "IMG_2031.zip", ok: false, why: ".zip はまとめたファイルだよ" },
              ] },
            ]}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <ExplorerFrame place="documents" onPlace={() => setWarn("このステップは「ドキュメント」の中で作業しよう")} path={["PC", "ドキュメント"]}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <button onClick={makeFolder} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded hover:bg-slate-100 border border-slate-200">
                <FolderPlus className="w-4 h-4 text-yellow-600" /> <Ruby rt="あたら">新</Ruby>しいフォルダー
              </button>
              <span className="text-xs text-slate-400">または、<Ruby rt="なに">何</Ruby>もないところを<Ruby rt="みぎ">右</Ruby>クリック</span>
            </div>
            <div
              className="relative grid grid-cols-3 md:grid-cols-4 gap-2 min-h-40 content-start"
              onContextMenu={(e) => {
                e.preventDefault()
                award("rightclick")
                const box = e.currentTarget.getBoundingClientRect()
                setCtx({ x: e.clientX - box.left, y: e.clientY - box.top })
              }}
              onClick={() => setCtx(null)}
            >
              {folder && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (dragging) dropInto(dragging) }}
                  className={cn("flex flex-col items-center gap-1 p-2 rounded-lg border-2", dragging ? "border-dashed border-sky-400 bg-sky-50" : "border-transparent")}
                >
                  {fileIcon(folder.name, true)}
                  {folder.naming ? (
                    <Input
                      autoFocus
                      value={folder.name}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setFolder({ ...folder, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" || e.nativeEvent.isComposing) return
                        if (folder.name.trim() === FOLDER_NAME) {
                          setFolder({ ...folder, name: FOLDER_NAME, naming: false })
                          setWarn(null)
                        } else setWarn(<>「{FOLDER_NAME}」と<Ruby rt="い">入</Ruby>れてね（<Ruby rt="すうじ">数字</Ruby>と「_」は<Ruby rt="はんかく">半角</Ruby>）</>)
                      }}
                      className="h-8 text-xs text-center w-36"
                    />
                  ) : (
                    <span className="text-xs font-bold text-center">{folder.name}（{folder.items.length}）</span>
                  )}
                </div>
              )}
              {files.map((f) => (
                <div
                  key={f}
                  draggable
                  onDragStart={() => setDragging(f)}
                  onDragEnd={() => setDragging(null)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-sky-50 cursor-grab active:cursor-grabbing"
                >
                  {fileIcon(f, true)}
                  <span className="text-xs text-center break-all">{f}</span>
                </div>
              ))}
              {ctx && (
                <div className="absolute z-20 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-48 text-sm" style={{ left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()}>
                  <button className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-400">表示</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-400">並べ替え</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-blue-50" onClick={makeFolder}>新規作成 → フォルダー</button>
                </div>
              )}
            </div>
          </ExplorerFrame>
          {folder?.items.includes("日本語の作文.docx") && (
            <button onClick={undoMove} className="text-sm font-bold text-primary underline">「日本語の作文」を元に戻す</button>
          )}
          <Warn>{warn}</Warn>
          <Tip>ファイルをマウスで<b><Ruby rt="お">押</Ruby>したまま</b><Ruby rt="うご">動</Ruby>かして、フォルダの<Ruby rt="うえ">上</Ruby>で<Ruby rt="はな">離</Ruby>す（ドラッグ＆ドロップ）</Tip>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {!nameQuizDone ? (
            <ChoiceQuiz
              key="naming"
              onDone={() => setNameQuizDone(true)}
              questions={[
                { q: <>さくら<Ruby rt="しょうじ">商事</Ruby>への10<Ruby rt="がつ">月</Ruby>の<Ruby rt="せいきゅうしょ">請求書</Ruby>。いちばんいいファイル<Ruby rt="めい">名</Ruby>は？</>, choices: [
                  { label: "新しいファイル(3).xlsx", ok: false, why: "中身がわからないね。あとで探せなくなるよ" },
                  { label: "20261031_請求書_さくら商事.xlsx", ok: true, why: "日付・内容・相手がわかる！日付を先頭にすると、古い順に並ぶよ" },
                  { label: "請求書.xlsx", ok: false, why: "請求書が何枚もあったら、どれかわからないね" },
                ] },
                { q: <>ファイルを<Ruby rt="なお">直</Ruby>した。<Ruby rt="まえ">前</Ruby>のファイルも<Ruby rt="のこ">残</Ruby>したい。<Ruby rt="あたら">新</Ruby>しいファイルの<Ruby rt="なまえ">名前</Ruby>は？</>, choices: [
                  { label: "報告書_最新_本当に最新.docx", ok: false, why: "「最新」はすぐ最新じゃなくなるよ" },
                  { label: "報告書_v2.docx", ok: true, why: "v1, v2, v3…と番号をつけると、順番がわかるよ（日付でもOK）" },
                  { label: "報告書 (1).docx", ok: false, why: "(1) は自動でつく名前。何が変わったかわからないね" },
                ] },
              ]}
            />
          ) : (
            <Card className="space-y-3">
              <p className="text-lg font-bold text-slate-800">11<Ruby rt="がつ">月</Ruby>5<Ruby rt="にち">日</Ruby>に<Ruby rt="ていしゅつ">提出</Ruby>する「<Ruby rt="にほんご">日本語</Ruby>の<Ruby rt="さくぶん">作文</Ruby>」。ファイル<Ruby rt="めい">名</Ruby>をつけよう（<Ruby rt="かくちょうし">拡張子</Ruby>はいらないよ）</p>
              <Input value={myName} onChange={(e) => { setMyName(e.target.value); setNameChecked(false) }} placeholder="例：日付_内容" className="h-12 text-lg" />
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => { setNameChecked(true); if (nameOk) succeed("いいファイル名！") }}
                  className="bg-primary text-primary-foreground font-bold rounded-lg px-5 py-2"
                >
                  チェック
                </button>
                {nameChecked && !nameOk && (
                  <span className="text-amber-700 font-bold text-sm">
                    {/\s/.test(myName.trim()) ? "スペースではなく「_」でつなごう" : "日付（1105 など）と「作文」を入れよう"}
                  </span>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </MissionFrame>
  )
}
