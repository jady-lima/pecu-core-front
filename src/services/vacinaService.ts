import { http } from '@/services/http'
import type { Vacina, VacinaPayload } from '@/types/vacina'

export const vacinaService = {
  listAll() {
    return http.get<Vacina[]>('/vacinas')
  },

  getById(id: number | string) {
    return http.get<Vacina>(`/vacinas/${id}`)
  },

  create(payload: VacinaPayload) {
    return http.post<Vacina>('/vacinas', payload)
  },

  update(id: number | string, payload: VacinaPayload) {
    return http.put<Vacina>(`/vacinas/${id}`, payload)
  },
}
