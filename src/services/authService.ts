import { http } from '@/services/http'
import type { LoginCredentials, LoginResponse, UsuarioLogado } from '@/types/auth'

export const authService = {
  login(credentials: LoginCredentials) {
    return http.post<LoginResponse>('/auth/login', credentials, { skipAuth: true })
  },
  
  me() {
    return http.get<UsuarioLogado>('/auth/me')
  },
}
