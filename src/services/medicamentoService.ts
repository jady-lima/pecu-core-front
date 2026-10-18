import { http } from '@/services/http'
import type { Medicamento, MedicamentoPayload, MedicamentoUpdatePayload } from '@/types/medicamento'

export const medicamentoService = {
  listByBrinco(brinco: number) {
    return http.get<Medicamento[]>(`/medicamentos/animal/${brinco}`)
  },

  create(payload: MedicamentoPayload) {
    return http.post<Medicamento>('/medicamentos', payload)
  },

  update(id: number, payload: MedicamentoUpdatePayload) {
    return http.put<Medicamento>(`/medicamentos/${id}`, payload)
  },

  remove(id: number) {
    return http.delete<void>(`/medicamentos/${id}`)
  },
}
