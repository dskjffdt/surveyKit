import { useState } from 'react'
import { QuestionRenderer } from '../questions/QuestionRenderer'
import { validateAnswer } from '../../services/questionUtils'
import type { AnswerSheet, Question, Survey } from '../../types/question'

type SurveyFillSource = Pick<Survey, 'title' | 'description' | 'questions'>

interface SurveyFillFormProps {
  survey: SurveyFillSource
  preview?: boolean
  showPreviewBanner?: boolean
  onSubmit?: (answers: AnswerSheet) => Promise<void>
  submitting?: boolean
}

export function SurveyFillForm({
  survey,
  preview = false,
  showPreviewBanner = true,
  onSubmit,
  submitting = false,
}: SurveyFillFormProps) {
  const [answers, setAnswers] = useState<AnswerSheet>({})
  const [errors, setErrors] = useState<Set<string>>(new Set())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (preview || !onSubmit) return

    const missing = new Set<string>()
    for (const q of survey.questions) {
      if (!validateAnswer(q as Question, answers[q.id])) missing.add(q.id)
    }
    if (missing.size > 0) {
      setErrors(missing)
      return
    }

    await onSubmit(answers)
  }

  return (
    <>
      {preview && showPreviewBanner && (
        <div className="preview-banner" role="status">
          预览模式 · 可体验填答交互，答卷不会提交
        </div>
      )}

      <header className="fill-header stack">
        {!preview && <span className="back-link">SurveyKit</span>}
        <h1>{survey.title || '未命名问卷'}</h1>
        {survey.description && <p className="subtitle">{survey.description}</p>}
      </header>

      <form className="panel fill-form" onSubmit={handleSubmit}>
        {survey.questions.length === 0 ? (
          <p className="preview-empty">暂无题目，请先在编辑页添加题目</p>
        ) : (
          survey.questions.map((q, i) => (
            <div key={q.id} className={errors.has(q.id) ? 'has-error' : ''}>
              <QuestionRenderer
                question={q as Question}
                mode="fill"
                index={i}
                value={answers[q.id]}
                onChange={(value) => {
                  setAnswers((prev) => ({ ...prev, [q.id]: value }))
                  setErrors((prev) => {
                    const next = new Set(prev)
                    next.delete(q.id)
                    return next
                  })
                }}
              />
              {errors.has(q.id) && <p className="error-msg">此题为必填项</p>}
            </div>
          ))
        )}

        {preview ? null : (
          <button type="submit" className="btn-primary submit-btn" disabled={submitting}>
            {submitting ? '提交中...' : '提交'}
          </button>
        )}
      </form>
    </>
  )
}
