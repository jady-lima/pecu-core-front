import { http } from '@/services/http'
import type { Alerta, StatusAlerta } from '@/types/alerta'

export const alertaService = {
  listarAlertas() {
    return http.get<Alerta[]>('/alertas')
  },

  atualizarStatusAlerta(id: number, status: StatusAlerta) {
    return http.put<Alerta>(`/alertas/${id}/status`, { status })
  },
}