"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Character, Ruby } from "../character"
import { SuccessOverlay } from "../success-overlay"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface Mission3Props {
  onComplete: () => void
}

// Characters to practice - more useful everyday symbols
const practiceCharacters = [
  { char: "・", hint: "Shift + 「/」", description: "中点（なかてん）" },
  { char: "「", hint: "「 キー", description: "かぎかっこ（左）" },
  { char: "」", hint: "」 キー", description: "かぎかっこ（右）" },
  { char: "。", hint: "「。」キー", description: "句点（くてん）" },
  { char: "、", hint: "「、」キー", description: "読点（とうてん）" },
  { char: "ー", hint: "「ー」キー（ほキーの右）", description: "長音（ちょうおん）" },
  { char: "＠", hint: "Shift + 「2」", description: "アットマーク" },
  { char: "：", hint: "「:」キー", description: "コロン" },
  { char: "＋", hint: "Shift + 「;」", description: "プラス" },
  { char: "＝", hint: "Shift + 「-」", description: "イコール" },
]

type Step = "intro" | "tutorial-shift" | "tutorial-symbols" | "practice" | "complete"

export function Mission3({ onComplete }: Mission3Props) {
  const [step, setStep] = useState<Step>("intro")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [completedChars, setCompletedChars] = useState<number[]>([])
  const [shiftPressed, setShiftPressed] = useState(false)

  const currentChar = practiceCharacters[currentCharIndex]

  const triggerSuccess = useCallback((message: string, nextStep: Step) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setStep(nextStep)
    }, 1500)
  }, [])

  // Track shift key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftPressed(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftPressed(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Check input for correct character
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (step === "practice" && currentChar) {
      // Check if the correct character was typed (including half-width/full-width variants)
      const target = currentChar.char
      const lastChar = value.slice(-1)
      
      // Match both full-width and half-width versions
      const matches = 
        lastChar === target ||
        (target === "・" && (lastChar === "・" || lastChar === "･")) ||
        (target === "「" && (lastChar === "「" || lastChar === "[")) ||
        (target === "」" && (lastChar === "」" || lastChar === "]")) ||
        (target === "。" && (lastChar === "。" || lastChar === ".")) ||
        (target === "、" && (lastChar === "、" || lastChar === ",")) ||
        (target === "ー" && (lastChar === "ー" || lastChar === "-" || lastChar === "－")) ||
        (target === "＠" && (lastChar === "＠" || lastChar === "@")) ||
        (target === "：" && (lastChar === "：" || lastChar === ":")) ||
        (target === "＋" && (lastChar === "＋" || lastChar === "+")) ||
        (target === "＝" && (lastChar === "＝" || lastChar === "="))

      if (matches) {
        const newCompleted = [...completedChars, currentCharIndex]
        setCompletedChars(newCompleted)
        setInputValue("")
        
        if (currentCharIndex < practiceCharacters.length - 1) {
          setCurrentCharIndex(currentCharIndex + 1)
        } else {
          // All done!
          triggerSuccess("すごい！全部の記号をマスターしたね！", "complete")
          setTimeout(() => {
            onComplete()
          }, 2000)
        }
      }
    }
  }

  const getMessage = (): React.ReactNode => {
    switch (step) {
      case "intro":
        return (
          <>
            キーボードの<Ruby rt="きごう">記号</Ruby>の<Ruby rt="だ">出</Ruby>し<Ruby rt="かた">方</Ruby>、<Ruby rt="むずか">難</Ruby>しいよね。<Ruby rt="ぼく">僕</Ruby>がルールを<Ruby rt="おし">教</Ruby>えるよ！
          </>
        )
      case "tutorial-shift":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【Shiftキーの<Ruby rt="つか">使</Ruby>い<Ruby rt="かた">方</Ruby>】</p>
            <p>キーに<Ruby rt="きごう">記号</Ruby>が2つあるとき、<span className="font-bold text-primary">Shiftを<Ruby rt="お">押</Ruby>しながら</span><Ruby rt="お">押</Ruby>すと「<Ruby rt="ひだりうえ">左上</Ruby>」の<Ruby rt="きごう">記号</Ruby>が<Ruby rt="で">出</Ruby>るんだ！</p>
            <div className="mt-4 flex justify-center items-center gap-4">
              <div className="relative bg-gray-800 text-white w-12 h-12 rounded flex items-center justify-center">
                <span className="absolute top-1 left-2 text-[10px] text-yellow-400">＠</span>
                <span className="text-lg">2</span>
              </div>
              <span className="text-lg">→</span>
              <div className="flex items-center gap-2">
                <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm">Shift</div>
                <span>+</span>
                <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm">2</div>
              </div>
              <span className="text-lg">→</span>
              <span className="text-2xl font-bold text-primary">＠</span>
            </div>
          </div>
        )
      case "tutorial-symbols":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【よく<Ruby rt="つか">使</Ruby>う<Ruby rt="きごう">記号</Ruby>】</p>
            <p><Ruby rt="にほんご">日本語</Ruby>でよく<Ruby rt="つか">使</Ruby>う<Ruby rt="きごう">記号</Ruby>の<Ruby rt="ばしょ">場所</Ruby>を<Ruby rt="おぼ">覚</Ruby>えよう！</p>
            <div className="mt-3 grid grid-cols-5 gap-2 text-center">
              <div className="bg-gray-100 rounded p-2">
                <span className="text-lg">「」</span>
                <p className="text-[10px] text-muted-foreground">かっこ</p>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <span className="text-lg">。、</span>
                <p className="text-[10px] text-muted-foreground"><Ruby rt="くとうてん">句読点</Ruby></p>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <span className="text-lg">・</span>
                <p className="text-[10px] text-muted-foreground"><Ruby rt="なかてん">中点</Ruby></p>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <span className="text-lg">ー</span>
                <p className="text-[10px] text-muted-foreground"><Ruby rt="ちょうおん">長音</Ruby></p>
              </div>
              <div className="bg-gray-100 rounded p-2">
                <span className="text-lg">＠</span>
                <p className="text-[10px] text-muted-foreground">メール</p>
              </div>
            </div>
          </div>
        )
      case "practice":
        return (
          <>
            <Ruby rt="じっさい">実際</Ruby>に<Ruby rt="にゅうりょく">入力</Ruby>してみよう！「<span className="font-bold text-primary text-xl">{currentChar?.char}</span>」（{currentChar?.description}）を<Ruby rt="う">打</Ruby>ってみて！
          </>
        )
      case "complete":
        return <>ミッション3クリア！キーボードの<Ruby rt="きごう">記号</Ruby>をマスターしたね！</>
      default:
        return ""
    }
  }

  const getMood = (): "happy" | "neutral" | "encouraging" | "celebrating" => {
    if (showSuccess || step === "complete") return "celebrating"
    if (step === "intro" || step.startsWith("tutorial")) return "happy"
    return "encouraging"
  }

  const isTutorialStep = step.startsWith("tutorial") || step === "intro"

  return (
    <div className="flex flex-col h-full">
      <SuccessOverlay show={showSuccess} message={successMessage} />
      
      {/* Character Section */}
      <div className="p-4 md:p-6 bg-gradient-to-b from-secondary to-background">
        <Character message={getMessage()} mood={getMood()} />
        
        {/* Tutorial navigation */}
        {step === "intro" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-shift")} size="lg" className="text-lg px-8">
              スタート！
            </Button>
          </div>
        )}
        
        {step === "tutorial-shift" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-symbols")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
        
        {step === "tutorial-symbols" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("practice")} size="lg" className="text-lg px-8">
              <Ruby rt="れんしゅう">練習</Ruby>をはじめる！
            </Button>
          </div>
        )}
      </div>

      {/* Practice Area */}
      {step === "practice" && (
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="h-full bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="h-full bg-gray-100 p-4 md:p-6 flex flex-col">
              {/* Progress indicator */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span><Ruby rt="しんちょく">進捗</Ruby></span>
                  <span>{completedChars.length} / {practiceCharacters.length}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(completedChars.length / practiceCharacters.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current character to practice */}
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-8xl font-bold text-primary mb-4 animate-bounce-subtle">
                    {currentChar?.char}
                  </div>
                  <p className="text-lg text-muted-foreground">{currentChar?.description}</p>
                </div>

                {/* Hint */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-border">
                  <p className="text-sm text-muted-foreground text-center mb-2">ヒント：</p>
                  <p className="text-lg font-medium text-center">{currentChar?.hint}</p>
                  {shiftPressed && (
                    <p className="text-sm text-success text-center mt-2 animate-pulse">
                      Shiftが<Ruby rt="お">押</Ruby>されてる！
                    </p>
                  )}
                </div>

                {/* Input */}
                <div className="w-full max-w-xs">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-4 py-4 text-2xl text-center bg-white border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary",
                      "ring-4 ring-warning"
                    )}
                    placeholder={`「${currentChar?.char}」を入力`}
                    autoFocus
                  />
                </div>
              </div>

              {/* Completed characters list */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  クリアした<Ruby rt="きごう">記号</Ruby>：
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {practiceCharacters.map((char, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-medium transition-all",
                        completedChars.includes(index) 
                          ? "bg-success text-success-foreground" 
                          : index === currentCharIndex
                            ? "bg-primary text-primary-foreground ring-2 ring-warning"
                            : "bg-gray-200 text-gray-400"
                      )}
                    >
                      {completedChars.includes(index) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        char.char
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete state */}
      {step === "complete" && (
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="h-full bg-card rounded-2xl border border-border shadow-lg overflow-hidden flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl font-bold text-success mb-4">キーボードマスター！</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {practiceCharacters.map((char, index) => (
                  <div 
                    key={index}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-medium bg-success text-success-foreground"
                  >
                    {char.char}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
