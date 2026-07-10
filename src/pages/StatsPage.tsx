import { Link, useParams } from 'react-router-dom'
import { StatsResult } from '../components/stats/StatsResult'
import { aggregateStats, exportResponsesCSV } from '../services/questionUtils'
import { useSurveyStore } from '../store/surveyStore'

export function StatsPage() {
  const { id } = useParams<{ id: string }>()
  const survey = useSurveyStore((s) => s.surveys.find((sv) => sv.id === id))
  const responses = useSurveyStore((s) => (id ? s.getResponses(id) : []))

  if (!id || !survey) {
    return (
      <div className="page">
        <p>问卷不存在</p>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  const handleExport = () => {
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
    <div className="page">
      <header className="page-header">
        <div className="stack">
          <Link to="/" className="back-link">← 返回</Link>
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
          <Link to={`/fill/${id}`} className="btn-secondary" target="_blank">
            打开填答页
          </Link>
        </div>
      ) : (
        <div className="stats-list">
          {survey.questions.map((q, i) => (
            <section key={q.id} className="panel">
              <h2 className="stats-title">
                {i + 1}. {q.title}
              </h2>
              <StatsResult stat={aggregateStats(q, responses)} responseCount={responses.length} />
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
