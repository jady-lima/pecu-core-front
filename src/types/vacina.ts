export interface Vacina {
  id: number
  nome: string
  fabricante: string
  carenciaDias: number
  intervaloDoseDias: number | null
}

export interface VacinaPayload {
  nome: string
  fabricante: string
  carenciaDias: number
  intervaloDoseDias: number | null
}
