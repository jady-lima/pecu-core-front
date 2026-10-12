import { http } from '@/services/http'

interface RegistroComCarencia {
  dataFimCarencia: string | null
}

function dataHojeIso() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

export const carenciaService = {
  async fimCarencia(brinco: number): Promise<string | null> {
    const [vacinacoes, medicamentos] = await Promise.all([
      http.get<RegistroComCarencia[]>(`/vacinacoes/animal/${brinco}`),
      http.get<RegistroComCarencia[]>(`/medicamentos/animal/${brinco}`),
    ])

    const hoje = dataHojeIso()

    const datasEmCarencia = [...vacinacoes, ...medicamentos]
      .map((registro) => registro.dataFimCarencia)
      .filter((data): data is string => data !== null && data > hoje)
      .sort()

    return datasEmCarencia.at(-1) ?? null
  },
}
