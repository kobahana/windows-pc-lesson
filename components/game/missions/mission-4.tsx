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
  SignalHigh,
  Bluetooth,
  Plane,
  Moon,
  Accessibility,
  Sun,
  Laptop
} from "lucide-react"

interface Mission4Props {
  onComplete: () => void
}

type Step = "intro" | "tutorial-wifi" | "tutorial-save" | "tutorial-shutdown" | "wifi" | "save" | "shutdown" | "complete"
type WifiSubStep = "quick-settings" | "wifi-list" | "password"

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
  const [showQuickSettings, setShowQuickSettings] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [wifiSubStep, setWifiSubStep] = useState<WifiSubStep>("quick-settings")
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
      setShowQuickSettings(false)
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
      case "intro": return <><Ruby rt="さいご">最後</Ruby>のミッションだ！これができれば<Ruby rt="いちにんまえ">一人前</Ruby>！</>
      case "tutorial-wifi": return <p><Ruby rt="がめん">画面</Ruby>の<Ruby rt="みぎした">右下</Ruby>のアイコンをクリックして、Wi-Fiの矢印（＞）から「Campus_WiFi」をえらぼう！</p>
      case "wifi": return <><Ruby rt="みぎした">右下</Ruby>のアイコンを<Ruby rt="お">押</Ruby>して、「<span className="font-bold text-primary">Campus_WiFi</span>」に<Ruby rt="せつぞく">接続</Ruby>して！</>
      case "save": return <>「<span className="font-bold text-primary">Ctrl+S</span>」を<Ruby rt="お">押</Ruby>してデータを<Ruby rt="ほぞん">保存</Ruby>して！</>
      case "shutdown": return <><Ruby rt="ひだりした">左下</Ruby>から<Ruby rt="でんげん">電源</Ruby>を<Ruby rt="ただ">正</Ruby>しく<Ruby rt="き">切</Ruby>って！</>
      case "complete": return <>全ミッションクリア！お疲れ様でした！</>
      default: return ""
    }
  }

  const isPracticeStep = step === "wifi" || step === "save" || step === "shutdown"

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50">
      <SuccessOverlay show={showSuccess} message={successMessage} />

      <div className={cn("shrink-0 p-4", isPracticeStep ? "bg-slate-100/50" : "bg-slate-50")}>
        <Character message={getMessage()} mood={showSuccess ? "celebrating" : "encouraging"} />
        {step === "intro" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-wifi")} size="lg" className="px-12">スタート！</Button>
          </div>
        )}
        {step.startsWith("tutorial") && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep(step === "tutorial-wifi" ? "wifi" : "wifi")} size="lg" className="px-12">OK！</Button>
          </div>
        )}
      </div>

      {isPracticeStep && (
        <div className="flex-1 min-h-0 p-4 flex items-center justify-center">
          <div className="w-full max-w-4xl aspect-video bg-card rounded-3xl border shadow-2xl overflow-hidden relative border-slate-200">
            {shuttingDown && (
              <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center animate-fade-in">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white">シャットダウンしています</p>
                </div>
              </div>
            )}

            <div className="h-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex flex-col relative">
              <div className="flex-1 relative p-8">
                {/* --- メモ帳ウィンドウ --- */}
                {step === "save" && !documentSaved && (
                  <div className="absolute top-10 left-10 w-96 bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b">
                      <span className="text-xs font-medium">メモ帳 - 無題.txt</span>
                      <Save className={cn("w-4 h-4 text-blue-600 animate-pulse ring-2 ring-blue-400 rounded", "cursor-pointer")} onClick={handleSave}/>
                    </div>
                    <div className="p-6 text-slate-800 text-lg">大切な練習記録...</div>
                  </div>
                )}

                {/* --- Windows 11 クイック設定パネル --- */}
                {showQuickSettings && (
                  <div className="absolute bottom-2 right-2 w-[360px] bg-slate-900/85 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                    
                    {wifiSubStep === "quick-settings" ? (
                      <div className="p-6">
                        {/* 6つのグリッドタイル */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          {/* Wi-Fiタイル (2分割) */}
                          <div className="col-span-1 flex h-14 bg-blue-600 rounded-md overflow-hidden ring-2 ring-white/20">
                            <button className="flex-1 flex items-center justify-center hover:bg-blue-500 transition-colors">
                              <Wifi className="w-5 h-5 text-white" />
                            </button>
                            <button 
                              onClick={() => setWifiSubStep("wifi-list")}
                              className={cn(
                                "w-8 flex items-center justify-center border-l border-white/20 hover:bg-blue-500 transition-colors",
                                step === "wifi" && !selectedNetwork && "bg-yellow-400/30 animate-pulse"
                              )}
                            >
                              <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          <div className="bg-white/10 h-14 rounded-md flex items-center justify-center"><Bluetooth className="w-5 h-5 text-white/50" /></div>
                          <div className="bg-white/10 h-14 rounded-md flex items-center justify-center"><Plane className="w-5 h-5 text-white/50" /></div>
                          <div className="bg-white/10 h-14 rounded-md flex items-center justify-center"><Accessibility className="w-5 h-5 text-white/50" /></div>
                          <div className="bg-white/10 h-14 rounded-md flex items-center justify-center"><Moon className="w-5 h-5 text-white/50" /></div>
                          <div className="bg-white/10 h-14 rounded-md flex items-center justify-center"><Sun className="w-5 h-5 text-white/50" /></div>
                        </div>
                        {/* スライダー類（ダミー） */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-4"><Sun className="w-4 h-4 text-white/70" /><div className="flex-1 h-1 bg-white/20 rounded-full relative"><div className="absolute w-3 h-3 bg-white rounded-full -top-1 left-3/4" /></div></div>
                          <div className="flex items-center gap-4"><Volume2 className="w-4 h-4 text-white/70" /><div className="flex-1 h-1 bg-white/20 rounded-full relative"><div className="absolute w-3 h-3 bg-white rounded-full -top-1 left-1/2" /></div></div>
                        </div>
                      </div>
                    ) : wifiSubStep === "wifi-list" ? (
                      <div className="p-4 h-[380px] flex flex-col animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 mb-4">
                          <button onClick={() => setWifiSubStep("quick-settings")}><ArrowLeft className="w-4 h-4 text-white hover:text-blue-400" /></button>
                          <span className="text-white text-sm font-semibold">Wi-Fi</span>
                        </div>
                        <div className="flex-1 space-y-1 overflow-y-auto">
                          {wifiNetworks.map((n) => (
                            <div key={n.name}>
                              <button 
                                onClick={() => setSelectedNetwork(n.name)}
                                className={cn(
                                  "w-full p-3 rounded-lg flex items-center justify-between text-sm transition-all",
                                  selectedNetwork === n.name ? "bg-blue-600 text-white" : "text-white/80 hover:bg-white/10",
                                  n.name === "Campus_WiFi" && !selectedNetwork && "ring-2 ring-yellow-400 animate-pulse"
                                )}
                              >
                                <div className="flex items-center gap-3"><Wifi className="w-4 h-4" />{n.name}</div>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              {selectedNetwork === n.name && (
                                <div className="p-2 bg-slate-800 rounded-b-lg">
                                  <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-400" onClick={() => setWifiSubStep("password")}>接続</Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 space-y-4 animate-in slide-in-from-right-4">
                        <button onClick={() => setWifiSubStep("wifi-list")} className="flex items-center gap-2 text-[10px] text-slate-400"><ArrowLeft className="w-3 h-3" /> 戻る</button>
                        <div>
                          <p className="text-white text-sm mb-3 font-semibold">{selectedNetwork}</p>
                          <label className="text-xs text-slate-400 mb-2 block">ネットワーク セキュリティ キーを入力してください</label>
                          <Input 
                            type="password" 
                            placeholder="password123" 
                            className="bg-slate-800 border-white/10 text-white" 
                            value={wifiPassword} 
                            onChange={(e) => setWifiPassword(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => setWifiSubStep("wifi-list")}>キャンセル</Button>
                          <Button size="sm" className="bg-blue-600 px-6" onClick={handleWifiConnect}>次へ</Button>
                        </div>
                      </div>
                    )}
                    <div className="p-3 bg-black/20 text-[10px] text-white/40 flex justify-between items-center">
                      <span>バッテリー残量: 100%</span>
                      <div className="flex gap-2"><Sun className="w-3 h-3" /><Monitor className="w-3 h-3" /></div>
                    </div>
                  </div>
                )}

                {/* スタートメニュー */}
                {showStartMenu && (
                  <div className="absolute bottom-2 left-2 w-96 bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50 p-6 animate-in slide-in-from-bottom-4">
                    <Input placeholder="アプリ、設定、ドキュメントの検索" className="bg-black/20 border-white/10 text-white mb-6" />
                    <div className="grid grid-cols-4 gap-4 mb-12">
                      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="flex flex-col items-center gap-1 opacity-50"><div className="w-10 h-10 bg-white/10 rounded-lg"/><div className="w-8 h-1 bg-white/10 rounded"/></div>)}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10 relative">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-500 rounded-full" /><span className="text-xs text-white">ユーザー</span></div>
                      <button onClick={() => setShowPowerMenu(!showPowerMenu)} className={cn("p-2 rounded hover:bg-white/10", step === "shutdown" && "ring-2 ring-yellow-400")}><Power className="w-5 h-5 text-white" /></button>
                      {showPowerMenu && (
                        <div className="absolute right-0 bottom-full mb-2 w-40 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                          <button onClick={handleShutdown} className="w-full p-3 text-left text-xs text-white hover:bg-blue-600 transition-colors flex items-center gap-2 animate-pulse">
                            <Power className="w-3 h-3" /> シャットダウン
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* --- 本物そっくりのタスクバー --- */}
              <div className="h-12 bg-black/20 backdrop-blur-md flex items-center justify-between px-3 border-t border-white/10 shrink-0">
                <button 
                  onClick={() => { setShowStartMenu(!showStartMenu); setShowQuickSettings(false); }}
                  className={cn("p-2 hover:bg-white/10 rounded transition-all", step === "shutdown" && !showStartMenu && "ring-2 ring-yellow-400 animate-pulse")}
                >
                  <div className="grid grid-cols-2 gap-0.5 w-5 h-5"><div className="bg-blue-400 rounded-sm"/><div className="bg-teal-400 rounded-sm"/><div className="bg-orange-400 rounded-sm"/><div className="bg-yellow-400 rounded-sm"/></div>
                </button>
                <div className="flex gap-1"><div className="w-8 h-1 bg-white/40 rounded-full self-end mb-1"/></div>
                <div className="flex items-center gap-1">
                  {/* ネットワーク、音量、バッテリーの合体ボタン */}
                  <button 
                    onClick={() => { setShowQuickSettings(!showQuickSettings); setShowStartMenu(false); setWifiSubStep("quick-settings"); }}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded-md transition-all border border-transparent",
                      step === "wifi" && !showQuickSettings && "ring-2 ring-yellow-400 animate-pulse border-yellow-400/50"
                    )}
                  >
                    {wifiConnected ? <Wifi className="w-4 h-4 text-white" /> : <WifiOff className="w-4 h-4 text-white/50" />}
                    <Volume2 className="w-4 h-4 text-white" />
                    <Battery className="w-4 h-4 text-white" />
                  </button>
                  <div className="text-[10px] text-white/80 text-right leading-tight px-1 cursor-default">
                    <div>12:00</div>
                    <div>2026/04/12</div>
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
