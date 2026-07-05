"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Character, Ruby } from "../character"
import { SuccessOverlay } from "../success-overlay"
import { Button } from "@/components/ui/button"
import { sounds } from "@/lib/sounds"
import { usePlatform } from "@/lib/platform"

interface Mission2Props {
  onComplete: () => void
}

type Step =
  | "intro"
  | "tutorial-ime"
  | "tutorial-romaji"
  | "tutorial-conversion"
  | "tutorial-backspace"
  | "tutorial-copypaste"
  | "ime-switch"
  | "hiragana-input"
  | "kanji-conversion"
  | "katakana-conversion"
  | "delete-practice"
  | "undo-practice"
  | "copy-paste"
  | "complete"

// ローマ字ヒントをキーボードキー風に表示するコンポーネント
function RomajiHint({ romaji, kana }: { romaji: string; kana: string }) {
  const parts = romaji.split(" - ")
  const kanaParts = kana.split("")

  return (
    <div className="mt-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
      <p className="text-xs text-indigo-600 font-bold mb-2 text-center">
        ⌨️ キーボードで<Ruby rt="う">打</Ruby>つローマ<Ruby rt="じ">字</Ruby>：
      </p>
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {parts.map((key, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-lg font-mono font-bold shadow-md min-w-[36px] text-center border-b-4 border-gray-600">
              {key}
            </div>
            {kanaParts[i] && (
              <span className="text-xs text-indigo-500 mt-1 font-bold">{kanaParts[i]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Backspaceアニメーション図解コンポーネント
function BackspaceDemo() {
  const [demoStep, setDemoStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep(prev => (prev + 1) % 3)
    }, 1500)
    return () => clearInterval(timer)
  }, [])

  const texts = ["こんにちあ", "こんにち", "こんにちは"]
  const labels = ["まちがってる…", "← Backspaceで消す！", "「は」を打って完成！"]
  const colors = ["text-destructive", "text-warning", "text-success"]

  return (
    <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-center gap-3">
        <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-xl font-mono min-w-[140px] text-center relative">
          {texts[demoStep].split("").map((char, i) => (
            <span
              key={i}
              className={cn(
                "transition-all duration-300",
                demoStep === 0 && i === texts[0].length - 1 && "text-red-500 bg-red-100 rounded px-0.5"
              )}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
      <p className={cn("text-sm text-center mt-2 font-bold transition-colors", colors[demoStep])}>
        {labels[demoStep]}
      </p>
    </div>
  )
}

// Undoアニメーション図解コンポーネント
function UndoDemo({ modKey }: { modKey: string }) {
  const [demoStep, setDemoStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep(prev => (prev + 1) % 3)
    }, 1500)
    return () => clearInterval(timer)
  }, [])

  const texts = ["こんに", "こんにち", "こんにちは"]
  const labels = [
    "消しすぎちゃった！",
    `${modKey}+Z で1つ戻す`,
    `もう1回 ${modKey}+Z で完成！`,
  ]
  const colors = ["text-destructive", "text-warning", "text-success"]

  return (
    <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-center gap-3">
        <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-xl font-mono min-w-[140px] text-center">
          {texts[demoStep]}
        </div>
      </div>
      <p className={cn("text-sm text-center mt-2 font-bold transition-colors", colors[demoStep])}>
        {labels[demoStep]}
      </p>
    </div>
  )
}

// 簡易キーボード図（IME切替キーの位置を示す）
function KeyboardDiagram({ isMac }: { isMac: boolean }) {
  return (
    <div className="mt-4 bg-gray-100 rounded-xl p-4 border border-gray-200">
      <p className="text-xs text-muted-foreground text-center mb-3">
        キーボードの<Ruby rt="ひだりうえ">左上</Ruby>にあるよ！
      </p>
      <div className="flex flex-col gap-1 items-center">
        {/* 一番上の行 */}
        <div className="flex gap-1">
          <div className={cn(
            "px-2 py-1.5 rounded text-xs font-mono border-b-2 min-w-[48px] text-center font-bold",
            isMac
              ? "bg-gray-300 text-gray-600 border-gray-400"
              : "bg-yellow-400 text-yellow-900 border-yellow-500 ring-2 ring-yellow-300 animate-pulse shadow-lg"
          )}>
            {isMac ? "esc" : <><Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby></>}
          </div>
          {["1", "2", "3", "4", "5"].map(k => (
            <div key={k} className="bg-gray-300 text-gray-600 px-2 py-1.5 rounded text-xs font-mono border-b-2 border-gray-400 min-w-[28px] text-center">{k}</div>
          ))}
          <div className="bg-gray-300 text-gray-500 px-2 py-1.5 rounded text-xs border-b-2 border-gray-400">...</div>
        </div>
        {/* スペースバーの行（Macの場合） */}
        {isMac && (
          <div className="flex gap-1 mt-1">
            <div className="bg-gray-300 text-gray-500 px-2 py-1.5 rounded text-xs border-b-2 border-gray-400">...</div>
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded text-xs font-mono border-b-2 border-yellow-500 ring-2 ring-yellow-300 animate-pulse shadow-lg font-bold">
              英数
            </div>
            <div className="bg-gray-300 text-gray-500 px-8 py-1.5 rounded text-xs font-mono border-b-2 border-gray-400 text-center">
              スペース
            </div>
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded text-xs font-mono border-b-2 border-yellow-500 ring-2 ring-yellow-300 animate-pulse shadow-lg font-bold">
              かな
            </div>
            <div className="bg-gray-300 text-gray-500 px-2 py-1.5 rounded text-xs border-b-2 border-gray-400">...</div>
          </div>
        )}
      </div>
      {!isMac && (
        <p className="text-xs text-center mt-2 text-yellow-700 font-bold">
          ↑ この<Ruby rt="きいろ">黄色</Ruby>いキーを<Ruby rt="お">押</Ruby>してね！
        </p>
      )}
      {isMac && (
        <p className="text-xs text-center mt-2 text-yellow-700 font-bold">
          ↑ 「かな」で<Ruby rt="にほんご">日本語</Ruby>、「<Ruby rt="えいすう">英数</Ruby>」で<Ruby rt="えいご">英語</Ruby>に<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>え！
        </p>
      )}
    </div>
  )
}

export function Mission2({ onComplete }: Mission2Props) {
  const [step, setStep] = useState<Step>("intro")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [imeMode, setImeMode] = useState<"en" | "ja">("en")
  const [inputValue, setInputValue] = useState("")
  const [deleteStepText, setDeleteStepText] = useState("こんにちあ")
  // undo-practice 用：最初から消しすぎた状態を用意
  const [undoText, setUndoText] = useState("こんに")
  const [undoStack, setUndoStack] = useState<string[]>(["こんにちは", "こんにち", "こんに"])
  const [clipboard, setClipboard] = useState("")
  const [selectedAll, setSelectedAll] = useState(false)
  const [pasteAreaText, setPasteAreaText] = useState("")
  const [copySourceFocused, setCopySourceFocused] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const pasteInputRef = useRef<HTMLInputElement>(null)
  const { isMac, modKey, imeKey } = usePlatform()

  const triggerSuccess = useCallback((message: string, nextStep: Step) => {
    sounds?.playSuccess()
    console.log(`[Mission2] ✅ triggerSuccess: "${message}" → next step: "${nextStep}"`)
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setStep(nextStep)
    }, 1500)
  }, [])

  // ステップ変化のログ
  useEffect(() => {
    console.log(`[Mission2] 📍 step changed → "${step}"`)
  }, [step])

  // copy-paste ステップの状態変化ログ
  useEffect(() => {
    if (step === "copy-paste") {
      console.log(`[Mission2] 📋 copy-paste state:`, {
        copySourceFocused,
        selectedAll,
        clipboard,
        pasteAreaText,
        inputValue,
      })
    }
  }, [step, copySourceFocused, selectedAll, clipboard, pasteAreaText, inputValue])

  // Check paste completion - when paste area has the correct text
  useEffect(() => {
    if (step === "copy-paste" && pasteAreaText) {
      const sourceText = inputValue || "サンプルテキスト"
      // Check if paste area has content that matches (or user manually typed it)
      if (pasteAreaText === sourceText || pasteAreaText === clipboard) {
        triggerSuccess("完璧だ！コピペマスター！", "complete")
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    }
  }, [step, pasteAreaText, inputValue, clipboard, triggerSuccess, onComplete])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (step === "delete-practice") {
      if (e.key === "Backspace") {
        // e.preventDefault() はしない。ブラウザに消させて onChange で検知する（二重削除防止）
        console.log(`[Mission2] ⌫ Backspace (delete-practice)`)
      }
    }
    // undo-practice の Ctrl/⌘+Z は window のグローバルリスナーだけで処理する
    // （ここでも処理すると1回の押下で2回 undo され、スタックが尽きてクリア不能になる）
  }

  const toggleIme = () => {
    const newMode = imeMode === "en" ? "ja" : "en"
    setImeMode(newMode)
    if (newMode === "ja" && step === "ime-switch") {
      triggerSuccess("よし！日本語モードになったね！", "hiragana-input")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Hiragana input check
    if (step === "hiragana-input") {
      if (value === "あした" || value === "明日") {
        triggerSuccess("ひらがなで入力できたね！", "kanji-conversion")
        setInputValue("")
      }
    }

    // Kanji conversion check
    if (step === "kanji-conversion") {
      if (value === "今日" || value === "きょう") {
        if (value === "今日") {
          triggerSuccess("漢字に変換できた！すごい！", "katakana-conversion")
          setInputValue("")
        }
      }
    }

    // Katakana conversion check
    if (step === "katakana-conversion") {
      if (value === "コンピュータ" || value === "コンピューター" || value === "こんぴゅーた") {
        if (value === "コンピュータ" || value === "コンピューター") {
          triggerSuccess("カタカナに変換できた！完璧！", "delete-practice")
          setInputValue("")
        }
      }
    }
  }

  // Check for correct text in delete step
  useEffect(() => {
    if (step === "delete-practice" && deleteStepText === "こんにちは") {
      triggerSuccess("綺麗に直せたね！", "undo-practice")
      // undo-practice の準備
      setUndoText("こんに")
      setUndoStack(["こんにちは", "こんにち"])
    }
  }, [deleteStepText, step, triggerSuccess])

  // Check for correct text in undo step
  useEffect(() => {
    if (step === "undo-practice" && undoText === "こんにちは") {
      triggerSuccess("すごい！魔法みたいに戻ったね！", "copy-paste")
    }
  }, [undoText, step, triggerSuccess])

  // Undo practice should work even if input focus is lost.
  useEffect(() => {
    if (step !== "undo-practice") return

    const handleUndoShortcut = (e: KeyboardEvent) => {
      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z"
      if (!isUndo) return

      e.preventDefault()
      if (undoStack.length > 0) {
        const prevText = undoStack[undoStack.length - 1]
        console.log(`[Mission2] ↩️ Global undo shortcut: restore to "${prevText}"`)
        setUndoText(prevText)
        setUndoStack(prev => prev.slice(0, -1))
      }
    }

    window.addEventListener("keydown", handleUndoShortcut)
    return () => window.removeEventListener("keydown", handleUndoShortcut)
  }, [step, undoStack])

  const getMessage = (): React.ReactNode => {
    switch (step) {
      case "intro":
        return (
          <>
            <Ruby rt="つぎ">次</Ruby>は<Ruby rt="もじ">文字</Ruby><Ruby rt="にゅうりょく">入力</Ruby>の<Ruby rt="れんしゅう">練習</Ruby>だ！<Ruby rt="にほん">日本</Ruby>のキーボードには<Ruby rt="ひみつ">秘密</Ruby>があるよ。
          </>
        )
      case "tutorial-ime":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【IMEの<Ruby rt="きりかえ">切替</Ruby> / Japanese ⇔ English】</p>
            <p>「<span className="font-bold text-primary">{isMac ? "かな / 英数" : <><Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby></>}</span>」キーを<Ruby rt="お">押</Ruby>すと、<Ruby rt="にほんご">日本語</Ruby>と<Ruby rt="えいご">英語</Ruby>を<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えられるよ！
            </p>
            <p className="text-xs text-muted-foreground">Press the <span className="font-mono">{imeKey}</span> key to switch Japanese ⇔ English.</p>
            <KeyboardDiagram isMac={isMac} />
          </div>
        )
      case "tutorial-romaji":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【ローマ<Ruby rt="じ">字</Ruby><Ruby rt="にゅうりょく">入力</Ruby>のキホン】</p>
            <p><Ruby rt="にほんご">日本語</Ruby>は<span className="font-bold text-primary">ローマ<Ruby rt="じ">字</Ruby></span>（アルファベット）で<Ruby rt="う">打</Ruby>つよ！</p>
            <p className="text-xs text-muted-foreground">Type Japanese using romaji (alphabet keys)!</p>
            <div className="mt-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
              {/* 母音 */}
              <p className="text-xs font-bold text-indigo-700 mb-2">
                まずは<Ruby rt="ぼいん">母音</Ruby>（5つの<Ruby rt="おと">音</Ruby>）：
              </p>
              <div className="flex justify-center gap-2 mb-3">
                {[
                  { kana: "あ", roma: "a" },
                  { kana: "い", roma: "i" },
                  { kana: "う", roma: "u" },
                  { kana: "え", roma: "e" },
                  { kana: "お", roma: "o" },
                ].map(({ kana, roma }) => (
                  <div key={roma} className="flex flex-col items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-indigo-100">
                    <span className="text-lg font-bold text-primary">{kana}</span>
                    <span className="text-xs text-gray-500">↓</span>
                    <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-sm font-mono font-bold">{roma}</span>
                  </div>
                ))}
              </div>
              {/* 子音 + 母音 */}
              <p className="text-xs font-bold text-indigo-700 mb-2">
                <Ruby rt="しいん">子音</Ruby> + <Ruby rt="ぼいん">母音</Ruby> で<Ruby rt="つく">作</Ruby>る：
              </p>
              <div className="grid grid-cols-5 gap-1 text-center text-sm">
                {[
                  { kana: "か", roma: "ka" },
                  { kana: "き", roma: "ki" },
                  { kana: "く", roma: "ku" },
                  { kana: "け", roma: "ke" },
                  { kana: "こ", roma: "ko" },
                  { kana: "さ", roma: "sa" },
                  { kana: "し", roma: "si" },
                  { kana: "す", roma: "su" },
                  { kana: "せ", roma: "se" },
                  { kana: "そ", roma: "so" },
                  { kana: "た", roma: "ta" },
                  { kana: "ち", roma: "ti" },
                  { kana: "つ", roma: "tu" },
                  { kana: "て", roma: "te" },
                  { kana: "と", roma: "to" },
                  { kana: "な", roma: "na" },
                  { kana: "に", roma: "ni" },
                  { kana: "ぬ", roma: "nu" },
                  { kana: "ね", roma: "ne" },
                  { kana: "の", roma: "no" },
                  { kana: "は", roma: "ha" },
                  { kana: "ひ", roma: "hi" },
                  { kana: "ふ", roma: "hu" },
                  { kana: "へ", roma: "he" },
                  { kana: "ほ", roma: "ho" },
                ].map(({ kana, roma }) => (
                  <div key={roma} className="bg-white rounded px-1 py-1 border border-gray-200">
                    <span className="text-primary font-bold">{kana}</span>
                    <span className="text-[10px] text-gray-500 block font-mono">{roma}</span>
                  </div>
                ))}
              </div>
              {/* よく使う特殊ルール */}
              <div className="mt-3 bg-white rounded-lg p-2 border border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 mb-1">
                  💡 <Ruby rt="とくべつ">特別</Ruby>ルール：
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold">ん</span>
                    <span className="text-gray-400">=</span>
                    <span className="font-mono bg-gray-100 px-1 rounded">nn</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold">きょ</span>
                    <span className="text-gray-400">=</span>
                    <span className="font-mono bg-gray-100 px-1 rounded">kyo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold">っ</span>
                    <span className="text-gray-400">=</span>
                    <span className="font-mono bg-gray-100 px-1 rounded">次の子音を2回</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold">ー</span>
                    <span className="text-gray-400">=</span>
                    <span className="font-mono bg-gray-100 px-1 rounded">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "tutorial-conversion":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【<Ruby rt="へんかん">変換</Ruby>の<Ruby rt="やりかた">やり方</Ruby> / Convert】</p>
            <p className="text-xs text-muted-foreground">Type hiragana → press <span className="font-mono">Space</span> to convert → <span className="font-mono">Enter</span> to confirm.</p>
            <p><Ruby rt="にほんご">日本語</Ruby>を<Ruby rt="にゅうりょく">入力</Ruby>したあと、<span className="font-bold text-primary">スペースキー</span>を<Ruby rt="お">押</Ruby>すと<Ruby rt="かんじ">漢字</Ruby>やカタカナに<Ruby rt="へんかん">変換</Ruby>できるよ！</p>
            <div className="mt-4 flex justify-center items-center gap-2">
              <span className="bg-gray-100 px-3 py-1 rounded">きょう</span>
              <span className="text-lg">→</span>
              <div className="bg-gray-800 text-white px-4 py-2 rounded font-mono text-sm">スペース</div>
              <span className="text-lg">→</span>
              <span className="bg-success/20 text-success px-3 py-1 rounded font-bold"><Ruby rt="きょう">今日</Ruby></span>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">Enter（エンター）で<Ruby rt="かくてい">確定</Ruby>！</p>
          </div>
        )
      case "tutorial-backspace":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【Backspaceと<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>す / Delete & Undo】</p>
            <p><span className="font-bold text-primary">Backspace（←）</span>で1<Ruby rt="もじ">文字</Ruby><Ruby rt="け">消</Ruby>せるよ！</p>
            <p className="text-xs text-muted-foreground">キーボードの<Ruby rt="みぎうえ">右上</Ruby>にある大きめのキーだよ</p>
            <BackspaceDemo />
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p><span className="font-bold text-primary">{modKey} + Z</span>で<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>せるよ！</p>
              <p className="text-xs text-muted-foreground">{modKey}+Z = undo（やり<Ruby rt="なお">直</Ruby>し）</p>
              <UndoDemo modKey={modKey} />
            </div>
          </div>
        )
      case "tutorial-copypaste":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【コピー＆ペースト / Copy & Paste】</p>
            <p><Ruby rt="じぶん">自分</Ruby>のキーボードで<Ruby rt="れんしゅう">練習</Ruby>するよ！</p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="flex gap-1 justify-center">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">{modKey}</div>
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">A</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1"><Ruby rt="ぜんぶえら">全部選</Ruby>ぶ / Select all</p>
              </div>
              <div className="text-center">
                <div className="flex gap-1 justify-center">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">{modKey}</div>
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">C</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">コピー / Copy</p>
              </div>
              <div className="text-center">
                <div className="flex gap-1 justify-center">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">{modKey}</div>
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">V</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">ペースト / Paste</p>
              </div>
            </div>
          </div>
        )
      case "ime-switch":
        return (
          <>
            「{isMac ? "かな" : <><Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby></>}」または「A/あ」キーを<Ruby rt="お">押</Ruby>して、<Ruby rt="にほんご">日本語</Ruby>が<Ruby rt="か">書</Ruby>けるようにしてみて！<Ruby rt="した">下</Ruby>の「あ/A」ボタンをクリックしてもOK！
            <span className="block text-xs text-muted-foreground mt-1">Switch to Japanese mode（あ）!</span>
          </>
        )
      case "hiragana-input":
        return (
          <>
            まずはひらがなで「<span className="font-bold text-primary">あした</span>」と<Ruby rt="にゅうりょく">入力</Ruby>してみよう！そのままEnterで<Ruby rt="かくてい">確定</Ruby>してね。
            <RomajiHint romaji="a - si - ta" kana="あした" />
          </>
        )
      case "kanji-conversion":
        return (
          <>
            <Ruby rt="つぎ">次</Ruby>は<Ruby rt="かんじ">漢字</Ruby>に<Ruby rt="へんかん">変換</Ruby>してみよう！「<span className="font-bold">きょう</span>」と<Ruby rt="にゅうりょく">入力</Ruby>して、<span className="font-bold text-primary">スペースキー</span>を<Ruby rt="お">押</Ruby>して「<Ruby rt="きょう">今日</Ruby>」に<Ruby rt="へんかん">変換</Ruby>、Enterで<Ruby rt="かくてい">確定</Ruby>！
            <RomajiHint romaji="k - y - o - u" kana="きょう" />
          </>
        )
      case "katakana-conversion":
        return (
          <>
            <Ruby rt="さいご">最後</Ruby>はカタカナ！「<span className="font-bold">こんぴゅーた</span>」と<Ruby rt="にゅうりょく">入力</Ruby>して、スペースを<Ruby rt="なんかい">何回</Ruby>か<Ruby rt="お">押</Ruby>して「<span className="font-bold text-primary">コンピュータ</span>」に<Ruby rt="へんかん">変換</Ruby>してみよう！
            <RomajiHint romaji="k - o - n - p - y - u - - - t - a" kana="こんぴゅーた" />
          </>
        )
      case "delete-practice":
        return deleteStepText === "こんにちは"
          ? <><Ruby rt="かんぺき">完璧</Ruby>！次は「元に戻す」練習だよ！</>
          : deleteStepText.includes("あ")
            ? (
              <>
                あれ？「こんにち<span className="font-bold text-primary">は</span>」って<Ruby rt="う">打</Ruby>ちたかったのに、<Ruby rt="まちが">間違</Ruby>えて「<span className="font-bold text-destructive">あ</span>」を<Ruby rt="う">打</Ruby>っちゃった！
                <span className="block mt-1 font-bold text-primary">「Backspace（←）」で「あ」を<Ruby rt="け">消</Ruby>して、「は」に<Ruby rt="なお">直</Ruby>そう！</span>
                <span className="block text-xs text-muted-foreground mt-1">Press Backspace to delete &quot;あ&quot;, then type &quot;は&quot; (ha).</span>
              </>
            )
            : (
              <>
                よし、<Ruby rt="け">消</Ruby>せたね！<Ruby rt="つぎ">次</Ruby>は「<span className="font-bold text-primary">は</span>」を<Ruby rt="にゅうりょく">入力</Ruby>して「こんにちは」にしよう！
                <RomajiHint romaji="h - a" kana="は" />
              </>
            )
      case "undo-practice":
        return undoText === "こんにちは"
          ? <><Ruby rt="すば">素晴</Ruby>らしい！ショートカットをマスターしたね！</>
          : (
            <>
              あ！<Ruby rt="まちが">間違</Ruby>えて<Ruby rt="け">消</Ruby>しすぎちゃった！
              <span className="block mt-1 font-bold text-primary">「{modKey} + Z」で<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>そう！</span>
              <span className="block text-xs text-muted-foreground mt-1">Press {modKey}+Z to undo!</span>
              <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                <p className="text-xs text-orange-700">
                  <Ruby rt="もくひょう">目標</Ruby>：「<span className="font-bold">こんにちは</span>」に<Ruby rt="もど">戻</Ruby>す（あと{undoText === "こんに" ? "2" : "1"}<Ruby rt="かい">回</Ruby>！）
                </p>
              </div>
            </>
          )
      case "copy-paste":
        return selectedAll && clipboard
          ? <><Ruby rt="うえ">上</Ruby>の<Ruby rt="はこ">箱</Ruby>でコピーできた！<Ruby rt="した">下</Ruby>の<Ruby rt="はこ">箱</Ruby>をクリックして<span className="font-bold text-primary">「{modKey}+V」</span>でペーストして！<span className="block text-xs text-muted-foreground mt-1">Click the bottom box, then {modKey}+V!</span></>
          : selectedAll
            ? <><Ruby rt="ぜんぶえら">全部選</Ruby>べたね！キーボードで<span className="font-bold text-primary">「{modKey}+C」</span>を<Ruby rt="お">押</Ruby>してコピーして！<span className="block text-xs text-muted-foreground mt-1">Press {modKey}+C to copy!</span></>
            : <><Ruby rt="うえ">上</Ruby>の<Ruby rt="はこ">箱</Ruby>をクリックして、キーボードで<span className="font-bold text-primary">「{modKey}+A」</span>を<Ruby rt="お">押</Ruby>して<Ruby rt="ぜんぶえら">全部選</Ruby>んで！<span className="block text-xs text-muted-foreground mt-1">Click the top box, then press {modKey}+A!</span></>
      case "complete":
        return <>ミッション2クリア！タイピングマスターだね！</>
      default:
        return ""
    }
  }

  const getMood = (): "happy" | "neutral" | "encouraging" | "celebrating" => {
    if (showSuccess || step === "complete") return "celebrating"
    if (step === "intro" || step.startsWith("tutorial")) return "happy"
    return "encouraging"
  }

  const isTutorialStep = step.startsWith("tutorial")

  return (
    <div className="flex flex-col h-full">
      <SuccessOverlay show={showSuccess} message={successMessage} />

      {/* Character Section */}
      <div className={cn(
        "p-4 md:p-6 bg-gradient-to-b from-secondary to-background",
        isTutorialStep ? "flex-1 overflow-y-auto" : ""
      )}>
        <Character message={getMessage()} mood={getMood()} />

        {/* Tutorial navigation */}
        {step === "intro" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-ime")} size="lg" className="text-lg px-8">
              スタート！
            </Button>
          </div>
        )}

        {step === "tutorial-ime" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-romaji")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}

        {step === "tutorial-romaji" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-conversion")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}

        {step === "tutorial-conversion" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-backspace")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}

        {step === "tutorial-backspace" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-copypaste")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}

        {step === "tutorial-copypaste" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("ime-switch")} size="lg" className="text-lg px-8">
              <Ruby rt="れんしゅう">練習</Ruby>をはじめる！
            </Button>
          </div>
        )}
      </div>

      {/* Simulation Area */}
      {!isTutorialStep && (
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="h-full bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="h-full bg-white p-6 flex flex-col overflow-y-auto">
              {/* IME Switch Step */}
              {step === "ime-switch" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-lg text-gray-700 mb-4"><Ruby rt="にゅうりょく">入力</Ruby>モード：</p>
                    <div className="text-6xl font-bold text-primary">
                      {imeMode === "en" ? "A" : "あ"}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {imeMode === "en" ? "英語モード" : "日本語モード"}
                    </p>
                  </div>
                  <Button
                    onClick={toggleIme}
                    size="lg"
                    variant="outline"
                    className={cn(
                      "text-xl px-8 py-6",
                      "ring-4 ring-warning animate-pulse"
                    )}
                  >
                    あ/A <Ruby rt="きりかえ">切替</Ruby>
                  </Button>
                  <p className="text-sm text-gray-500">
                    キーボードの「{isMac ? "かな / 英数" : <><Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby></>}」キーでも<Ruby rt="きりか">切替</Ruby>えられるよ！
                  </p>
                </div>
              )}

              {/* Hiragana Input Step */}
              {step === "hiragana-input" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="w-full max-w-md">
                    <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4">
                      <p className="text-success font-medium text-center">ステップ1: ひらがな<Ruby rt="にゅうりょく">入力</Ruby></p>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      「<span className="font-bold text-primary">あした</span>」と<Ruby rt="にゅうりょく">入力</Ruby>してね：
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-3 text-xl border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                        "ring-4 ring-warning"
                      )}
                      placeholder="ローマ字で a s i t a と打ってね"
                      autoFocus
                    />
                    {/* ローマ字ヒント */}
                    <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                      <p className="text-xs text-indigo-600 font-bold mb-2 text-center">⌨️ キーボードでこの<Ruby rt="じゅんばん">順番</Ruby>に<Ruby rt="お">押</Ruby>してね：</p>
                      <div className="flex items-center justify-center gap-2">
                        {[
                          { key: "A", kana: "あ" },
                          { key: "S", kana: "" },
                          { key: "I", kana: "し" },
                          { key: "T", kana: "" },
                          { key: "A", kana: "た" },
                        ].map(({ key, kana }, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="bg-gray-800 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono font-bold shadow-md border-b-4 border-gray-600">
                              {key}
                            </div>
                            {kana && <span className="text-xs text-indigo-500 mt-1 font-bold">{kana}</span>}
                          </div>
                        ))}
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2">→ <Ruby rt="さいご">最後</Ruby>に Enter で<Ruby rt="かくてい">確定</Ruby>！</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Kanji Conversion Step */}
              {step === "kanji-conversion" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="w-full max-w-md">
                    <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4">
                      <p className="text-success font-medium text-center">ステップ2: <Ruby rt="かんじ">漢字</Ruby><Ruby rt="へんかん">変換</Ruby></p>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      「きょう」→「<span className="font-bold text-primary"><Ruby rt="きょう">今日</Ruby></span>」に<Ruby rt="へんかん">変換</Ruby>してね：
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-3 text-xl border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                        "ring-4 ring-warning"
                      )}
                      placeholder="ローマ字で k y o u と打ってね"
                      autoFocus
                    />
                    {/* ローマ字ヒント */}
                    <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                      <p className="text-xs text-indigo-600 font-bold mb-2 text-center">⌨️ キーボードでこの<Ruby rt="じゅんばん">順番</Ruby>に<Ruby rt="お">押</Ruby>してね：</p>
                      <div className="flex items-center justify-center gap-2">
                        {[
                          { key: "K", kana: "" },
                          { key: "Y", kana: "きょ" },
                          { key: "O", kana: "" },
                          { key: "U", kana: "う" },
                        ].map(({ key, kana }, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="bg-gray-800 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono font-bold shadow-md border-b-4 border-gray-600">
                              {key}
                            </div>
                            {kana && <span className="text-xs text-indigo-500 mt-1 font-bold">{kana}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-center items-center gap-2 text-sm text-muted-foreground bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <span className="font-bold">①</span>
                      <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">kyou</span>
                      <span>→</span>
                      <span className="font-bold">②</span>
                      <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs">スペース</span>
                      <span>→</span>
                      <span className="font-bold">③</span>
                      <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs">Enter</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Katakana Conversion Step */}
              {step === "katakana-conversion" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="w-full max-w-md">
                    <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4">
                      <p className="text-success font-medium text-center">ステップ3: カタカナ<Ruby rt="へんかん">変換</Ruby></p>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      「こんぴゅーた」→「<span className="font-bold text-primary">コンピュータ</span>」に<Ruby rt="へんかん">変換</Ruby>してね：
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-3 text-xl border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                        "ring-4 ring-warning"
                      )}
                      placeholder="ローマ字で k o n p y u - t a"
                      autoFocus
                    />
                    {/* ローマ字ヒント */}
                    <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                      <p className="text-xs text-indigo-600 font-bold mb-2 text-center">⌨️ キーボードでこの<Ruby rt="じゅんばん">順番</Ruby>に<Ruby rt="お">押</Ruby>してね：</p>
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {[
                          { key: "K", kana: "" },
                          { key: "O", kana: "こ" },
                          { key: "N", kana: "" },
                          { key: "N", kana: "ん" },
                          { key: "P", kana: "" },
                          { key: "Y", kana: "" },
                          { key: "U", kana: "ぴゅ" },
                          { key: "-", kana: "ー" },
                          { key: "T", kana: "" },
                          { key: "A", kana: "た" },
                        ].map(({ key, kana }, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="bg-gray-800 text-white w-8 h-8 rounded-md flex items-center justify-center text-sm font-mono font-bold shadow-md border-b-2 border-gray-600">
                              {key}
                            </div>
                            {kana && <span className="text-[10px] text-indigo-500 mt-0.5 font-bold">{kana}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      スペースを<Ruby rt="なんかい">何回</Ruby>か<Ruby rt="お">押</Ruby>すと<Ruby rt="べつ">別</Ruby>の<Ruby rt="こうほ">候補</Ruby>が<Ruby rt="で">出</Ruby>るよ！
                    </p>
                  </div>
                </div>
              )}

              {/* Delete Practice Step */}
              {step === "delete-practice" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="w-full max-w-md">
                    <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4 text-center text-success font-medium">
                      ステップ4: <Ruby rt="もじ">文字</Ruby>を<Ruby rt="なお">直</Ruby>そう
                    </div>

                    {/* ビフォーアフター表示 */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-1"><Ruby rt="いま">今</Ruby>の<Ruby rt="じょうたい">状態</Ruby></p>
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          <span className="text-lg">こんにち<span className="text-red-500 font-bold bg-red-100 rounded px-0.5">あ</span></span>
                        </div>
                      </div>
                      <span className="text-2xl text-gray-400">→</span>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-1"><Ruby rt="ただ">正</Ruby>しい<Ruby rt="こたえ">答</Ruby>え</p>
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <span className="text-lg">こんにち<span className="text-green-600 font-bold">は</span></span>
                        </div>
                      </div>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backspace（←）で「<span className="text-destructive font-bold">あ</span>」を<Ruby rt="け">消</Ruby>して、「<span className="text-success font-bold">は</span>」に<Ruby rt="なお">直</Ruby>してね：
                    </label>
                    <input
                      type="text"
                      value={deleteStepText}
                      onChange={(e) => setDeleteStepText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "w-full px-4 py-3 text-xl border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                        deleteStepText.includes("あ") && "ring-4 ring-destructive"
                      )}
                      autoFocus
                    />

                    {/* 操作ヒント */}
                    <div className="mt-4 flex gap-4 justify-center">
                      <div className="text-center">
                        <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center justify-center text-white text-sm shadow-md border-b-4 border-gray-600">
                          ← Backspace
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {deleteStepText.includes("あ") 
                            ? <>まずこれで「あ」を<Ruby rt="け">消</Ruby>す！</>
                            : <>✓ <Ruby rt="け">消</Ruby>せた！</>
                          }
                        </p>
                      </div>
                      {!deleteStepText.includes("あ") && deleteStepText !== "こんにちは" && (
                        <div className="text-center">
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-indigo-600 font-bold">「は」=<span className="font-mono">ha</span></p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            <Ruby rt="つぎ">次</Ruby>にこれを<Ruby rt="う">打</Ruby>つ！
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Undo Practice Step */}
              {step === "undo-practice" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="w-full max-w-md">
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4 text-center text-warning font-medium">
                      ステップ5: <Ruby rt="まちが">間違</Ruby>えて<Ruby rt="け">消</Ruby>しすぎちゃった！
                    </div>

                    {/* ビフォーアフター表示 */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-1"><Ruby rt="いま">今</Ruby>の<Ruby rt="じょうたい">状態</Ruby></p>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                          <span className="text-lg font-mono">{undoText}</span>
                        </div>
                      </div>
                      <span className="text-2xl text-gray-400">→</span>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-1"><Ruby rt="もど">戻</Ruby>したい</p>
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <span className="text-lg font-mono">こんにちは</span>
                        </div>
                      </div>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {modKey} + Z で「こんにちは」に<Ruby rt="もど">戻</Ruby>そう：
                    </label>
                    <input
                      type="text"
                      value={undoText}
                      readOnly
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-3 text-xl border-2 rounded-lg bg-gray-50 focus:outline-none ring-4 ring-warning"
                      autoFocus
                    />
                    <div className="mt-4 flex gap-4 justify-center">
                      <div className="text-center opacity-50">
                        <div className="w-20 h-12 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs border-b-4 border-gray-400">
                          ← Backspace
                        </div>
                        <p className="text-xs text-gray-400 mt-1"><Ruby rt="け">消</Ruby>しすぎた！</p>
                      </div>
                      <div className="text-center">
                        <div className="flex gap-1 justify-center">
                          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-mono font-bold shadow-md border-b-4 border-gray-600 ring-2 ring-warning animate-pulse">
                            {modKey}
                          </div>
                          <div className="flex items-center text-gray-500 font-bold">+</div>
                          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-mono font-bold shadow-md border-b-4 border-gray-600 ring-2 ring-warning animate-pulse">
                            Z
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1"><Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>すよ / Undo</p>
                      </div>
                    </div>

                    {/* 進捗インジケータ */}
                    <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 justify-center">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold",
                          undoText.length >= 4 ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                        )}>こんに</span>
                        <span className="text-gray-400">→</span>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold",
                          undoText.length >= 5 ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                        )}>こんにち</span>
                        <span className="text-gray-400">→</span>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold",
                          undoText === "こんにちは" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
                        )}>こんにちは</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Copy/Paste Step - Keyboard only */}
              {step === "copy-paste" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="w-full max-w-md space-y-4">
                    {/* Instructions */}
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                      <p className="text-sm text-primary font-medium">
                        <Ruby rt="じぶん">自分</Ruby>のキーボードで<Ruby rt="そうさ">操作</Ruby>してね！
                      </p>
                    </div>

                    {/* Source input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        コピー<Ruby rt="もと">元</Ruby>（ここをクリック → {modKey}+A → {modKey}+C）：
                      </label>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue || "サンプルテキスト"}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => {
                          console.log('[Mission2] 🔵 source input focused')
                          setCopySourceFocused(true)
                        }}
                        onSelect={(e) => {
                          const el = e.currentTarget
                          const isAll = el.selectionStart === 0 && el.selectionEnd === el.value.length
                          console.log(`[Mission2] 🖱️ onSelect: start=${el.selectionStart} end=${el.selectionEnd} len=${el.value.length} isAll=${isAll}`)
                          if (isAll && el.value.length > 0) setSelectedAll(true)
                        }}
                        onCopy={() => {
                          console.log('[Mission2] 📋 onCopy fired — setting clipboard state')
                          setClipboard(inputValue || "サンプルテキスト")
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-xl border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                          selectedAll && "bg-blue-100",
                          !selectedAll && "ring-4 ring-warning animate-pulse"
                        )}
                        autoFocus
                      />
                      {selectedAll && (
                        <p className="text-sm text-success mt-1 text-center">
                          {clipboard ? "コピーできた！" : <><Ruby rt="つぎ">次</Ruby>は {modKey}+C！</>}
                        </p>
                      )}
                    </div>

                    {/* Target input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ペースト<Ruby rt="さき">先</Ruby>（ここをクリック → {modKey}+V）：
                      </label>
                      <input
                        ref={pasteInputRef}
                        type="text"
                        value={pasteAreaText}
                        onChange={(e) => setPasteAreaText(e.target.value)}
                        onPaste={(e) => {
                          e.preventDefault()
                          const pastedText = e.clipboardData.getData('text')
                          console.log(`[Mission2] 📥 onPaste fired — pastedText: "${pastedText}"`)
                          if (pastedText) {
                            setPasteAreaText(pastedText)
                          } else {
                            console.warn('[Mission2] ⚠️ onPaste: clipboardData empty. Clipboard may be blocked.')
                          }
                        }}
                        onFocus={() => {
                          console.log('[Mission2] 🟣 paste target focused')
                          setCopySourceFocused(false)
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-xl border-2 border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-primary",
                          clipboard && !pasteAreaText && "ring-4 ring-warning animate-pulse"
                        )}
                        placeholder="ここにペースト！"
                      />
                      {pasteAreaText && (
                        <p className="text-sm text-success mt-1 text-center">
                          ペーストできた！
                        </p>
                      )}
                    </div>

                    {/* Keyboard hints */}
                    <div className="flex gap-2 justify-center flex-wrap">
                      <div className={cn(
                        "text-center px-3 py-2 rounded-lg border",
                        !selectedAll ? "bg-warning/20 border-warning" : "bg-success/20 border-success"
                      )}>
                        <div className="flex gap-1 justify-center">
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">{modKey}</span>
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">A</span>
                        </div>
                        <p className="text-xs mt-1">{selectedAll ? "✓" : "1"}</p>
                      </div>
                      <div className={cn(
                        "text-center px-3 py-2 rounded-lg border",
                        selectedAll && !clipboard ? "bg-warning/20 border-warning" : clipboard ? "bg-success/20 border-success" : "bg-gray-100 border-gray-200"
                      )}>
                        <div className="flex gap-1 justify-center">
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">{modKey}</span>
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">C</span>
                        </div>
                        <p className="text-xs mt-1">{clipboard ? "✓" : "2"}</p>
                      </div>
                      <div className={cn(
                        "text-center px-3 py-2 rounded-lg border",
                        clipboard && !pasteAreaText ? "bg-warning/20 border-warning" : pasteAreaText ? "bg-success/20 border-success" : "bg-gray-100 border-gray-200"
                      )}>
                        <div className="flex gap-1 justify-center">
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">{modKey}</span>
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">V</span>
                        </div>
                        <p className="text-xs mt-1">{pasteAreaText ? "✓" : "3"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete */}
              {step === "complete" && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">タイピングマスター！</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
