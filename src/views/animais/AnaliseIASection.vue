<template>
  <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">
          Análise com IA
        </h3>

        <p class="mt-1 text-sm text-slate-500">
          A análise individual usa as pesagens, alimentação, vacinas, medicamentos e metas deste animal.
          A comparativa confronta esses dados com os demais animais do Lote {{ numeroLote }}.
        </p>
      </div>

      <div class="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          :disabled="gerando !== null || carregando"
          @click="gerar('INDIVIDUAL')"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {{ gerando === 'INDIVIDUAL' ? 'Gerando análise...' : 'Gerar análise individual' }}
        </button>

        <button
          type="button"
          :disabled="gerando !== null || carregando"
          @click="gerar('COMPARATIVA')"
          class="rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-60"
        >
          {{ gerando === 'COMPARATIVA' ? 'Gerando análise...' : 'Gerar análise comparativa' }}
        </button>
      </div>
    </div>

    <p v-if="gerando" class="mt-4 text-sm text-blue-700">
      {{ gerando === 'COMPARATIVA' ? `Comparando o animal com os demais do Lote ${numeroLote}.` : 'Analisando os dados do animal.' }}
      A análise pode levar alguns segundos.
    </p>

    <div
      v-if="erro"
      class="mt-4 rounded-md px-4 py-3 text-sm ring-1"
      :class="erro.tipo === 'dados' ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-red-50 text-red-700 ring-red-200'"
    >
      <p class="font-medium">{{ erro.titulo }}</p>
      <p class="mt-1">{{ erro.mensagem }}</p>
    </div>

    <p v-if="carregando" class="mt-4 text-slate-500">
      Carregando análises...
    </p>

    <template v-else-if="modo === 'lista'">
      <p
        v-if="analises.length === 0"
        class="mt-4 text-sm text-slate-500"
      >
        Nenhuma análise gerada para este animal ainda.
      </p>

      <div v-else class="mt-5">
        <h4 class="mb-3 text-sm font-semibold text-slate-900">
          Análises geradas
          <span class="ml-1 font-normal text-slate-500">({{ analises.length }})</span>
        </h4>

        <div class="overflow-x-auto rounded-lg ring-1 ring-slate-200">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Gerada em</th>
                <th class="px-4 py-3 font-medium">Tipo</th>
                <th class="px-4 py-3 font-medium">Situação</th>
                <th class="px-4 py-3 font-medium">Resumo</th>
                <th class="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200">
              <tr v-for="analise in analises" :key="analise.id" class="align-top">
                <td class="whitespace-nowrap px-4 py-3 text-slate-700">
                  {{ formatarDataHora(analise.dataGeracao) }}
                </td>

                <td class="whitespace-nowrap px-4 py-3">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="TIPO_ANALISE_CLASSE[analise.tipo]"
                  >
                    {{ TIPO_ANALISE_LABEL[analise.tipo] }}
                  </span>
                </td>

                <td class="whitespace-nowrap px-4 py-3">
                  <span
                    v-if="analise.relatorio"
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="SITUACAO_GERAL_CLASSE[analise.relatorio.situacaoGeral]"
                  >
                    {{ SITUACAO_GERAL_LABEL[analise.relatorio.situacaoGeral] }}
                  </span>
                  <span v-else class="text-slate-400">-</span>
                </td>

                <td class="px-4 py-3 text-slate-600">
                  <p class="line-clamp-2 max-w-xl">
                    {{ analise.relatorio?.resumo ?? 'Relatório indisponível.' }}
                  </p>
                </td>

                <td class="px-4 py-3">
                  <button
                    type="button"
                    @click="abrir(analise.id)"
                    class="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                  >
                    Abrir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="mt-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          @click="voltarParaLista"
          class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Voltar às análises
        </button>

        <div v-if="analises.length > 1" class="flex items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            :disabled="indiceAberta <= 0 || carregandoDetalhe"
            @click="abrirVizinha(-1)"
            class="rounded-md border border-slate-300 px-2 py-1 transition hover:bg-slate-100 disabled:opacity-40"
          >
            Mais recente
          </button>

          <span>{{ indiceAberta + 1 }} de {{ analises.length }}</span>

          <button
            type="button"
            :disabled="indiceAberta >= analises.length - 1 || carregandoDetalhe"
            @click="abrirVizinha(1)"
            class="rounded-md border border-slate-300 px-2 py-1 transition hover:bg-slate-100 disabled:opacity-40"
          >
            Mais antiga
          </button>
        </div>
      </div>

      <p v-if="carregandoDetalhe" class="text-slate-500">
        Carregando análise...
      </p>

      <article v-else-if="analiseAberta?.relatorio" class="space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-full px-3 py-1 text-sm font-semibold"
            :class="SITUACAO_GERAL_CLASSE[analiseAberta.relatorio.situacaoGeral]"
          >
            {{ SITUACAO_GERAL_LABEL[analiseAberta.relatorio.situacaoGeral] }}
          </span>

          <span
            class="rounded-full px-3 py-1 text-sm font-medium"
            :class="TIPO_ANALISE_CLASSE[analiseAberta.tipo]"
          >
            {{ TIPO_ANALISE_LABEL[analiseAberta.tipo] }}
          </span>

          <span class="text-xs text-slate-500">
            Gerada em {{ formatarDataHora(analiseAberta.dataGeracao) }}
          </span>
        </div>

        <p
          v-if="analiseAberta.tipo === 'COMPARATIVA'"
          class="rounded-md bg-indigo-50 px-4 py-3 text-sm text-indigo-800 ring-1 ring-indigo-200"
        >
          Esta análise compara o desempenho deste animal com os demais animais do mesmo lote.
        </p>

        <div>
          <h4 class="text-sm font-semibold text-slate-900">Resumo</h4>
          <p class="mt-1 text-sm leading-6 text-slate-700">{{ analiseAberta.relatorio.resumo }}</p>
        </div>

        <div v-if="analiseAberta.relatorio.evolucaoDesempenho">
          <h4 class="text-sm font-semibold text-slate-900">Evolução do desempenho</h4>
          <p class="mt-1 text-sm leading-6 text-slate-700">{{ analiseAberta.relatorio.evolucaoDesempenho }}</p>
        </div>

        <div
          v-for="bloco in blocosDaAnalise"
          :key="bloco.titulo"
        >
          <h4 class="text-sm font-semibold text-slate-900">{{ bloco.titulo }}</h4>
          <ul class="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li v-for="(item, indice) in bloco.itens" :key="indice">{{ item }}</li>
          </ul>
        </div>

        <p class="border-t border-slate-200 pt-3 text-xs text-slate-500">
          Relatório gerado por inteligência artificial ({{ analiseAberta.modelo }}). Use como apoio à decisão; não substitui a avaliação de um veterinário.
        </p>
      </article>

      <p v-else class="text-sm text-slate-500">
        O relatório desta análise não está disponível.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { analiseService } from '@/services/analiseService'
