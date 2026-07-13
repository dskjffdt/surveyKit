import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { AppLayout } from './components/layout/AppLayout'
import { RouteSuspense } from './components/ui/RouteSuspense'
import { useAuthBootstrap } from './hooks/useAuthBootstrap'
import {
  LazyEditorPage,
  LazyFillPage,
  LazyHomePage,
  LazyLoginPage,
  LazyRegisterPage,
  LazyStatsPage,
} from './routes/lazyPages'
import './index.css'

function AppRoutes() {
  useAuthBootstrap()

  return (
    <BrowserRouter>
      <AppLayout>
        <RouteSuspense>
          <Routes>
            <Route path="/login" element={<LazyLoginPage />} />
            <Route path="/register" element={<LazyRegisterPage />} />
            <Route path="/fill/:id" element={<LazyFillPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <LazyHomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/editor/:id"
              element={
                <PrivateRoute roles={['creator']}>
                  <LazyEditorPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/stats/:id"
              element={
                <PrivateRoute roles={['admin', 'creator']}>
                  <LazyStatsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </RouteSuspense>
      </AppLayout>
    </BrowserRouter>
  )
}

export default function App() {
  return <AppRoutes />
}
