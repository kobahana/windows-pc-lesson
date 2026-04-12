"use client"

import { useState } from "react"
import { MissionHeader } from "./mission-header"
import { Mission1 } from "./missions/mission-1"
import { Mission2 } from "./missions/mission-2"
import { Mission3 } from "./missions/mission-3"
import { Mission4 } from "./missions/mission-4"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy } from "lucide-react"
import { Ruby } from "./character"

export function GameContainer() {
  const [currentMission, setCurrentMission] = useState(1)
  const [completedMissions, setCompletedMissions] = useState<number[]>([])
  const [gameComplete, setGameComplete] = useState(false)

  const missions = [
    { id: 1, title: "タッチパッドと画面", titleFull: <>タッチパッドと<Ruby rt="がめん">画面</Ruby>の<Ruby rt="だいぼうけん">大冒険</Ruby></>, completed: completedMissions.includes(1), current: currentMission === 1 },
    { id: 2, title: "タイピングと変換", titleFull: <>タイピングと<Ruby rt="まほう">魔法</Ruby>のキー</>, completed: completedMissions.includes(2), current: currentMission === 2 },
    { id: 3, title: "キーボードの秘密", titleFull: <>キーボードの<Ruby rt="ひみつ">秘密</Ruby>を<Ruby rt="と">解</Ruby>き<Ruby rt="あか">明</Ruby>かせ</>, completed: completedMissions.includes(3), current: currentMission === 3 },
    { id: 4, title: "必須スキル", titleFull: <>Windowsの<Ruby rt="ひっす">必須</Ruby>スキルをマスター</>, completed: completedMissions.includes(4), current: currentMission === 4 },
  ]

  const handleMissionComplete = (missionId: number) => {
    setCompletedMissions(prev => prev.includes(missionId) ? prev : [...prev, missionId])
    if (missionId < 4) {
      setCurrentMission(missionId + 1)
    } else {
      setGameComplete(true)
    }
  }

  const handleMissionSelect = (missionId: number) => {
    setCurrentMission(missionId)
    setGameComplete(false)
  }

  const handleRestart = () => {
    setCurrentMission(1)
    setCompletedMissions([])
    setGameComplete(false)
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MissionHeader missions={missions} currentMission={currentMission} onMissionSelect={handleMissionSelect} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl animate-bounce-subtle">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              おめでとう！
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              <Ruby rt="ぜん">全</Ruby>てのミッションをクリアしました！
              <br />
              パソコンの<Ruby rt="きほん">基本</Ruby>をマスターしたね！
            </p>
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h2 className="font-bold text-lg mb-4 text-card-foreground"><Ruby rt="まな">学</Ruby>んだこと：</h2>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm">✓</span>
                    タッチパッドの<Ruby rt="つか">使</Ruby>い<Ruby rt="かた">方</Ruby>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm">✓</span>
                    <Ruby rt="にほんご">日本語</Ruby><Ruby rt="にゅうりょく">入力</Ruby>と<Ruby rt="へんかん">変換</Ruby>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm">✓</span>
                    キーボードの<Ruby rt="きごう">記号</Ruby><Ruby rt="にゅうりょく">入力</Ruby>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-success-foreground text-sm">✓</span>
                    Wi-Fi<Ruby rt="せつぞく">接続</Ruby>と<Ruby rt="ほぞん">保存</Ruby>
                  </li>
                </ul>
              </div>
              <Button onClick={handleRestart} size="lg" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                もう<Ruby rt="いちど">一度</Ruby><Ruby rt="ちょうせん">挑戦</Ruby>する
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <MissionHeader missions={missions} currentMission={currentMission} onMissionSelect={handleMissionSelect} />
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {currentMission === 1 && (
          <Mission1 onComplete={() => handleMissionComplete(1)} />
        )}
        {currentMission === 2 && (
          <Mission2 onComplete={() => handleMissionComplete(2)} />
        )}
        {currentMission === 3 && (
          <Mission3 onComplete={() => handleMissionComplete(3)} />
        )}
        {currentMission === 4 && (
          <Mission4 onComplete={() => handleMissionComplete(4)} />
        )}
      </main>
    </div>
  )
}
