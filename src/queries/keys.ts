export const authKeys = {
  me: () => ['auth', 'me'] as const,
}

export const surveyKeys = {
  all: ['surveys'] as const,
  list: () => ['surveys', 'list'] as const,
  detail: (id: string) => ['surveys', 'detail', id] as const,
  responses: (id: string) => ['surveys', 'detail', id, 'responses'] as const,
  public: (id: string) => ['surveys', 'public', id] as const,
}
