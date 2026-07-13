import { http } from './request'
import type { AnswerSheet, Survey, SurveyResponse } from '../types/question'

export function fetchSurveys() {
  return http<Survey[]>({ method: 'GET', url: '/surveys' })
}

export function fetchSurvey(id: string) {
  return http<Survey>({ method: 'GET', url: `/surveys/${id}` })
}

export function createSurvey() {
  return http<Survey>({ method: 'POST', url: '/surveys' })
}

export function updateSurvey(survey: Survey) {
  return http<Survey>({
    method: 'PUT',
    url: `/surveys/${survey.id}`,
    data: survey,
  })
}

export function deleteSurvey(id: string) {
  return http<{ ok: boolean }>({ method: 'DELETE', url: `/surveys/${id}` })
}

export function fetchResponses(surveyId: string) {
  return http<SurveyResponse[]>({
    method: 'GET',
    url: `/surveys/${surveyId}/responses`,
  })
}

export function fetchPublicSurvey(id: string) {
  return http<Pick<Survey, 'id' | 'title' | 'description' | 'status' | 'questions'>>({
    method: 'GET',
    url: `/public/surveys/${id}`,
  })
}

export function submitPublicResponse(surveyId: string, answers: AnswerSheet) {
  return http<{ id: string }>({
    method: 'POST',
    url: `/public/surveys/${surveyId}/responses`,
    data: { answers },
  })
}
