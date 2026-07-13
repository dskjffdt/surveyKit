import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import * as surveyApi from '../api/surveys'
import { createDefaultQuestion } from '../services/questionUtils'
import type { AnswerSheet, Question, QuestionType, Survey } from '../types/question'
import { surveyKeys } from './keys'

function touchSurvey(survey: Survey): Survey {
  return { ...survey, updatedAt: Date.now() }
}

function patchSurveyInList(surveys: Survey[], survey: Survey) {
  return surveys.map((item) => (item.id === survey.id ? survey : item))
}

function getCachedSurvey(queryClient: QueryClient, id: string) {
  const detail = queryClient.getQueryData<Survey>(surveyKeys.detail(id))
  const fromList = queryClient
    .getQueryData<Survey[]>(surveyKeys.list())
    ?.find((item) => item.id === id)
  return detail ?? fromList
}

function requireCachedSurvey(queryClient: QueryClient, id: string) {
  const survey = getCachedSurvey(queryClient, id)
  if (!survey) throw new Error('问卷不存在')
  return survey
}

export function useSurveysQuery(enabled = true) {
  return useQuery({
    queryKey: surveyKeys.list(),
    queryFn: surveyApi.fetchSurveys,
    enabled,
  })
}

export function useSurveyQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: surveyKeys.detail(id ?? ''),
    queryFn: () => surveyApi.fetchSurvey(id!),
    enabled: enabled && Boolean(id),
  })
}

export function useSurveyResponsesQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: surveyKeys.responses(id ?? ''),
    queryFn: () => surveyApi.fetchResponses(id!),
    enabled: enabled && Boolean(id),
  })
}

export function usePublicSurveyQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: surveyKeys.public(id ?? ''),
    queryFn: () => surveyApi.fetchPublicSurvey(id!),
    enabled: enabled && Boolean(id),
  })
}

export function useSurveyEditorMutations() {
  const queryClient = useQueryClient()

  const setSurvey = (survey: Survey) => {
    queryClient.setQueryData(surveyKeys.detail(survey.id), survey)
    queryClient.setQueryData<Survey[]>(surveyKeys.list(), (current) =>
      current ? patchSurveyInList(current, survey) : current,
    )
  }

  const patchSurvey = (id: string, patch: Partial<Survey>) => {
    const base = getCachedSurvey(queryClient, id)
    if (!base) return
    setSurvey({ ...base, ...patch })
  }

  const saveSurvey = useMutation({
    mutationFn: (survey: Survey) => surveyApi.updateSurvey(touchSurvey(survey)),
    onSuccess: setSurvey,
  })

  const updateMeta = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Pick<Survey, 'title' | 'description'>>
    }) => saveSurvey.mutateAsync({ ...requireCachedSurvey(queryClient, id), ...patch }),
  })

  const publish = useMutation({
    mutationFn: async (id: string) => {
      const survey = getCachedSurvey(queryClient, id) ?? (await surveyApi.fetchSurvey(id))
      return saveSurvey.mutateAsync({ ...survey, status: 'published' })
    },
  })

  const unpublish = useMutation({
    mutationFn: async (id: string) => {
      const survey = getCachedSurvey(queryClient, id) ?? (await surveyApi.fetchSurvey(id))
      return saveSurvey.mutateAsync({ ...survey, status: 'draft' })
    },
  })

  const addQuestion = useMutation({
    mutationFn: ({ surveyId, type }: { surveyId: string; type: QuestionType }) => {
      const survey = requireCachedSurvey(queryClient, surveyId)
      const question = createDefaultQuestion(type)
      return saveSurvey.mutateAsync(
        touchSurvey({ ...survey, questions: [...survey.questions, question] }),
      )
    },
  })

  const updateQuestion = useMutation({
    mutationFn: ({
      surveyId,
      questionId,
      patch,
    }: {
      surveyId: string
      questionId: string
      patch: Partial<Question>
    }) => {
      const survey = requireCachedSurvey(queryClient, surveyId)
      return saveSurvey.mutateAsync(
        touchSurvey({
          ...survey,
          questions: survey.questions.map((question) =>
            question.id === questionId ? ({ ...question, ...patch } as Question) : question,
          ),
        }),
      )
    },
  })

  const deleteQuestion = useMutation({
    mutationFn: ({ surveyId, questionId }: { surveyId: string; questionId: string }) => {
      const survey = requireCachedSurvey(queryClient, surveyId)
      return saveSurvey.mutateAsync(
        touchSurvey({
          ...survey,
          questions: survey.questions.filter((question) => question.id !== questionId),
        }),
      )
    },
  })

  const reorderQuestions = useMutation({
    mutationFn: ({
      surveyId,
      fromIndex,
      toIndex,
    }: {
      surveyId: string
      fromIndex: number
      toIndex: number
    }) => {
      if (fromIndex === toIndex) return Promise.resolve(null)
      const survey = requireCachedSurvey(queryClient, surveyId)
      const questions = [...survey.questions]
      if (fromIndex < 0 || fromIndex >= questions.length) return Promise.resolve(null)
      if (toIndex < 0 || toIndex >= questions.length) return Promise.resolve(null)
      const [item] = questions.splice(fromIndex, 1)
      questions.splice(toIndex, 0, item)
      return saveSurvey.mutateAsync(touchSurvey({ ...survey, questions }))
    },
  })

  return {
    patchSurvey,
    updateMeta,
    publish,
    unpublish,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  }
}

export function useCreateSurveyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: surveyApi.createSurvey,
    onSuccess: (survey) => {
      queryClient.setQueryData<Survey[]>(surveyKeys.list(), (current) =>
        current ? [survey, ...current] : [survey],
      )
      queryClient.setQueryData(surveyKeys.detail(survey.id), survey)
    },
  })
}

export function useDeleteSurveyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: surveyApi.deleteSurvey,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Survey[]>(surveyKeys.list(), (current) =>
        current?.filter((survey) => survey.id !== id),
      )
      queryClient.removeQueries({ queryKey: surveyKeys.detail(id) })
      queryClient.removeQueries({ queryKey: surveyKeys.responses(id) })
    },
  })
}

export function useSubmitResponseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ surveyId, answers }: { surveyId: string; answers: AnswerSheet }) =>
      surveyApi.submitPublicResponse(surveyId, answers),
    onSuccess: (_result, { surveyId }) => {
      sessionStorage.setItem(`surveykit-submitted-${surveyId}`, '1')
      queryClient.invalidateQueries({ queryKey: surveyKeys.responses(surveyId) })
      queryClient.invalidateQueries({ queryKey: surveyKeys.list() })
    },
  })
}

export function hasSubmittedSurvey(surveyId: string) {
  return sessionStorage.getItem(`surveykit-submitted-${surveyId}`) === '1'
}
