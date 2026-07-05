"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { sounds } from "@/lib/sounds"
import {
  type ActivityType,
  appendActivity,
  getCurrentStudentId,
  getStudent,
  markStudentLessonCompleted,
  setCurrentStudentId,
  upsertStudent,
} from "@/lib/student-store"

interface StudentInfo {
  id: string
  name?: string
}

interface SettingsContextType {
  ready: boolean;
  showRuby: boolean;
  setShowRuby: (value: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
  completedLessons: number[];
  markLessonCompleted: (lessonId: number) => void;
  student: StudentInfo | null;
  login: (id: string, name?: string) => void;
  logout: () => void;
  recordEvent: (lessonId: number, type: ActivityType, detail?: string, extra?: { timeSec?: number; missCount?: number }) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showRuby, setShowRuby] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const storedRuby = localStorage.getItem("setting_showRuby")
    if (storedRuby !== null) setShowRuby(storedRuby === "true")

    const storedSound = localStorage.getItem("setting_soundEnabled")
    if (storedSound !== null) setSoundEnabled(storedSound === "true")

    // ログイン中の生徒がいればその生徒の進捗、いなければ従来のグローバル進捗
    const currentId = getCurrentStudentId()
    if (currentId) {
      const record = getStudent(currentId)
      if (record) {
        setStudent({ id: record.id, name: record.name })
        setCompletedLessons(record.completedLessons)
        setIsMounted(true)
        return
      }
    }

    const storedLessons = localStorage.getItem("setting_completedLessons")
    if (storedLessons !== null) {
      try {
        setCompletedLessons(JSON.parse(storedLessons))
      } catch (e) {
        console.error("Failed to parse completed lessons", e)
      }
    }
    setIsMounted(true)
  }, [])

  // Save to localStorage when state changes (only after mount)
  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem("setting_showRuby", showRuby.toString())
  }, [showRuby, isMounted])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem("setting_soundEnabled", soundEnabled.toString())
    // SEトグルを実際のサウンドシステムへ反映
    sounds?.setEnabled(soundEnabled)
  }, [soundEnabled, isMounted])

  const login = useCallback((id: string, name?: string) => {
    const trimmedId = id.trim()
    if (!trimmedId) return
    const record = upsertStudent(trimmedId, name?.trim() || undefined)
    setCurrentStudentId(trimmedId)
    setStudent({ id: record.id, name: record.name })
    setCompletedLessons(record.completedLessons)
  }, [])

  const logout = useCallback(() => {
    setCurrentStudentId(null)
    setStudent(null)
    // ゲスト用（従来）の進捗に戻す
    try {
      const stored = localStorage.getItem("setting_completedLessons")
      setCompletedLessons(stored ? JSON.parse(stored) : [])
    } catch {
      setCompletedLessons([])
    }
  }, [])

  const markLessonCompleted = useCallback((lessonId: number) => {
    setCompletedLessons((prev) => {
      if (prev.includes(lessonId)) return prev
      return [...prev, lessonId]
    })
    if (student) {
      markStudentLessonCompleted(student.id, lessonId)
    } else {
      // 未ログイン時は従来のグローバル保存
      try {
        const stored = localStorage.getItem("setting_completedLessons")
        const list: number[] = stored ? JSON.parse(stored) : []
        if (!list.includes(lessonId)) {
          list.push(lessonId)
          localStorage.setItem("setting_completedLessons", JSON.stringify(list))
        }
      } catch (e) {
        console.error("Failed to save completed lessons", e)
      }
    }
  }, [student])

  const recordEvent = useCallback((lessonId: number, type: ActivityType, detail?: string, extra?: { timeSec?: number; missCount?: number }) => {
    if (!student) return
    appendActivity(student.id, { lessonId, type, detail, ...extra })
  }, [student])

  return (
    <SettingsContext.Provider value={{
      ready: isMounted,
      showRuby,
      setShowRuby,
      soundEnabled,
      setSoundEnabled,
      completedLessons,
      markLessonCompleted,
      student,
      login,
      logout,
      recordEvent
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
