/** Código da fase do lote. As fases válidas vêm do back (GET /lotes/fases) e mudam conforme a aplicação. */
export type FinalidadeLote = string

export interface FaseLote {
  codigo: FinalidadeLote
  descricao: string
}

export interface Lote {
  id: number
  numero: number
  finalidade: FinalidadeLote
  capacidade: number
  dataCriacao: string
  propriedadeId: number
  gmdMeta: number | null
}

export interface LotePayload {
  numero: number
  finalidade: FinalidadeLote
  capacidade: number
  dataCriacao: string
  propriedadeId: number
}