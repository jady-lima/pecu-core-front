export interface Pesagem {
  id: number
  brinco: number
  peso: number
  dataPesagem: string
  gmdCalculado: number | null
  aviso: string | null
}

export interface PesagemPayload {
  brinco: number
  pesoAtual: number
  dataPesagem: string
}
