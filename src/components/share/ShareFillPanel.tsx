import { useState } from 'react'
import { copyFillUrl, getFillUrl } from '../../services/fillUrl'

interface ShareFillPanelProps {
  surveyId: string
  compact?: boolean
}

export function ShareFillPanel({ surveyId, compact = false }: ShareFillPanelProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const fillUrl = getFillUrl(surveyId)

  const handleCopy = async () => {
    try {
      await copyFillUrl(surveyId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('复制失败，请手动复制链接')
    }
  }

  if (compact) {
    return (
      <button type="button" className="btn-secondary btn-sm" onClick={handleCopy}>
        {copied ? '已复制' : '复制链接'}
      </button>
    )
  }

  return (
    <div className="share-fill">
      <button type="button" className="btn-secondary btn-sm" onClick={() => setOpen((v) => !v)}>
        分享填答
      </button>
      {open && (
        <div className="share-fill-panel panel">
          <p className="share-fill-label">填答链接</p>
          <input className="input share-fill-input" readOnly value={fillUrl} />
          <div className="share-fill-actions">
            <button type="button" className="btn-primary btn-sm" onClick={handleCopy}>
              {copied ? '已复制' : '复制链接'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
