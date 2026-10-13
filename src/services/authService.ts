import { http } from '@/services/http'
import type {
  AlterarSenhaPayload,
  LoginCredentials,
  LoginResponse,
  UsuarioLogado,
} from '@/types/auth'

export const authService = {
  login(credentials: LoginCredentials) {
    return http.post<LoginResponse>('/auth/login', credentials, { skipAuth: true })
  },

  me() {
    return http.get<UsuarioLogado>('/auth/me')
  },

  alterarSenha(payload: AlterarSenhaPayload) {
    return http.put<void>('/auth/me/senha', payload)
  },
}
