
<template>
  <PageLayout titulo="Desempenho" subtitulo="Manejo">
    <p v-if="loading" class="text-sm text-slate-500">
      Carregando dados de desempenho...
    </p>

    <div
      v-else-if="erroLista && historicos.length === 0"
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ erroLista }}
    </div>

    <template v-else>
      <p
        v-if="erroLista"
        class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
      >
        {{ erroLista }}
      </p>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p class="text-sm text-slate-500">Ganho médio diário</p>
          <p class="mt-1 text-2xl font-semibold text-slate-900">
            {{ gmdMedio === null ? '-' : `${formatarNumero(gmdMedio)} kg/dia` }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Média do GMD dos animais com histórico suficiente
          </p>
        </div>

        <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p class="text-sm text-slate-500">Animais acompanhados</p>
          <p class="mt-1 text-2xl font-semibold text-slate-900">
            {{ animaisAcompanhados }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Animais com pelo menos uma pesagem
          </p>
        </div>

        <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p class="text-sm text-slate-500">Evolução média do peso</p>
          <p
            class="mt-1 text-2xl font-semibold"
            :class="
              variacaoMedia === null
                ? 'text-slate-900'
                : variacaoMedia >= 0
                  ? 'text-green-700'
                  : 'text-red-700'
            "
          >
            {{ variacaoMedia === null ? '-' : `${formatarNumero(variacaoMedia)} kg` }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Variação média entre a primeira e a última pesagem
          </p>
        </div>
      </section>

      <section class="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-slate-900">
            Evolução do peso dos animais
          </h3>
          <p class="mt-1 text-sm text-slate-500">
            Histórico de pesagens de todos os animais acompanhados.
          </p>
        </div>

        <p v-if="seriesGeral.length === 0" class="py-8 text-center text-sm text-slate-500">
          Ainda não há pesagens suficientes para exibir o gráfico.
        </p>

        <template v-else>
          <div class="overflow-x-auto">
            <svg
              viewBox="0 0 800 320"
              class="w-full min-w-[600px]"
              role="img"
              aria-label="Gráfico geral da evolução do peso dos animais"
            >
              <g v-for="linha in 5" :key="linha">
                <line
                  x1="65"
                  :y1="35 + (linha - 1) * 55"
                  x2="770"
                  :y2="35 + (linha - 1) * 55"
                  stroke="#e2e8f0"
                  stroke-width="1"
                />
                <text
                  x="55"
                  :y="39 + (linha - 1) * 55"
                  text-anchor="end"
                  fill="#64748b"
                  font-size="11"
                >
                  {{
                    formatarNumero(
                      graficoGeral.maxPeso -
                        ((graficoGeral.maxPeso - graficoGeral.minPeso) * (linha - 1)) / 4,
                    )
                  }}
                </text>
              </g>

              <text x="65" y="18" fill="#64748b" font-size="11">
                Peso (kg)
              </text>

              <text x="65" y="310" fill="#64748b" font-size="11">
                {{ formatarDataCurta(graficoGeral.dataInicial) }}
              </text>

              <text
                x="770"
                y="310"
                text-anchor="end"
                fill="#64748b"
                font-size="11"
              >
                {{ formatarDataCurta(graficoGeral.dataFinal) }}
              </text>

              <g v-for="serie in seriesGeral" :key="serie.brinco">
                <polyline
                  v-if="serie.pontos.length > 1"
                  :points="serie.pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(' ')"
                  fill="none"
                  :stroke="serie.cor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <circle
                  v-for="(ponto, indice) in serie.pontos"
                  :key="`${serie.brinco}-${indice}`"
                  :cx="ponto.x"
                  :cy="ponto.y"
                  r="3.5"
                  :fill="serie.cor"
                >
                  <title>
                    Brinco {{ serie.brinco }} — {{ formatarData(ponto.data) }}:
                    {{ formatarNumero(ponto.peso) }} kg
                  </title>
                </circle>
              </g>
            </svg>
          </div>

          <div class="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <div
              v-for="serie in seriesGeral"
              :key="`legenda-${serie.brinco}`"
              class="flex items-center gap-2 text-sm text-slate-600"
            >
              <span
                class="inline-block h-3 w-3 rounded-full"
                :style="{ backgroundColor: serie.cor }"
              />
              Brinco {{ serie.brinco }}
            </div>
          </div>
        </template>
      </section>

      <section class="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-slate-900">
            Desempenho por animal
          </h3>
          <p class="mt-1 text-sm text-slate-500">
            Selecione um animal para consultar suas pesagens.
          </p>
        </div>

        <div class="mb-5 max-w-sm">
          <label
            for="desempenho-animal"
            class="mb-1 block text-sm font-medium text-slate-700"
          >
            Animal
          </label>

          <select
            id="desempenho-animal"
            v-model="brincoSelecionado"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option
              v-for="historico in historicosComPesagem"
              :key="historico.animal.id"
              :value="historico.animal.brinco"
            >
              Brinco {{ historico.animal.brinco }}
            </option>
          </select>
        </div>

        <template v-if="historicoSelecionado">
          <div class="mb-4 grid gap-3 sm:grid-cols-3">
            <div class="rounded-md bg-slate-50 p-3">
              <p class="text-xs text-slate-500">Pesagens registradas</p>
              <p class="mt-1 text-lg font-semibold text-slate-900">
                {{ historicoSelecionado.pesagens.length }}
              </p>
            </div>

            <div class="rounded-md bg-slate-50 p-3">
              <p class="text-xs text-slate-500">Peso mais recente</p>
              <p class="mt-1 text-lg font-semibold text-slate-900">
                {{ formatarNumero(ultimaPesagemSelecionada!.peso) }} kg
              </p>
            </div>

            <div class="rounded-md bg-slate-50 p-3">
              <p class="text-xs text-slate-500">GMD histórico</p>
              <p class="mt-1 text-lg font-semibold text-slate-900">
                {{
                  gmdSelecionado === null
                    ? '-'
                    : `${formatarNumero(gmdSelecionado)} kg/dia`
                }}
              </p>
            </div>
          </div>

          <div v-if="graficoIndividual.pontos.length > 0" class="overflow-x-auto">
            <svg
              viewBox="0 0 800 300"
              class="w-full min-w-[600px]"
              role="img"
              :aria-label="`Evolução do peso do animal ${brincoSelecionado}`"
            >
              <g v-for="linha in 5" :key="linha">
                <line
                  x1="65"
                  :y1="35 + (linha - 1) * 50"
                  x2="770"
                  :y2="35 + (linha - 1) * 50"
                  stroke="#e2e8f0"
                  stroke-width="1"
                />
                <text
                  x="55"
                  :y="39 + (linha - 1) * 50"
                  text-anchor="end"
                  fill="#64748b"
                  font-size="11"
                >
                  {{
                    formatarNumero(
                      graficoIndividual.maxPeso -
                        ((graficoIndividual.maxPeso - graficoIndividual.minPeso) *
                          (linha - 1)) /
                          4,
                    )
                  }}
                </text>
              </g>

              <text x="65" y="18" fill="#64748b" font-size="11">
                Peso (kg)
              </text>

              <polyline
                v-if="graficoIndividual.pontos.length > 1"
                :points="
                  graficoIndividual.pontos
                    .map((ponto) => `${ponto.x},${ponto.y}`)
                    .join(' ')
                "
                fill="none"
                stroke="#2563eb"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g v-for="(ponto, indice) in graficoIndividual.pontos" :key="indice">
                <circle :cx="ponto.x" :cy="ponto.y" r="5" fill="#2563eb">
                  <title>
                    {{ formatarData(ponto.data) }}:
                    {{ formatarNumero(ponto.peso) }} kg
                  </title>
                </circle>
              </g>

              <text x="65" y="290" fill="#64748b" font-size="11">
                {{ formatarDataCurta(graficoIndividual.dataInicial) }}
              </text>

              <text
                x="770"
                y="290"
                text-anchor="end"
                fill="#64748b"
                font-size="11"
              >
                {{ formatarDataCurta(graficoIndividual.dataFinal) }}
              </text>
            </svg>
          </div>

          <div class="mt-5">
            <h4 class="mb-3 font-medium text-slate-900">Histórico de pesagens</h4>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-100 text-slate-600">
                  <tr>
                    <th class="px-4 py-3 font-medium">Data</th>
                    <th class="px-4 py-3 text-right font-medium">Peso</th>
                    <th class="px-4 py-3 text-right font-medium">GMD</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-slate-200">
                  <tr
                    v-for="pesagem in historicoSelecionado.pesagens"
                    :key="pesagem.id"
                  >
                    <td class="px-4 py-3 text-slate-700">
                      {{ formatarData(pesagem.dataPesagem) }}
                    </td>
                    <td class="px-4 py-3 text-right text-slate-700">
                      {{ formatarNumero(pesagem.peso) }} kg
                    </td>
                    <td class="px-4 py-3 text-right text-slate-700">
                      {{
                        pesagem.gmdCalculado === null
                          ? '-'
                          : `${formatarNumero(pesagem.gmdCalculado)} kg/dia`
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <p v-else class="py-8 text-center text-sm text-slate-500">
          Nenhum animal possui pesagens registradas.
        </p>
      </section>

      <section class="mt-6 grid gap-4 md:grid-cols-2">
        <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 class="font-semibold text-slate-900">Queda de peso</h3>
          <p class="mt-2 text-2xl font-semibold text-slate-900">
            {{ animaisComQueda }}
          </p>
          <p class="mt-1 text-sm text-slate-500">
            Animais cuja última pesagem ficou abaixo da anterior.
          </p>
        </div>

        <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 class="font-semibold text-slate-900">GMD por animal</h3>
          <p class="mt-2 text-sm text-slate-600">
            O GMD histórico é calculado pela diferença entre a primeira e a
            última pesagem, dividida pelo número de dias entre elas.
          </p>
        </div>
      </section>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { animalService } from '@/services/animalService'
import { pesagemService } from '@/services/pesagemService'
import type { Animal } from '@/types/animal'
import type { Pesagem } from '@/types/pesagem'
import { getApiErrorMessage } from '@/utils/apiErrors'

interface HistoricoAnimal {
  animal: Animal
  pesagens: Pesagem[]
}

interface PontoGrafico {
  x: number
  y: number
  data: string
  peso: number
}

interface SerieGrafico {
  brinco: number
  cor: string
  pontos: PontoGrafico[]
}

interface DadosGrafico {
  pontos: PontoGrafico[]
  minPeso: number
  maxPeso: number
  dataInicial: string
  dataFinal: string
}

const CORES_GRAFICO = [
  '#2563eb',
  '#16a34a',
  '#9333ea',
  '#ea580c',
  '#0891b2',
  '#db2777',
  '#4f46e5',
  '#65a30d',
  '#c026d3',
  '#0d9488',
]

const historicos = ref<HistoricoAnimal[]>([])
const loading = ref(true)
const erroLista = ref('')
const brincoSelecionado = ref<number | null>(null)

const historicosComPesagem = computed(() =>
  historicos.value
    .filter((historico) => historico.pesagens.length > 0)
    .sort((a, b) => a.animal.brinco - b.animal.brinco),
)

const historicoSelecionado = computed(
  () =>
    historicosComPesagem.value.find(
      (historico) => historico.animal.brinco === brincoSelecionado.value,
    ) ?? null,
)

const ultimaPesagemSelecionada = computed(() => {
  const pesagens = historicoSelecionado.value?.pesagens
  return pesagens?.length ? pesagens[pesagens.length - 1] : null
})

const animaisAcompanhados = computed(() => historicosComPesagem.value.length)

function diasEntre(dataInicial: string, dataFinal: string): number {
  const inicio = new Date(`${dataInicial}T00:00:00`).getTime()
  const fim = new Date(`${dataFinal}T00:00:00`).getTime()
  return Math.round((fim - inicio) / 86400000)
}

function gmdHistorico(historico: HistoricoAnimal): number | null {
  const pesagens = historico.pesagens
  if (pesagens.length < 2) return null

  const primeira = pesagens[0]!
  const ultima = pesagens[pesagens.length - 1]!
  const dias = diasEntre(primeira.dataPesagem, ultima.dataPesagem)

  if (dias <= 0) return null

  return (ultima.peso - primeira.peso) / dias
}

const gmdMedio = computed(() => {
  const valores = historicosComPesagem.value
    .map(gmdHistorico)
    .filter((valor): valor is number => valor !== null && Number.isFinite(valor))

  if (valores.length === 0) return null

  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length
})

const variacaoMedia = computed(() => {
  const variacoes = historicosComPesagem.value
    .filter((historico) => historico.pesagens.length >= 2)
    .map((historico) => {
      const primeira = historico.pesagens[0]!
      const ultima = historico.pesagens[historico.pesagens.length - 1]!
      return ultima.peso - primeira.peso
    })

  if (variacoes.length === 0) return null

  return variacoes.reduce((soma, variacao) => soma + variacao, 0) / variacoes.length
})

const gmdSelecionado = computed(() =>
  historicoSelecionado.value ? gmdHistorico(historicoSelecionado.value) : null,
)

const animaisComQueda = computed(
  () =>
    historicosComPesagem.value.filter((historico) => {
      if (historico.pesagens.length < 2) return false

      const ultima = historico.pesagens[historico.pesagens.length - 1]!
      const anterior = historico.pesagens[historico.pesagens.length - 2]!

      return ultima.peso < anterior.peso
    }).length,
)

function ordenarPesagens(pesagens: Pesagem[]): Pesagem[] {
  return [...pesagens].sort(
    (a, b) =>
      a.dataPesagem.localeCompare(b.dataPesagem) || a.id - b.id,
  )
}

function criarDadosGrafico(
  pesagens: Pesagem[],
  minDataGlobal?: number,
  maxDataGlobal?: number,
  minPesoGlobal?: number,
  maxPesoGlobal?: number,
): DadosGrafico {
  if (pesagens.length === 0) {
    return {
      pontos: [],
      minPeso: 0,
      maxPeso: 1,
      dataInicial: '',
      dataFinal: '',
    }
  }

  const datas = pesagens.map((pesagem) =>
    new Date(`${pesagem.dataPesagem}T00:00:00`).getTime(),
  )
  const pesos = pesagens.map((pesagem) => pesagem.peso)

  const menorData = minDataGlobal ?? Math.min(...datas)
  const maiorData = maxDataGlobal ?? Math.max(...datas)
  const menorPeso = minPesoGlobal ?? Math.min(...pesos)
  const maiorPeso = maxPesoGlobal ?? Math.max(...pesos)

  const faixaPeso = maiorPeso - menorPeso || 1
  const faixaData = maiorData - menorData || 1

  const pontos = pesagens.map((pesagem) => {
    const data = new Date(`${pesagem.dataPesagem}T00:00:00`).getTime()

    return {
      x: 65 + ((data - menorData) / faixaData) * 705,
      y: 35 + ((maiorPeso - pesagem.peso) / faixaPeso) * 220,
      data: pesagem.dataPesagem,
      peso: pesagem.peso,
    }
  })

  return {
    pontos,
    minPeso: menorPeso,
    maxPeso: maiorPeso,
    dataInicial: pesagens[0]!.dataPesagem,
    dataFinal: pesagens[pesagens.length - 1]!.dataPesagem,
  }
}

const graficoGeral = computed(() => {
  const pesagens = historicosComPesagem.value.flatMap(
    (historico) => historico.pesagens,
  )

  if (pesagens.length === 0) {
    return criarDadosGrafico([])
  }

  const datas = pesagens.map((pesagem) =>
    new Date(`${pesagem.dataPesagem}T00:00:00`).getTime(),
  )
  const pesos = pesagens.map((pesagem) => pesagem.peso)

  const menorData = Math.min(...datas)
  const maiorData = Math.max(...datas)
  const menorPeso = Math.min(...pesos)
  const maiorPeso = Math.max(...pesos)
  const margem = (maiorPeso - menorPeso) * 0.1 || 1

  return {
    minData: menorData,
    maxData: maiorData,
    minPeso: menorPeso - margem,
    maxPeso: maiorPeso + margem,
    dataInicial: new Date(menorData).toISOString().slice(0, 10),
    dataFinal: new Date(maiorData).toISOString().slice(0, 10),
  }
})

const seriesGeral = computed<SerieGrafico[]>(() => {
  const dados = graficoGeral.value

  if (!('minData' in dados)) return []

  return historicosComPesagem.value.map((historico, indice) => {
    const grafico = criarDadosGrafico(
      historico.pesagens,
      dados.minData,
      dados.maxData,
      dados.minPeso,
      dados.maxPeso,
    )

    return {
      brinco: historico.animal.brinco,
      cor: CORES_GRAFICO[indice % CORES_GRAFICO.length]!,
      pontos: grafico.pontos,
    }
  })
})

const graficoIndividual = computed(() => {
  const pesagens = historicoSelecionado.value?.pesagens ?? []

  if (pesagens.length === 0) {
    return criarDadosGrafico([])
  }

  const pesos = pesagens.map((pesagem) => pesagem.peso)
  const menorPeso = Math.min(...pesos)
  const maiorPeso = Math.max(...pesos)
  const margem = (maiorPeso - menorPeso) * 0.1 || 1

  return criarDadosGrafico(
    pesagens,
    undefined,
    undefined,
    menorPeso - margem,
    maiorPeso + margem,
  )
})

function formatarNumero(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatarData(data: string): string {
  if (!data) return '-'

  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarDataCurta(data: string): string {
  if (!data) return '-'

  const [, mes, dia] = data.split('-')
  return `${dia}/${mes}`
}

async function carregarDesempenho() {
  loading.value = true
  erroLista.value = ''

  try {
    const animais = await animalService.listAll()

    const resultados = await Promise.allSettled(
      animais.map(async (animal) => ({
        animal,
        pesagens: ordenarPesagens(
          await pesagemService.listByBrinco(animal.brinco),
        ),
      })),
    )

    historicos.value = resultados
      .filter(
        (
          resultado,
        ): resultado is PromiseFulfilledResult<HistoricoAnimal> =>
          resultado.status === 'fulfilled',
      )
      .map((resultado) => resultado.value)

    const falhas = resultados.filter(
      (resultado) => resultado.status === 'rejected',
    ).length

    if (falhas > 0) {
      erroLista.value =
        `Não foi possível carregar o histórico de ${falhas} animal(is). ` +
        'Os gráficos podem estar incompletos.'
    }

    if (
      !historicosComPesagem.value.some(
        (historico) => historico.animal.brinco === brincoSelecionado.value,
      )
    ) {
      brincoSelecionado.value =
        historicosComPesagem.value[0]?.animal.brinco ?? null
    }
  } catch (err) {
    console.error('Falha ao carregar desempenho', err)
    erroLista.value = getApiErrorMessage(
      err,
      'Não foi possível carregar os dados de desempenho.',
    )
  } finally {
    loading.value = false
  }
}

watch(brincoSelecionado, () => {
  // Os gráficos e indicadores individuais são atualizados pelos computed.
})

onMounted(carregarDesempenho)
</script>