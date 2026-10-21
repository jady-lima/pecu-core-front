import type { FinalidadeLote } from '@/types/lote'

export type SexoAnimal = 'Macho' | 'Femea'

export const SEXO_ANIMAL_LABEL: Record<SexoAnimal, string> = {
  Macho: 'Macho',
  Femea: 'Fêmea',
}

export type StatusAnimal = 'ATIVO' | 'VENDIDO' | 'OBITO' | 'ABATIDO'

export const STATUS_ANIMAL_LABEL: Record<StatusAnimal, string> = {
  ATIVO: 'Ativo',
  VENDIDO: 'Vendido',
  OBITO: 'Óbito',
  ABATIDO: 'Abatido',
}

export const STATUS_ANIMAL_CLASSE: Record<StatusAnimal, string> = {
  ATIVO: 'bg-green-100 text-green-800',
  VENDIDO: 'bg-blue-100 text-blue-800',
  OBITO: 'bg-slate-200 text-slate-700',
  ABATIDO: 'bg-amber-100 text-amber-800',
}

export interface Animal {
  id: number
  brinco: number
  dataNascimento: string
  pesoAtual: number
  sexo: SexoAnimal
  loteId: number
  status: StatusAnimal
}

export interface FichaAnimal {
  id: number
  brinco: number
  dataNascimento: string
  pesoAtual: number
  sexo: SexoAnimal
  status: StatusAnimal
  loteId: number
  numeroLote: number
  finalidadeLote: FinalidadeLote
  capacidadeLote: number
  dataCriacaoLote: string
  propriedadeId: number
  nomePropriedade: string
  localizacaoPropriedade: string
}

export interface AnimalPayload {
  brinco: number
  dataNascimento: string
  pesoAtual: number
  sexo: SexoAnimal
  loteId: number
  dataPrimeiraPesagem: string
}
