"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Character, Ruby } from "../character"
import { SuccessOverlay } from "../success-overlay"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Wifi, WifiOff, Battery, Volume2, Save, Power, 
  ChevronRight, ArrowLeft, Lock, SignalHigh, 
  Bluetooth, Plane, Moon, Accessibility, Sun, Laptop, Search, Settings, User
} from "lucide-react"

interface Mission4Props {
  onComplete: () => void
}

type Step = "intro" | "wifi" | "save" | "shutdown" | "complete"
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
          triggerSuccess("正しく保存ほぞんできたね！", "shutdown");
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
      triggerSuccess("インターネットにつながったね！", "save")
    } else {
      alert("パスワードが違ちがうみたい。「password123」と入力にゅうりょくしてね。")
    }
  }

  const handleShutdown = () => {
    setShuttingDown(true)
    setShowPowerMenu(false)
    setShowStartMenu(false)
    setTimeout(() => {
      triggerSuccess("ミッションクリア！よく頑張がんばったね！", "complete")
      setTimeout(() => onComplete(), 2000)
    }, 2000)
  }

  const getMessage = (): React.ReactNode => {
    switch (step) {
      case "intro": return <><Ruby rt="さいご">最後</Ruby>のミッション！これができれば<Ruby rt="かんぺき">完璧</Ruby>だよ！</>
      case "wifi": return <><Ruby rt="みぎした">右下</Ruby>のアイコンを<Ruby rt="お">押</Ruby>して、「<span className="text-primary font-bold">Campus_WiFi</span>」につないでみよう！</>
      case "save": return <>大事だいじなデータだから「<span className="text-primary font-bold">Ctrl + S</span>」で<Ruby rt="ほぞん">保存</Ruby>してね！</>
      case "shutdown": return <>Windowsマークをクリックして、<Ruby rt="でんげん">電源</Ruby>を<Ruby rt="き">切</Ruby>ってみよう！</>
      case "complete": return <>おめでとう！パソコンマスターだね！</>
      default: return ""
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <SuccessOverlay show={showSuccess} message={successMessage} />
      
      {/* キャラクター指示エリア（大きく、見やすく） */}
      <div className="shrink-0 p-6 bg-white border-b shadow-sm">
        <Character message={getMessage()} mood={showSuccess ? "celebrating" : "encouraging"} />
        {step === "intro" && (
          <div className="mt-6 flex justify-center">
            <Button onClick={() => setStep("wifi")} size="lg" className="text-xl px-12 h-16 shadow-lg">スタート！</Button>
          </div>
        )}
      </div>

      {(step !== "intro" && step !== "complete") && (
        <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
          {/* シミュレーター本体：見切れ防止のため aspect-ratio を削除し w-full h-full で制御 */}
          <div className="w-full h-full max-w-6xl max-h-[700px] bg-slate-900 rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden relative border-[12px] border-slate-800 flex flex-col">
            
            {/* シャットダウン画面 */}
            {shuttingDown && (
              <div className="absolute inset-0 bg-black z-[100] flex flex-col items-center justify-center animate-fade-in text-white">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-2xl font-light">シャットダウンしています</p>
              </div>
            )}

            <div className="flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative p-10">
              
              {/* メモ帳（保存ミッション） */}
              {step === "save" && !documentSaved && (
                <div className="absolute top-10 left-10 w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 animate-in zoom-in-95">
                  <div className="bg-slate-100 px-5 py-3 border-b flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">メモ帳 - 練習れんしゅう.txt</span>
                    <Save className="w-6 h-6 text-blue-600 cursor-pointer hover:scale-110 transition-transform" onClick={() => { setDocumentSaved(true); triggerSuccess("保存できたね！", "shutdown"); }}/>
                  </div>
                  <div className="p-10 text-2xl font-mono text-slate-800 leading-relaxed">
                    これは大事だいじなデータです。<br />
                    保存ほぞんしないと消きえちゃいます！
                  </div>
                </div>
              )}

              {/* クイック設定パネル（Windows 11 風） */}
              {showQuickSettings && (
                <div className="absolute bottom-4 right-4 w-[400px] bg-slate-900/90 backdrop-blur-3xl border border-white/20 rounded-[1.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in slide-in-from-bottom-4">
                  {wifiSubStep === "quick-settings" ? (
                    <div className="p-8">
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="col-span-1 flex h-20 bg-blue-600 rounded-xl overflow-hidden shadow-lg border border-white/10">
                          <div className="flex-1 flex items-center justify-center"><Wifi className="w-8 h-8 text-white" /></div>
                          <button onClick={() => setWifiSubStep("wifi-list")} className={cn("w-10 border-l border-white/20 flex items-center justify-center hover:bg-white/10", !selectedNetwork && "bg-yellow-400/30 animate-pulse")}>
                            <ChevronRight className="w-6 h-6 text-white" />
                          </button>
                        </div>
                        {[Bluetooth, Plane, Moon, Sun, Accessibility].map((Icon, i) => (
                          <div key={i} className="bg-white/10 h-20 rounded-xl flex items-center justify-center"><Icon className="w-8 h-8 text-white/40" /></div>
                        ))}
                      </div>
                      <div className="space-y-6 px-2">
                        <div className="flex items-center gap-6"><Sun className="w-6 h-6 text-white/60" /><div className="flex-1 h-2 bg-white/20 rounded-full relative"><div className="absolute w-5 h-5 bg-white rounded-full -top-1.5 left-3/4 shadow-md" /></div></div>
                        <div className="flex items-center gap-6"><Volume2 className="w-6 h-6 text-white/60" /><div className="flex-1 h-2 bg-white/20 rounded-full relative"><div className="absolute w-5 h-5 bg-white rounded-full -top-1.5 left-1/2 shadow-md" /></div></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 h-[450px] flex flex-col">
                      <button onClick={() => setWifiSubStep("quick-settings")} className="flex items-center gap-3 text-sm text-white/60 mb-6 hover:text-white"><ArrowLeft className="w-5 h-5" /> Wi-Fi 設定せってい</button>
                      <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                        {wifiNetworks.map(n => (
                          <button key={n.name} onClick={() => setSelectedNetwork(n.name)} className={cn("w-full p-4 text-left text-base rounded-xl transition-all", selectedNetwork === n.name ? "bg-blue-600 text-white shadow-lg" : "text-white/80 hover:bg-white/10")}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4"><Wifi className="w-5 h-5" /> {n.name}</div>
                              {selectedNetwork === n.name && <ChevronRight className="w-5 h-5" />}
                            </div>
                          </button>
                        ))}
                      </div>
                      {selectedNetwork && wifiSubStep === "wifi-list" && <Button size="lg" className="mt-4 h-14 text-lg bg-blue-600 hover:bg-blue-500" onClick={() => setWifiSubStep("password")}>接続せつぞくする</Button>}
                      {wifiSubStep === "password" && (
                        <div className="mt-4 space-y-4 animate-in slide-in-from-right-4">
                          <div className="p-4 bg-blue-900/40 rounded-xl border border-blue-400/30">
                            <p className="text-white text-sm font-medium mb-3">パスワードを入力にゅうりょくしてください：</p>
                            <Input type="password" placeholder="ヒント：password123" className="h-12 text-base bg-slate-800 border-white/10 text-white shadow-inner" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} autoFocus />
                            <p className="text-xs text-blue-300 mt-3 font-bold">※練習用れんしゅうようパスワード：password123</p>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="ghost" className="flex-1 text-white" onClick={() => setWifiSubStep("wifi-list")}>キャンセル</Button>
                            <Button className="flex-1 bg-blue-600" onClick={handleWifiConnect}>次つぎへ</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* スタートメニュー（中央配置） */}
              {showStartMenu && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[550px] h-[600px] bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.7)] z-50 p-10 flex flex-col animate-in slide-in-from-bottom-10">
                  <div className="flex-1">
                    <div className="grid grid-cols-4 gap-8">
                      {[Settings, User, Laptop, Search, Plane, Sun, Bluetooth, Accessibility].map((Icon, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 group cursor-pointer">
                          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-all"><Icon className="w-8 h-8 text-white/70"/></div>
                          <div className="w-10 h-1.5 bg-white/10 rounded-full"/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8 border-t border-white/10 flex justify-between items-center relative">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">U</div>
                      <span className="text-lg text-white font-medium">ユーザー</span>
                    </div>
                    <button onClick={() => setShowPowerMenu(!showPowerMenu)} className={cn("p-4 rounded-xl hover:bg-white/10 transition-colors", step === "shutdown" && "ring-4 ring-yellow-400 animate-pulse")}><Power className="w-8 h-8 text-white" /></button>
                    {showPowerMenu && (
                      <div className="absolute right-0 bottom-full mb-4 w-56 bg-slate-800 rounded-xl border border-white/10 overflow-hidden shadow-2xl z-[70] animate-in zoom-in-95">
                        <button onClick={handleShutdown} className="w-full p-5 text-left text-base text-white hover:bg-blue-600 flex items-center gap-4"><Power className="w-5 h-5" /> シャットダウン</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* タスクバー（高さアップ・中央スタートボタン） */}
            <div className="h-20 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 flex items-center px-6 justify-between shrink-0 relative z-[70]">
              <div className="w-1/3" />
              <div className="w-1/3 flex justify-center gap-2">
                <button 
                  onClick={() => { setShowStartMenu(!showStartMenu); setShowQuickSettings(false); }} 
                  className={cn("p-3 hover:bg-white/10 rounded-xl transition-all", step === "shutdown" && !showStartMenu && "ring-4 ring-yellow-400 animate-pulse")}
                >
                  <div className="grid grid-cols-2 gap-1 w-7 h-7">
                    <div className="bg-blue-500 rounded-sm"/><div className="bg-blue-500 rounded-sm"/>
                    <div className="bg-blue-500 rounded-sm"/><div className="bg-blue-500 rounded-sm"/>
                  </div>
                </button>
                <div className="w-12 h-12 flex items-center justify-center opacity-30"><Search className="w-7 h-7 text-white"/></div>
              </div>
              <div className="w-1/3 flex justify-end">
                <button 
                  onClick={() => { setShowQuickSettings(!showQuickSettings); setShowStartMenu(false); setWifiSubStep("quick-settings"); }} 
                  className={cn("flex items-center gap-4 px-5 hover:bg-white/10 rounded-xl h-14 transition-all", step === "wifi" && !showQuickSettings && "ring-4 ring-yellow-400 animate-pulse")}
                >
                  {wifiConnected ? <Wifi className="w-6 h-6 text-white" /> : <WifiOff className="w-6 h-6 text-white/40" />}
                  <Volume2 className="w-6 h-6 text-white" />
                  <Battery className="w-6 h-6 text-white" />
                  <div className="text-sm text-white/80 font-mono pl-2">14:00</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
