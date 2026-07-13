import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatsResult } from '../components/stats/StatsResult'
import { PageGate } from '../components/ui/PageGate'
import { aggregateStats, exportResponsesCSV } from '../services/questionUtils'
import { useSurveyQuery, useSurveyResponsesQuery } from '../queries/surveys'
import { useAuthStore } from '../store/authStore'

const EMPTY_RESPONSES: never[] = []

export function StatsPage() {
  const { id } = useParams<{ id: string }>()
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin')
  const ready = useAuthStore((s) => s.ready)
  const surveyQuery = useSurveyQuery(id, ready)
  const responsesQuery = useSurveyResponsesQuery(id, ready)

  const survey = surveyQuery.data
  const responses = responsesQuery.data ?? EMPTY_RESPONSES

  const questionStats = useMemo(() => {
    if (!survey) return []
    return survey.questions.map((question) => ({
      question,
      stat: aggregateStats(question, responses),
    }))
  }, [survey, responses])

  const pending = !ready || surveyQuery.isPending || responsesQuery.isPending
  const error =
    (surveyQuery.error instanceof Error ? surveyQuery.error.message : undefined) ??
    (responsesQuery.error instanceof Error ? responsesQuery.error.message : undefined)

  const handleRetry = () => {
    void surveyQuery.refetch()
    void responsesQuery.refetch()
  }

  if (!id) {
    return (
      <div className="page">
        <p>问卷不存在</p>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  if (ready && !pending && !error && !survey) {
    return (
      <div className="page">
        <p>问卷不存在</p>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  const handleExport = () => {
    if (!survey) return
    const csv = exportResponsesCSV(survey.questions, responses)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${survey.title}-答卷.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageGate pending={pending} error={error} onRetry={handleRetry}>
      {survey && (
        <div className="page">
          <header className="page-header">
            <div className="stack">
              <Link to="/" className="back-link">
                ← 返回
              </Link>
              <h1>{survey.title}</h1>
              <p className="subtitle">共 {responses.length} 份答卷</p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExport}
              disabled={responses.length === 0}
            >
              导出 CSV
            </button>
          </header>

          {responses.length === 0 ? (
            <div className="empty-state">
              <p>暂无答卷</p>
              {!isAdmin && (
                <Link to={`/fill/${id}`} className="btn-secondary" target="_blank">
                  打开填答页
                </Link>
              )}
            </div>
          ) : (
            <div className="stats-list">
              {questionStats.map(({ question, stat }, i) => (
                <section key={question.id} className="panel">
                  <h2 className="stats-title">
                    {i + 1}. {question.title}
                  </h2>
                  <StatsResult stat={stat} responseCount={responses.length} />
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </PageGate>
  )
}
