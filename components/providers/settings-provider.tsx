"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SettingsContextType {
  showRuby: boolean;
  setShowRuby: (value: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  completedLessons: number[];
  markLessonCompleted: (lessonId: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showRuby, setShowRuby] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true)
    const storedRuby = localStorage.getItem("setting_showRuby")
    if (storedRuby !== null) setShowRuby(storedRuby === "true")

    const storedSound = localStorage.getItem("setting_soundEnabled")
    if (storedSound !== null) setSoundEnabled(storedSound === "true")

    const storedLessons = localStorage.getItem("setting_completedLessons")
    if (storedLessons !== null) {
      try {
        setCompletedLessons(JSON.parse(storedLessons))
      } catch (e) {
        console.error("Failed to parse completed lessons", e)
      }
    }
  }, [])

  // Save to localStorage when state changes (only after mount)
  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem("setting_showRuby", showRuby.toString())
  }, [showRuby, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem("setting_soundEnabled", soundEnabled.toString())
  }, [soundEnabled, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem("setting_completedLessons", JSON.stringify(completedLessons))
  }, [completedLessons, isMounted])

  const markLessonCompleted = (lessonId: number) => {
    setCompletedLessons((prev) => {
      if (prev.includes(lessonId)) return prev
      return [...prev, lessonId]
    })
  }

  return (
    <SettingsContext.Provider value={{
      showRuby,
      setShowRuby,
      soundEnabled,
      setSoundEnabled,
      completedLessons,
      markLessonCompleted
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
