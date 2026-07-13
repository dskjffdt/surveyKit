interface PageLoadingProps {
  label?: string
}

export function PageLoading({ label = '加载中…' }: PageLoadingProps) {
  return (
    <div className="page page-loading-state" aria-live="polite" aria-busy="true">
      <div className="page-loading-indicator">
        <span className="page-loading-spinner" aria-hidden="true" />
        <p className="page-loading-label">{label}</p>
      </div>
    </div>
  )
}
