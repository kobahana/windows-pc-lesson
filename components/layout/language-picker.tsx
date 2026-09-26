"use client"

import { Languages } from "lucide-react"
import { useSettings } from "@/components/providers/settings-provider"
import { Ruby } from "@/components/game/character"
import { LANGUAGES, T } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// 補助の言語をえらぶボタンの列。その言語での名前を出す（自分の言語を見つけやすいように）
export function LanguagePicker({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { lang, setLang } = useSettings()
  return (
    <div className={cn("space-y-2", className)}>
      {!compact && (
        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
          <Languages className="w-4 h-4" />
          <span>せつめいの<Ruby rt="げんご">言語</Ruby> / <T>Language</T></span>
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            title={l.ja}
            aria-pressed={lang === l.code}
            onClick={() => setLang(l.code)}
            className={cn(
              "rounded-full border-2 font-bold transition-colors",
              compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
              lang === l.code
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50",
            )}
          >
            {l.name}
          </button>
        ))}
      </div>
    </div>
  )
}
