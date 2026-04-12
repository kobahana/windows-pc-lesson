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
  LayoutGrid
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

  // キーボードショートカットの制御 (Ctrl+S 無効化)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S または Command+S (Mac) を検知
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault(); // ブラウザの「名前を付けて保存」を阻止
        
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
      case "shutdown": return <>画面<Ruby rt="した">下</Ruby>バーの<Ruby rt="まんなか">真ん中</Ruby>にあるWindowsマークをクリックして、<Ruby rt="でんげん">電源</Ruby>を<Ruby rt="き">切</Ruby>って！</>
      case "complete": return <>全ミッションクリア！お疲れ様でした！</>
      default: return ""
    }
  }

  const isPracticeStep = step === "wifi" || step === "save" || step === "shutdown"

  // Windows 11 の青い正方形4つのアイコン
  const Windows11Icon = () => (
    <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
      <div className="bg-blue-600 rounded-sm hover:bg-blue-500"/>
      <div className="bg-blue-600 rounded-sm hover:bg-blue-500"/>
      <div className="bg-blue-600 rounded-sm hover:bg-blue-500"/>
      <div className="bg-blue-600 rounded-sm hover:bg-blue-500"/>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50">
      <SuccessOverlay show={showSuccess} message={successMessage} />

      <div className={cn("shrink-0 p-4", isPracticeStep ? "bg-slate-100/50" : "bg-slate-50")}>
        <Character message={getMessage()} mood={showSuccess ? "celebrating" : "encouraging"} />
        {step === "intro" && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep("tutorial-wifi")} size="lg" className="px-12 hover:scale-105 transition-transform">スタート！</Button>
          </div>
        )}
        {step.startsWith("tutorial") && (
          <div className="mt-4 flex justify-center">
            <Button onClick={() => setStep(step === "tutorial-wifi" ? "wifi" : "wifi")} size="lg" className="px-12 hover:scale-105 transition-transform">OK！</Button>
          </div>
        )}
      </div>

      {isPracticeStep && (
        <div className="flex-1 min-h-0 p-4 flex items-center justify-center">
          <div className="w-full max-w-5xl aspect-[16/10] bg-card rounded-3xl border shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative border-slate-200">
            {shuttingDown && (
              <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center animate-fade-in">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg">シャットダウンしています</p>
                </div>
              </div>
            )}

            <div className="h-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex flex-col relative">
              {/* --- メイン デスクトップ領域 --- */}
              <div className="flex-1 relative p-10 overflow-hidden">
                {/* メモ帳ウィンドウ */}
                {step === "save" && !documentSaved && (
                  <div className="absolute top-16 left-16 w-[450px] bg-white/95 backdrop-blur-sm rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 border border-slate-200">
                    <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b">
                      <span className="text-xs font-medium text-slate-700">メモ帳 - 無題.txt</span>
                      <Save className={cn("w-4 h-4 text-blue-600 ring-2 ring-blue-400 rounded-sm cursor-pointer", "transition-all hover:scale-110")} onClick={handleSave}/>
                    </div>
                    <div className="p-8 text-slate-800 text-xl font-mono">大切な練習記録...保存ほぞんしないと消きえちゃうよ！</div>
                  </div>
                )}

                {/* --- Windows 11 クイック設定パネル --- */}
                {showQuickSettings && (
                  <div className="absolute bottom-2 right-2 w-[380px] bg-slate-900/85 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.6)] z-[60] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    
                    {wifiSubStep === "quick-settings" ? (
                      <div className="p-7">
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          {/* Wi-Fiタイル (2分割) */}
                          <div className="col-span-1 flex h-16 bg-blue-600 rounded-lg overflow-hidden ring-2 ring-white/10 shadow-lg">
                            <button className="flex-1 flex items-center justify-center hover:bg-blue-500 transition-colors">
                              <Wifi className="w-6 h-6 text-white" />
                            </button>
                            <button 
                              onClick={() => setWifiSubStep("wifi-list")}
                              className={cn(
                                "w-9 flex items-center justify-center border-l border-white/10 hover:bg-blue-500 transition-colors",
                                step === "wifi" && !selectedNetwork && "bg-yellow-400/40 animate-pulse"
                              )}
                            >
                              <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                          </div>
                          {[Bluetooth, Plane, Accessibility, Moon, Sun].map((Icon, i) => (
                            <div key={i} className="bg-white/10 h-16 rounded-lg flex items-center justify-center group"><Icon className="w-6 h-6 text-white/50 group-hover:text-white" /></div>
                          ))}
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center gap-5"><Sun className="w-5 h-5 text-white/70" /><div className="flex-1 h-1.5 bg-white/20 rounded-full relative"><div className="absolute w-4 h-4 bg-white rounded-full -top-1.5 left-3/4 shadow-md" /></div></div>
                          <div className="flex items-center gap-5"><Volume2 className="w-5 h-5 text-white/70" /><div className="flex-1 h-1.5 bg-white/20 rounded-full relative"><div className="absolute w-4 h-4 bg-white rounded-full -top-1.5 left-1/2 shadow-md" /></div></div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 h-[400px] flex flex-col animate-in slide-in-from-right-4 duration-200 overflow-hidden">
                        <div className="flex items-center gap-4 mb-5 pb-3 border-b border-white/10">
                          <button onClick={() => setWifiSubStep("quick-settings")}><ArrowLeft className="w-5 h-5 text-white hover:text-blue-400" /></button>
                          <span className="text-white text-base font-semibold">Wi-Fi</span>
                        </div>
                        <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                          {wifiNetworks.map((n) => (
                            <div key={n.name}>
                              <button 
                                onClick={() => setSelectedNetwork(n.name)}
                                className={cn(
                                  "w-full px-4 py-3.5 rounded-xl flex items-center justify-between text-sm transition-all",
                                  selectedNetwork === n.name ? "bg-blue-600 text-white shadow-md" : "text-white/80 hover:bg-white/10",
                                  n.name === "Campus_WiFi" && !selectedNetwork && "ring-2 ring-yellow-400 animate-pulse border-yellow-400/30"
                                )}
                              >
                                <div className="flex items-center gap-4"><Wifi className="w-5 h-5" />{n.name}</div>
                                <div className="flex items-center gap-2">
                                  {n.secured && <Lock className="w-4 h-4 text-white/50"/>}
                                  <SignalHigh className="w-4 h-4 text-white/50"/>
                                  <ChevronRight className="w-4 h-4 text-white/50" />
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                        {selectedNetwork && wifiSubStep === "wifi-list" && (
                          <div className="pt-4 mt-1 animate-in fade-in slide-in-from-bottom-2">
                             <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-500 shadow-md" onClick={() => setWifiSubStep("password")}>接続せつぞく</Button>
                          </div>
                        )}
                        {wifiSubStep === "password" && (
                           <div className="space-y-4 pt-4 animate-in slide-in-from-right-4">
                              <label className="text-sm text-slate-300 block mb-2">{selectedNetwork} ネットワーク セキュリティ キーを入力してください</label>
                              <Input type="password" placeholder="password123" className="bg-slate-800 border-white/10 text-white h-12 text-base shadow-inner" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} autoFocus />
                              <div className="flex gap-2 justify-end pt-2">
                                <Button variant="ghost" className="text-white" onClick={() => setWifiSubStep("wifi-list")}>キャンセル</Button>
                                <Button className="bg-blue-600 px-8" onClick={handleWifiConnect}>次へ</Button>
                              </div>
                           </div>
                        )}
                      </div>
                    )}
                    <div className="p-4 bg-white/5 text-xs text-white/50 border-t border-white/5 flex justify-between items-center cursor-default">
                      <span>設定せっていネットワークとインターネット</span>
                      <Monitor className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* --- スタートメニュー (Windows 11 純正風) --- */}
                {showStartMenu && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[550px] h-[600px] bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] z-50 p-8 animate-in slide-in-from-bottom-4 duration-300">
                    <Input placeholder="アプリ、設定、ドキュメントの検索" className="bg-black/20 border-white/10 text-white h-11 mb-8 shadow-inner" />
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-white text-sm font-medium">ピン留め済み</span>
                        <Button variant="ghost" className="text-slate-400 text-xs">すべてのアプリ ＞</Button>
                    </div>
                    <div className="grid grid-cols-6 gap-6 mb-16 overflow-hidden">
                      {[Laptop, Wifi, Search, LayoutGrid, Sun, Plane, Bluetooth, Lock, Moon, Save, Volume2, Character].map((Icon, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group">
                              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform"><Icon className="w-8 h-8 text-white"/></div>
                              <div className="w-10 h-1 bg-white/10 rounded"/>
                          </div>
                      ))}
                    </div>
                    {/* 下部領域 */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-black/10 flex justify-between items-center border-t border-white/10 relative">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-500 rounded-full" /><span className="text-white text-sm">ユーザー</span></div>
                      <button onClick={() => setShowPowerMenu(!showPowerMenu)} className={cn("p-2 rounded hover:bg-white/10", step === "shutdown" && "ring-2 ring-yellow-400 animate-pulse")}><Power className="w-6 h-6 text-white" /></button>
                      
                      {/* 電源サブメニュー */}
                      {showPowerMenu && (
                        <div className="absolute right-8 bottom-full mb-3 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-[70] animate-in zoom-in-95">
                          <button onClick={handleShutdown} className="w-full p-4 text-left text-sm text-white hover:bg-blue-600 transition-colors flex items-center gap-3 animate-pulse">
                            <Power className="w-4 h-4 text-white" /> シャットダウン
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* --- 完璧なタスクバー (真ん中に配置) --- */}
              <div className="h-14 bg-slate-900/90 backdrop-blur-md flex items-center px-4 border-t border-white/10 shrink-0 relative z-[70]">
                {/* 1. 左側（システム領域のダミー） */}
                <div className="w-1/3 flex items-center gap-2 text-white/50 text-sm">ウィジェット</div>

                {/* 2. 真ん中（スタートボタン と アプリ） */}
                <div className="w-1/3 flex items-center justify-center gap-1.5 h-full relative">
                  {/* スタートボタン (Windows 11純正風) */}
                  <button 
                    onClick={() => { setShowStartMenu(!showStartMenu); setShowQuickSettings(false); }}
                    className={cn(
                      "h-full px-3 hover:bg-white/5 rounded transition-all",
                      step === "shutdown" && !showStartMenu && "ring-2 ring-yellow-400 animate-pulse border-yellow-400/50"
                    )}
                  >
                    <Windows11Icon />
                  </button>
                  {/* ダミーのアプリアイコン */}
                  {[Search, LayoutGrid, Monitor,Laptop].map((Icon, i) => (
                      <div key={i} className="p-3 hover:bg-white/5 rounded"><Icon className="w-5 h-5 text-white/60"/></div>
                  ))}
                  <div className="absolute bottom-0 left-[20px] w-6 h-0.5 bg-blue-600 rounded-full"/>
                </div>

                {/* 3. 右側（システムトレイ ＝ 合体ボタン） */}
                <div className="w-1/3 flex items-center justify-end gap-1.5">
                  <button 
                    onClick={() => { setShowQuickSettings(!showQuickSettings); setShowStartMenu(false); setWifiSubStep("quick-settings"); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-md transition-all border border-transparent",
                      step === "wifi" && !showQuickSettings && "ring-2 ring-yellow-400 animate-pulse border-yellow-400/50"
                    )}
                  >
                    {wifiConnected ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white/50" />}
                    <Volume2 className="w-5 h-5 text-white" />
                    <Battery className="w-5 h-5 text-white" />
                  </button>
                  <div className="text-[11px] text-white/70 text-right leading-tight px-1 cursor-default tabular-nums">
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
