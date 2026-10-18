export type SituacaoGeralAnimal = 'ESTAVEL' | 'ATENCAO' | 'CRITICO'

export const SITUACAO_GERAL_LABEL: Record<SituacaoGeralAnimal, string> = {
  ESTAVEL: 'Estável',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico',
}

export const SITUACAO_GERAL_CLASSE: Record<SituacaoGeralAnimal, string> = {
  ESTAVEL: 'bg-green-100 text-green-800',
  ATENCAO: 'bg-amber-100 text-amber-800',
  CRITICO: 'bg-red-100 text-red-800',
}

export type TipoAnalise = 'INDIVIDUAL' | 'COMPARATIVA'

export const TIPO_ANALISE_LABEL: Record<TipoAnalise, string> = {
  INDIVIDUAL: 'Individual',
  COMPARATIVA: 'Comparativa com lote',
}

export const TIPO_ANALISE_CLASSE: Record<TipoAnalise, string> = {
  INDIVIDUAL: 'bg-slate-100 text-slate-700',
  COMPARATIVA: 'bg-indigo-100 text-indigo-800',
}

export interface RelatorioAnalise {
  situacaoGeral: SituacaoGeralAnimal
  resumo: string
  evolucaoDesempenho: string
  pontosAtencao: string[]
  possiveisFatores: string[]
  recomendacoes: string[]
  acompanhamento: string[]
  limitacoesDados: string[]
}

export interface AnaliseIA {
  id: number
  animalId: number
  brinco: number
  tipo: TipoAnalise
  dataGeracao: string
  modelo: string
  relatorio: RelatorioAnalise | null
}
