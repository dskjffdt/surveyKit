import { lazy, type ComponentType } from 'react'

function lazyNamed<T extends ComponentType<unknown>>(
  loader: () => Promise<Record<string, T>>,
  exportName: string,
) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] as T })))
}

export const LazyLoginPage = lazyNamed(() => import('../pages/LoginPage'), 'LoginPage')
export const LazyRegisterPage = lazyNamed(() => import('../pages/RegisterPage'), 'RegisterPage')
export const LazyFillPage = lazyNamed(() => import('../pages/FillPage'), 'FillPage')
export const LazyHomePage = lazyNamed(() => import('../pages/HomePage'), 'HomePage')
export const LazyEditorPage = lazyNamed(() => import('../pages/EditorPage'), 'EditorPage')
export const LazyStatsPage = lazyNamed(() => import('../pages/StatsPage'), 'StatsPage')

export const LazyAdminDashboardPage = lazyNamed(
  () => import('../pages/AdminDashboardPage'),
  'AdminDashboardPage',
)
export const LazyCreatorHomePage = lazyNamed(
  () => import('../pages/CreatorHomePage'),
  'CreatorHomePage',
)
