"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Settings, Volume2, VolumeX, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsDropdown } from "./settings-dropdown"

interface LessonHeaderProps {
  children?: React.ReactNode
}

export function LessonHeader({ children }: LessonHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 shrink-0 shadow-sm z-50">
      <div className="w-24 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-3.5 h-3.5" /> もどる
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex justify-center items-center overflow-x-auto px-2">
        {children}
      </div>

      <div className="w-24 flex items-center justify-end">
        <SettingsDropdown />
      </div>
    </header>
  )
}
