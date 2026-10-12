import { useAuthStore } from '@/stores/auth'

const baseURL = import.meta.env.VITE_API_BASE_URL

export class HttpError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown; skipAuth?: boolean }

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const auth = useAuthStore()
  const { body, headers, skipAuth, ...rest } = options

  const response = await fetch(`${baseURL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(auth.token && !skipAuth ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const tokenInvalido =
    response.status === 401 ||
    (response.status === 403 && path === '/auth/me')

  if (tokenInvalido) {
    auth.logout()

    // Não redireciona quando a própria tentativa de login falha.
    if (
      path !== '/auth/login' &&
      window.location.pathname !== '/login'
    ) {
      window.location.replace('/login')
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new HttpError(response.status, errorBody)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'GET',
    }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body,
    }),

  put: <T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body,
    }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'DELETE',
    }),
}