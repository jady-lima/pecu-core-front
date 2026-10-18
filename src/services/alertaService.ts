
import { http } from '@/services/http'

export type StatusAlerta =
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'RESOLVIDO'
  | 'IGNORADO'

export interface Alerta {
  id: number
  tipo: string
  severidade: string
  mensagem: string
  status: StatusAlerta
  dataCriacao: string
  animal: {
    id: number
    brinco: number
  }
}

export const listarAlertas = () => {
  return http.get<Alerta[]>('/alertas')
}

export const atualizarStatusAlerta = (
  id: number,
  status: StatusAlerta,
) => {
  return http.put<Alerta>(
    `/alertas/${id}/status?status=${encodeURIComponent(status)}`,
  )
}
