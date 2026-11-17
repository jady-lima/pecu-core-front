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