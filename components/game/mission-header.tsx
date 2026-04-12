"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Lock } from "lucide-react"

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
  className?: string
}

export function MissionHeader({ missions, currentMission, className }: MissionHeaderProps) {
  return (
    <div className={cn("w-full bg-card border-b border-border", className)}>
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {missions.map((mission, index) => (
            <div key={mission.id} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap",
                mission.current && "bg-primary text-primary-foreground",
                mission.completed && !mission.current && "text-success",
                !mission.completed && !mission.current && "text-muted-foreground"
              )}>
                {mission.completed ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : mission.current ? (
                  <Circle className="w-5 h-5 flex-shrink-0 fill-primary-foreground/30" />
                ) : (
                  <Lock className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="text-sm font-medium hidden sm:inline">
                  {mission.titleFull || mission.title}
                </span>
                <span className="text-sm font-medium sm:hidden">
                  M{mission.id}
                </span>
              </div>
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
