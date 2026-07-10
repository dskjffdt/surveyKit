import { Link, useLocation } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation()
  const isFill = pathname.startsWith('/fill')

  if (isFill) {
    return (
      <div className="app-shell app-shell--fill">
        <main className="app-main">{children}</main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">SurveyKit</Link>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
