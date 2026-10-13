import { http } from '@/services/http'
import type { Pesagem, PesagemPayload } from '@/types/pesagem'

export const pesagemService = {
  listByBrinco(brinco: number) {
    return http.get<Pesagem[]>(`/pesagens/animal/${brinco}`)
  },

  create(payload: PesagemPayload) {
    return http.post<Pesagem>('/pesagens', payload)
  },
}
