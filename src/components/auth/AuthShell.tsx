import type { ReactNode } from 'react'

function LoginLogo() {
  return (
    <svg className="login-logo-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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

interface AuthShellProps {
  title: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ title, children, footer }: AuthShellProps) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <LoginLogo />
          <span>SurveyKit</span>
        </div>

        <header className="login-header">
          <h1>{title}</h1>
        </header>

        {children}

        <div className="login-foot">{footer}</div>
      </div>
    </div>
  )
}
