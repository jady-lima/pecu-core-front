<template>
  <PageLayout
    titulo="Pesagens"
    subtitulo="Manejo"
  >
    <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <label class="mb-1 block text-sm font-medium text-slate-700">
        Animal
      </label>

      <select
        v-model="brinco"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 md:max-w-md"
        :disabled="loading || animais.length === 0"
        @change="selecionarAnimal"
      >
        <option :value="null" disabled>
          {{ loading ? 'Carregando animais...' : 'Selecione um animal' }}
        </option>

        <optgroup
          v-for="grupo in animaisPorPropriedade"
          :key="grupo.titulo"
          :label="grupo.titulo"
        >
          <option
            v-for="animal in grupo.animais"
            :key="animal.id"
            :value="animal.brinco"
          >
            Brinco {{ animal.brinco }} - {{ nomeLote(animal.loteId) }}{{ animal.status !== 'ATIVO' ? ` (${STATUS_ANIMAL_LABEL[animal.status]})` : '' }}
          </option>
        </optgroup>
      </select>

      <p
        v-if="!loading && animais.length === 0"
        class="mt-2 text-sm text-slate-500"
      >
        Nenhum animal cadastrado. Cadastre um animal em Animais primeiro.
      </p>

      <dl
        v-if="animalSelecionado"
        class="mt-5 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <dt class="text-xs font-medium uppercase text-slate-500">Status</dt>
          <dd class="mt-1">
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="STATUS_ANIMAL_CLASSE[animalSelecionado.status]"
            >
              {{ STATUS_ANIMAL_LABEL[animalSelecionado.status] }}
            </span>
          </dd>
        </div>

        <div>
          <dt class="text-xs font-medium uppercase text-slate-500">Peso atual</dt>
          <dd class="mt-1 font-medium text-slate-900">
            {{ formatarNumero(animalSelecionado.pesoAtual) }} kg
          </dd>
        </div>

        <div>
          <dt class="text-xs font-medium uppercase text-slate-500">Última pesagem</dt>
          <dd class="mt-1 font-medium text-slate-900">
            {{ ultimaPesagem ? formatarData(ultimaPesagem.dataPesagem) : '-' }}
          </dd>
        </div>

        <div>
          <dt class="text-xs font-medium uppercase text-slate-500">Lote</dt>
          <dd class="mt-1 font-medium text-slate-900">
            {{ nomeLote(animalSelecionado.loteId) }}
            <span class="font-normal text-slate-500">
              - {{ propriedadeDoLote(animalSelecionado.loteId)?.nome ?? '-' }}
            </span>
          </dd>
        </div>
      </dl>
    </section>

    <form
      v-if="animalSelecionado && animalSelecionado.status === 'ATIVO'"
      @submit.prevent="salvarPesagem"
      class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h3 class="mb-4 text-lg font-semibold text-slate-900">
        Registrar pesagem
      </h3>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Peso (kg)
          </label>

          <input
            v-model.number="pesoAtual"
            type="number"
            min="0.1"
            step="0.1"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Data da pesagem
          </label>

          <input
            v-model="dataPesagem"
            type="date"
            :min="dataMinima"
            :max="dataHoje"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />

          <p v-if="dataMinima" class="mt-1 text-xs text-slate-500">
            Não pode ser anterior a {{ formatarData(dataMinima) }}{{ ultimaPesagem ? ' (última pesagem)' : ' (nascimento)' }}.
          </p>
        </div>
      </div>

      <div class="mt-5">
        <button
          type="submit"
          :disabled="salvando || carregandoHistorico"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {{ salvando ? 'Salvando...' : 'Registrar pesagem' }}
        </button>
      </div>
    </form>

    <p
      v-else-if="animalSelecionado"
      class="rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-600"
    >
      Este animal está com status {{ STATUS_ANIMAL_LABEL[animalSelecionado.status] }} e não recebe novas pesagens. O histórico continua disponível abaixo.
    </p>

    <p v-if="erro" class="text-sm text-red-600">
      {{ erro }}
    </p>

    <p v-if="sucesso" class="text-sm text-green-700">
      {{ sucesso }}
    </p>

    <p
      v-if="aviso"
      class="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
    >
      {{ aviso }}
    </p>

    <section v-if="animalSelecionado">
      <h3 class="mb-3 text-lg font-semibold text-slate-900">
        Histórico de pesagens
      </h3>

      <p v-if="carregandoHistorico" class="text-slate-500">
        Carregando histórico...
      </p>

      <div
        v-else-if="historico.length > 0"
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Data</th>
              <th class="px-4 py-3 font-medium">Peso</th>
              <th class="px-4 py-3 font-medium">Variação</th>
              <th class="px-4 py-3 font-medium">GMD</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="item in historico" :key="item.pesagem.id">
              <td class="px-4 py-3 text-slate-700">
                {{ formatarData(item.pesagem.dataPesagem) }}
              </td>

              <td class="px-4 py-3 font-medium text-slate-900">
                {{ formatarNumero(item.pesagem.peso) }} kg
              </td>

              <td
                class="px-4 py-3"
                :class="classeVariacao(item.variacao)"
              >
                {{ item.variacao === null ? '-' : `${item.variacao > 0 ? '+' : ''}${formatarNumero(item.variacao)} kg` }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ item.pesagem.gmdCalculado === null ? '-' : `${formatarNumero(item.pesagem.gmdCalculado, 3)} kg/dia` }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-slate-500">
        Nenhuma pesagem registrada para este animal.
      </p>
    </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'
