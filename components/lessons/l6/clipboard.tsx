"use client"

// L6 ミッション2：コピー＆ペースト
// 目に見えない「クリップボード」を画面に見える化する。
// 本物の copy / cut / paste イベントで判定するので、右クリックのメニューでも進める。

import { useCallback, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, Keys, MissionFrame, Ruby, Tip, Warn, useAward, useStepFlow } from "@/components/lesson/kit"
import { usePlatform } from "@/lib/platform"
import { ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { T, useT } from "@/lib/i18n"

const LESSON_ID = 7

// 選択中の文字（入力欄の中の選択にも対応）
function selectedText(): string {
  const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null
  if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA") && typeof el.selectionStart === "number") {
    return el.value.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0)
  }
  return window.getSelection()?.toString() ?? ""
}

// ショートカットキーで操作したかどうかを見分けるため、直前のキー入力を覚えておく
function useLastModKey() {
  const ref = useRef<{ key: string; at: number } | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) ref.current = { key: e.key.toLowerCase(), at: Date.now() }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])
  return useCallback((key: string) => !!ref.current && ref.current.key === key && Date.now() - ref.current.at < 1500, [])
}

type ClipEvent = { kind: "copy" | "cut"; text: string; byKey: boolean }

// クリップボードの中身を見張る
function useClipboardWatch(onClip?: (e: ClipEvent) => void) {
  const [content, setContent] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const contentRef = useRef("")
  const usedKey = useLastModKey()
  const cbRef = useRef(onClip)
  cbRef.current = onClip

  useEffect(() => {
    const handler = (kind: "copy" | "cut") => () => {
      const text = selectedText()
      if (!text) return
      const prev = contentRef.current
      if (prev && prev !== text) setHistory((h) => [prev, ...h].slice(0, 3))
      contentRef.current = text
      setContent(text)
      cbRef.current?.({ kind, text, byKey: usedKey(kind === "copy" ? "c" : "x") })
    }
    const onCopy = handler("copy")
    const onCut = handler("cut")
    document.addEventListener("copy", onCopy)
    document.addEventListener("cut", onCut)
    return () => {
      document.removeEventListener("copy", onCopy)
      document.removeEventListener("cut", onCut)
    }
  }, [usedKey])

  return { content, history, usedKey }
}

function ClipboardBox({ content, history }: { content: string; history: string[] }) {
  return (
    <div className="sticky top-2 z-10 bg-violet-50 border-2 border-dashed border-violet-400 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-violet-500 text-white flex items-center justify-center">
        <ClipboardList className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-violet-600">クリップボード（<Ruby rt="み">見</Ruby>えない<Ruby rt="はこ">箱</Ruby>） / <T>Clipboard</T></p>
        <p key={content} className={cn("font-bold text-lg truncate animate-bounce-in", content ? "text-slate-800" : "text-slate-400")}>
          {content || <>（からっぽ / <T>empty</T>）</>}
        </p>
        {history.length > 0 && (
          <p className="text-xs text-slate-400 truncate">
            <Ruby rt="き">消</Ruby>えたもの：{history.map((h, i) => <s key={i} className="mr-2">{h}</s>)}
          </p>
        )}
      </div>
    </div>
  )
}

const ADDRESS = "東京都新宿区西新宿2-8-1"
const SELF_INTRO = "はじめまして。ベトナムから来ました。\n趣味は料理と写真です。\nどうぞよろしくお願いします。"

