import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSurveysQuery } from '../queries/surveys'

const OVERVIEW_TONES = ['blue', 'green', 'amber', 'violet'] as const

export function AdminDashboardPage() {
  const { data: surveys = [] } = useSurveysQuery()

  const overview = useMemo(() => {
    const published = surveys.filter((s) => s.status === 'published').length
    const draft = surveys.length - published
    const responses = surveys.reduce((sum, s) => sum + (s.responseCount ?? 0), 0)
    return { total: surveys.length, published, draft, responses }
  }, [surveys])

  const overviewCards = useMemo(
    () => [
      { label: '问卷总数', value: overview.total },
      { label: '已发布', value: overview.published },
      { label: '草稿', value: overview.draft },
      { label: '答卷总数', value: overview.responses },
    ],
    [overview],
  )

  const rows = useMemo(
    () => [...surveys].sort((a, b) => (b.responseCount ?? 0) - (a.responseCount ?? 0)),
    [surveys],
  )

  return (
    <div className="page admin-dashboard">
      <header className="page-hero">
        <div className="page-hero-text">
          <h1>数据概览</h1>
          <p className="subtitle">全平台问卷与答卷数据统计</p>
        </div>
      </header>

      {surveys.length === 0 ? (
        <div className="page-empty panel">
          <p>暂无问卷数据</p>
        </div>
      ) : (
        <>
          <div className="overview-cards page-overview">
            {overviewCards.map((card, index) => (
              <div
                key={card.label}
                className={`overview-card overview-card--${OVERVIEW_TONES[index]}`}
              >
                <span className="overview-value">{card.value}</span>
                <span className="overview-label">{card.label}</span>
              </div>
            ))}
          </div>

          <section className="panel admin-data-table">
            <div className="section-head">
              <h2>问卷数据明细</h2>
              <span className="section-count">共 {surveys.length} 份</span>
            </div>
            <div className="admin-data-table-wrap">
              <table className="admin-data-table-grid">
                <thead>
                  <tr>
                    <th>问卷</th>
                    <th>创建者</th>
                    <th>状态</th>
                    <th>题目数</th>
                    <th>答卷数</th>
                    <th>更新时间</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((survey) => (
                    <tr key={survey.id}>
                      <td className="admin-data-title">{survey.title}</td>
                      <td>{survey.ownerName ?? '—'}</td>
                      <td>
                        <span className={`tag tag--${survey.status}`}>
                          {survey.status === 'published' ? '已发布' : '草稿'}
                        </span>
                      </td>
                      <td>{survey.questions.length}</td>
                      <td>{survey.responseCount ?? 0}</td>
                      <td>{new Date(survey.updatedAt).toLocaleDateString('zh-CN')}</td>
                      <td>
                        {survey.status === 'published' ? (
                          <Link to={`/stats/${survey.id}`} className="btn-secondary btn-sm">
                            查看统计
                          </Link>
                        ) : (
                          <span className="admin-data-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
