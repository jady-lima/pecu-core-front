import { http } from '@/services/http'
import type { MetaDesempenho, MetaDesempenhoPayload } from '@/types/metaDesempenho'

export const metaDesempenhoService = {
  listAll() {
    return http.get<MetaDesempenho[]>('/metas-desempenho')
  },

  create(payload: MetaDesempenhoPayload) {
    return http.post<MetaDesempenho>('/metas-desempenho', payload)
  },

  update(id: number, payload: MetaDesempenhoPayload) {
    return http.put<MetaDesempenho>(`/metas-desempenho/${id}`, payload)
  },

  remove(id: number) {
    return http.delete<void>(`/metas-desempenho/${id}`)
  },
}
