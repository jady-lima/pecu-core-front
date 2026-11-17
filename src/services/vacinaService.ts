import { http } from '@/services/http'
import type { Vacina, VacinaPayload } from '@/types/vacina'

export const vacinaService = {
  listAll() {
    return http.get<Vacina[]>('/vacinas')
  },

  create(payload: VacinaPayload) {
    return http.post<Vacina>('/vacinas', payload)
  },

  update(id: number | string, payload: VacinaPayload) {
    return http.put<Vacina>(`/vacinas/${id}`, payload)
  },

  remove(id: number) {
    return http.delete<void>(`/vacinas/${id}`)
  },
}
