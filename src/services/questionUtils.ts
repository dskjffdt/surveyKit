import type { AnswerValue, Question, QuestionStat, QuestionType, SurveyResponse } from '../types/question'

function newBase() {
  return { id: crypto.randomUUID(), title: '', required: false }
}

export function createDefaultQuestion(type: QuestionType): Question {
  switch (type) {
    case 'single':
      return { ...newBase(), type: 'single', options: ['选项 1', '选项 2'] }
    case 'multiple':
      return { ...newBase(), type: 'multiple', options: ['选项 1', '选项 2'] }
    case 'text':
      return { ...newBase(), type: 'text', placeholder: '请输入', multiline: false }
    case 'rating':
      return { ...newBase(), type: 'rating', max: 5 }
    default: {
      const _exhaustive: never = type
      return _exhaustive
    }
  }
}

export function validateAnswer(question: Question, value: AnswerValue | undefined): boolean {
  if (!question.required) return true
  switch (question.type) {
    case 'single':
    case 'text':
      return typeof value === 'string' && value.trim().length > 0
    case 'multiple':
      return Array.isArray(value) && value.length > 0
    case 'rating':
      return typeof value === 'number' && value > 0
    default: {
      const _exhaustive: never = question
      return _exhaustive
    }
  }
}

export function aggregateStats(question: Question, responses: SurveyResponse[]): QuestionStat {
  const answers = responses
    .map((r) => r.answers[question.id])
    .filter((a): a is AnswerValue => a !== undefined)

  switch (question.type) {
    case 'single':
    case 'multiple': {
      const total = answers.length
      const stats = question.options.map((option) => {
        const count =
          question.type === 'single'
            ? answers.filter((a) => a === option).length
            : answers.filter((a) => Array.isArray(a) && a.includes(option)).length
        return {
          option,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }
      })
      return { type: question.type, stats, total }
    }
    case 'text':
      return {
        type: 'text',
        stats: { answers: answers.filter((a): a is string => typeof a === 'string' && Boolean(a)) },
      }
    case 'rating': {
      const valid = answers.filter((a): a is number => typeof a === 'number' && a > 0)
      const total = valid.length
      const sum = valid.reduce((acc, v) => acc + v, 0)
      const distribution = Array.from({ length: question.max }, (_, i) => {
        const value = i + 1
        return { value, count: valid.filter((a) => a === value).length }
      })
      return {
        type: 'rating',
        stats: {
          average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
          distribution,
        },
      }
    }
    default: {
      const _exhaustive: never = question
      return _exhaustive
    }
  }
}

export function exportResponsesCSV(questions: Question[], responses: SurveyResponse[]): string {
  const headers = ['提交时间', ...questions.map((q) => q.title)]
  const rows = responses.map((r) => {
    const time = new Date(r.submittedAt).toLocaleString('zh-CN')
    const cells = questions.map((q) => formatCSVCell(q, r.answers[q.id]))
    return [time, ...cells]
  })
  return [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n')
}

function formatCSVCell(question: Question, value: AnswerValue | undefined): string {
  switch (question.type) {
    case 'single':
    case 'text':
      return typeof value === 'string' ? value : ''
    case 'multiple':
      return Array.isArray(value) ? value.join('; ') : ''
    case 'rating':
      return typeof value === 'number' ? String(value) : ''
    default: {
      const _exhaustive: never = question
      return _exhaustive
    }
  }
}

function escapeCSV(cell: string): string {
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`
  }
  return cell
}
