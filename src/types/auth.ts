export type UserRole = 'admin' | 'creator'

export interface User {
  id: string
  username: string
  role: UserRole
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理员',
  creator: '创建者',
}
