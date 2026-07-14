import { Suspense } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSurveysQuery } from '../queries/surveys'
import { PageGate } from '../components/ui/PageGate'
import { PageLoading } from '../components/ui/PageLoading'
import { LazyAdminDashboardPage, LazyCreatorHomePage } from '../routes/lazyPages'

export function HomePage() {
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const surveysQuery = useSurveysQuery(Boolean(ready && user))

  const pending = !ready || surveysQuery.isPending
  const error = surveysQuery.error instanceof Error ? surveysQuery.error.message : undefined

  return (
    <PageGate pending={pending} error={error} onRetry={() => surveysQuery.refetch()}>
      <Suspense fallback={<PageLoading />}>
        {user?.role === 'admin' ? <LazyAdminDashboardPage /> : <LazyCreatorHomePage />}
      </Suspense>
    </PageGate>
  )
}
