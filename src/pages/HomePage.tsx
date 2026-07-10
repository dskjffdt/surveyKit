import { Link, useNavigate } from 'react-router-dom'
import { useSurveyStore } from '../store/surveyStore'

export function HomePage() {
  const navigate = useNavigate()
  const surveys = useSurveyStore((s) => s.surveys)
  const createSurvey = useSurveyStore((s) => s.createSurvey)
  const deleteSurvey = useSurveyStore((s) => s.deleteSurvey)

  const handleCreate = () => {
    const id = createSurvey()
    navigate(`/editor/${id}`)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack">
          <h1>我的问卷</h1>
          <p className="subtitle">创建、发布、收集与统计</p>
        </div>
        <button type="button" className="btn-primary" onClick={handleCreate}>
          创建问卷
        </button>
      </header>

      {surveys.length === 0 ? (
        <div className="empty-state">
          <p>还没有问卷</p>
          <button type="button" className="btn-secondary" onClick={handleCreate}>
            创建第一份
          </button>
        </div>
      ) : (
        <ul className="survey-list">
          {surveys.map((survey) => (
            <li key={survey.id} className="survey-item">
              <div className="survey-item-main">
                <div className="survey-item-title-row">
                  <h2>{survey.title}</h2>
                  <span className={`tag tag--${survey.status}`}>
                    {survey.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
                <p className="meta">
                  {survey.questions.length} 道题 · 更新于{' '}
                  {new Date(survey.updatedAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div className="survey-item-actions">
                <Link to={`/editor/${survey.id}`} className="btn-secondary btn-sm">
                  编辑
                </Link>
                {survey.status === 'published' && (
                  <>
                    <Link to={`/fill/${survey.id}`} className="btn-secondary btn-sm" target="_blank">
                      填答
                    </Link>
                    <Link to={`/stats/${survey.id}`} className="btn-secondary btn-sm">
                      统计
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  className="btn-text danger"
                  onClick={() => {
                    if (window.confirm('确定删除这份问卷？')) deleteSurvey(survey.id)
                  }}
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
