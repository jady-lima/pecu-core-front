import { http } from '@/services/http'
import type { FaseLote, Lote, LotePayload } from '@/types/lote'

export const loteService = {
  listAll() {
    return http.get<Lote[]>('/lotes')
  },


  listFases() {
    return http.get<FaseLote[]>('/lotes/fases')
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

  definirMetaGmd(id: number | string, gmdEsperado: number) {
    return http.put<Lote>(`/lotes/${id}/meta-gmd`, { gmdEsperado })
  },

  removerMetaGmd(id: number | string) {
    return http.delete<void>(`/lotes/${id}/meta-gmd`)
  },
}
