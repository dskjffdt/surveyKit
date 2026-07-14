import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SurveyFillForm } from '../fill/SurveyFillForm'
import type { Survey } from '../../types/question'

interface SurveyPreviewModalProps {
  survey: Survey
  onClose: () => void
}

export function SurveyPreviewModal({ survey, onClose }: SurveyPreviewModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="preview-overlay" onClick={onClose} role="presentation">
      <div
        className="preview-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        <header className="preview-modal-header">
          <h2 id="preview-modal-title">填答预览</h2>
          <div className="preview-modal-actions">
            <Link
              to={`/preview/${survey.id}`}
              className="btn-secondary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              新窗口打开
            </Link>
            <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
              关闭
            </button>
          </div>
        </header>
        <div className="preview-modal-body">
          <SurveyFillForm survey={survey} preview showPreviewBanner={false} />
        </div>
      </div>
    </div>
  )
}
