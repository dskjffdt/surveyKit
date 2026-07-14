import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SurveyFillForm } from '../components/fill/SurveyFillForm'
import { PageGate } from '../components/ui/PageGate'
import {
  hasSubmittedSurvey,
  usePublicSurveyQuery,
  useSubmitResponseMutation,
} from '../queries/surveys'
import type { AnswerSheet } from '../types/question'

export function FillPage() {
  const { id } = useParams<{ id: string }>()
  const surveyQuery = usePublicSurveyQuery(id, Boolean(id))
  const submitResponse = useSubmitResponseMutation()

  const [submitted, setSubmitted] = useState(false)

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

  const handleSubmit = async (answers: AnswerSheet) => {
    if (!survey) return
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
          <SurveyFillForm
            survey={survey}
            onSubmit={handleSubmit}
            submitting={submitResponse.isPending}
          />
        </div>
      )}
    </PageGate>
  )
}
