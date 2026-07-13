export function getFillUrl(surveyId: string) {
  return `${window.location.origin}/fill/${surveyId}`
}

export async function copyFillUrl(surveyId: string) {
  const url = getFillUrl(surveyId)
  await navigator.clipboard.writeText(url)
  return url
}