import { HttpError } from '@/services/http'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { formatarDataHora } from '@/utils/formatters'
import {
  SITUACAO_GERAL_CLASSE,
  SITUACAO_GERAL_LABEL,
  TIPO_ANALISE_CLASSE,
  TIPO_ANALISE_LABEL,
  type AnaliseIA,
  type TipoAnalise,
} from '@/types/analiseIA'

const props = defineProps<{
  animalId: number
  numeroLote: number
}>()

interface ErroAnalise {
  tipo: 'dados' | 'servico' | 'outro'
  titulo: string
  mensagem: string
}

const analises = ref<AnaliseIA[]>([])
const analiseAberta = ref<AnaliseIA | null>(null)
const modo = ref<'lista' | 'detalhe'>('lista')
const carregando = ref(true)
const carregandoDetalhe = ref(false)
const gerando = ref<TipoAnalise | null>(null)
const erro = ref<ErroAnalise | null>(null)

const indiceAberta = computed(() =>
  analises.value.findIndex((analise) => analise.id === analiseAberta.value?.id),
)

const blocosDaAnalise = computed(() => {
  const relatorio = analiseAberta.value?.relatorio

  if (!relatorio) {
    return []
  }

  return [
    { titulo: 'Pontos de atenção', itens: relatorio.pontosAtencao },
    { titulo: 'Possíveis fatores', itens: relatorio.possiveisFatores },
    { titulo: 'Recomendações', itens: relatorio.recomendacoes },
    { titulo: 'Acompanhamento', itens: relatorio.acompanhamento },
    { titulo: 'Limitações dos dados', itens: relatorio.limitacoesDados },
  ].filter((bloco) => bloco.itens?.length > 0)
})

