export type FinalidadeLote =
  | 'CORTE'
  | 'RECRIA'
  | 'ENGORDA'
  | 'REPRODUCAO'
  | 'QUARENTENA'
  | 'DESMAME'

export const FINALIDADE_LOTE_LABEL: Record<FinalidadeLote, string> = {
  CORTE: 'Corte',
  RECRIA: 'Recria',
  ENGORDA: 'Engorda',
  REPRODUCAO: 'Reprodução',
  QUARENTENA: 'Quarentena',
  DESMAME: 'Desmame',
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
