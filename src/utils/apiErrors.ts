import { HttpError } from '@/services/http'

function extractMensagem(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null
  }

  const mensagem = (body as Record<string, unknown>).mensagem

  if (typeof mensagem === 'string' && mensagem.trim() !== '') {
    return mensagem
  }

  return null
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof HttpError)) {
    return fallback
  }

  const mensagem = extractMensagem(err.body)

  if (mensagem) {
    return mensagem
  }

  if (err.status === 403) {
    return 'Você não tem permissão para realizar esta ação.'
  }

  return fallback
}
