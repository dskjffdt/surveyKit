import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth/AuthShell'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const loggingOut = useAuthStore((s) => s.loggingOut)
  const login = useAuthStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from || '/'

  if (user && !loggingOut) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="登录"
      footer={
        <p>
          还没有账户？<Link to="/register">创建账户</Link>
        </p>
      }
    >
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-field">
          <span>用户名</span>
          <input
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            autoComplete="username"
            spellCheck={false}
            required
          />
        </label>

        <label className="login-field">
          <span>密码</span>
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div className="login-alert" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? '正在登录…' : '登录'}
        </button>
      </form>
    </AuthShell>
  )
}
