import { http } from '@/services/http'
import type { Vacinacao, VacinacaoPayload } from '@/types/vacinacao'

export const vacinacaoService = {
  listByBrinco(brinco: number) {
    return http.get<Vacinacao[]>(`/vacinacoes/animal/${brinco}`)
  },

  create(payload: VacinacaoPayload) {
    return http.post<Vacinacao>('/vacinacoes', payload)
  },
}
