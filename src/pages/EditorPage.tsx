import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShareFillPanel } from '../components/share/ShareFillPanel'
import { QuestionRenderer } from '../components/questions/QuestionRenderer'
import { SurveyPreviewModal } from '../components/preview/SurveyPreviewModal'
import { PageGate } from '../components/ui/PageGate'
import type { QuestionType } from '../types/question'
import { QUESTION_TYPE_LABELS } from '../types/question'
import { useLeaveConfirm } from '../hooks/useLeaveConfirm'
import {
  useSurveyEditorMutations,
  useSurveyQuery,
} from '../queries/surveys'
import { useAuthStore } from '../store/authStore'

const TOAST_DURATION = 1

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const ready = useAuthStore((s) => s.ready)
  const surveyQuery = useSurveyQuery(id, ready)
  const {
    patchSurvey,
    updateMeta,
    publish,
    unpublish,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  } = useSurveyEditorMutations()

  const [dirty, setDirty] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saveToastSec, setSaveToastSec] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  useLeaveConfirm(dirty)

  const survey = surveyQuery.data
  const pending = !ready || surveyQuery.isPending
  const error = surveyQuery.error instanceof Error ? surveyQuery.error.message : undefined

  useEffect(() => {
    if (saveToastSec === null || saveToastSec <= 0) return
    const timer = setTimeout(() => {
      setSaveToastSec((sec) => (sec !== null && sec > 1 ? sec - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [saveToastSec])

  const markSaved = () => {
    setDirty(false)
    setSaveToastSec(TOAST_DURATION)
  }

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action()
      markSaved()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
      setDirty(true)
    }
  }

  const handleDrop = (toIndex: number) => {
    if (!id || dragIndex === null || dragIndex === toIndex) return
    setDirty(true)
    runAction(() => reorderQuestions.mutateAsync({ surveyId: id, fromIndex: dragIndex, toIndex }))
    setDragIndex(null)
    setDragOverIndex(null)
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

  const handlePublish = async () => {
    if (!survey) return
    if (survey.questions.length === 0) {
      alert('请至少添加一道题目')
      return
    }
    if (survey.questions.some((q) => !q.title.trim())) {
      alert('请填写所有题目标题')
      return
    }
    await runAction(() => publish.mutateAsync(id))
  }

  return (
    <PageGate pending={pending} error={error} onRetry={() => surveyQuery.refetch()}>
      {survey && (
        <div className="page">
          <header className="page-header">
            <div className="stack">
              <Link to="/" className="back-link">
                ← 返回
              </Link>
              <input
                className="title-input"
                value={survey.title}
                onChange={(e) => {
                  setDirty(true)
                  patchSurvey(id, { title: e.target.value })
                }}
                onBlur={(e) => {
                  runAction(() =>
                    updateMeta.mutateAsync({ id, patch: { title: e.target.value } }),
                  )
                }}
                placeholder="问卷标题"
              />
              <input
                className="input"
                value={survey.description}
                placeholder="问卷说明（可选）"
                onChange={(e) => {
                  setDirty(true)
                  patchSurvey(id, { description: e.target.value })
                }}
                onBlur={(e) => {
                  runAction(() =>
                    updateMeta.mutateAsync({ id, patch: { description: e.target.value } }),
                  )
                }}
              />
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setPreviewOpen(true)}
              >
                预览
              </button>
              {survey.status === 'published' ? (
                <>
                  <span className="tag tag--published">已发布</span>
                  <ShareFillPanel surveyId={id} />
                  <Link to={`/stats/${id}`} className="btn-secondary btn-sm">
                    统计
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => runAction(() => unpublish.mutateAsync(id))}
                  >
                    撤回
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primary" onClick={handlePublish}>
                  发布
                </button>
              )}
            </div>
          </header>

          <div className="editor-body">
            {survey.questions.map((q, i) => (
              <div
                key={q.id}
                className={`question-drag-wrap ${dragOverIndex === i ? 'is-drag-over' : ''} ${dragIndex === i ? 'is-dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverIndex(i)
                }}
                onDragLeave={() => setDragOverIndex((prev) => (prev === i ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(i)
                }}
              >
                <button
                  type="button"
                  className="drag-handle"
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragEnd={() => {
                    setDragIndex(null)
                    setDragOverIndex(null)
                  }}
                  aria-label={`拖拽调整第 ${i + 1} 题顺序`}
                  title="拖拽排序"
                >
                  ⋮⋮
                </button>
                <QuestionRenderer
                  question={q}
                  mode="edit"
                  index={i}
                  onUpdate={(patch) => {
                    setDirty(true)
                    runAction(() => updateQuestion.mutateAsync({ surveyId: id, questionId: q.id, patch }))
                  }}
                  onDelete={() => {
                    setDirty(true)
                    runAction(() => deleteQuestion.mutateAsync({ surveyId: id, questionId: q.id }))
                  }}
                />
              </div>
            ))}

            <div className="add-bar">
              <span className="add-bar-label">添加题目</span>
              {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    setDirty(true)
                    runAction(() => addQuestion.mutateAsync({ surveyId: id, type }))
                  }}
                >
                  {QUESTION_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {saveToastSec !== null && <div className="toast">已自动保存</div>}
          {previewOpen && (
            <SurveyPreviewModal survey={survey} onClose={() => setPreviewOpen(false)} />
          )}
        </div>
      )}
    </PageGate>
  )
}
