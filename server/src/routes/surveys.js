import { Router } from 'express'
import { randomUUID } from 'crypto'
import {
  deleteSurveyById,
  findSurveyById,
  insertSurvey,
  listResponsesBySurveyId,
  listSurveys,
  updateSurveyRecord,
} from '../db.js'
import { authenticate, canManageSurvey, canViewSurvey } from '../middleware/auth.js'

const router = Router()

function touchSurvey(survey) {
  return { ...survey, updatedAt: Date.now() }
}

router.get('/', authenticate, async (req, res) => {
  const surveys = await listSurveys(req.user)
  res.json(surveys)
})

router.post('/', authenticate, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: '管理员无法创建问卷' })
  }
  if (req.user.role !== 'creator') {
    return res.status(403).json({ message: '无权限' })
  }

  const now = Date.now()
  const survey = await insertSurvey({
    id: randomUUID(),
    ownerId: req.user.id,
    title: '未命名问卷',
    description: '',
    status: 'draft',
    questions: [],
    createdAt: now,
    updatedAt: now,
  })
  res.status(201).json(survey)
})

router.get('/:id', authenticate, async (req, res) => {
  const survey = await findSurveyById(req.params.id)
  if (!survey) return res.status(404).json({ message: '问卷不存在' })
  if (!canViewSurvey(req.user, survey)) {
    return res.status(403).json({ message: '无权限' })
  }
  res.json(survey)
})

router.put('/:id', authenticate, async (req, res) => {
  const survey = await findSurveyById(req.params.id)
  if (!survey) return res.status(404).json({ message: '问卷不存在' })
  if (!canManageSurvey(req.user, survey)) {
    return res.status(403).json({ message: '无权限' })
  }

  const { title, description, status, questions } = req.body
  const updated = await updateSurveyRecord(
    touchSurvey({
      ...survey,
      title: title ?? survey.title,
      description: description ?? survey.description,
      status: status ?? survey.status,
      questions: questions ?? survey.questions,
    }),
  )
  res.json(updated)
})

router.delete('/:id', authenticate, async (req, res) => {
  const survey = await findSurveyById(req.params.id)
  if (!survey) return res.status(404).json({ message: '问卷不存在' })
  if (!canManageSurvey(req.user, survey)) {
    return res.status(403).json({ message: '无权限' })
  }

  await deleteSurveyById(req.params.id)
  res.json({ ok: true })
})

router.get('/:id/responses', authenticate, async (req, res) => {
  const survey = await findSurveyById(req.params.id)
  if (!survey) return res.status(404).json({ message: '问卷不存在' })
  if (!canViewSurvey(req.user, survey)) {
    return res.status(403).json({ message: '无权限' })
  }

  const responses = await listResponsesBySurveyId(req.params.id)
  res.json(responses)
})

export default router
