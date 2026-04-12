"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Character, Ruby } from "../character"
import { SuccessOverlay } from "../success-overlay"
import { Button } from "@/components/ui/button"
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Volume2,
  Save,
  Power,
  Monitor,
  Check,
  ChevronRight
} from "lucide-react"

interface Mission4Props {
  onComplete: () => void
}

type Step = "intro" | "tutorial-wifi" | "tutorial-save" | "tutorial-shutdown" | "wifi" | "save" | "shutdown" | "complete"

const wifiNetworks = [
  { name: "Campus_WiFi", secured: true, strength: 3 },
  { name: "Guest_Network", secured: false, strength: 2 },
  { name: "Library_WiFi", secured: true, strength: 2 },
]

export function Mission4({ onComplete }: Mission4Props) {
  const [step, setStep] = useState<Step>("intro")
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [wifiConnected, setWifiConnected] = useState(false)
  const [showWifiPanel, setShowWifiPanel] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [documentSaved, setDocumentSaved] = useState(false)
  const [showStartMenu, setShowStartMenu] = useState(false)
  const [showPowerMenu, setShowPowerMenu] = useState(false)
  const [shuttingDown, setShuttingDown] = useState(false)

  const triggerSuccess = useCallback((message: string, nextStep: Step) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setStep(nextStep)
    }, 1500)
  }, [])

  // Handle Ctrl+S for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === "save" && e.ctrlKey && e.key === "s") {
        e.preventDefault()
        if (!documentSaved) {
          setDocumentSaved(true)
          triggerSuccess("これで安心だね！", "shutdown")
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [step, documentSaved, triggerSuccess])

  const handleWifiConnect = (networkName: string) => {
    setSelectedNetwork(networkName)
    if (networkName === "Campus_WiFi") {
      setTimeout(() => {
        setWifiConnected(true)
        setShowWifiPanel(false)
        triggerSuccess("これでインターネットにつながったね！", "save")
      }, 1000)
    }
  }

  const handleSave = () => {
    if (step === "save") {
      setDocumentSaved(true)
      triggerSuccess("これで安心だね！", "shutdown")
    }
  }

  const handleShutdown = () => {
    setShuttingDown(true)
    setShowPowerMenu(false)
    setShowStartMenu(false)
    setTimeout(() => {
      triggerSuccess("お疲れ様！今日もよく頑張ったね！また一緒に練習しよう！", "complete")
      setTimeout(() => {
        onComplete()
      }, 2000)
    }, 2000)
  }

  const getMessage = (): React.ReactNode => {
    switch (step) {
      case "intro":
        return (
          <>
            <Ruby rt="さいご">最後</Ruby>のミッションだ！これができれば<Ruby rt="いちにんまえ">一人前</Ruby>！
          </>
        )
      case "tutorial-wifi":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【Wi-Fi<Ruby rt="せつぞく">接続</Ruby>の<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p><Ruby rt="がめん">画面</Ruby>の<Ruby rt="みぎした">右下</Ruby>にあるWi-Fiアイコンをクリックして、ネットワークを<Ruby rt="えら">選</Ruby>ぶよ！</p>
            <div className="mt-4 flex justify-center items-center gap-4">
              <div className="bg-gray-800 p-2 rounded">
                <WifiOff className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg">→</span>
              <div className="bg-gray-100 border rounded p-2">
                <p className="text-xs">Campus_WiFi</p>
                <p className="text-xs text-muted-foreground">Guest_Network</p>
              </div>
              <span className="text-lg">→</span>
              <div className="bg-gray-800 p-2 rounded">
                <Wifi className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        )
      case "tutorial-save":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【<Ruby rt="ほぞん">保存</Ruby>の<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p>パソコンは<Ruby rt="ほぞん">保存</Ruby>しないとデータが<Ruby rt="き">消</Ruby>えちゃう！</p>
            <div className="mt-4 flex justify-center items-center gap-4">
              <div className="text-center">
                <div className="bg-gray-800 p-2 rounded inline-block mb-1">
                  <Save className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-muted-foreground"><Ruby rt="ほぞん">保存</Ruby>アイコン</p>
              </div>
              <span className="text-lg">または</span>
              <div className="text-center">
                <div className="flex gap-1 justify-center">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm">Ctrl</div>
                  <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm">S</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">ショートカット</p>
              </div>
            </div>
          </div>
        )
      case "tutorial-shutdown":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【<Ruby rt="ただ">正</Ruby>しいシャットダウン】</p>
            <p><Ruby rt="でんげん">電源</Ruby>ボタンを<Ruby rt="ちょくせつお">直接押</Ruby>さないで！<Ruby rt="ひだりした">左下</Ruby>のWindowsマークから<Ruby rt="ただ">正</Ruby>しく<Ruby rt="き">切</Ruby>ろう。</p>
            <div className="mt-4 flex justify-center items-center gap-2">
              <div className="bg-gray-800 p-2 rounded">
                <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                  <div className="bg-blue-400 rounded-sm" />
                  <div className="bg-green-400 rounded-sm" />
                  <div className="bg-red-400 rounded-sm" />
                  <div className="bg-yellow-400 rounded-sm" />
                </div>
              </div>
              <span className="text-lg">→</span>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <Power className="w-4 h-4" />
                <span className="text-sm"><Ruby rt="でんげん">電源</Ruby></span>
              </div>
              <span className="text-lg">→</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">シャットダウン</span>
            </div>
          </div>
        )
      case "wifi":
        return (
          <>
            <Ruby rt="した">下</Ruby>のパソコン<Ruby rt="がめん">画面</Ruby>の<Ruby rt="みぎした">右下</Ruby>にあるWi-Fiアイコンをクリックして、「<span className="font-bold text-primary">Campus_WiFi</span>」に<Ruby rt="せつぞく">接続</Ruby>して！
          </>
        )
      case "save":
        return (
          <>
            パソコンは「<Ruby rt="ほぞん">保存</Ruby>（Save）」を<Ruby rt="お">押</Ruby>さないとデータが<Ruby rt="き">消</Ruby>えちゃう！フロッピーディスクのアイコン、または「<span className="font-bold text-primary">Ctrl+S</span>」を<Ruby rt="お">押</Ruby>して<Ruby rt="ほぞん">保存</Ruby>して！
          </>
        )
      case "shutdown":
        return (
          <>
            <Ruby rt="ひだりした">左下</Ruby>のWindowsマークをクリックして、<Ruby rt="でんげん">電源</Ruby>を<Ruby rt="ただ">正</Ruby>しく<Ruby rt="き">切</Ruby>って！
          </>
        )
      case "complete":
        return (
          <>
            <Ruby rt="ぜん">全</Ruby>ミッションクリア！パソコンの<Ruby rt="きほん">基本</Ruby>をマスターしたね！お<Ruby rt="つか">疲</Ruby>れ<Ruby rt="さま">様</Ruby>でした！
          </>
        )
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
  const isPracticeStep = step === "wifi" || step === "save" || step === "shutdown"

  return (
    <div className="flex flex-col h-full">
      <SuccessOverlay show={showSuccess} message={successMessage} />
      
      {/* Character Section */}
      <div className="p-4 md:p-6 bg-gradient-to-b from-secondary to-background">
        <Character message={getMessage()} mood={getMood()} />
        
        {/* Tutorial navigation */}
        {step === "intro" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-wifi")} size="lg" className="text-lg px-8">
              スタート！
            </Button>
          </div>
        )}
        
        {step === "tutorial-wifi" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-save")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
        
        {step === "tutorial-save" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-shutdown")} size="lg" className="text-lg px-8">
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
        
        {step === "tutorial-shutdown" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("wifi")} size="lg" className="text-lg px-8">
              <Ruby rt="れんしゅう">練習</Ruby>をはじめる！
            </Button>
          </div>
        )}
      </div>

      {/* Simulation Area */}
      {isPracticeStep && (
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="h-full bg-card rounded-2xl border border-border shadow-lg overflow-hidden relative">
            {/* Shutdown Animation */}
            {shuttingDown && (
              <div className="absolute inset-0 bg-black z-50 flex items-center justify-center animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg">シャットダウンしています...</p>
                </div>
              </div>
            )}

            {/* Desktop - Full layout visible */}
            <div className="h-full bg-gradient-to-br from-blue-900 to-blue-950 flex flex-col relative">
              {/* Main desktop area */}
              <div className="flex-1 p-4 relative overflow-hidden">
                {/* Document Window for Save step */}
                {step === "save" && !documentSaved && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-80 bg-white rounded-lg shadow-2xl overflow-hidden z-10">
                    <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                      <span className="text-white text-sm">ドキュメント.txt</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleSave}
                          className={cn(
                            "w-8 h-6 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500",
                            "ring-4 ring-warning animate-pulse"
                          )}
                          title="保存 (Ctrl+S)"
                        >
                          <Save className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 text-gray-800 text-sm">
                      <p><Ruby rt="たいせつ">大切</Ruby>なデータ...</p>
                      <p className="mt-2"><Ruby rt="ほぞん">保存</Ruby>しないと<Ruby rt="き">消</Ruby>えちゃうよ！</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 text-xs text-muted-foreground">
                      <Ruby rt="じぶん">自分</Ruby>のキーボードで「Ctrl+S」でもOK！
                    </div>
                  </div>
                )}

                {/* Saved notification */}
                {documentSaved && step === "save" && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-success text-success-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-10">
                    <Check className="w-5 h-5" />
                    <span><Ruby rt="ほぞん">保存</Ruby>しました！</span>
                  </div>
                )}

                {/* Wi-Fi Panel - Now opens ABOVE the taskbar for better visibility */}
                {showWifiPanel && (
                  <div className="absolute bottom-0 right-2 w-72 bg-gray-900/95 backdrop-blur rounded-t-lg shadow-2xl overflow-hidden z-40">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-white font-medium">Wi-Fi ネットワーク</h3>
                    </div>
                    <div className="p-2 max-h-48 overflow-y-auto">
                      {wifiNetworks.map((network) => (
                        <button
                          key={network.name}
                          onClick={() => handleWifiConnect(network.name)}
                          className={cn(
                            "w-full px-3 py-3 text-left text-white hover:bg-gray-700 rounded flex items-center justify-between transition-all",
                            selectedNetwork === network.name && "bg-gray-700",
                            network.name === "Campus_WiFi" && "ring-2 ring-warning animate-pulse"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Wifi className="w-5 h-5" />
                            <span>{network.name}</span>
                          </div>
                          {selectedNetwork === network.name && network.name === "Campus_WiFi" && (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Start Menu - Opens upward */}
                {showStartMenu && (
                  <div className="absolute bottom-0 left-0 w-72 bg-gray-900/95 backdrop-blur rounded-tr-lg shadow-2xl overflow-visible z-40">
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">U</span>
                        </div>
                        <span className="text-white">ユーザー</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded flex items-center gap-3">
                        <Monitor className="w-5 h-5" />
                        <span><Ruby rt="せってい">設定</Ruby></span>
                      </button>
                      <button 
                        onClick={() => setShowPowerMenu(!showPowerMenu)}
                        className={cn(
                          "w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded flex items-center justify-between",
                          step === "shutdown" && "ring-2 ring-warning"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Power className="w-5 h-5" />
                          <span><Ruby rt="でんげん">電源</Ruby></span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Power submenu - Opens to the right */}
                    {showPowerMenu && (
                      <div className="absolute left-full bottom-0 w-48 bg-gray-800 rounded-lg shadow-xl ml-1">
                        <button className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 rounded-t-lg">
                          スリープ
                        </button>
                        <button 
                          onClick={handleShutdown}
                          className={cn(
                            "w-full px-4 py-3 text-left text-white hover:bg-gray-700 rounded-b-lg",
                            "ring-2 ring-warning animate-pulse"
                          )}
                        >
                          シャットダウン
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Desktop icons */}
                <div className="flex flex-col gap-4">
                  <div className="w-16 text-center">
                    <div className="w-12 h-12 mx-auto bg-blue-500 rounded-lg flex items-center justify-center">
                      <Monitor className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white text-xs mt-1 block">PC</span>
                  </div>
                </div>
              </div>

              {/* Taskbar - Fixed at bottom, always visible */}
              <div className="h-12 bg-gray-900/95 backdrop-blur flex items-center px-2 shrink-0">
                {/* Start button */}
                <button 
                  onClick={() => {
                    setShowStartMenu(!showStartMenu)
                    setShowWifiPanel(false)
                  }}
                  className={cn(
                    "h-10 px-4 hover:bg-gray-700 text-white rounded flex items-center gap-2 transition-all",
                    step === "shutdown" && !showStartMenu && "ring-4 ring-warning animate-pulse"
                  )}
                >
                  <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                    <div className="bg-blue-400 rounded-sm" />
                    <div className="bg-green-400 rounded-sm" />
                    <div className="bg-red-400 rounded-sm" />
                    <div className="bg-yellow-400 rounded-sm" />
                  </div>
                </button>
                
                <div className="flex-1" />
                
                {/* System tray */}
                <div className="flex items-center gap-3 text-white">
                  <button 
                    onClick={() => {
                      setShowWifiPanel(!showWifiPanel)
                      setShowStartMenu(false)
                    }}
                    className={cn(
                      "p-2 hover:bg-gray-700 rounded transition-all",
                      step === "wifi" && !showWifiPanel && "ring-4 ring-warning animate-pulse"
                    )}
                  >
                    {wifiConnected ? (
                      <Wifi className="w-5 h-5 text-blue-400" />
                    ) : (
                      <WifiOff className="w-5 h-5" />
                    )}
                  </button>
                  <Volume2 className="w-5 h-5" />
                  <Battery className="w-5 h-5" />
                  <span className="text-xs">12:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
