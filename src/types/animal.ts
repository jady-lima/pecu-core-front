export type SexoAnimal = "Macho" | "Femea"

export type StatusAnimal =
  | "ATIVO"
  | "VENDIDO"
  | "OBITO"
  | "ABATIDO"

export interface Animal {
  id: number
  brinco: number
  dataNascimento: string
  pesoAtual: number
  sexo: SexoAnimal
  loteId: number
  status: StatusAnimal
}