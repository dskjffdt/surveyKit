import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { findUserByUsername, insertUser } from '../db.js'
import { authenticate, signToken } from '../middleware/auth.js'

const router = Router()

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/

function issueAuthCookie(res, user) {
  const token = signToken(user)
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  }
}

router.post('/register', async (req, res) => {
  const username = String(req.body.username ?? '').trim()
  const password = String(req.body.password ?? '')

  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ message: '用户名需为 3–20 位字母、数字或下划线' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: '密码至少 6 位' })
  }

  const existing = await findUserByUsername(username)
  if (existing) {
    return res.status(409).json({ message: '用户名已被占用' })
  }

  const user = await insertUser({
    id: randomUUID(),
    username,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'creator',
    createdAt: Date.now(),
  })

  res.status(201).json(issueAuthCookie(res, user))
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' })
  }

  const user = await findUserByUsername(username)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }

  res.json(issueAuthCookie(res, user))
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

router.get('/me', authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
  })
})

export default router
