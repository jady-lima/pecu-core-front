import { http } from '@/services/http'
import type { Custo, CustoPayload } from '@/types/custo'

export const custoService = {
  listAll() {
    return http.get<Custo[]>('/custos')
  },

  create(payload: CustoPayload) {
    return http.post<Custo>('/custos', payload)
  },
}
