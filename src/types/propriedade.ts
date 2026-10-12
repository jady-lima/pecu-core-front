export interface Propriedade {
  id: number
  nome: string
  localizacao: string
  usuarioId: number | null
}

export interface NovaPropriedadePayload {
  nome: string
  localizacao: string
  usuarioId?: number
}

export interface AtualizarPropriedadePayload {
  nome: string
  localizacao: string
}
