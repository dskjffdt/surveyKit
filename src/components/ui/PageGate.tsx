import type { ReactNode } from 'react'
import { useDeferredLoading } from '../../hooks/useDeferredLoading'
import { PageLoading } from './PageLoading'

interface PageGateProps {
  pending: boolean
  error?: string
  onRetry?: () => void
  children: ReactNode
}

export function PageGate({ pending, error, onRetry, children }: PageGateProps) {
  const showLoading = useDeferredLoading(pending)

  if (error) {
    return (
      <div className="page">
        <p className="error-msg">{error}</p>
        {onRetry && (
          <button type="button" className="btn-secondary" onClick={onRetry}>
            重试
          </button>
        )}
      </div>
    )
  }

  if (showLoading) {
    return <PageLoading />
  }

  if (pending) {
    return <div className="page page-loading-state page-loading-hold" aria-busy="true" />
  }

  return <div className="page-content-reveal">{children}</div>
}
