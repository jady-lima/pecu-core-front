import { http } from '@/services/http'
import type { Lote } from '@/types/lote'

export const loteService = {
  listAll() {
    return http.get<Lote[]>('/lotes')
  },

  getById(id: number) {
    return http.get<Lote>(`/lotes/${id}`)
  },

  create(lote: Omit<Lote, 'id'>) {
    return http.post<Lote>('/lotes', lote)
  },

  update(id: number, lote: Omit<Lote, 'id'>) {
    return http.put<Lote>(`/lotes/${id}`, lote)
  },

  delete(id: number) {
    return http.delete(`/lotes/${id}`)
  },
}
