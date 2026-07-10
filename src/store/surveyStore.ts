import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createDefaultQuestion } from '../services/questionUtils'
import type { AnswerSheet, Question, QuestionType, Survey, SurveyResponse } from '../types/question'

interface SurveyState {
  surveys: Survey[]
  responses: SurveyResponse[]
  hydrated: boolean

  setHydrated: () => void
  createSurvey: () => string
  updateSurvey: (id: string, patch: Partial<Pick<Survey, 'title' | 'description'>>) => void
  deleteSurvey: (id: string) => void
  publishSurvey: (id: string) => void
  unpublishSurvey: (id: string) => void

  addQuestion: (surveyId: string, type: QuestionType) => void
  updateQuestion: (surveyId: string, questionId: string, patch: Partial<Question>) => void
  deleteQuestion: (surveyId: string, questionId: string) => void
  moveQuestion: (surveyId: string, questionId: string, direction: 'up' | 'down') => void

  submitResponse: (surveyId: string, answers: AnswerSheet) => string | null
  getSurvey: (id: string) => Survey | undefined
  getResponses: (surveyId: string) => SurveyResponse[]
  hasSubmitted: (surveyId: string) => boolean
}

function touchSurvey(survey: Survey): Survey {
  return { ...survey, updatedAt: Date.now() }
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      surveys: [],
      responses: [],
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      createSurvey: () => {
        const id = crypto.randomUUID()
        const now = Date.now()
        const survey: Survey = {
          id,
          title: '未命名问卷',
          description: '',
          status: 'draft',
          questions: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ surveys: [survey, ...s.surveys] }))
        return id
      },

      updateSurvey: (id, patch) => {
        set((s) => ({
          surveys: s.surveys.map((survey) =>
            survey.id === id ? touchSurvey({ ...survey, ...patch }) : survey,
          ),
        }))
      },

      deleteSurvey: (id) => {
        set((s) => ({
          surveys: s.surveys.filter((survey) => survey.id !== id),
          responses: s.responses.filter((r) => r.surveyId !== id),
        }))
      },

      publishSurvey: (id) => {
        set((s) => ({
          surveys: s.surveys.map((survey) =>
            survey.id === id
              ? touchSurvey({ ...survey, status: 'published' })
              : survey,
          ),
        }))
      },

      unpublishSurvey: (id) => {
        set((s) => ({
          surveys: s.surveys.map((survey) =>
            survey.id === id ? touchSurvey({ ...survey, status: 'draft' }) : survey,
          ),
        }))
      },

      addQuestion: (surveyId, type) => {
        const question = createDefaultQuestion(type)
        set((s) => ({
          surveys: s.surveys.map((survey) =>
            survey.id === surveyId
              ? touchSurvey({
                  ...survey,
                  questions: [...survey.questions, question],
                })
              : survey,
          ),
        }))
      },

      updateQuestion: (surveyId, questionId, patch) => {
        set((s) => ({
          surveys: s.surveys.map((survey) =>
            survey.id === surveyId
              ? touchSurvey({
                  ...survey,
                  questions: survey.questions.map((q) =>
                    q.id === questionId ? ({ ...q, ...patch } as Question) : q,
                  ),
                })
              : survey,
          ),
        }))
      },

      deleteQuestion: (surveyId, questionId) => {
        set((s) => ({
          surveys: s.surveys.map((survey) =>
            survey.id === surveyId
              ? touchSurvey({
                  ...survey,
                  questions: survey.questions.filter((q) => q.id !== questionId),
                })
              : survey,
          ),
        }))
      },

      moveQuestion: (surveyId, questionId, direction) => {
        set((s) => ({
          surveys: s.surveys.map((survey) => {
            if (survey.id !== surveyId) return survey
            const idx = survey.questions.findIndex((q) => q.id === questionId)
            if (idx < 0) return survey
            const target = direction === 'up' ? idx - 1 : idx + 1
            if (target < 0 || target >= survey.questions.length) return survey
            const questions = [...survey.questions]
            ;[questions[idx], questions[target]] = [questions[target], questions[idx]]
            return touchSurvey({ ...survey, questions })
          }),
        }))
      },

      submitResponse: (surveyId, answers) => {
        const survey = get().getSurvey(surveyId)
        if (!survey || survey.status !== 'published') return null
        if (get().hasSubmitted(surveyId)) return null

        const id = crypto.randomUUID()
        const response: SurveyResponse = {
          id,
          surveyId,
          answers,
          submittedAt: Date.now(),
        }
        set((s) => ({ responses: [...s.responses, response] }))
        sessionStorage.setItem(`surveykit-submitted-${surveyId}`, '1')
        return id
      },

      getSurvey: (id) => get().surveys.find((s) => s.id === id),

      getResponses: (surveyId) =>
        get().responses.filter((r) => r.surveyId === surveyId),

      hasSubmitted: (surveyId) =>
        sessionStorage.getItem(`surveykit-submitted-${surveyId}`) === '1',
    }),
    {
      name: 'surveykit-storage',
      partialize: (state) => ({
        surveys: state.surveys,
        responses: state.responses,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)
