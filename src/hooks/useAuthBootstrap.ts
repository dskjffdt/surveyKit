import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as authApi from '../api/auth'
import { authKeys } from '../queries/keys'
import { useAuthStore } from '../store/authStore'

export function useAuthBootstrap() {
  const syncSession = useAuthStore((s) => s.syncSession)
  const meQuery = useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.fetchMe,
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (!meQuery.isFetched) return
    const user = meQuery.isError ? null : (meQuery.data ?? null)
    syncSession(user)
  }, [meQuery.isFetched, meQuery.isError, meQuery.data, syncSession])
}
