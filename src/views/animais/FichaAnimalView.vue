<template>
  <PageLayout
    :titulo="ficha ? `Ficha do animal - brinco ${ficha.brinco}` : 'Ficha do animal'"
    subtitulo="Cadastros"
    :voltar-para="{ name: 'animais' }"
  >
    <p v-if="loading" class="text-slate-500">
      Carregando ficha...
    </p>

    <p
      v-else-if="erroInicial"
      class="rounded-lg bg-white p-6 text-sm text-red-600 shadow-sm ring-1 ring-slate-200"
    >
      {{ erroInicial }}
    </p>

    <template v-else-if="ficha">
      <nav class="flex gap-1 border-b border-slate-200">
        <button
          v-for="aba in ABAS_PRINCIPAIS"
          :key="aba.chave"
          type="button"
          @click="abrirAbaPrincipal(aba.chave)"
          class="-mb-px border-b-2 px-4 py-2 text-sm font-medium transition"
          :class="abaPrincipal === aba.chave ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          {{ aba.titulo }}
        </button>
      </nav>

      <div v-show="abaPrincipal === 'informacoes'" class="space-y-6">
      <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🐄</span>

            <div>
              <p class="text-xl font-semibold text-slate-900">Brinco {{ ficha.brinco }}</p>
              <span
                class="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                :class="STATUS_ANIMAL_CLASSE[ficha.status]"
              >
                {{ STATUS_ANIMAL_LABEL[ficha.status] }}
              </span>
            </div>
          </div>

          <div
            v-if="(auth.isProdutor || auth.isVeterinario) && ficha.status === 'ATIVO'"
            class="flex flex-wrap gap-2"
          >
            <RouterLink
              v-for="acao in ACOES"
              :key="acao.rota"
              :to="{ name: acao.rota, query: { brinco: String(ficha.brinco) } }"
              class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {{ acao.texto }}
            </RouterLink>
          </div>
        </div>

        <dl class="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt class="text-xs font-medium uppercase text-slate-500">Sexo</dt>
            <dd class="mt-1 text-slate-900">{{ SEXO_ANIMAL_LABEL[ficha.sexo] ?? ficha.sexo }}</dd>
          </div>

          <div>
            <dt class="text-xs font-medium uppercase text-slate-500">Nascimento</dt>
            <dd class="mt-1 text-slate-900">
              {{ formatarData(ficha.dataNascimento) }}
              <span class="text-sm text-slate-500">({{ idade }})</span>
            </dd>
          </div>

          <div>
            <dt class="text-xs font-medium uppercase text-slate-500">Peso atual</dt>
            <dd class="mt-1 text-slate-900">{{ formatarNumero(ficha.pesoAtual) }} kg</dd>
          </div>

          <div>
            <dt class="text-xs font-medium uppercase text-slate-500">Lote</dt>
            <dd class="mt-1 text-slate-900">
              Lote {{ ficha.numeroLote }}
              <span class="text-sm text-slate-500">- {{ FINALIDADE_LOTE_LABEL[ficha.finalidadeLote] }}</span>
            </dd>
          </div>

          <div class="sm:col-span-2">
            <dt class="text-xs font-medium uppercase text-slate-500">Propriedade</dt>
            <dd class="mt-1 text-slate-900">
              {{ ficha.nomePropriedade }}
              <span class="text-sm text-slate-500">- {{ ficha.localizacaoPropriedade }}</span>
            </dd>
          </div>
        </dl>
      </section>

      <section class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p class="text-sm text-slate-500">Carência</p>
          <p
            class="mt-1 text-lg font-semibold"
            :class="fimCarencia ? 'text-amber-700' : 'text-slate-900'"
          >
            {{ fimCarencia ? `Até ${formatarData(fimCarencia)}` : 'Liberado' }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ fimCarencia ? 'Não pode ser vendido nem abatido.' : 'Sem carência de vacina ou medicamento.' }}
          </p>
        </div>

        <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p class="text-sm text-slate-500">Próxima vacina</p>
          <p
            class="mt-1 text-lg font-semibold"
            :class="proximaDose && proximaDose.data < dataHoje ? 'text-red-700' : 'text-slate-900'"
          >
            {{ proximaDose ? formatarData(proximaDose.data) : 'Nenhuma pendente' }}
          </p>
          <p v-if="proximaDose" class="mt-1 text-xs text-slate-500">
            {{ proximaDose.vacina }}{{ proximaDose.data < dataHoje ? ' - vencida' : '' }}
          </p>
        </div>

        <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p class="text-sm text-slate-500">Última pesagem</p>
          <p class="mt-1 text-lg font-semibold text-slate-900">
            {{ ultimaPesagem ? formatarData(ultimaPesagem.dataPesagem) : 'Sem pesagens' }}
          </p>
          <p v-if="ultimaPesagem?.gmdCalculado != null" class="mt-1 text-xs text-slate-500">
            GMD {{ formatarNumero(ultimaPesagem.gmdCalculado, 3) }} kg/dia
          </p>
        </div>
      </section>

      <section class="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div class="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-3">
          <button
            v-for="aba in abasVisiveis"
            :key="aba.chave"
            type="button"
            @click="abaAtiva = aba.chave"
            class="-mb-px rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition"
            :class="abaAtiva === aba.chave ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'"
          >
            {{ aba.titulo }}
            <span class="ml-1 rounded-full bg-slate-100 px-1.5 text-xs text-slate-600">{{ aba.total }}</span>
          </button>
        </div>

        <div class="p-4">
          <p v-if="erroHistoricos" class="mb-3 text-sm text-red-600">
            {{ erroHistoricos }}
          </p>

          <div v-if="abaAtiva === 'pesagens'" class="overflow-x-auto">
            <table v-if="pesagens.length > 0" class="w-full text-left text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="px-4 py-3 font-medium">Data</th>
                  <th class="px-4 py-3 font-medium">Peso</th>
                  <th class="px-4 py-3 font-medium">GMD</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="item in [...pesagens].reverse()" :key="item.id">
                  <td class="px-4 py-3 text-slate-700">{{ formatarData(item.dataPesagem) }}</td>
                  <td class="px-4 py-3 font-medium text-slate-900">{{ formatarNumero(item.peso) }} kg</td>
                  <td class="px-4 py-3 text-slate-700">
                    {{ item.gmdCalculado === null ? '-' : `${formatarNumero(item.gmdCalculado, 3)} kg/dia` }}
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-slate-500">Nenhuma pesagem registrada.</p>
          </div>

          <div v-else-if="abaAtiva === 'alimentacoes'" class="overflow-x-auto">
            <table v-if="alimentacoes.length > 0" class="w-full text-left text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="px-4 py-3 font-medium">Data</th>
                  <th class="px-4 py-3 font-medium">Tipo</th>
                  <th class="px-4 py-3 font-medium">Quantidade</th>
                  <th class="px-4 py-3 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="item in [...alimentacoes].reverse()" :key="item.id">
                  <td class="px-4 py-3 text-slate-700">{{ formatarData(item.data) }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ TIPO_ALIMENTACAO_LABEL[item.tipo] }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ formatarNumero(item.quantidade) }} kg</td>
                  <td class="px-4 py-3 text-slate-700">{{ item.valor === null ? '-' : formatarMoeda(item.valor) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-slate-500">Nenhuma alimentação registrada.</p>
          </div>

          <div v-else-if="abaAtiva === 'vacinacoes'" class="overflow-x-auto">
            <table v-if="vacinacoes.length > 0" class="w-full text-left text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="px-4 py-3 font-medium">Data</th>
                  <th class="px-4 py-3 font-medium">Vacina</th>
                  <th class="px-4 py-3 font-medium">Aplicada por</th>
                  <th class="px-4 py-3 font-medium">Próxima dose</th>
                  <th class="px-4 py-3 font-medium">Fim da carência</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="item in [...vacinacoes].reverse()" :key="item.id">
                  <td class="px-4 py-3 text-slate-700">{{ formatarData(item.data) }}</td>
                  <td class="px-4 py-3 text-slate-900">
                    {{ item.nomeVacina }}
                    <span class="text-xs text-slate-500">- {{ formatarNumero(item.doseAplicada) }} mL</span>
                  </td>
                  <td class="px-4 py-3 text-slate-700">{{ item.aplicador }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ item.dataProximaDose ? formatarData(item.dataProximaDose) : 'Dose única' }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ item.dataFimCarencia ? formatarData(item.dataFimCarencia) : '-' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-slate-500">Nenhuma vacinação registrada.</p>
          </div>

          <div v-else-if="abaAtiva === 'medicamentos'" class="overflow-x-auto">
            <table v-if="medicamentos.length > 0" class="w-full text-left text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="px-4 py-3 font-medium">Data</th>
                  <th class="px-4 py-3 font-medium">Medicamento</th>
                  <th class="px-4 py-3 font-medium">Dosagem</th>
                  <th class="px-4 py-3 font-medium">Fim da carência</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="item in [...medicamentos].reverse()" :key="item.id">
                  <td class="px-4 py-3 text-slate-700">{{ formatarData(item.data) }}</td>
                  <td class="px-4 py-3 text-slate-900">
                    {{ item.nome }}
                    <span class="text-xs text-slate-500">- {{ item.motivo }}</span>
                  </td>
                  <td class="px-4 py-3 text-slate-700">{{ formatarNumero(item.dosagem) }} mL</td>
                  <td class="px-4 py-3 text-slate-700">{{ item.dataFimCarencia ? formatarData(item.dataFimCarencia) : '-' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="text-slate-500">Nenhum medicamento registrado.</p>
          </div>

          <div v-else-if="abaAtiva === 'custos'" class="overflow-x-auto">
            <table v-if="custosDoAnimal.length > 0" class="w-full text-left text-sm">
              <thead class="bg-slate-100 text-slate-600">
                <tr>
                  <th class="px-4 py-3 font-medium">Data</th>
                  <th class="px-4 py-3 font-medium">Tipo</th>
                  <th class="px-4 py-3 font-medium">Origem</th>
                  <th class="px-4 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="item in custosDoAnimal" :key="item.id">
                  <td class="px-4 py-3 text-slate-700">{{ formatarData(item.data) }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ TIPO_CUSTO_LABEL[item.tipo] }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ ORIGEM_CUSTO_LABEL[item.origem] }}</td>
                  <td class="px-4 py-3 text-right text-slate-900">{{ formatarMoeda(item.valor) }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-slate-50 font-medium text-slate-900">
                <tr>
                  <td class="px-4 py-3" colspan="3">Total direto do animal</td>
                  <td class="px-4 py-3 text-right">{{ formatarMoeda(totalCustos) }}</td>
                </tr>
              </tfoot>
            </table>
            <p v-else class="text-slate-500">Nenhum custo lançado diretamente para este animal.</p>
            <p class="mt-2 text-xs text-slate-500">
              Custos lançados para o lote ou a propriedade não aparecem aqui.
            </p>
          </div>
        </div>
      </section>
      </div>

      <AnaliseIASection
        v-if="analiseCarregada"
        v-show="abaPrincipal === 'analise'"
        :animal-id="ficha.id"
      />
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'
import AnaliseIASection from '@/views/animais/AnaliseIASection.vue'
import { useAuthStore } from '@/stores/auth'
import { alimentacaoService } from '@/services/alimentacaoService'
import { animalService } from '@/services/animalService'
import { custoService } from '@/services/custoService'
import { medicamentoService } from '@/services/medicamentoService'
import { pesagemService } from '@/services/pesagemService'
import { vacinacaoService } from '@/services/vacinacaoService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { dataHojeIso, formatarData, formatarMoeda, formatarNumero } from '@/utils/formatters'
import { TIPO_ALIMENTACAO_LABEL, type Alimentacao } from '@/types/alimentacao'
import {
  SEXO_ANIMAL_LABEL,
  STATUS_ANIMAL_CLASSE,
  STATUS_ANIMAL_LABEL,
  type FichaAnimal,
} from '@/types/animal'
import { ORIGEM_CUSTO_LABEL, TIPO_CUSTO_LABEL, type Custo } from '@/types/custo'
import { FINALIDADE_LOTE_LABEL } from '@/types/lote'
import type { Medicamento } from '@/types/medicamento'
import type { Pesagem } from '@/types/pesagem'
import type { Vacinacao } from '@/types/vacinacao'

type Aba = 'pesagens' | 'alimentacoes' | 'vacinacoes' | 'medicamentos' | 'custos'

type AbaPrincipal = 'informacoes' | 'analise'

const ABAS_PRINCIPAIS: { chave: AbaPrincipal; titulo: string }[] = [
  { chave: 'informacoes', titulo: 'Informações do animal' },
  { chave: 'analise', titulo: 'Análise com IA' },
]

const ACOES = [
  { rota: 'pesagens', texto: 'Registrar pesagem' },
  { rota: 'alimentacoes', texto: 'Registrar alimentação' },
  { rota: 'vacinacoes', texto: 'Registrar vacinação' },
  { rota: 'medicamentos', texto: 'Registrar medicamento' },
]

const auth = useAuthStore()
const route = useRoute()

const ficha = ref<FichaAnimal | null>(null)
const pesagens = ref<Pesagem[]>([])
const alimentacoes = ref<Alimentacao[]>([])
const vacinacoes = ref<Vacinacao[]>([])
const medicamentos = ref<Medicamento[]>([])
const custos = ref<Custo[]>([])

const loading = ref(true)
const erroInicial = ref('')
const erroHistoricos = ref('')
const abaAtiva = ref<Aba>('pesagens')
const abaPrincipal = ref<AbaPrincipal>('informacoes')
const analiseCarregada = ref(false)

function abrirAbaPrincipal(aba: AbaPrincipal) {
  abaPrincipal.value = aba

  if (aba === 'analise') {
    analiseCarregada.value = true
  }
}

const dataHoje = dataHojeIso()

const custosDoAnimal = computed(() =>
  custos.value
    .filter((custo) => custo.animalId === ficha.value?.id)
    .sort((a, b) => b.data.localeCompare(a.data)),
)

const totalCustos = computed(() =>
  custosDoAnimal.value.reduce((total, custo) => total + custo.valor, 0),
)

const abasVisiveis = computed(() => [
  { chave: 'pesagens' as const, titulo: 'Pesagens', total: pesagens.value.length },
  { chave: 'alimentacoes' as const, titulo: 'Alimentação', total: alimentacoes.value.length },
  { chave: 'vacinacoes' as const, titulo: 'Vacinação', total: vacinacoes.value.length },
  { chave: 'medicamentos' as const, titulo: 'Medicamentos', total: medicamentos.value.length },
  ...(auth.isProdutor
    ? [{ chave: 'custos' as const, titulo: 'Custos', total: custosDoAnimal.value.length }]
    : []),
])

const ultimaPesagem = computed(() => pesagens.value.at(-1) ?? null)

const fimCarencia = computed(() => {
  const datas = [...vacinacoes.value, ...medicamentos.value]
    .map((registro) => registro.dataFimCarencia)
    .filter((dataFim): dataFim is string => dataFim !== null && dataFim > dataHoje)
    .sort()

  return datas.at(-1) ?? null
})

const proximaDose = computed(() => {
  const pendentes = vacinacoes.value
    .filter((item) => item.dataProximaDose !== null)
    .filter((item) => !vacinacoes.value.some((outra) => outra.vacinaId === item.vacinaId && outra.data > item.data))
    .map((item) => ({ data: item.dataProximaDose!, vacina: item.nomeVacina }))
    .sort((a, b) => a.data.localeCompare(b.data))

  return pendentes[0] ?? null
})

const idade = computed(() => {
  if (!ficha.value) {
    return ''
  }

  const [anoNasc, mesNasc, diaNasc] = ficha.value.dataNascimento.split('-').map(Number)
  const [anoHoje, mesHoje, diaHoje] = dataHoje.split('-').map(Number)
  const meses = (anoHoje! - anoNasc!) * 12 + (mesHoje! - mesNasc!) - (diaHoje! < diaNasc! ? 1 : 0)

  if (meses < 1) return 'menos de 1 mês'
  if (meses < 24) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`

  const anos = Math.floor(meses / 12)
  const resto = meses % 12

  return `${anos} anos${resto > 0 ? ` e ${resto} ${resto === 1 ? 'mês' : 'meses'}` : ''}`
})

onMounted(async () => {
  try {
    ficha.value = await animalService.getFicha(String(route.params.id))
  } catch (err) {
    console.error('Falha ao carregar ficha do animal', err)
    erroInicial.value = getApiErrorMessage(err, 'Não foi possível carregar a ficha do animal.')
    loading.value = false
    return
  }

  const brinco = ficha.value.brinco

  try {
    const [dadosPesagens, dadosAlimentacoes, dadosVacinacoes, dadosMedicamentos, dadosCustos] =
      await Promise.all([
        pesagemService.listByBrinco(brinco),
        alimentacaoService.listByBrinco(brinco),
        vacinacaoService.listByBrinco(brinco),
        medicamentoService.listByBrinco(brinco),
        auth.isProdutor ? custoService.listAll() : Promise.resolve([]),
      ])

    pesagens.value = dadosPesagens
    alimentacoes.value = dadosAlimentacoes
    vacinacoes.value = dadosVacinacoes
    medicamentos.value = dadosMedicamentos
    custos.value = dadosCustos
  } catch (err) {
    console.error('Falha ao carregar históricos do animal', err)
    erroHistoricos.value = getApiErrorMessage(err, 'Não foi possível carregar todos os históricos.')
  } finally {
    loading.value = false
  }
})
</script>