export function ClipboardMission({ onComplete }: { onComplete: () => void }) {
  const t = useT()
  const { step, succeed, showSuccess, successMsg } = useStepFlow(5, onComplete)
  const { modKey, isMac } = usePlatform()
  const award = useAward(LESSON_ID)
  const [warn, setWarn] = useState<React.ReactNode>(null)
  const copiedRef = useRef<Set<string>>(new Set())
  const pressedSelectAllRef = useRef(false)

  const { content, history, usedKey } = useClipboardWatch((e) => {
    copiedRef.current.add(e.text)
    if (e.kind === "copy" && e.byKey) award("copy")
    if (e.kind === "cut" && e.byKey) award("cut")
    setWarn(null)
  })

  // ステップ3（全部選ぶ）：Ctrl+A を押したか
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") pressedSelectAllRef.current = true
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => { setWarn(null) }, [step])

  const pasted = (e: React.ClipboardEvent) => {
    if (usedKey("v")) award("paste")
    return e.clipboardData.getData("text")
  }

  // 切り取りステップの入力欄
  const [itemsField, setItemsField] = useState("筆記用具、会議室B")
  const [placeField, setPlaceField] = useState("")
  useEffect(() => {
    if (step === 2 && placeField.includes("会議室B") && !itemsField.includes("会議室B")) {
      succeed("移動できた！")
    }
  }, [step, itemsField, placeField, succeed])

  const messages: React.ReactNode[] = [
    <><Ruby rt="コピー">コピー</Ruby>すると、<Ruby rt="もじ">文字</Ruby>は「クリップボード」という<Ruby rt="み">見</Ruby>えない<Ruby rt="はこ">箱</Ruby>に<Ruby rt="はい">入</Ruby>るよ。<Ruby rt="はりつ">貼り付</Ruby>けると、<Ruby rt="はこ">箱</Ruby>の<Ruby rt="なか">中</Ruby>から<Ruby rt="で">出</Ruby>てくる！<span className="block text-sm text-muted-foreground mt-1"><T>Copy puts text in an invisible box. Paste takes it out.</T></span></>,
    <><Ruby rt="はこ">箱</Ruby>には<b>1つ</b>しか<Ruby rt="はい">入</Ruby>らないよ。<Ruby rt="ためし">試</Ruby>してみよう！<span className="block text-sm text-muted-foreground mt-1"><T>The box holds only ONE thing.</T></span></>,
    <>「<Ruby rt="き">切</Ruby>り<Ruby rt="と">取</Ruby>り」は、<Ruby rt="もじ">文字</Ruby>を<Ruby rt="いどう">移動</Ruby>するときに<Ruby rt="つか">使</Ruby>うよ。<Ruby rt="もと">元</Ruby>の<Ruby rt="ばしょ">場所</Ruby>からは<Ruby rt="き">消</Ruby>えるんだ。<span className="block text-sm text-muted-foreground mt-1"><T>Cut = move text.</T></span></>,
    <><Ruby rt="なが">長</Ruby>い<Ruby rt="ぶんしょう">文章</Ruby>は、マウスでなぞるより <Keys k="Mod+A" /> で<Ruby rt="ぜんぶ">全部</Ruby><Ruby rt="えら">選</Ruby>ぶと<Ruby rt="らく">楽</Ruby>だよ！<span className="block text-sm text-muted-foreground mt-1"><T s="Select all with {key}." v={{ key: `${modKey}+A` }} /></span></>,
    <><Ruby rt="ほんもの">本物</Ruby>のブラウザでやってみよう！<Ruby rt="うえ">上</Ruby>のアドレスバーの URL をコピーして、ここに<Ruby rt="はりつ">貼り付</Ruby>けてね。<span className="block text-sm text-muted-foreground mt-1"><T>Copy the real URL from the address bar.</T></span></>,
  ]

  return (
    <MissionFrame message={messages[step]} step={step} total={5} showSuccess={showSuccess} successMsg={successMsg}>
      <div className="space-y-4">
        <ClipboardBox content={content} history={history} />

        {step === 0 && (
          <>
            <Card className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">① この<Ruby rt="じゅうしょ">住所</Ruby>をマウスでなぞって<Ruby rt="えら">選</Ruby>び、<Keys k="Mod+C" /> でコピー</p>
                <p className="text-2xl md:text-3xl font-bold bg-slate-50 rounded-xl p-4 select-text">{ADDRESS}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">② ここをクリックして、<Keys k="Mod+V" /> で<Ruby rt="はりつ">貼り付</Ruby>け</p>
                <Input
                  placeholder={`ここに貼り付け / ${t("Paste here")}`}
                  className="h-14 text-xl"
                  onPaste={(e) => {
                    const t = pasted(e)
                    if (t.trim() === ADDRESS) succeed("コピペ成功！")
                    else setWarn(<>コピーした<Ruby rt="もじ">文字</Ruby>が<Ruby rt="ちが">違</Ruby>うみたい。<Ruby rt="じゅうしょ">住所</Ruby>を<Ruby rt="ぜんぶ">全部</Ruby><Ruby rt="えら">選</Ruby>べているかな？</>)
                  }}
                  onChange={(e) => { if (e.target.value && !e.target.value.includes("東京")) setWarn(<><Ruby rt="て">手</Ruby>で<Ruby rt="う">打</Ruby>たずに、コピーして<Ruby rt="はりつ">貼り付</Ruby>けてね / <T>Don&apos;t type — paste!</T></>) }}
                />
              </div>
              <Warn>{warn}</Warn>
            </Card>
            <Tip>
              <Ruby rt="みぎ">右</Ruby>クリックのメニューにも「コピー」「<Ruby rt="はりつ">貼り付</Ruby>け」があるよ。でも <Keys k="Mod+C" /> <Keys k="Mod+V" /> は<b>どのアプリでも</b><Ruby rt="おな">同</Ruby>じ。<Ruby rt="おぼ">覚</Ruby>えると<Ruby rt="いっしょう">一生</Ruby><Ruby rt="つか">使</Ruby>えるよ！
            </Tip>
          </>
        )}

        {step === 1 && (
          <Card className="space-y-4">
            <p className="font-bold text-slate-600">① 「りんご」をコピー → ② 「みかん」をコピー → ③ <Ruby rt="した">下</Ruby>に<Ruby rt="はりつ">貼り付</Ruby>け。<Ruby rt="なに">何</Ruby>が<Ruby rt="で">出</Ruby>るかな？</p>
            <div className="flex gap-4 justify-center">
              <span className="text-3xl font-bold bg-red-50 border-2 border-red-200 rounded-xl px-6 py-3 select-text">りんご</span>
              <span className="text-3xl font-bold bg-orange-50 border-2 border-orange-200 rounded-xl px-6 py-3 select-text">みかん</span>
            </div>
            <p className="text-xs text-center text-slate-400"><Ruby rt="もじ">文字</Ruby>をダブルクリックすると、すぐに<Ruby rt="えら">選</Ruby>べるよ / <T>Double-click to select a word</T></p>
            <Input
              placeholder={`ここに貼り付け / ${t("Paste here")}`}
              className="h-14 text-2xl text-center"
              onPaste={(e) => {
                const t = pasted(e).trim()
                if (t === "みかん" && copiedRef.current.has("りんご")) succeed(<>りんごは<Ruby rt="き">消</Ruby>えたね！</>)
                else if (t === "みかん") setWarn(<>まず「りんご」もコピーしてから、もう<Ruby rt="いちど">一度</Ruby>「みかん」をコピーしてみて</>)
                else if (t === "りんご") setWarn(<>「みかん」もコピーしてから<Ruby rt="はりつ">貼り付</Ruby>けてね</>)
              }}
            />
            <Warn>{warn}</Warn>
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-4">
            <p className="font-bold text-slate-600">「<Ruby rt="かいぎしつ">会議室</Ruby>B」が<Ruby rt="まちが">間違</Ruby>った<Ruby rt="らん">欄</Ruby>にあるよ。<Keys k="Mod+X" /> で<Ruby rt="き">切</Ruby>り<Ruby rt="と">取</Ruby>って、「<Ruby rt="ばしょ">場所</Ruby>」に<Ruby rt="はりつ">貼り付</Ruby>けよう。</p>
            <div className="space-y-1">
              <label className="font-bold text-slate-700"><Ruby rt="も">持</Ruby>ち<Ruby rt="もの">物</Ruby></label>
              <Input value={itemsField} onChange={(e) => setItemsField(e.target.value)} className="h-14 text-xl" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700"><Ruby rt="ばしょ">場所</Ruby></label>
              <Input value={placeField} onChange={(e) => setPlaceField(e.target.value)} onPaste={(e) => { pasted(e) }} placeholder="ここに貼り付け" className="h-14 text-xl" />
            </div>
            <p className="text-sm text-slate-500">「、」が<Ruby rt="のこ">残</Ruby>ってもOK。<Ruby rt="き">気</Ruby>になったら <Keys k="Backspace" /> で<Ruby rt="け">消</Ruby>そう。</p>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">① <Ruby rt="した">下</Ruby>の<Ruby rt="ぶんしょう">文章</Ruby>をクリック → <Keys k="Mod+A" /> → <Keys k="Mod+C" /></p>
              <Textarea readOnly value={SELF_INTRO} className="text-lg h-32 bg-slate-50" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">② ここをクリック → <Keys k="Mod+V" /></p>
              <Textarea
                placeholder={`ここに貼り付け / ${t("Paste here")}`}
                className="text-lg h-32"
                onPaste={(e) => {
                  const t = pasted(e)
                  if (t.replace(/\r/g, "").trim() === SELF_INTRO.trim()) {
                    if (pressedSelectAllRef.current) award("selectall")
                    succeed("全部コピーできた！")
                  } else {
                    setWarn(<><Ruby rt="ぜんぶ">全部</Ruby>ではないみたい。<Ruby rt="うえ">上</Ruby>の<Ruby rt="ぶんしょう">文章</Ruby>をクリックしてから <Keys k="Mod+A" /> を<Ruby rt="お">押</Ruby>してね</>)
                  }
                }}
              />
            </div>
            <Warn>{warn}</Warn>
          </Card>
        )}

        {step === 4 && (
          <Card className="space-y-4">
            <div className="rounded-xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 text-slate-500 text-sm">
                <span>←</span><span>→</span><span>⟳</span>
                <span className="flex-1 bg-white rounded-full px-3 py-1 ring-4 ring-yellow-300 text-slate-700 truncate">https://…… ← ここ！ / <T>Here!</T></span>
              </div>
            </div>
            <p className="font-bold text-slate-600">
              ① ブラウザのいちばん<Ruby rt="うえ">上</Ruby>の URL をクリック（<Keys k="Mod+L" /> でもOK）<br />
              ② <Ruby rt="ぜんぶ">全部</Ruby><Ruby rt="えら">選</Ruby>ばれたら <Keys k="Mod+C" /><br />
              ③ <Ruby rt="した">下</Ruby>をクリックして <Keys k="Mod+V" />
            </p>
            <Input
              placeholder={`URLを貼り付け / ${t("Paste the URL")}`}
              className="h-14 text-lg"
              onPaste={(e) => {
                const t = pasted(e).trim()
                if (t.startsWith(window.location.origin) || t.startsWith(window.location.host)) succeed("URLのコピー、完璧！")
                else setWarn(<>このページの URL ではないみたい。{isMac ? "画面" : "ブラウザ"}のいちばん<Ruby rt="うえ">上</Ruby>をよく<Ruby rt="み">見</Ruby>てね</>)
              }}
            />
            <Warn>{warn}</Warn>
            <Tip>
              <Ruby rt="ともだち">友達</Ruby>にお<Ruby rt="みせ">店</Ruby>のページを<Ruby rt="おし">教</Ruby>えるとき、LINE やメールに URL を<Ruby rt="はりつ">貼り付</Ruby>けて<Ruby rt="おく">送</Ruby>れるよ。<Ruby rt="て">手</Ruby>で<Ruby rt="う">打</Ruby>つと<Ruby rt="まちが">間違</Ruby>えるので、URL は<b>かならずコピペ</b>！
            </Tip>
          </Card>
        )}
      </div>
    </MissionFrame>
  )
}
