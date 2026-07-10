import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QuestionRenderer } from '../components/questions/QuestionRenderer'
import type { QuestionType } from '../types/question'
import { QUESTION_TYPE_LABELS } from '../types/question'
import { useLeaveConfirm } from '../hooks/useLeaveConfirm'
import { useSurveyStore } from '../store/surveyStore'

const TOAST_DURATION = 1

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const survey = useSurveyStore((s) => s.surveys.find((sv) => sv.id === id))
  const updateSurvey = useSurveyStore((s) => s.updateSurvey)
  const publishSurvey = useSurveyStore((s) => s.publishSurvey)
  const unpublishSurvey = useSurveyStore((s) => s.unpublishSurvey)
  const addQuestion = useSurveyStore((s) => s.addQuestion)
  const updateQuestion = useSurveyStore((s) => s.updateQuestion)
  const deleteQuestion = useSurveyStore((s) => s.deleteQuestion)
  const moveQuestion = useSurveyStore((s) => s.moveQuestion)

  const [dirty, setDirty] = useState(false)
  const [saveToastSec, setSaveToastSec] = useState<number | null>(null)
  useLeaveConfirm(dirty)

  useEffect(() => {
    if (saveToastSec === null || saveToastSec <= 0) return
    const timer = setTimeout(() => {
      setSaveToastSec((sec) => (sec !== null && sec > 1 ? sec - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [saveToastSec])

  if (!id || !survey) {
    return (
      <div className="page">
        <p>问卷不存在</p>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  const isPublished = survey.status === 'published'
  const markDirty = () => {
    setDirty(true)
    setSaveToastSec(TOAST_DURATION)
  }

  const handlePublish = () => {
    if (survey.questions.length === 0) {
      alert('请至少添加一道题目')
      return
    }
    if (survey.questions.some((q) => !q.title.trim())) {
      alert('请填写所有题目标题')
      return
    }
    publishSurvey(id)
    setDirty(false)
    setSaveToastSec(null)
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="stack">
          <Link to="/" className="back-link">← 返回</Link>
          <input
            className="title-input"
            value={survey.title}
            onChange={(e) => {
              updateSurvey(id, { title: e.target.value })
              markDirty()
            }}
            placeholder="问卷标题"
          />
          <input
            className="input"
            value={survey.description}
            placeholder="问卷说明（可选）"
            onChange={(e) => {
              updateSurvey(id, { description: e.target.value })
              markDirty()
            }}
          />
        </div>
        <div className="header-actions">
          {isPublished ? (
            <>
              <span className="tag tag--published">已发布</span>
              <Link to={`/fill/${id}`} className="btn-secondary btn-sm" target="_blank">
                预览
              </Link>
              <Link to={`/stats/${id}`} className="btn-secondary btn-sm">
                统计
              </Link>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  unpublishSurvey(id)
                  markDirty()
                }}
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
          <QuestionRenderer
            key={q.id}
            question={q}
            mode="edit"
            index={i}
            onUpdate={(patch) => {
              updateQuestion(id, q.id, patch)
              markDirty()
            }}
            onDelete={() => {
              deleteQuestion(id, q.id)
              markDirty()
            }}
            onMoveUp={i > 0 ? () => { moveQuestion(id, q.id, 'up'); markDirty() } : undefined}
            onMoveDown={
              i < survey.questions.length - 1
                ? () => { moveQuestion(id, q.id, 'down'); markDirty() }
                : undefined
            }
          />
        ))}

        <div className="add-bar">
          <span className="add-bar-label">添加题目</span>
          {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
            <button
              key={type}
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => {
                addQuestion(id, type)
                markDirty()
              }}
            >
              {QUESTION_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {saveToastSec !== null && <div className="toast">已自动保存</div>}
    </div>
  )
}
