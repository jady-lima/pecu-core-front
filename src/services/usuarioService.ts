import { http } from '@/services/http'
import type { NovoUsuarioPayload, Usuario } from '@/types/usuario'

export const usuarioService = {
  listAll() {
    return http.get<Usuario[]>('/usuarios')
  },

  create(payload: NovoUsuarioPayload) {
    return http.post<Usuario>('/usuarios', payload)
  },

  remove(id: number | string) {
    return http.delete<void>(`/usuarios/${id}`)
  },
}
