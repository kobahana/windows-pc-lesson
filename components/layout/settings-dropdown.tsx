"use client"

import React from "react"
import Link from "next/link"
import { Settings, Volume2, VolumeX, Type, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "../providers/settings-provider"

export function SettingsDropdown() {
  const { showRuby, setShowRuby, soundEnabled, setSoundEnabled } = useSettings()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800">
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
        <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          設定
        </div>
        
        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Type className="w-4 h-4 text-primary" />
            <span>ふりがなを表示</span>
          </div>
          <Switch 
            checked={showRuby} 
            onCheckedChange={setShowRuby}
          />
        </div>

        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span>効果音（SE）</span>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
        </div>

        <div className="mt-1 pt-1 border-t border-slate-100">
          <Link
            href="/teacher"
            className="flex items-center gap-2 p-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            <span>先生用ページ（学習記録）</span>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
