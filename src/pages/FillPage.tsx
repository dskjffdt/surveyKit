import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { QuestionRenderer } from '../components/questions/QuestionRenderer'
import { PageGate } from '../components/ui/PageGate'
import { validateAnswer } from '../services/questionUtils'
import {
  hasSubmittedSurvey,
  usePublicSurveyQuery,
  useSubmitResponseMutation,
} from '../queries/surveys'
import type { AnswerSheet, Question } from '../types/question'

export function FillPage() {
  const { id } = useParams<{ id: string }>()
  const surveyQuery = usePublicSurveyQuery(id, Boolean(id))
  const submitResponse = useSubmitResponseMutation()

  const [answers, setAnswers] = useState<AnswerSheet>({})
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  const survey = surveyQuery.data
  const pending = surveyQuery.isPending
  const error = surveyQuery.error instanceof Error ? surveyQuery.error.message : undefined

  if (!id) {
    return (
      <div className="page">
        <p>问卷不存在</p>
      </div>
    )
  }

  if (!pending && !error && survey && (hasSubmittedSurvey(id) || submitted)) {
    return (
      <div className="page">
        <div className="panel panel-center">
          <h2>提交成功</h2>
          <p className="subtitle">感谢您的参与</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!survey) return
    const missing = new Set<string>()
    for (const q of survey.questions) {
      if (!validateAnswer(q as Question, answers[q.id])) missing.add(q.id)
    }
    if (missing.size > 0) {
      setErrors(missing)
      return
    }

    try {
      await submitResponse.mutateAsync({ surveyId: id, answers })
      setSubmitted(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败')
    }
  }

  return (
    <PageGate pending={pending} error={error} onRetry={() => surveyQuery.refetch()}>
      {survey && (
        <div className="page">
          <header className="fill-header stack">
            <span className="back-link">SurveyKit</span>
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
            ))}

            <button
              type="submit"
              className="btn-primary submit-btn"
              disabled={submitResponse.isPending}
            >
              {submitResponse.isPending ? '提交中...' : '提交'}
            </button>
          </form>
        </div>
      )}
    </PageGate>
  )
}
