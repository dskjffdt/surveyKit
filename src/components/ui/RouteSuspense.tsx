import { Suspense, type ReactNode } from 'react'
import { PageLoading } from './PageLoading'

interface RouteSuspenseProps {
  children: ReactNode
}

export function RouteSuspense({ children }: RouteSuspenseProps) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>
}
