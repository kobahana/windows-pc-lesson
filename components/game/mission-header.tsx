"use client"

import { cn } from "@/lib/utils"
import { CircleCheck as CheckCircle2, Circle, Zap } from "lucide-react"

interface Mission {
  id: number
  title: string
  titleFull?: React.ReactNode
  completed: boolean
  current: boolean
}

interface MissionHeaderProps {
  missions: Mission[]
  currentMission: number
  onMissionSelect?: (missionId: number) => void
  className?: string
}

export function MissionHeader({ missions, currentMission, onMissionSelect, className }: MissionHeaderProps) {
  return (
    <div className={cn("w-full bg-card border-b border-border", className)}>
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {missions.map((mission, index) => (
            <div key={mission.id} className="flex items-center">
              <button
                onClick={() => onMissionSelect?.(mission.id)}
                title={`ミッション${mission.id}へスキップ`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  onMissionSelect && "hover:opacity-80 active:scale-95 cursor-pointer",
                  mission.current && "bg-primary text-primary-foreground",
                  mission.completed && !mission.current && "text-success hover:bg-success/10",
                  !mission.completed && !mission.current && "text-muted-foreground hover:bg-muted"
                )}
              >
                {mission.completed ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : mission.current ? (
                  <Circle className="w-5 h-5 flex-shrink-0 fill-primary-foreground/30" />
                ) : (
                  <Zap className="w-4 h-4 flex-shrink-0 opacity-50" />
                )}
                <span className="text-sm font-medium hidden sm:inline">
                  {mission.titleFull || mission.title}
                </span>
                <span className="text-xs font-medium sm:hidden">
                  {mission.title}
                </span>
              </button>
              {index < missions.length - 1 && (
                <div className={cn(
                  "w-6 md:w-12 h-0.5 mx-1",
                  mission.completed ? "bg-success" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
