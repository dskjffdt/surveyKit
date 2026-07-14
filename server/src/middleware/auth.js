import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'surveykit-dev-secret'

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
}

export function authenticate(req, res, next) {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({ message: '未登录' })
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: '登录已过期' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: '无权限' })
    }
    next()
  }
}

export function canViewSurvey(user, survey) {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.role === 'creator' && survey.ownerId === user.id
}

export function canManageSurvey(user, survey) {
  if (!user) return false
  if (user.role === 'admin') return false
  return user.role === 'creator' && survey.ownerId === user.id
}
