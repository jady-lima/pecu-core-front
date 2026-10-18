import { http } from '@/services/http'
import type { Vacinacao, VacinacaoPayload, VacinacaoUpdatePayload } from '@/types/vacinacao'

export const vacinacaoService = {
  listByBrinco(brinco: number) {
    return http.get<Vacinacao[]>(`/vacinacoes/animal/${brinco}`)
  },

  create(payload: VacinacaoPayload) {
    return http.post<Vacinacao>('/vacinacoes', payload)
  },

  update(id: number, payload: VacinacaoUpdatePayload) {
    return http.put<Vacinacao>(`/vacinacoes/${id}`, payload)
  },

  remove(id: number) {
    return http.delete<void>(`/vacinacoes/${id}`)
  },
}
