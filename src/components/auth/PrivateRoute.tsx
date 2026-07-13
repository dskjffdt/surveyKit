import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../../types/auth'

interface PrivateRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => s.ready)
  const location = useLocation()

  if (!ready) {
    return children
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="page">
        <p>无权限访问该页面</p>
      </div>
    )
  }

  return children
}