function ordenar(lista: AnaliseIA[]): AnaliseIA[] {
  return [...lista].sort((a, b) => b.dataGeracao.localeCompare(a.dataGeracao))
}

function traduzirErro(err: unknown, tipoAnalise: TipoAnalise): ErroAnalise {
  const mensagem = getApiErrorMessage(err, 'Não foi possível gerar a análise.')

  if (err instanceof HttpError && err.status === 422) {
    const titulo = tipoAnalise === 'COMPARATIVA'
      ? 'Não foi possível comparar com o lote'
      : 'Dados insuficientes para análise'

    return { tipo: 'dados', titulo, mensagem }
  }

  if (err instanceof HttpError && err.status === 503) {
    return { tipo: 'servico', titulo: 'Serviço de IA indisponível no momento', mensagem }
  }

  return { tipo: 'outro', titulo: 'Erro ao gerar a análise', mensagem }
}

async function abrir(id: number) {
  erro.value = null
  modo.value = 'detalhe'
  analiseAberta.value = analises.value.find((analise) => analise.id === id) ?? null
  carregandoDetalhe.value = true

  try {
    analiseAberta.value = await analiseService.getById(id)
  } catch (err) {
    console.error('Falha ao abrir análise', err)
    erro.value = {
      tipo: 'outro',
      titulo: 'Erro ao abrir a análise',
      mensagem: getApiErrorMessage(err, 'Não foi possível carregar esta análise.'),
    }
  } finally {
    carregandoDetalhe.value = false
  }
}

function abrirVizinha(direcao: number) {
  const vizinha = analises.value[indiceAberta.value + direcao]

  if (vizinha) {
    abrir(vizinha.id)
  }
}

function voltarParaLista() {
  erro.value = null
  modo.value = 'lista'
  analiseAberta.value = null
}

async function gerar(tipoAnalise: TipoAnalise) {
  erro.value = null
  gerando.value = tipoAnalise

  try {
    const nova = tipoAnalise === 'COMPARATIVA'
      ? await analiseService.gerarComparativa(props.animalId)
      : await analiseService.gerarIndividual(props.animalId)
    analises.value = ordenar([nova, ...analises.value.filter((analise) => analise.id !== nova.id)])
    analiseAberta.value = nova
    modo.value = 'detalhe'
  } catch (err) {
    console.error('Falha ao gerar análise com IA', err)
    erro.value = traduzirErro(err, tipoAnalise)
  } finally {
    gerando.value = null
  }
}

onMounted(async () => {
  try {
    analises.value = ordenar(await analiseService.listByAnimal(props.animalId))
  } catch (err) {
    console.error('Falha ao carregar análises do animal', err)
    erro.value = {
      tipo: 'outro',
      titulo: 'Erro ao carregar análises',
      mensagem: getApiErrorMessage(err, 'Não foi possível carregar as análises anteriores.'),
    }
  } finally {
    carregando.value = false
  }
})
</script>
