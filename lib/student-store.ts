"use client"

// 学籍番号ベースの学習記録ストア（localStorage 永続化）
// この端末で学習した生徒の記録を保存し、/teacher ページで先生が閲覧できる

export type ActivityType = "start" | "stage_clear" | "lesson_clear" | "test_clear" | "skill_clear"

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
  // ショートカット・パスポート：skillId → 合格日時（ISO）
  skills?: Record<string, string>
  // タイピング計測の記録（1分間の文字数）
  typing?: TypingResult[]
}

export interface TypingResult {
  at: string
  cpm: number // 1分間に正しく打てた文字数
  miss: number
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
  7: "毎日つかう基本ワザ",
  8: "ビジネス文書",
  9: "請求書",
  10: "仕事で困らないパソコン術",
  11: "初めて見るアプリ",
  12: "ウォームアップ",
  13: "タイピング計測",
  14: "PC操作テスト",
}

// 画面に表示するレッスン番号（lessonId 6 はまとめテストのため、新レッスンは id がひとつずれる）
export const LESSON_DISPLAY_NUMBER: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 7: 6, 8: 7, 9: 8, 10: 9, 11: 10,
}

// ホーム・先生用ページでクリア状況を表示するレッスン（表示順）
export const COURSE_LESSON_IDS = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]

// 記録の表示用ラベル（例: "L6 毎日つかう基本ワザ" / "まとめテスト"）
export function lessonLabel(lessonId: number): string {
  const title = LESSON_TITLES[lessonId] ?? `Lesson ${lessonId}`
  const n = LESSON_DISPLAY_NUMBER[lessonId]
  return n ? `L${n} ${title}` : title
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  start: "開始",
  stage_clear: "ステージクリア",
  lesson_clear: "レッスンクリア",
  test_clear: "テスト完了",
  skill_clear: "スキル合格",
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

// スキル合格を記録する。はじめての合格なら true を返す
export function markStudentSkill(id: string, skillId: string): boolean {
  const students = loadStudents()
  const record = students[id]
  if (!record) return false
  record.skills = record.skills ?? {}
  if (record.skills[skillId]) return false
  record.skills[skillId] = new Date().toISOString()
  saveStudents(students)
  return true
}

export function addTypingResult(id: string, result: TypingResult) {
  const students = loadStudents()
  const record = students[id]
  if (!record) return
  record.typing = [...(record.typing ?? []), result].slice(-100)
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
        escape(lessonLabel(ev.lessonId)),
        ACTIVITY_LABELS[ev.type],
        escape(ev.detail ?? ""),
        ev.timeSec != null ? String(ev.timeSec) : "",
        ev.missCount != null ? String(ev.missCount) : "",
      ].join(","))
    }
  }
  return "﻿" + lines.join("\r\n") // 先頭はBOM（Excel文字化け対策）
}
