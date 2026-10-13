import { medicamentoService } from '@/services/medicamentoService'
import { vacinacaoService } from '@/services/vacinacaoService'
import { dataHojeIso } from '@/utils/formatters'

export const carenciaService = {
  async fimCarencia(brinco: number): Promise<string | null> {
    const [vacinacoes, medicamentos] = await Promise.all([
      vacinacaoService.listByBrinco(brinco),
      medicamentoService.listByBrinco(brinco),
    ])

    const hoje = dataHojeIso()

    const datasEmCarencia = [...vacinacoes, ...medicamentos]
      .map((registro) => registro.dataFimCarencia)
      .filter((data): data is string => data !== null && data > hoje)
      .sort()

    return datasEmCarencia.at(-1) ?? null
  },
}
