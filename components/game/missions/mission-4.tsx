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
  Laptop,
  Search,
  LayoutGrid,
  Settings,
  User,
  Mail,
  Camera,
  Music,
  Video
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

  // Ctrl+S ブロック機能
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (step === "save" && !documentSaved) {
          setDocumentSaved(true);
          triggerSuccess("これで安心だね！", "shutdown");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, documentSaved, triggerSuccess]);

  const handleWifiConnect = () => {
    if (wifiPassword === "password123") {
      setWifiConnected(true)
      setShowQuickSettings(false)
      triggerSuccess("これでインターネットにつながったね！", "save")
    } else {
      alert("パスワードが違います。「password123」と入力してね！")
    }
  }

  const handleShutdown = () => {
    setShuttingDown(true)
    setShowPowerMenu(false)
    setShowStartMenu(false)
    setTimeout(() => {
      triggerSuccess("お疲れ様！今日もよく頑張ったね！", "complete")
      setTimeout(() => onComplete(), 2000)
    }, 2000)
  }

  const getMessage = (): React.ReactNode => {
    switch (step) {
      case "intro": return <><Ruby rt="さいご">最後</Ruby>のミッションだ！</>
      case "wifi": return <><Ruby rt="みぎした">右下</Ruby>を<Ruby rt="お">押</Ruby>して「Campus_WiFi」につないで！</>
      case "save": return <>「Ctrl+S」で<Ruby rt="ほぞん">保存</Ruby>して！</>
      case "shutdown": return <>Windowsマークから<Ruby rt="でんげん">電源</Ruby>を<Ruby rt="き">切</Ruby>って！</>
      case "complete": return <>全ミッションクリア！</>
      default: return "がんばろう！"
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <SuccessOverlay show={showSuccess} message={successMessage} />
      
      <div className="shrink-0 p-4">
        <Character message={getMessage()} mood={showSuccess ? "celebrating" : "encouraging"} />
        {step === "intro" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("wifi")} size="lg">スタート！</Button>
          </div>
        )}
      </div>

      {(step === "wifi" || step === "save" || step === "shutdown") && (
        <div className="flex-1 p-4 flex items-center justify-center min-h-0">
          <div className="w-full max-w-5xl aspect-[16/10] bg-slate-800 rounded-3xl shadow-2xl overflow-hidden relative border border-slate-700">
            {shuttingDown && (
              <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p>シャットダウン中...</p>
                </div>
              </div>
            )}

            <div className="h-full bg-gradient-to-br from-blue-700 to-indigo-900 flex flex-col">
              <div className="flex-1 relative p-8">
                {/* メモ帳 */}
                {step === "save" && !documentSaved && (
                  <div className="absolute top-10 left-10 w-80 bg-white rounded-lg shadow-xl overflow-hidden border">
                    <div className="bg-slate-100 px-3 py-1 text-[10px] border-b flex justify-between">
                      <span>メモ帳</span>
                      <Save className="w-3 h-3 text-blue-600 cursor-pointer" onClick={() => { setDocumentSaved(true); triggerSuccess("保存したね！", "shutdown"); }}/>
                    </div>
                    <div className="p-4 text-sm h-32">練習用テキスト...</div>
                  </div>
                )}

                {/* クイック設定 */}
                {showQuickSettings && (
                  <div className="absolute bottom-2 right-2 w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {wifiSubStep === "quick-settings" ? (
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="col-span-1 flex h-12 bg-blue-600 rounded overflow-hidden">
                            <div className="flex-1 flex items-center justify-center"><Wifi className="w-4 h-4 text-white" /></div>
                            <button onClick={() => setWifiSubStep("wifi-list")} className="w-6 border-l border-white/10 flex items-center justify-center hover:bg-white/10"><ChevronRight className="w-3 h-3 text-white" /></button>
                          </div>
                          {[Bluetooth, Plane, Moon, Sun, Accessibility].map((Icon, i) => (
                            <div key={i} className="bg-white/10 h-12 rounded flex items-center justify-center"><Icon className="w-4 h-4 text-white/50" /></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 h-80 flex flex-col">
                        <button onClick={() => setWifiSubStep("quick-settings")} className="flex items-center gap-2 text-[10px] text-white/50 mb-4"><ArrowLeft className="w-3 h-3" /> Wi-Fi</button>
                        <div className="flex-1 space-y-1 overflow-y-auto">
                          {wifiNetworks.map(n => (
                            <button key={n.name} onClick={() => setSelectedNetwork(n.name)} className={cn("w-full p-2 text-left text-xs rounded", selectedNetwork === n.name ? "bg-blue-600 text-white" : "text-white/80 hover:bg-white/10")}>
                              {n.name}
                            </button>
                          ))}
                        </div>
                        {selectedNetwork && wifiSubStep === "wifi-list" && <Button size="sm" className="mt-2" onClick={() => setWifiSubStep("password")}>接続</Button>}
                        {wifiSubStep === "password" && (
                          <div className="mt-2 space-y-2">
                            <Input type="password" placeholder="password123" className="h-8 text-xs bg-slate-800 text-white" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} />
                            <Button size="sm" className="w-full" onClick={handleWifiConnect}>次へ</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* スタートメニュー */}
                {showStartMenu && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[400px] h-[500px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl z-50 p-6 flex flex-col">
                    <div className="flex-1">
                      <div className="grid grid-cols-4 gap-4">
                        {[Settings, User, Mail, Camera, Music, Video, Search, Laptop].map((Icon, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 opacity-60"><Icon className="w-6 h-6 text-white"/><div className="w-6 h-1 bg-white/10 rounded"/></div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center relative">
                      <div className="flex items-center gap-2"><div className="w-6 h-6 bg-blue-500 rounded-full"/><span className="text-[10px] text-white">User</span></div>
                      <button onClick={() => setShowPowerMenu(!showPowerMenu)} className="p-1 hover:bg-white/10 rounded"><Power className="w-4 h-4 text-white" /></button>
                      {showPowerMenu && (
                        <div className="absolute right-0 bottom-full mb-2 w-32 bg-slate-800 rounded border border-white/10 overflow-hidden shadow-xl">
                          <button onClick={handleShutdown} className="w-full p-2 text-left text-[10px] text-white hover:bg-blue-600 flex items-center gap-2"><Power className="w-3 h-3" /> シャットダウン</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* タスクバー */}
              <div className="h-12 bg-black/20 backdrop-blur-md border-t border-white/10 flex items-center px-4 justify-between shrink-0">
                <div className="w-1/3" />
                <div className="w-1/3 flex justify-center gap-1">
                  <button onClick={() => { setShowStartMenu(!showStartMenu); setShowQuickSettings(false); }} className="p-2 hover:bg-white/10 rounded">
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4"><div className="bg-blue-500 rounded-sm"/><div className="bg-blue-500 rounded-sm"/><div className="bg-blue-500 rounded-sm"/><div className="bg-blue-500 rounded-sm"/></div>
                  </button>
                  <div className="w-8 h-8 flex items-center justify-center opacity-40"><Search className="w-4 h-4 text-white"/></div>
                </div>
                <div className="w-1/3 flex justify-end">
                  <button onClick={() => { setShowQuickSettings(!showQuickSettings); setShowStartMenu(false); setWifiSubStep("quick-settings"); }} className="flex items-center gap-2 px-2 hover:bg-white/10 rounded h-8">
                    {wifiConnected ? <Wifi className="w-3 h-3 text-white" /> : <WifiOff className="w-3 h-3 text-white/50" />}
                    <Volume2 className="w-3 h-3 text-white" />
                    <Battery className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
