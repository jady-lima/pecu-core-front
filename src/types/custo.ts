export type TipoCusto = 'ALIMENTACAO' | 'MEDICAMENTO' | 'VACINA' | 'MAO_DE_OBRA' | 'OUTROS'

export const TIPO_CUSTO_LABEL: Record<TipoCusto, string> = {
  ALIMENTACAO: 'Alimentação',
  MEDICAMENTO: 'Medicamento',
  VACINA: 'Vacina',
  MAO_DE_OBRA: 'Mão de obra',
  OUTROS: 'Outros',
}

export type OrigemCusto = 'MANUAL' | 'AUTOMATICO'

export const ORIGEM_CUSTO_LABEL: Record<OrigemCusto, string> = {
  MANUAL: 'Manual',
  AUTOMATICO: 'Automático',
}

export interface Custo {
  id: number
  tipo: TipoCusto
  origem: OrigemCusto
  valor: number
  data: string
  animalId: number | null
  loteId: number | null
  propriedadeId: number | null
}

export interface CustoPayload {
  tipo: TipoCusto
  valor: number
  data: string
  animalId: number | null
  loteId: number | null
  propriedadeId: number | null
}
