import { http } from '@/services/http'
import type { Usuario, Perfil } from '@/types/usuario'

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

  getById(id: number) {
    return http.get<Usuario>(`/usuarios/${id}`)
  },

  create(usuario: UsuarioRequest) {
    return http.post<Usuario>('/usuarios', usuario)
  },

  update(id: number, usuario: UsuarioRequest) {
    return http.put<Usuario>(`/usuarios/${id}`, usuario)
  },

  delete(id: number) {
    return http.delete(`/usuarios/${id}`)
  },
}