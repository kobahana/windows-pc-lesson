"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { MissionHeader } from "./mission-header"
import { Mission1 } from "./missions/mission-1"
import { Mission2 } from "./missions/mission-2"
import { Mission3 } from "./missions/mission-3"
import { Mission4 } from "./missions/mission-4"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy } from "lucide-react"
import { Ruby } from "./character"
import { LessonHeader } from "@/components/layout/lesson-header"
import { useSettings } from "../providers/settings-provider"
import { sounds } from "@/lib/sounds"
import Link from "next/link"

export function GameContainer() {
  const [currentMission, setCurrentMission] = useState(1)
  const [completedMissions, setCompletedMissions] = useState<number[]>([])
  const [gameComplete, setGameComplete] = useState(false)
  const { markLessonCompleted } = useSettings()

  const missions = useMemo(() => [
    { id: 1, title: "タッチパッド", titleFull: <>タッチパッドと<Ruby rt="がめん">画面</Ruby>の<Ruby rt="だいぼうけん">大冒険</Ruby></>, completed: completedMissions.includes(1), current: currentMission === 1 },
    { id: 2, title: "タイピング", titleFull: <>タイピングと<Ruby rt="まほう">魔法</Ruby>のキー</>, completed: completedMissions.includes(2), current: currentMission === 2 },
    { id: 3, title: "記号", titleFull: <>キーボードの<Ruby rt="ひみつ">秘密</Ruby>を<Ruby rt="と">解</Ruby>き<Ruby rt="あか">明</Ruby>かせ</>, completed: completedMissions.includes(3), current: currentMission === 3 },
    { id: 4, title: "Wi-Fi・保存", titleFull: <>Windowsの<Ruby rt="ひっす">必須</Ruby>スキルをマスター</>, completed: completedMissions.includes(4), current: currentMission === 4 },
  ], [completedMissions, currentMission])

  const handleMissionComplete = useCallback((missionId: number) => {
    setCompletedMissions(prev => prev.includes(missionId) ? prev : [...prev, missionId])
    sounds?.playSuccess()
    if (missionId < 4) {
      setCurrentMission(missionId + 1)
    } else {
      sounds?.playClear()
      setGameComplete(true)
      markLessonCompleted(1)
    }
  }, [markLessonCompleted])

  const handleMissionSelect = useCallback((missionId: number) => {
    sounds?.playClick()
    setCurrentMission(missionId)
    setGameComplete(false)
  }, [])

  const handleRestart = useCallback(() => {
    sounds?.playClick()
    setCurrentMission(1)
    setCompletedMissions([])
    setGameComplete(false)
  }, [])

  // Wrapped complete handlers to keep them stable for mission components
  const onMission1Complete = useCallback(() => handleMissionComplete(1), [handleMissionComplete])
  const onMission2Complete = useCallback(() => handleMissionComplete(2), [handleMissionComplete])
  const onMission3Complete = useCallback(() => handleMissionComplete(3), [handleMissionComplete])
  const onMission4Complete = useCallback(() => handleMissionComplete(4), [handleMissionComplete])

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LessonHeader>
          <div className="flex-1 w-full max-w-xl">
            <MissionHeader missions={missions} currentMission={currentMission} onMissionSelect={handleMissionSelect} />
          </div>
        </LessonHeader>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl animate-bounce-subtle">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">おめでとう！</h1>
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
      <LessonHeader>
        <div className="flex-1 w-full max-w-xl">
          <MissionHeader missions={missions} currentMission={currentMission} onMissionSelect={handleMissionSelect} />
        </div>
      </LessonHeader>

      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {currentMission === 1 && (
          <Mission1 onComplete={onMission1Complete} />
        )}
        {currentMission === 2 && (
          <Mission2 onComplete={onMission2Complete} />
        )}
        {currentMission === 3 && (
          <Mission3 onComplete={onMission3Complete} />
        )}
        {currentMission === 4 && (
          <Mission4 onComplete={onMission4Complete} />
        )}
      </main>
    </div>
  )
}
