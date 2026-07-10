import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useLeaveConfirm(when: boolean, message = '有未保存的更改，确定离开？') {
  const location = useLocation()

  useEffect(() => {
    if (!when) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])

  useEffect(() => {
    if (!when) return

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor || anchor.target === '_blank') return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('http') || href === location.pathname) return
      if (!window.confirm(message)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [when, message, location.pathname])
}
