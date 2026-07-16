"use client"

// 学籍番号ベースの学習記録ストア（localStorage 永続化）
// この端末で学習した生徒の記録を保存し、/teacher ページで先生が閲覧できる

export type ActivityType = "start" | "stage_clear" | "lesson_clear" | "test_clear"

export interface ActivityEvent {
  at: string // ISO 8601
  lessonId: number
  type: ActivityType
  detail?: string
  timeSec?: number
  missCount?: number
}

export interface StudentRecord {
  id: string // 学籍番号
  name?: string
  createdAt: string
  lastActiveAt: string
  completedLessons: number[]
  activity: ActivityEvent[]
}

const STUDENTS_KEY = "pclesson_students_v1"
const CURRENT_KEY = "pclesson_current_student_v1"
const MAX_ACTIVITY = 1000

export const LESSON_TITLES: Record<number, string> = {
  1: "Windowsの基本操作",
  2: "ホームポジション",
  3: "ローマ字入力",
  4: "漢字変換",
  5: "ビジネス日本語",
  6: "まとめテスト",
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  start: "開始",
  stage_clear: "ステージクリア",
  lesson_clear: "レッスンクリア",
  test_clear: "テスト完了",
}

export function loadStudents(): Record<string, StudentRecord> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STUDENTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStudents(students: Record<string, StudentRecord>) {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students))
  } catch (e) {
    console.error("Failed to save students", e)
  }
}

export function getCurrentStudentId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CURRENT_KEY)
}

export function setCurrentStudentId(id: string | null) {
  if (id === null) {
    localStorage.removeItem(CURRENT_KEY)
  } else {
    localStorage.setItem(CURRENT_KEY, id)
  }
}

export function upsertStudent(id: string, name?: string): StudentRecord {
  const students = loadStudents()
  const now = new Date().toISOString()
  const existing = students[id]
  const record: StudentRecord = existing
    ? { ...existing, name: name || existing.name, lastActiveAt: now }
    : { id, name, createdAt: now, lastActiveAt: now, completedLessons: [], activity: [] }
  students[id] = record
  saveStudents(students)
  return record
}

export function getStudent(id: string): StudentRecord | null {
  return loadStudents()[id] ?? null
}

export function appendActivity(id: string, event: Omit<ActivityEvent, "at">) {
  const students = loadStudents()
  const record = students[id]
  if (!record) return
  const now = new Date().toISOString()
  record.activity.push({ ...event, at: now })
  if (record.activity.length > MAX_ACTIVITY) {
    record.activity = record.activity.slice(-MAX_ACTIVITY)
  }
  record.lastActiveAt = now
  saveStudents(students)
}

export function markStudentLessonCompleted(id: string, lessonId: number) {
  const students = loadStudents()
  const record = students[id]
  if (!record) return
  if (!record.completedLessons.includes(lessonId)) {
    record.completedLessons.push(lessonId)
  }
  record.lastActiveAt = new Date().toISOString()
  saveStudents(students)
}

export function deleteStudent(id: string) {
  const students = loadStudents()
  delete students[id]
  saveStudents(students)
  if (getCurrentStudentId() === id) setCurrentStudentId(null)
}

// ローカル時刻での "YYYY-MM-DD"
export function localDateKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return localDateKey(new Date().toISOString())
}

// 全活動履歴を Excel で開ける CSV に変換（BOM 付き）
export function activityToCsv(students: Record<string, StudentRecord>): string {
  const header = ["学籍番号", "名前", "日付", "時刻", "レッスン", "記録", "詳細", "時間(秒)", "ミス回数"]
  const lines = [header.join(",")]
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  for (const record of Object.values(students)) {
    for (const ev of record.activity) {
      const d = new Date(ev.at)
      lines.push([
        escape(record.id),
        escape(record.name ?? ""),
        localDateKey(ev.at),
        d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
        escape(LESSON_TITLES[ev.lessonId] ?? `Lesson ${ev.lessonId}`),
        ACTIVITY_LABELS[ev.type],
        escape(ev.detail ?? ""),
        ev.timeSec != null ? String(ev.timeSec) : "",
        ev.missCount != null ? String(ev.missCount) : "",
      ].join(","))
    }
  }
  return "﻿" + lines.join("\r\n") // 先頭はBOM（Excel文字化け対策）
}