import { animalService } from '@/services/animalService'
import { loteService } from '@/services/loteService'
import { pesagemService } from '@/services/pesagemService'
import { propriedadeService } from '@/services/propriedadeService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { dataHojeIso, formatarData, formatarNumero } from '@/utils/formatters'
import { STATUS_ANIMAL_CLASSE, STATUS_ANIMAL_LABEL, type Animal } from '@/types/animal'
import type { Lote } from '@/types/lote'
import type { Pesagem } from '@/types/pesagem'
import type { Propriedade } from '@/types/propriedade'

const route = useRoute()
const router = useRouter()

const animais = ref<Animal[]>([])
const lotes = ref<Lote[]>([])
const propriedades = ref<Propriedade[]>([])
const pesagens = ref<Pesagem[]>([])

const loading = ref(true)
const carregandoHistorico = ref(false)
const salvando = ref(false)

const erro = ref('')
const sucesso = ref('')
const aviso = ref('')

const brinco = ref<number | null>(null)
const pesoAtual = ref<number | null>(null)
const dataPesagem = ref(dataHojeIso())
const dataHoje = dataHojeIso()

const lotePorId = computed(() => new Map(lotes.value.map((lote) => [lote.id, lote])))

const propriedadePorId = computed(
  () => new Map(propriedades.value.map((propriedade) => [propriedade.id, propriedade])),
)

const animalSelecionado = computed(
  () => animais.value.find((animal) => animal.brinco === brinco.value) ?? null,
)

const ultimaPesagem = computed(() => pesagens.value.at(-1) ?? null)

const dataMinima = computed(
  () => ultimaPesagem.value?.dataPesagem ?? animalSelecionado.value?.dataNascimento ?? undefined,
)

const historico = computed(() =>
  pesagens.value
    .map((pesagem, indice) => ({
      pesagem,
      variacao: indice === 0 ? null : pesagem.peso - pesagens.value[indice - 1]!.peso,
    }))
    .reverse(),
)

const animaisPorPropriedade = computed(() => {
  const grupos = new Map<string, Animal[]>()

  for (const animal of [...animais.value].sort((a, b) => a.brinco - b.brinco)) {
    const titulo = propriedadeDoLote(animal.loteId)?.nome ?? 'Sem propriedade'
    grupos.set(titulo, [...(grupos.get(titulo) ?? []), animal])
  }

  return [...grupos.entries()]
    .map(([titulo, lista]) => ({ titulo, animais: lista }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo))
})

function nomeLote(id: number): string {
  const lote = lotePorId.value.get(id)
  return lote ? `Lote ${lote.numero}` : `Lote #${id}`
}

function propriedadeDoLote(id: number): Propriedade | undefined {
  const lote = lotePorId.value.get(id)
  return lote ? propriedadePorId.value.get(lote.propriedadeId) : undefined
}

function classeVariacao(variacao: number | null): string {
  if (variacao === null || variacao === 0) return 'text-slate-700'
  return variacao > 0 ? 'text-green-700' : 'font-medium text-red-700'
}

function limparMensagens() {
  erro.value = ''
  sucesso.value = ''
  aviso.value = ''
}

async function carregarHistorico() {
  pesagens.value = []

  if (brinco.value === null) {
    return
  }

  carregandoHistorico.value = true

  try {
    pesagens.value = await pesagemService.listByBrinco(brinco.value)
  } catch (err) {
    console.error('Falha ao carregar histórico de pesagens', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível carregar o histórico de pesagens.')
  } finally {
    carregandoHistorico.value = false
  }
}

async function selecionarAnimal() {
  limparMensagens()
  pesoAtual.value = null
  dataPesagem.value = dataHoje

  router.replace({ query: brinco.value === null ? {} : { brinco: String(brinco.value) } })

  await carregarHistorico()
}

async function salvarPesagem() {
  limparMensagens()

  if (brinco.value === null || pesoAtual.value === null || !dataPesagem.value) {
    erro.value = 'Informe o peso e a data da pesagem.'
    return
  }

  salvando.value = true

  try {
    const resultado = await pesagemService.create({
      brinco: brinco.value,
      pesoAtual: pesoAtual.value,
      dataPesagem: dataPesagem.value,
    })

    sucesso.value = 'Pesagem registrada com sucesso.'
    aviso.value = resultado.aviso ?? ''
    pesoAtual.value = null
    dataPesagem.value = dataHoje

    const [dadosAnimais] = await Promise.all([animalService.listAll(), carregarHistorico()])
    animais.value = dadosAnimais
  } catch (err) {
    console.error('Falha ao registrar pesagem', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível registrar a pesagem.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    const [dadosAnimais, dadosLotes, dadosPropriedades] = await Promise.all([
      animalService.listAll(),
      loteService.listAll(),
      propriedadeService.listAll(),
    ])

    animais.value = dadosAnimais
    lotes.value = dadosLotes
    propriedades.value = dadosPropriedades
  } catch (err) {
    console.error('Falha ao carregar animais', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível carregar os animais.')
  } finally {
    loading.value = false
  }

  const brincoDaUrl = Number(route.query.brinco)

  if (Number.isInteger(brincoDaUrl) && animais.value.some((animal) => animal.brinco === brincoDaUrl)) {
    brinco.value = brincoDaUrl
    await carregarHistorico()
  }
})
</script>
