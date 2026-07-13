import { http } from './request'
import type { User } from '../types/auth'

export function register(username: string, password: string) {
  return http<User>({
    method: 'POST',
    url: '/auth/register',
    data: { username, password },
  })
}

export function login(username: string, password: string) {
  return http<User>({
    method: 'POST',
    url: '/auth/login',
    data: { username, password },
  })
}

export function logout() {
  return http<{ ok: boolean }>({
    method: 'POST',
    url: '/auth/logout',
  })
}

export function fetchMe() {
  return http<User>({
    method: 'GET',
    url: '/auth/me',
  })
}
