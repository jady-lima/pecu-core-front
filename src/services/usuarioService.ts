import { http } from '@/services/http'
import type { Usuario } from '@/types/usuario'

export const usuarioService = {
  listAll() {
    return http.get<Usuario[]>('/usuarios')
  },
}
