export interface Vacinacao {
  id: number
  brinco: number
  vacinaId: number
  nomeVacina: string
  data: string
  loteVacina: string
  doseAplicada: number
  dataProximaDose: string | null
  dataFimCarencia: string | null
  observacoes: string | null
  aplicadorId: number
  aplicador: string
  registradoPor: string
  valor: number | null
}

export interface VacinacaoPayload {
  brinco: number
  vacinaId: number
  aplicadorId: number
  data: string
  loteVacina: string
  doseAplicada: number
  observacoes: string | null
  valor: number | null
}

export type VacinacaoUpdatePayload = Omit<VacinacaoPayload, 'brinco'>
