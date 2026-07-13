import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShareFillPanel } from '../components/share/ShareFillPanel'
import {
  useCreateSurveyMutation,
  useDeleteSurveyMutation,
  useSurveysQuery,
} from '../queries/surveys'
import { useAuthStore } from '../store/authStore'

const OVERVIEW_TONES = ['blue', 'green', 'amber', 'violet'] as const

export function CreatorHomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: surveys = [] } = useSurveysQuery()
  const createSurveyMutation = useCreateSurveyMutation()
  const deleteSurveyMutation = useDeleteSurveyMutation()
  const [creating, setCreating] = useState(false)

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

  const sortedSurveys = useMemo(
    () => [...surveys].sort((a, b) => b.updatedAt - a.updatedAt),
    [surveys],
  )

  const handleCreate = async () => {
    setCreating(true)
    try {
      const survey = await createSurveyMutation.mutateAsync()
      navigate(`/editor/${survey.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : '创建失败')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page creator-home">
      <header className="page-hero creator-hero">
        <div className="page-hero-text creator-hero-text">
          <h1>我的问卷</h1>
          <p className="subtitle">创建、发布、收集与统计</p>
        </div>
        <button
          type="button"
          className="btn-primary creator-create-btn"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? '创建中…' : '+ 创建问卷'}
        </button>
      </header>

      {surveys.length === 0 ? (
        <div className="creator-empty page-empty panel">
          <div className="creator-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16h16M16 24h12M16 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2>还没有问卷</h2>
          <p>从第一份问卷开始，完成编辑、发布与回收。</p>
          <button type="button" className="btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? '创建中…' : '创建第一份问卷'}
          </button>
        </div>
      ) : (
        <>
          <div className="overview-cards page-overview creator-overview">
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

          <section className="creator-surveys">
            <div className="creator-surveys-head section-head">
              <h2>问卷列表</h2>
              <span className="section-count">共 {surveys.length} 份</span>
            </div>

            <div className="survey-grid">
              {sortedSurveys.map((survey) => (
                <article key={survey.id} className="survey-card">
                  <div className="survey-card-top">
                    <h3 className="survey-card-title">{survey.title}</h3>
                    <span className={`tag tag--${survey.status}`}>
                      {survey.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </div>

                  <div className="survey-card-metrics">
                    <span>{survey.questions.length} 道题</span>
                    <span>{survey.responseCount ?? 0} 份答卷</span>
                  </div>

                  <p className="survey-card-meta">
                    更新于 {new Date(survey.updatedAt).toLocaleDateString('zh-CN')}
                  </p>

                  <div className="survey-card-actions">
                    <Link to={`/editor/${survey.id}`} className="btn-secondary btn-sm">
                      编辑
                    </Link>
                    {survey.status === 'published' && (
                      <>
                        <ShareFillPanel surveyId={survey.id} compact />
                        <Link to={`/stats/${survey.id}`} className="btn-secondary btn-sm">
                          统计
                        </Link>
                        <Link
                          to={`/fill/${survey.id}`}
                          className="btn-text btn-sm"
                          target="_blank"
                        >
                          预览填答
                        </Link>
                      </>
                    )}
                    {survey.ownerId === user?.id && (
                      <button
                        type="button"
                        className="btn-text danger btn-sm survey-card-delete"
                        onClick={async () => {
                          if (!window.confirm('确定删除这份问卷？')) return
                          try {
                            await deleteSurveyMutation.mutateAsync(survey.id)
                          } catch (err) {
                            alert(err instanceof Error ? err.message : '删除失败')
                          }
                        }}
                      >
                        删除
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
