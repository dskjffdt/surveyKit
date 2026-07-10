// 问卷

export type SurveyStatus = 'draft' | 'published'

export interface Survey {
  id: string
  title: string
  description: string
  status: SurveyStatus
  questions: Question[]
  createdAt: number
  updatedAt: number
}

// 题目

interface QuestionBase {
  id: string
  title: string
  required: boolean
}

export interface SingleQuestion extends QuestionBase {
  type: 'single'
  options: string[]
}

export interface MultipleQuestion extends QuestionBase {
  type: 'multiple'
  options: string[]
}

export interface TextQuestion extends QuestionBase {
  type: 'text'
  placeholder?: string
  multiline?: boolean
}

export interface RatingQuestion extends QuestionBase {
  type: 'rating'
  max: number
}

export type Question = SingleQuestion | MultipleQuestion | TextQuestion | RatingQuestion
export type QuestionType = Question['type']

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  text: '填空题',
  rating: '评分题',
}

// 填答

export type AnswerValue = string | string[] | number
export type AnswerSheet = Record<string, AnswerValue>

export interface SurveyResponse {
  id: string
  surveyId: string
  answers: AnswerSheet
  submittedAt: number
}

// 统计

export type ChoiceStat = {
  type: 'single' | 'multiple'
  stats: { option: string; count: number; percentage: number }[]
  total: number
}

export type TextStat = {
  type: 'text'
  stats: { answers: string[] }
}

export type RatingStat = {
  type: 'rating'
  stats: { average: number; distribution: { value: number; count: number }[] }
}

export type QuestionStat = ChoiceStat | TextStat | RatingStat
