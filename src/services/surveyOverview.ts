import type { Survey } from '../types/question'

export const OVERVIEW_TONES = ['blue', 'green', 'amber', 'violet'] as const

export interface OverviewCard {
  label: string
  value: number
}

export function buildSurveyOverview(surveys: Survey[]) {
  const published = surveys.filter((s) => s.status === 'published').length
  const draft = surveys.length - published
  const responses = surveys.reduce((sum, s) => sum + (s.responseCount ?? 0), 0)
  return { total: surveys.length, published, draft, responses }
}

export function buildOverviewCards(surveys: Survey[]): OverviewCard[] {
  const overview = buildSurveyOverview(surveys)
  return [
    { label: '问卷总数', value: overview.total },
    { label: '已发布', value: overview.published },
    { label: '草稿', value: overview.draft },
    { label: '答卷总数', value: overview.responses },
  ]
}
