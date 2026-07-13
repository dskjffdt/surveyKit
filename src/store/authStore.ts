import { create } from 'zustand'
import * as authApi from '../api/auth'
import { queryClient } from '../lib/queryClient'
import { authKeys, surveyKeys } from '../queries/keys'
import type { User, UserRole } from '../types/auth'

const ROLE_HINT_KEY = 'surveykit-user-role'

interface AuthState {
  user: User | null
  ready: boolean
  syncSession: (user: User | null) => void
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

function persistRoleHint(role: UserRole | null) {
  try {
    if (role) {
      sessionStorage.setItem(ROLE_HINT_KEY, role)
      document.documentElement.dataset.theme = role === 'admin' ? 'admin' : 'creator'
    } else {
      sessionStorage.removeItem(ROLE_HINT_KEY)
      delete document.documentElement.dataset.theme
    }
  } catch {
    // ignore storage errors
  }
}

export function readRoleHint(): UserRole | null {
  try {
    const role = sessionStorage.getItem(ROLE_HINT_KEY)
    return role === 'admin' || role === 'creator' ? role : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  ready: false,

  syncSession: (user) => {
    persistRoleHint(user?.role ?? null)
    set({ user, ready: true })
  },

  login: async (username, password) => {
    const user = await authApi.login(username, password)
    queryClient.setQueryData(authKeys.me(), user)
    persistRoleHint(user.role)
    set({ user })
  },

  register: async (username, password) => {
    const user = await authApi.register(username, password)
    queryClient.setQueryData(authKeys.me(), user)
    persistRoleHint(user.role)
    set({ user })
  },

  logout: async () => {
    await authApi.logout()
    queryClient.setQueryData(authKeys.me(), null)
    queryClient.removeQueries({ queryKey: surveyKeys.all })
    persistRoleHint(null)
    set({ user: null })
  },
}))
