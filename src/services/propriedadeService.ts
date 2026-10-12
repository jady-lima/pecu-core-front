import { http } from '@/services/http'
import type {
  AtualizarPropriedadePayload,
  NovaPropriedadePayload,
  Propriedade,
} from '@/types/propriedade'
import type { Usuario } from '@/types/usuario'

export const propriedadeService = {
  listAll() {
    return http.get<Propriedade[]>('/propriedades')
  },

  getById(id: number | string) {
    return http.get<Propriedade>(`/propriedades/${id}`)
  },

  create(payload: NovaPropriedadePayload) {
    return http.post<Propriedade>('/propriedades', payload)
  },

  update(id: number | string, payload: AtualizarPropriedadePayload) {
    return http.put<Propriedade>(`/propriedades/${id}`, payload)
  },

  remove(id: number | string) {
    return http.delete<void>(`/propriedades/${id}`)
  },

  listVeterinarios(id: number | string) {
    return http.get<Usuario[]>(`/propriedades/${id}/veterinarios`)
  },

  vincularVeterinario(id: number | string, veterinarioId: number) {
    return http.post<Propriedade>(`/propriedades/${id}/veterinarios/${veterinarioId}`)
  },

  desvincularVeterinario(id: number | string, veterinarioId: number) {
    return http.delete<void>(`/propriedades/${id}/veterinarios/${veterinarioId}`)
  },
}
