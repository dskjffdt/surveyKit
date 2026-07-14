import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { OverviewCards } from '../components/surveys/OverviewCards'
import { useSurveysQuery } from '../queries/surveys'

export function AdminDashboardPage() {
  const { data: surveys = [] } = useSurveysQuery()

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
          <OverviewCards surveys={surveys} />

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
                        <div className="admin-data-actions">
                          <Link to={`/preview/${survey.id}`} className="btn-secondary btn-sm" target="_blank">
                            预览
                          </Link>
                          {survey.status === 'published' && (
                            <Link to={`/stats/${survey.id}`} className="btn-secondary btn-sm">
                              统计
                            </Link>
                          )}
                        </div>
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
