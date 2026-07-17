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
import { buildSheetRow, flushSheetQueue, queueSheetRow } from "@/lib/sheet-sync"

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

// 15分間操作がなければ自動ログアウト（次のクラスの生徒に前の生徒のログインが残らないように）
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000
const LAST_ACTIVITY_KEY = "pclesson_last_activity_v1"

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showRuby, setShowRuby] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // 前回送信できなかった学習記録があれば再送する
  useEffect(() => {
    void flushSheetQueue()
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    const storedRuby = localStorage.getItem("setting_showRuby")
    if (storedRuby !== null) setShowRuby(storedRuby === "true")

    const storedSound = localStorage.getItem("setting_soundEnabled")
    if (storedSound !== null) setSoundEnabled(storedSound === "true")

    // ログイン中の生徒がいればその生徒の進捗、いなければ従来のグローバル進捗
    const currentId = getCurrentStudentId()
    if (currentId) {
      // 15分以上操作がなければ、前の生徒を自動ログアウトしてログイン画面に戻す
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0)
      const expired = !lastActivity || Date.now() - lastActivity > INACTIVITY_LIMIT_MS
      if (expired) {
        setCurrentStudentId(null)
      } else {
        const record = getStudent(currentId)
        if (record) {
          setStudent({ id: record.id, name: record.name })
          setCompletedLessons(record.completedLessons)
          setIsMounted(true)
          return
        }
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

  // 操作のたびに時刻を記録（30秒に1回まで。15分無操作の判定に使う）
  useEffect(() => {
    let lastWrite = 0
    const touch = () => {
      const now = Date.now()
      if (now - lastWrite < 30000) return
      lastWrite = now
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now))
      } catch {
        // 保存できなくても動作は続行
      }
    }
    window.addEventListener("pointerdown", touch)
    window.addEventListener("keydown", touch)
    return () => {
      window.removeEventListener("pointerdown", touch)
      window.removeEventListener("keydown", touch)
    }
  }, [])

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

  // ログイン中、15分間操作がなければ自動的にログアウトする
  useEffect(() => {
    if (!student) return
    const timer = setInterval(() => {
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0)
      if (!lastActivity || Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
        logout()
      }
    }, 60000)
    return () => clearInterval(timer)
  }, [student, logout])

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
    const event = { lessonId, type, detail, ...extra, at: new Date().toISOString() }
    appendActivity(student.id, event)
    // 先生のスプレッドシートにも送信（未設定なら何もしない）
    queueSheetRow(buildSheetRow(student.id, student.name, event))
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
