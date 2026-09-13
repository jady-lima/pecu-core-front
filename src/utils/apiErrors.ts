import { HttpError } from '@/services/http'

function extractFromProblemDetail(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null
  }

  const problem = body as Record<string, unknown>

  if (Array.isArray(problem.errors) && problem.errors.length > 0) {
    const messages = problem.errors
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }
        if (item && typeof item === 'object') {
          const field = item as Record<string, unknown>
          const message = field.defaultMessage ?? field.message ?? field.detail
          if (typeof message === 'string') {
            return typeof field.field === 'string' ? `${field.field}: ${message}` : message
          }
        }
        return null
      })
      .filter((message): message is string => Boolean(message))

    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  if (typeof problem.detail === 'string' && problem.detail.trim() !== '') {
    return problem.detail
  }

  if (typeof problem.message === 'string' && problem.message.trim() !== '') {
    return problem.message
  }

  if (typeof problem.title === 'string' && problem.title.trim() !== '') {
    return problem.title
  }

  return null
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof HttpError)) {
    return fallback
  }

  if (err.status === 409) {
    return 'Este e-mail já está cadastrado.'
  }

  if (err.status === 403) {
    return 'Você não tem permissão para realizar esta ação.'
  }

  return extractFromProblemDetail(err.body) ?? fallback
}
