import { http } from '@/services/http'
import type { Lote, LotePayload } from '@/types/lote'

export const loteService = {
  listAll() {
    return http.get<Lote[]>('/lotes')
  },

  getById(id: number | string) {
    return http.get<Lote>(`/lotes/${id}`)
  },

  create(payload: LotePayload) {
    return http.post<Lote>('/lotes', payload)
  },

  update(id: number | string, payload: LotePayload) {
    return http.put<Lote>(`/lotes/${id}`, payload)
  },

  remove(id: number | string) {
    return http.delete<void>(`/lotes/${id}`)
  },
}
