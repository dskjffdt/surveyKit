import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import * as authApi from './api/auth'
import { queryClient } from './lib/queryClient'
import { authKeys } from './queries/keys'

queryClient.prefetchQuery({
  queryKey: authKeys.me(),
  queryFn: authApi.fetchMe,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
