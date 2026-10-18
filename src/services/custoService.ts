import { http } from '@/services/http'
import type { Custo, CustoPayload } from '@/types/custo'

export const custoService = {
  listAll() {
    return http.get<Custo[]>('/custos')
  },

  create(payload: CustoPayload) {
    return http.post<Custo>('/custos', payload)
  },

  update(id: number, payload: CustoPayload) {
    return http.put<Custo>(`/custos/${id}`, payload)
  },

  remove(id: number) {
    return http.delete<void>(`/custos/${id}`)
  },
}
