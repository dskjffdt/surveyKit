import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from '../../types/auth'
import { readRoleHint, useAuthStore } from '../../store/authStore'

interface AppLayoutProps {
  children: React.ReactNode
}

function BrandLogo() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M9 11h14M9 16h10M9 21h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isFill = pathname.startsWith('/fill')
  const isPreview = pathname.startsWith('/preview')
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => s.ready)
  const logout = useAuthStore((s) => s.logout)

  if (isFill || isPreview || isAuthPage) {
    return (
      <div className={`app-shell ${isFill || isPreview ? 'app-shell--fill' : ''}`}>
        <main className="app-main">{children}</main>
      </div>
    )
  }

  const handleLogout = async () => {
    useAuthStore.setState({ loggingOut: true })
    navigate('/login', { replace: true })
    try {
      await logout()
    } catch {
      // logout() resets loggingOut on failure
    }
  }

  const shellRole = user?.role ?? readRoleHint()
  const isAdmin = shellRole === 'admin'

  return (
    <div className={`app-shell ${isAdmin ? 'app-shell--admin' : 'app-shell--creator'}`}>
      <header className="app-header">
        <Link to="/" className="brand">
          <BrandLogo />
          <span>SurveyKit</span>
        </Link>
        {ready && user ? (
          <div className="header-user">
            <span className="user-name">{user.username}</span>
            <span className={`role-pill role-pill--${user.role}`}>{ROLE_LABELS[user.role]}</span>
            <button type="button" className="btn-text header-logout" onClick={handleLogout}>
              退出
            </button>
          </div>
        ) : null}
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
