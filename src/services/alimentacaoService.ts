import { http } from '@/services/http'
import type {
  Alimentacao,
  AlimentacaoAnimalPayload,
  AlimentacaoLotePayload,
} from '@/types/alimentacao'

export const alimentacaoService = {
  listByBrinco(brinco: number) {
    return http.get<Alimentacao[]>(`/alimentacoes/animal/${brinco}`)
  },

  createParaAnimal(payload: AlimentacaoAnimalPayload) {
    return http.post<Alimentacao>('/alimentacoes', payload)
  },

  createParaLote(payload: AlimentacaoLotePayload) {
    return http.post<Alimentacao[]>('/alimentacoes/lote', payload)
  },
}
