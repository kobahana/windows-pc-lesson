"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Character, Ruby } from "../character"
import { SuccessOverlay } from "../success-overlay"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Volume2,
  Save,
  Power,
  Monitor,
  Check,
  ChevronRight,
  ArrowLeft,
  Lock,
  SignalHigh
} from "lucide-react"

interface Mission4Props {
  onComplete: () => void
}

type Step = "intro" | "tutorial-wifi" | "tutorial-save" | "tutorial-shutdown" | "wifi" | "save" | "shutdown" | "complete"
type WifiSubStep = "list" | "password"

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
  const [wifiSubStep, setWifiSubStep] = useState<WifiSubStep>("list")
  const [wifiPassword, setWifiPassword] = useState("")
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

  const handleWifiConnect = () => {
    if (wifiPassword === "password123") {
      setWifiConnected(true)
      setShowWifiPanel(false)
      triggerSuccess("これでインターネットにつながったね！", "save")
    } else {
      alert("パスワードが違います。「password123」と入力してね！")
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
            <p className="text-xs text-muted-foreground mt-2">※パスワードは「<span className="font-bold">password123</span>」だよ！</p>
          </div>
        )
      case "tutorial-save":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【<Ruby rt="ほぞん">保存</Ruby>の<Ruby rt="やりかた">やり方</Ruby>】</p>
            <p>パソコンは<Ruby rt="ほぞん">保存</Ruby>しないとデータが<Ruby rt="き">消</Ruby>えちゃう！</p>
          </div>
        )
      case "tutorial-shutdown":
        return (
          <div className="space-y-2">
            <p className="font-bold text-primary">【<Ruby rt="ただ">正</Ruby>しいシャットダウン】</p>
            <p><Ruby rt="でんげん">電源</Ruby>ボタンを<Ruby rt="ちょくせつお">直接押</Ruby>さないで！<Ruby rt="ひだりした">左下</Ruby>のWindowsマークから<Ruby rt="ただ">正</Ruby>しく<Ruby rt="き">切</Ruby>ろう。</p>
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
            パソコンは「<Ruby rt="ほぞん">保存</Ruby>（Save）」を<Ruby rt="お">押</Ruby>さないとデータが<Ruby rt="き">消</Ruby>えちゃう！「<span className="font-bold text-primary">Ctrl+S</span>」を<Ruby rt="お">押</Ruby>して<Ruby rt="ほぞん">保存</Ruby>して！
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
    <div className="flex flex-col h-full min-h-0">
      <SuccessOverlay show={showSuccess} message={successMessage} />

      <div className={cn(
        "bg-gradient-to-b from-secondary to-background shrink-0",
        isPracticeStep ? "p-3 md:p-4" : "p-4 md:p-6"
      )}>
        <Character message={getMessage()} mood={getMood()} className={isPracticeStep ? "scale-90 origin-top-left" : ""} />

        {step === "intro" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-wifi")} size="lg" className="text-lg px-8">スタート！</Button>
          </div>
        )}

        {isTutorialStep && (
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => {
                if (step === "tutorial-wifi") setStep("tutorial-save")
                else if (step === "tutorial-save") setStep("tutorial-shutdown")
                else setStep("wifi")
              }} 
              size="lg" className="text-lg px-8"
            >
              <Ruby rt="つぎ">次</Ruby>へ
            </Button>
          </div>
        )}
      </div>

      {isPracticeStep && (
        <div className="flex-1 min-h-0 p-3 md:p-4">
          <div className="h-full bg-card rounded-2xl border border-border shadow-lg overflow-hidden relative">
            {shuttingDown && (
              <div className="absolute inset-0 bg-black z-50 flex items-center justify-center animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg">シャットダウンしています...</p>
                </div>
              </div>
            )}

            <div className="h-full bg-gradient-to-br from-blue-900 to-blue-950 flex flex-col relative">
              <div className="flex-1 p-4 relative overflow-visible min-h-0">
                {step === "save" && !documentSaved && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-80 bg-white rounded-lg shadow-2xl overflow-hidden z-10">
                    <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                      <span className="text-white text-sm">ドキュメント.txt</span>
                      <button onClick={handleSave} className="w-8 h-6 bg-gray-600 rounded flex items-center justify-center hover:bg-gray-500 ring-4 ring-warning animate-pulse">
                        <Save className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="p-4 text-gray-800 text-sm italic">
                      大切なデータ...保存しないと消えちゃうよ！
                    </div>
                  </div>
                )}

                {/* --- Windows 11 風 Wi-Fiパネル --- */}
                {showWifiPanel && (
                  <div className="absolute bottom-2 right-2 w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2">
                    {wifiSubStep === "list" ? (
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-white/10 mb-2">
                          <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                            <Wifi className="w-4 h-4" /> Wi-Fi
                          </h3>
                        </div>
                        <div className="space-y-1">
                          {wifiNetworks.map((network) => (
                            <div key={network.name}>
                              <button
                                onClick={() => setSelectedNetwork(network.name)}
                                className={cn(
                                  "w-full px-3 py-3 text-left text-white hover:bg-white/10 rounded-md flex items-center justify-between transition-all text-sm",
                                  selectedNetwork === network.name && "bg-blue-600/30",
                                  network.name === "Campus_WiFi" && !selectedNetwork && "ring-2 ring-warning animate-pulse"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Wifi className="w-4 h-4" />
                                  <span>{network.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                  {network.secured && <Lock className="w-3 h-3" />}
                                  <SignalHigh className="w-4 h-4" />
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </button>
                              {selectedNetwork === network.name && (
                                <div className="px-3 py-2 bg-white/5 rounded-b-md">
                                  <Button 
                                    size="sm" 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => setWifiSubStep("password")}
                                  >
                                    接続
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-4 animate-in slide-in-from-right-4">
                        <button onClick={() => setWifiSubStep("list")} className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-white">
                          <ArrowLeft className="w-3 h-3" /> ネットワーク一覧に戻る
                        </button>
                        <div>
                          <p className="text-white text-sm font-medium mb-1">{selectedNetwork}</p>
                          <label className="text-[11px] text-slate-400 block mb-2">ネットワーク セキュリティ キーを入力してください</label>
                          <Input
                            type="password"
                            value={wifiPassword}
                            onChange={(e) => setWifiPassword(e.target.value)}
                            placeholder="password123"
                            className="bg-slate-800 border-slate-700 text-white h-8 text-sm"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" className="text-white text-xs" onClick={() => setWifiSubStep("list")}>キャンセル</Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-8 text-xs" onClick={handleWifiConnect}>
                            次へ
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="bg-white/5 p-2 text-[10px] text-slate-500 border-t border-white/5">
                      ネットワークとインターネットの設定
                    </div>
                  </div>
                )}

                {/* Start Menu */}
                {showStartMenu && (
                  <div className="absolute bottom-0 left-0 w-72 bg-gray-900/95 backdrop-blur rounded-tr-lg shadow-2xl z-40">
                    <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full" />
                      <span className="text-white text-sm">ユーザー</span>
                    </div>
                    <div className="p-2 space-y-1">
                      <button onClick={() => setShowPowerMenu(!showPowerMenu)} className={cn("w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded flex items-center justify-between", step === "shutdown" && "ring-2 ring-warning")}>
                        <div className="flex items-center gap-3"><Power className="w-4 h-4" /><span>電源</span></div>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    {showPowerMenu && (
                      <div className="absolute left-full bottom-0 w-48 bg-gray-800 rounded-lg shadow-xl ml-1 overflow-hidden">
                        <button onClick={handleShutdown} className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 ring-2 ring-warning animate-pulse text-sm">シャットダウン</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Taskbar */}
              <div className="h-12 bg-black/40 backdrop-blur-md flex items-center px-2 shrink-0 border-t border-white/10">
                <button onClick={() => { setShowStartMenu(!showStartMenu); setShowWifiPanel(false); }} className={cn("h-10 px-3 hover:bg-white/10 rounded flex items-center gap-2", step === "shutdown" && !showStartMenu && "ring-4 ring-warning animate-pulse")}>
                  <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                    <div className="bg-blue-400 rounded-sm" /><div className="bg-green-400 rounded-sm" />
                    <div className="bg-red-400 rounded-sm" /><div className="bg-yellow-400 rounded-sm" />
                  </div>
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-2 px-2">
                  <button onClick={() => { setShowWifiPanel(!showWifiPanel); setShowStartMenu(false); }} className={cn("p-2 hover:bg-white/10 rounded transition-all", step === "wifi" && !showWifiPanel && "ring-4 ring-warning animate-pulse")}>
                    {wifiConnected ? <Wifi className="w-4 h-4 text-blue-400" /> : <WifiOff className="w-4 h-4 text-white" />}
                  </button>
                  <div className="text-[10px] text-white flex flex-col items-end px-1">
                    <span>12:00</span>
                    <span>2026/04/12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
