export type TipoAlimentacao = 'PASTO' | 'RACAO' | 'SUPLEMENTO_REFORCO'

export const TIPO_ALIMENTACAO_LABEL: Record<TipoAlimentacao, string> = {
  PASTO: 'Pasto',
  RACAO: 'Ração',
  SUPLEMENTO_REFORCO: 'Suplemento / reforço',
}

export interface Alimentacao {
  id: number
  brinco: number
  tipo: TipoAlimentacao
  quantidade: number
  data: string
  valor: number | null
}

export interface AlimentacaoAnimalPayload {
  brinco: number
  tipo: TipoAlimentacao
  quantidade: number
  data: string
  valor: number | null
}

export interface AlimentacaoLotePayload {
  loteId: number
  tipo: TipoAlimentacao
  quantidade: number
  data: string
  valor: number | null
}
