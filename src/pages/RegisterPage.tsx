import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth/AuthShell'
import { useAuthStore } from '../store/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const register = useAuthStore((s) => s.register)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setSubmitting(true)
    try {
      await register(username, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="注册"
      footer={
        <p>
          已有账户？<Link to="/login">返回登录</Link>
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
            placeholder="3–20 个字符，支持字母、数字、下划线"
            autoComplete="username"
            spellCheck={false}
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_]+"
            title="仅支持字母、数字和下划线"
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
            placeholder="至少 6 位"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label className="login-field">
          <span>确认密码</span>
          <input
            className="login-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入密码"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error && (
          <div className="login-alert" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? '正在创建…' : '创建账户'}
        </button>
      </form>
    </AuthShell>
  )
}
