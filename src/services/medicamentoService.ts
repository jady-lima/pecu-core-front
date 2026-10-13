import { http } from '@/services/http'
import type { Medicamento, MedicamentoPayload } from '@/types/medicamento'

export const medicamentoService = {
  listByBrinco(brinco: number) {
    return http.get<Medicamento[]>(`/medicamentos/animal/${brinco}`)
  },

  create(payload: MedicamentoPayload) {
    return http.post<Medicamento>('/medicamentos', payload)
  },
}
