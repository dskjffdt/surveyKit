import { Router } from 'express'
import { randomUUID } from 'crypto'
import { findPublishedSurvey, insertResponse } from '../db.js'

const router = Router()

router.get('/surveys/:id', async (req, res) => {
  const survey = await findPublishedSurvey(req.params.id)
  if (!survey) {
    return res.status(404).json({ message: '问卷不存在或未发布' })
  }
  res.json(survey)
})

router.post('/surveys/:id/responses', async (req, res) => {
  const survey = await findPublishedSurvey(req.params.id)
  if (!survey) {
    return res.status(400).json({ message: '问卷不可提交' })
  }

  const { answers } = req.body
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ message: '答案格式错误' })
  }

  const response = await insertResponse({
    id: randomUUID(),
    surveyId: survey.id,
    answers,
    submittedAt: Date.now(),
  })
  res.status(201).json({ id: response.id })
})

export default router
