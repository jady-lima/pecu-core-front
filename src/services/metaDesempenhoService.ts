import { http } from '@/services/http'
import type { MetaDesempenho, MetaDesempenhoPayload } from '@/types/metaDesempenho'

export const metaDesempenhoService = {
  listAll() {
    return http.get<MetaDesempenho[]>('/metas-desempenho')
  },

  create(payload: MetaDesempenhoPayload) {
    return http.post<MetaDesempenho>('/metas-desempenho', payload)
  },
}
