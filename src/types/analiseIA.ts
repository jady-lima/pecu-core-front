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
  tipo: 'INDIVIDUAL' | 'COMPARATIVA'
  dataGeracao: string
  modelo: string
  relatorio: RelatorioAnalise | null
}
