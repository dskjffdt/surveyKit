import { Link, useParams } from 'react-router-dom'
import { SurveyFillForm } from '../components/fill/SurveyFillForm'
import { PageGate } from '../components/ui/PageGate'
import { useSurveyQuery } from '../queries/surveys'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types/auth'
import type { Survey } from '../types/question'

function PreviewSurveyBody({
  survey,
  surveyId,
  user,
}: {
  survey: Survey
  surveyId: string
  user: User | null
}) {
  const isOwner = user?.role === 'creator' && survey.ownerId === user.id

  return (
    <div className="page">
      <div className="preview-page-toolbar">
        <Link to={isOwner ? `/editor/${surveyId}` : '/'} className="back-link">
          ← {isOwner ? '返回编辑' : '返回首页'}
        </Link>
        {survey.status === 'draft' && <span className="tag tag--draft">草稿预览</span>}
      </div>
      <SurveyFillForm survey={survey} preview />
    </div>
  )
}

export function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const surveyQuery = useSurveyQuery(id, ready)

  const survey = surveyQuery.data
  const pending = !ready || surveyQuery.isPending
  const error = surveyQuery.error instanceof Error ? surveyQuery.error.message : undefined

  if (!id) {
    return (
      <div className="page">
        <p>问卷不存在</p>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  return (
    <PageGate pending={pending} error={error} onRetry={() => surveyQuery.refetch()}>
      {survey && <PreviewSurveyBody survey={survey} surveyId={id} user={user} />}
    </PageGate>
  )
}
