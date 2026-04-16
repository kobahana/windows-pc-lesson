"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Character, Ruby } from "../character"
import { SuccessOverlay } from "../success-overlay"
import { Button } from "@/components/ui/button"
import { sounds } from "@/lib/sounds"
import { 
  Monitor, 
  FolderOpen, 
  FileText, 
  Trash2, 
  Settings,
  X,
  Maximize2,
  Minimize2,
  Apple,
  Mail
} from "lucide-react"

interface Mission1Props {
  onComplete: () => void
}

type Step = 
  | "intro" 
  | "tutorial-click" 
  | "tutorial-doubleclick"
  | "tutorial-rightclick" 
  | "tutorial-scroll" 
  | "tutorial-drag" 
  | "tutorial-selectall"
  | "click" 
  | "doubleclick" 
  | "rightclick" 
  | "scroll-drag" 
  | "window" 
  | "complete"

export function Mission1({ onComplete }: Mission1Props) {
  const [step, setStep] = useState<Step>("intro")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<React.ReactNode>("")
  const [contextMenuVisible, setContextMenuVisible] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [appleDragged, setAppleDragged] = useState(false)
  const [windowState, setWindowState] = useState<"normal" | "maximized" | "closed">("normal")
  const [windowClosed, setWindowClosed] = useState(false)
  const [windowMaximized, setWindowMaximized] = useState(false)
  const [appOpened, setAppOpened] = useState(false)

  const triggerSuccess = useCallback((message: React.ReactNode, nextStep: Step) => {
    sounds?.playSuccess()
    console.log(`[Mission1] ✅ triggerSuccess → next step: "${nextStep}"`)
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setStep(nextStep)
    }, 1500)
  }, [])

  useEffect(() => {
    console.log(`[Mission1] 📍 step changed → "${step}"`)
  }, [step])

  const handleStartClick = useCallback(() => {
    console.log(`[Mission1] 💡 handleStartClick: step="${step}"`)
    if (step === "click") {
      triggerSuccess("OK！バッチリだ！", "doubleclick")
    }
  }, [step, triggerSuccess])

  const handleDoubleClick = useCallback(() => {
    console.log(`[Mission1] 💡 handleDoubleClick: step="${step}"`)
    if (step === "doubleclick") {
      setAppOpened(true)
      setTimeout(() => {
        triggerSuccess("アプリが開いたね！", "rightclick")
        setAppOpened(false)
      }, 1000)
    }
  }, [step, triggerSuccess])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    console.log(`[Mission1] 💡 handleContextMenu: step="${step}"`)
    if (step === "rightclick") {
      setContextMenuPosition({ x: e.clientX, y: e.clientY })
      setContextMenuVisible(true)
      setTimeout(() => {
        setContextMenuVisible(false)
        triggerSuccess("すごい！メニューが出たね！", "scroll-drag")
      }, 1000)
    }
  }, [step, triggerSuccess])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    console.log(`[Mission1] 💡 handleDragEnd: step="${step}" x=${e.clientX} y=${e.clientY}`)
    const dropTarget = document.getElementById("basket")
    if (dropTarget) {
      const rect = dropTarget.getBoundingClientRect()
      const hit = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      console.log(`[Mission1] 🍎 dragEnd basket rect:`, rect, `hit=${hit}`)
      if (hit) {
        setAppleDragged(true)
        triggerSuccess("やったー！りんごゲット！", "window")
      }
    }
  }, [step, triggerSuccess])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleCloseWindow = useCallback(() => {
    console.log(`[Mission1] 💡 handleCloseWindow: step="${step}" windowClosed=${windowClosed}`)
    if (step === "window" && !windowClosed) {
      setWindowClosed(true)
      setWindowState("closed")
      triggerSuccess("ありがとう！画面がスッキリしたね！", "complete")
      setTimeout(() => {
        onComplete()
      }, 2000)
    }
  }, [step, windowClosed, triggerSuccess, onComplete])

  const handleMaximizeWindow = useCallback(() => {
    console.log(`[Mission1] 💡 handleMaximizeWindow: step="${step}" windowMaximized=${windowMaximized}`)
    if (step === "window" && !windowMaximized) {
      setWindowMaximized(true)
      setWindowState("maximized")
    }
  }, [step, windowMaximized])

  const message = useMemo(() => {
    switch (step) {
      case "intro":
        return (
          <>
            やあ！<Ruby rt="きょう">今日</Ruby>から<Ruby rt="いっしょ">一緒</Ruby>にパソコンの<Ruby rt="つか">使</Ruby>い<Ruby rt="かた">方</Ruby>を<Ruby rt="れんしゅう">練習</Ruby>しよう！まずは<Ruby rt="がめん">画面</Ruby>を<Ruby rt="うご">動</Ruby>かす<Ruby rt="れんしゅう">練習</Ruby>からだ。
          </>
        )
      case "tutorial-click":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【クリックの<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p>タッチパッドを<span className="font-bold text-primary">1<Ruby rt="ぼん">本</Ruby>の<Ruby rt="ゆび">指</Ruby>で1<Ruby rt="かい">回</Ruby>タップ</span>するよ！</p>
            <div className="mt-4 flex justify-center">
              <div className="bg-gray-200 rounded-xl p-4 w-32 h-20 flex items-center justify-center relative">
                <div className="absolute w-4 h-4 bg-primary rounded-full animate-ping" />
                <div className="absolute w-4 h-4 bg-primary rounded-full" />
              </div>
            </div>
          </div>
        )
      case "tutorial-doubleclick":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【ダブルクリックの<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p>タッチパッドを<span className="font-bold text-primary">すばやく2<Ruby rt="かい">回</Ruby>タップ</span>するとアプリが<Ruby rt="ひら">開</Ruby>くよ！</p>
            <div className="mt-4 flex justify-center">
              <div className="bg-gray-200 rounded-xl p-4 w-32 h-20 flex items-center justify-center relative">
                <div className="flex gap-4">
                  <div className="w-4 h-4 bg-primary rounded-full animate-ping" />
                  <div className="w-4 h-4 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">タンタン！と<Ruby rt="すばや">素早</Ruby>くね！</p>
          </div>
        )
      case "tutorial-rightclick":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【<Ruby rt="みぎ">右</Ruby>クリックの<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p>タッチパッドを<span className="font-bold text-primary">2<Ruby rt="ほん">本</Ruby>の<Ruby rt="ゆび">指</Ruby>で1<Ruby rt="かい">回</Ruby>タップ</span>するよ！</p>
            <p className="text-sm text-muted-foreground">（または、<Ruby rt="みぎした">右下</Ruby>のコーナーを<Ruby rt="お">押</Ruby>す）</p>
            <div className="mt-4 flex justify-center">
              <div className="bg-gray-200 rounded-xl p-4 w-32 h-20 flex items-center justify-center relative gap-2">
                <div className="w-4 h-4 bg-primary rounded-full animate-ping" />
                <div className="w-4 h-4 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.1s' }} />
              </div>
            </div>
          </div>
        )
      case "tutorial-scroll":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【スクロールの<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p>タッチパッドを<span className="font-bold text-primary">2<Ruby rt="ほん">本</Ruby>の<Ruby rt="ゆび">指</Ruby>で<Ruby rt="うえ">上</Ruby>か<Ruby rt="した">下</Ruby>にスライド</span>するよ！</p>
            <div className="mt-4 flex justify-center">
              <div className="bg-gray-200 rounded-xl p-4 w-32 h-20 flex items-center justify-center relative">
                <div className="flex gap-2 animate-bounce">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  <div className="w-4 h-4 bg-primary rounded-full" />
                </div>
                <div className="absolute text-2xl top-0">↑</div>
                <div className="absolute text-2xl bottom-0">↓</div>
              </div>
            </div>
          </div>
        )
      case "tutorial-drag":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【ドラッグの<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p><span className="font-bold text-primary">クリックしたまま<Ruby rt="ゆび">指</Ruby>を<Ruby rt="うご">動</Ruby>かす</span>と、ものを<Ruby rt="うご">動</Ruby>かせるよ！</p>
            <p className="text-sm text-muted-foreground">（タッチパッドを<Ruby rt="お">押</Ruby>しながらスライド）</p>
            <div className="mt-4 flex justify-center items-center gap-4">
              <div className="bg-gray-200 rounded-xl p-4 w-32 h-20 flex items-center justify-center relative">
                <div className="w-4 h-4 bg-primary rounded-full" />
                <div className="absolute w-full h-0.5 bg-primary/50" />
              </div>
              <span className="text-2xl">→</span>
              <div className="w-8 h-8 bg-primary/30 rounded border-2 border-dashed border-primary" />
            </div>
          </div>
        )
      case "tutorial-selectall":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【<Ruby rt="ぜんぶ">全部</Ruby><Ruby rt="えら">選</Ruby>ぶ<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p>キーボードの<span className="font-bold text-primary">「Ctrl」キーと「A」キーを<Ruby rt="どうじ">同時</Ruby>に<Ruby rt="お">押</Ruby>す</span>と、<Ruby rt="ぜんぶ">全部</Ruby><Ruby rt="えら">選</Ruby>べるよ！</p>
            <div className="mt-4 flex justify-center items-center gap-2">
              <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-mono">Ctrl</div>
              <span className="text-lg">+</span>
              <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-mono">A</div>
            </div>
          </div>
        )
      case "click":
        return (
          <>
            <Ruby rt="やじるし">矢印</Ruby>（カーソル）を<Ruby rt="うご">動</Ruby>かして、この「スタート」ボタンを1<Ruby rt="かい">回</Ruby>タップ（クリック）して！
          </>
        )
      case "doubleclick":
        return (
          <>
            <Ruby rt="つぎ">次</Ruby>はダブルクリック！「メール」アイコンを<span className="font-bold text-primary">すばやく2<Ruby rt="かい">回</Ruby>タップ</span>して、アプリを<Ruby rt="ひら">開</Ruby>いてみよう！
          </>
        )
      case "rightclick":
        return (
          <>
            このフォルダを2<Ruby rt="ほん">本</Ruby><Ruby rt="ゆび">指</Ruby>でタップ（または<Ruby rt="みぎした">右下</Ruby>を<Ruby rt="お">押</Ruby>す）して、メニューを<Ruby rt="だ">出</Ruby>してみよう！
          </>
        )
      case "scroll-drag":
        return (
          <>
            2<Ruby rt="ほん">本</Ruby><Ruby rt="ゆび">指</Ruby>で<Ruby rt="がめん">画面</Ruby>を<Ruby rt="した">下</Ruby>に<Ruby rt="うご">動</Ruby>かして（スクロール）、<Ruby rt="み">見</Ruby>つけた「りんご」を「カゴ」まで<Ruby rt="はこ">運</Ruby>んで（ドラッグ）！
          </>
        )
      case "window":
        return windowClosed 
          ? <>ありがとう！<Ruby rt="がめん">画面</Ruby>がスッキリしたね！</> 
          : windowMaximized 
            ? <>よし！<Ruby rt="おお">大</Ruby>きくなったね！<Ruby rt="つぎ">次</Ruby>は「×」で<Ruby rt="と">閉</Ruby>じてみて！</> 
            : <>このウィンドウ、ちょっと<Ruby rt="じゃま">邪魔</Ruby>だな…。<Ruby rt="みぎうえ">右上</Ruby>の「×」で<Ruby rt="と">閉</Ruby>じてくれる？</>
      case "complete":
        return <>ミッション1クリア！<Ruby rt="つぎ">次</Ruby>のミッションに<Ruby rt="すす">進</Ruby>もう！</>
      default:
        return ""
    }
  }, [step, windowClosed, windowMaximized])

  const mood = useMemo((): "happy" | "neutral" | "encouraging" | "celebrating" => {
    if (showSuccess || step === "complete") return "celebrating"
    if (step === "intro" || step.startsWith("tutorial")) return "happy"
    return "encouraging"
  }, [showSuccess, step])

  const isTutorialStep = step.startsWith("tutorial")

  return (
    <div className="flex flex-col h-full">
      <SuccessOverlay show={showSuccess} message={successMessage} />
      
      {/* Character Section */}
      <div className="p-4 md:p-6 bg-gradient-to-b from-secondary to-background">
        <Character message={message} mood={mood} />
        
        {/* Tutorial navigation buttons */}
        {step === "intro" && (
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => setStep("tutorial-click")} 
              size="lg"
              className="text-lg px-8"
            >
              スタート！
            </Button>
          </div>
        )}
        
        {step === "tutorial-click" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-doubleclick")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
        
        {step === "tutorial-doubleclick" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-rightclick")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
        
        {step === "tutorial-rightclick" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-scroll")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
        
        {step === "tutorial-scroll" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-drag")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
        
        {step === "tutorial-drag" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-selectall")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
        
        {step === "tutorial-selectall" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("click")} size="lg" className="text-lg px-8">
              <Ruby rt="れんしゅう">練習</Ruby>をはじめる！
            </Button>
          </div>
        )}
      </div>

      {/* Simulation Area - only show when not in tutorial */}
      {!isTutorialStep && (
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="h-full bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            {/* Desktop Simulation */}
            <div className="h-full bg-gradient-to-br from-blue-900 to-blue-950 p-4 relative">
              {/* Desktop Icons */}
              <div className="flex flex-col gap-4">
                {/* Mail App Icon for double-click */}
                {step === "doubleclick" && (
                  <div 
                    className={cn(
                      "w-16 text-center cursor-pointer transition-transform hover:scale-105",
                      "ring-4 ring-warning ring-offset-2 ring-offset-blue-900 rounded-lg animate-pulse"
                    )}
                    onDoubleClick={handleDoubleClick}
                  >
                    <div className="w-12 h-12 mx-auto bg-blue-500 rounded-lg flex items-center justify-center">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white text-xs mt-1 block">メール</span>
                  </div>
                )}

                {/* Folder for right-click */}
                <div 
                  className={cn(
                    "w-16 text-center cursor-pointer transition-transform hover:scale-105",
                    step === "rightclick" && "ring-4 ring-warning ring-offset-2 ring-offset-blue-900 rounded-lg animate-pulse"
                  )}
                  onContextMenu={handleContextMenu}
                >
                  <div className="w-12 h-12 mx-auto bg-yellow-400 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-yellow-800" />
                  </div>
                  <span className="text-white text-xs mt-1 block">フォルダ</span>
                </div>
                
                <div className="w-16 text-center">
                  <div className="w-12 h-12 mx-auto bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-white text-xs mt-1 block">ファイル</span>
                </div>

                <div className="w-16 text-center">
                  <div className="w-12 h-12 mx-auto bg-gray-600 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-gray-300" />
                  </div>
                  <span className="text-white text-xs mt-1 block">ゴミ<ruby>箱<rt>ばこ</rt></ruby></span>
                </div>
              </div>

              {/* App opened overlay */}
              {appOpened && (
                <div className="absolute inset-4 bg-white rounded-lg shadow-2xl flex items-center justify-center animate-bounce-in">
                  <div className="text-center">
                    <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-800">メールアプリが<ruby>開<rt>ひら</rt></ruby>きました！</p>
                  </div>
                </div>
              )}

              {/* Context Menu */}
              {contextMenuVisible && (
                <div 
                  className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-40 z-50"
                  style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
                >
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"><ruby>開<rt>ひら</rt></ruby>く</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800">コピー</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"><ruby>削除<rt>さくじょ</rt></ruby></div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800">プロパティ</div>
                </div>
              )}

              {/* Scroll and Drag Area */}
              {step === "scroll-drag" && !appleDragged && (
                <div className="absolute inset-x-4 top-4 bottom-16 bg-white/10 rounded-xl overflow-hidden">
                  <div 
                    className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
                  >
                    <div className="p-4 space-y-4" style={{ minHeight: "200%" }}>
                      <p className="text-white text-center py-8">↓ <ruby>下<rt>した</rt></ruby>にスクロールしてりんごを<ruby>探<rt>さが</rt></ruby>そう！ ↓</p>
                      <div className="h-32" />
                      <div className="h-32" />
                      <div className="flex justify-center">
                        <div 
                          draggable
                          onDragEnd={handleDragEnd}
                          className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-transform ring-4 ring-warning animate-pulse"
                        >
                          <Apple className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <p className="text-white text-center mt-4">↑ りんごをカゴにドラッグ！</p>
                    </div>
                  </div>
                  {/* Basket */}
                  <div 
                    id="basket"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="absolute bottom-4 right-4 w-24 h-24 bg-amber-700 rounded-xl flex items-center justify-center border-4 border-amber-600"
                  >
                    <span className="text-white text-2xl">🧺</span>
                    <span className="absolute -bottom-6 text-white text-xs">カゴ</span>
                  </div>
                </div>
              )}

              {/* Window for window operations */}
              {step === "window" && !windowClosed && (
                <div className={cn(
                  "absolute bg-white rounded-lg shadow-2xl overflow-hidden transition-all",
                  windowState === "maximized" 
                    ? "inset-4" 
                    : "top-1/4 left-1/4 w-1/2 h-1/2"
                )}>
                  <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                    <span className="text-white text-sm">ウィンドウ</span>
                    <div className="flex items-center gap-2">
                      <button className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500">
                        <Minimize2 className="w-3 h-3 text-white" />
                      </button>
                      <button 
                        onClick={handleMaximizeWindow}
                        className={cn(
                          "w-6 h-6 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500",
                          !windowMaximized && "ring-2 ring-warning animate-pulse"
                        )}
                      >
                        <Maximize2 className="w-3 h-3 text-white" />
                      </button>
                      <button 
                        onClick={handleCloseWindow}
                        className={cn(
                          "w-6 h-6 bg-red-500 rounded flex items-center justify-center hover:bg-red-400",
                          windowMaximized && "ring-2 ring-warning animate-pulse"
                        )}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 text-gray-800">
                    <p>このウィンドウを<ruby>操作<rt>そうさ</rt></ruby>してね！</p>
                  </div>
                </div>
              )}

              {/* Taskbar */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-900/95 backdrop-blur flex items-center px-2">
                <button 
                  onClick={handleStartClick}
                  className={cn(
                    "h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 transition-all",
                    step === "click" && "ring-4 ring-warning ring-offset-2 ring-offset-gray-900 animate-pulse"
                  )}
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm font-medium">スタート</span>
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-2 text-white text-xs">
                  <Settings className="w-4 h-4" />
                  <span>12:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
