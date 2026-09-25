"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { sounds } from "@/lib/sounds"
import {
  type ActivityType,
  appendActivity,
  getCurrentStudentId,
  getStudent,
  markStudentLessonCompleted,
  markStudentSkill,
  setCurrentStudentId,
  upsertStudent,
} from "@/lib/student-store"
import { SKILL_BY_ID } from "@/lib/skills"
import { buildSheetRow, flushSheetQueue, flushWithBeacon, migrateQueueV1ToV2, queueSheetRow } from "@/lib/sheet-sync"

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
  // ショートカット・パスポート（skillId → 合格日時）
  skills: Record<string, string>;
  // スキル合格を記録する。はじめての合格なら true（スタンプ演出に使う）
  markSkill: (skillId: string, lessonId: number) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// 15分間操作がなければ自動ログアウト（次のクラスの生徒に前の生徒のログインが残らないように）
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000
const LAST_ACTIVITY_KEY = "pclesson_last_activity_v1"
// 未ログイン（ゲスト）時のスキル記録
const GUEST_SKILLS_KEY = "pclesson_guest_skills_v1"

function loadGuestSkills(): Record<string, string> {
  try {
    const raw = localStorage.getItem(GUEST_SKILLS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showRuby, setShowRuby] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [skills, setSkills] = useState<Record<string, string>>({})
  const [isMounted, setIsMounted] = useState(false)

  // 旧キュー（v1）からの移行 + 前回送信できなかった学習記録があれば再送する
  useEffect(() => {
    migrateQueueV1ToV2()
    void flushSheetQueue()
  }, [])

  // ページ離脱・タブ切り替え時に未送信データを sendBeacon で送信する
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushWithBeacon()
      }
    }
    const handleBeforeUnload = () => {
      flushWithBeacon()
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
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
          setSkills(record.skills ?? {})
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
    setSkills(loadGuestSkills())
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
    setSkills(record.skills ?? {})
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
    setSkills(loadGuestSkills())
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

  const markSkill = useCallback((skillId: string, lessonId: number) => {
    if (skills[skillId]) return false
    const now = new Date().toISOString()
    setSkills((prev) => (prev[skillId] ? prev : { ...prev, [skillId]: now }))
    if (student) {
      const isNew = markStudentSkill(student.id, skillId)
      if (isNew) recordEvent(lessonId, "skill_clear", SKILL_BY_ID[skillId]?.label ?? skillId)
    } else {
      try {
        const guest = loadGuestSkills()
        guest[skillId] = now
        localStorage.setItem(GUEST_SKILLS_KEY, JSON.stringify(guest))
      } catch {
        // 保存できなくても続行
      }
    }
    return true
  }, [skills, student, recordEvent])

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
      recordEvent,
      skills,
      markSkill,
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
