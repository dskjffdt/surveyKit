import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QuestionRenderer } from '../components/questions/QuestionRenderer'
import { validateAnswer } from '../services/questionUtils'
import { useSurveyStore } from '../store/surveyStore'
import type { AnswerSheet } from '../types/question'

export function FillPage() {
  const { id } = useParams<{ id: string }>()
  const survey = useSurveyStore((s) => s.surveys.find((sv) => sv.id === id))
  const submitResponse = useSurveyStore((s) => s.submitResponse)
  const hasSubmitted = useSurveyStore((s) => s.hasSubmitted)

  const [answers, setAnswers] = useState<AnswerSheet>({})
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  if (!id || !survey) {
    return (
      <div className="page">
        <p>问卷不存在</p>
      </div>
    )
  }

  if (survey.status !== 'published') {
    return (
      <div className="page">
        <p>该问卷尚未发布</p>
      </div>
    )
  }

  if (hasSubmitted(id) || submitted) {
    return (
      <div className="page">
        <div className="panel panel-center">
          <h2>提交成功</h2>
          <p className="subtitle">感谢您的参与</p>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    const missing = new Set<string>()
    for (const q of survey.questions) {
      if (!validateAnswer(q, answers[q.id])) missing.add(q.id)
    }
    if (missing.size > 0) {
      setErrors(missing)
      return
    }

    setSubmitting(true)
    const result = submitResponse(id, answers)
    setSubmitting(false)
    if (result) setSubmitted(true)
    else alert('提交失败，请重试')
  }

  return (
    <div className="page">
      <header className="fill-header stack">
        <Link to="/" className="back-link">SurveyKit</Link>
        <h1>{survey.title}</h1>
        {survey.description && <p className="subtitle">{survey.description}</p>}
      </header>

      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        {survey.questions.map((q, i) => (
          <div key={q.id} className={errors.has(q.id) ? 'has-error' : ''}>
            <QuestionRenderer
              question={q}
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
        ))}

        <button type="submit" className="btn-primary submit-btn" disabled={submitting}>
          {submitting ? '提交中...' : '提交'}
        </button>
      </form>
    </div>
  )
}
