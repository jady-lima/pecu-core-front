export interface Medicamento {
  id: number
  brinco: number
  nome: string
  motivo: string
  dosagem: number
  carenciaDias: number
  data: string
  dataFimCarencia: string | null
  valor: number | null
}

export interface MedicamentoPayload {
  brinco: number
  nome: string
  motivo: string
  dosagem: number
  carenciaDias: number
  data: string
  valor: number | null
}
