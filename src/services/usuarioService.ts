import { http } from '@/services/http'
import type { AtualizarUsuarioPayload, NovoUsuarioPayload, Usuario, Perfil } from '@/types/usuario'

interface UsuarioRequest {
  nome: string
  username: string
  senha: string
  perfil: Perfil
}

export const usuarioService = {
  listAll() {
    return http.get<Usuario[]>('/usuarios')
  },

  getById(id: number | string) {
    return http.get<Usuario>(`/usuarios/${id}`)
  },

  create(payload: NovoUsuarioPayload) {
    return http.post<Usuario>('/usuarios', payload)
  },

  update(id: number | string, payload: AtualizarUsuarioPayload) {
    return http.put<Usuario>(`/usuarios/${id}`, payload)
  },

  remove(id: number | string) {
    return http.delete<void>(`/usuarios/${id}`)
  },
}
