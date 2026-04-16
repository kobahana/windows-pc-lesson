"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Character, Ruby } from "../character"
import { SuccessOverlay } from "../success-overlay"
import { Button } from "@/components/ui/button"
import { sounds } from "@/lib/sounds"

interface Mission2Props {
  onComplete: () => void
}

type Step =
  | "intro"
  | "tutorial-ime"
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

    if (step === "undo-practice") {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault()
        if (undoStack.length > 0) {
          const prevText = undoStack[undoStack.length - 1]
          console.log(`[Mission2] ↩️ Ctrl+Z (undo-practice): restore to "${prevText}"`)
          setUndoText(prevText)
          setUndoStack(prev => prev.slice(0, -1))
        }
      }
      // undo-practice 中の誤入力を防ぐ
      if (e.key !== "Control" && !e.ctrlKey) {
        // e.preventDefault()
      }
    }
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
            <p className="font-bold text-primary">【IMEの<Ruby rt="きりかえ">切替</Ruby>】</p>
            <p>「<span className="font-bold text-primary"><Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby></span>」キーを<Ruby rt="お">押</Ruby>すと、<Ruby rt="にほんご">日本語</Ruby>と<Ruby rt="えいご">英語</Ruby>を<Ruby rt="き">切</Ruby>り<Ruby rt="か">替</Ruby>えられるよ！</p>
            <div className="mt-4 flex justify-center items-center gap-4">
              <div className="bg-gray-800 text-white px-4 py-2 rounded font-mono text-sm"><Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby></div>
              <span className="text-lg">→</span>
              <div className="flex gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded">A</span>
                <span>↔</span>
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded">あ</span>
              </div>
            </div>
          </div>
        )
      case "tutorial-conversion":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【<Ruby rt="へんかん">変換</Ruby>の<Ruby rt="やりかた">やり方</Ruby>】</p>
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
            <p className="font-bold text-primary">【Backspaceと<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>す】</p>
            <p><span className="font-bold text-primary">Backspace（←）</span>で1<Ruby rt="もじ">文字</Ruby><Ruby rt="け">消</Ruby>せるよ！</p>
            <p><span className="font-bold text-primary">Ctrl + Z</span>で<Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>せるよ！</p>
            <div className="mt-4 flex justify-center gap-4">
              <div className="text-center">
                <div className="bg-gray-800 text-white px-4 py-2 rounded font-mono text-sm">← Backspace</div>
                <p className="text-xs text-muted-foreground mt-1"><Ruby rt="け">消</Ruby>す</p>
              </div>
              <div className="text-center">
                <div className="flex gap-1">
                  <div className="bg-gray-800 text-white px-3 py-2 rounded font-mono text-sm">Ctrl</div>
                  <div className="bg-gray-800 text-white px-3 py-2 rounded font-mono text-sm">Z</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1"><Ruby rt="もと">元</Ruby>に<Ruby rt="もど">戻</Ruby>す</p>
              </div>
            </div>
          </div>
        )
      case "tutorial-copypaste":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【コピー＆ペースト】</p>
            <p><Ruby rt="じぶん">自分</Ruby>のキーボードで<Ruby rt="れんしゅう">練習</Ruby>するよ！</p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="flex gap-1 justify-center">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">Ctrl</div>
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">A</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1"><Ruby rt="ぜんぶえら">全部選</Ruby>ぶ</p>
              </div>
              <div className="text-center">
                <div className="flex gap-1 justify-center">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">Ctrl</div>
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">C</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">コピー</p>
              </div>
              <div className="text-center">
                <div className="flex gap-1 justify-center">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">Ctrl</div>
                  <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs">V</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">ペースト</p>
              </div>
            </div>
          </div>
        )
      case "ime-switch":
        return (
          <>
            「<Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby>」または「A/あ」キーを<Ruby rt="お">押</Ruby>して、<Ruby rt="にほんご">日本語</Ruby>が<Ruby rt="か">書</Ruby>けるようにしてみて！<Ruby rt="した">下</Ruby>の「あ/A」ボタンをクリックしてもOK！
          </>
        )
      case "hiragana-input":
        return (
          <>
            まずはひらがなで「<span className="font-bold text-primary">あした</span>」と<Ruby rt="にゅうりょく">入力</Ruby>してみよう！そのままEnterで<Ruby rt="かくてい">確定</Ruby>してね。
          </>
        )
      case "kanji-conversion":
        return (
          <>
            <Ruby rt="つぎ">次</Ruby>は<Ruby rt="かんじ">漢字</Ruby>に<Ruby rt="へんかん">変換</Ruby>してみよう！「<span className="font-bold">きょう</span>」と<Ruby rt="にゅうりょく">入力</Ruby>して、<span className="font-bold text-primary">スペースキー</span>を<Ruby rt="お">押</Ruby>して「<Ruby rt="きょう">今日</Ruby>」に<Ruby rt="へんかん">変換</Ruby>、Enterで<Ruby rt="かくてい">確定</Ruby>！
          </>
        )
      case "katakana-conversion":
        return (
          <>
            <Ruby rt="さいご">最後</Ruby>はカタカナ！「<span className="font-bold">こんぴゅーた</span>」と<Ruby rt="にゅうりょく">入力</Ruby>して、スペースを<Ruby rt="なんかい">何回</Ruby>か<Ruby rt="お">押</Ruby>して「<span className="font-bold text-primary">コンピュータ</span>」に<Ruby rt="へんかん">変換</Ruby>してみよう！
          </>
        )
      case "delete-practice":
        return deleteStepText === "こんにちは"
          ? <><Ruby rt="かんぺき">完璧</Ruby>！次は「元に戻す」練習だよ！</>
          : deleteStepText.includes("あ")
            ? <>この文字、間違ってる…。「Backspace（←）」で「あ」を消して、「は」に直そう！</>
            : <>よし、消せたね！次は「は」を入力して「こんにちは」にしよう！</>
      case "undo-practice":
        return undoText === "こんにちは"
          ? <><Ruby rt="すば">素晴</Ruby>らしい！ショートカットをマスターしたね！</>
          : <>あ！間違えて消しすぎちゃった！<span className="font-bold text-primary">「Ctrl + Z」</span>で元に戻そう！</>
      case "copy-paste":
        return selectedAll && clipboard
          ? <><Ruby rt="うえ">上</Ruby>の<Ruby rt="はこ">箱</Ruby>でコピーできた！<Ruby rt="した">下</Ruby>の<Ruby rt="はこ">箱</Ruby>をクリックして<span className="font-bold text-primary">「Ctrl+V」</span>でペーストして！</>
          : selectedAll
            ? <><Ruby rt="ぜんぶえら">全部選</Ruby>べたね！キーボードで<span className="font-bold text-primary">「Ctrl+C」</span>を<Ruby rt="お">押</Ruby>してコピーして！</>
            : <><Ruby rt="うえ">上</Ruby>の<Ruby rt="はこ">箱</Ruby>をクリックして、キーボードで<span className="font-bold text-primary">「Ctrl+A」</span>を<Ruby rt="お">押</Ruby>して<Ruby rt="ぜんぶえら">全部選</Ruby>んで！</>
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
      <div className="p-4 md:p-6 bg-gradient-to-b from-secondary to-background">
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
            <div className="h-full bg-white p-6 flex flex-col">
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
                    キーボードの「<Ruby rt="はんかく">半角</Ruby>/<Ruby rt="ぜんかく">全角</Ruby>」キーでも<Ruby rt="きりか">切替</Ruby>えられるよ！
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
                      placeholder="あした"
                      autoFocus
                    />
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      <Ruby rt="にゅうりょく">入力</Ruby>したらEnterで<Ruby rt="かくてい">確定</Ruby>！
                    </p>
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
                      placeholder="きょう → スペースで変換 → Enter"
                      autoFocus
                    />
                    <div className="mt-4 flex justify-center items-center gap-2 text-sm text-muted-foreground">
                      <span>①「きょう」</span>
                      <span>→</span>
                      <span className="bg-gray-200 px-2 py-1 rounded">スペース</span>
                      <span>→</span>
                      <span className="bg-gray-200 px-2 py-1 rounded">Enter</span>
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
                      placeholder="こんぴゅーた → スペースで変換"
                      autoFocus
                    />
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
                      ステップ4: 文字を直そう
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backspace（←）で「あ」を消して、「は」に直してね：
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
                    <div className="mt-4 flex justify-center">
                      <div className="text-center">
                        <div className="w-24 h-12 bg-gray-800 rounded flex items-center justify-center text-white text-sm">
                          ← Backspace
                        </div>
                        <p className="text-xs text-gray-500 mt-1">これで消すよ</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Undo Practice Step */}
              {step === "undo-practice" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="w-full max-w-md">
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4 text-center text-warning font-medium">
                      ステップ5: 間違えて消しすぎちゃった！
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ctrl + Z で「こんにちは」に戻そう：
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
                        <div className="w-20 h-12 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs">
                          ← Backspace
                        </div>
                        <p className="text-xs text-gray-400 mt-1">消しすぎた！</p>
                      </div>
                      <div className="text-center">
                        <div className="w-24 h-12 bg-gray-800 rounded flex items-center justify-center text-white text-sm">
                          Ctrl + Z
                        </div>
                        <p className="text-xs text-gray-500 mt-1">元に戻すよ</p>
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
                        コピー<Ruby rt="もと">元</Ruby>（ここをクリック → Ctrl+A → Ctrl+C）：
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
                          {clipboard ? "コピーできた！" : <><Ruby rt="つぎ">次</Ruby>は Ctrl+C！</>}
                        </p>
                      )}
                    </div>

                    {/* Target input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ペースト<Ruby rt="さき">先</Ruby>（ここをクリック → Ctrl+V）：
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
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Ctrl</span>
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">A</span>
                        </div>
                        <p className="text-xs mt-1">{selectedAll ? "✓" : "1"}</p>
                      </div>
                      <div className={cn(
                        "text-center px-3 py-2 rounded-lg border",
                        selectedAll && !clipboard ? "bg-warning/20 border-warning" : clipboard ? "bg-success/20 border-success" : "bg-gray-100 border-gray-200"
                      )}>
                        <div className="flex gap-1 justify-center">
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Ctrl</span>
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">C</span>
                        </div>
                        <p className="text-xs mt-1">{clipboard ? "✓" : "2"}</p>
                      </div>
                      <div className={cn(
                        "text-center px-3 py-2 rounded-lg border",
                        clipboard && !pasteAreaText ? "bg-warning/20 border-warning" : pasteAreaText ? "bg-success/20 border-success" : "bg-gray-100 border-gray-200"
                      )}>
                        <div className="flex gap-1 justify-center">
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Ctrl</span>
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
