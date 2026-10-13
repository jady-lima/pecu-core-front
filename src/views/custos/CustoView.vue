<template>
  <PageLayout
    titulo="Custos"
    subtitulo="Financeiro"
  >
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm text-slate-500">Total no período</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ formatarMoeda(total) }}</p>
        <p class="mt-1 text-xs text-slate-500">{{ custosFiltrados.length }} lançamento(s)</p>
      </div>

      <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm text-slate-500">Automáticos</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ formatarMoeda(totalPorOrigem.AUTOMATICO) }}</p>
        <p class="mt-1 text-xs text-slate-500">De alimentação, vacinas e medicamentos</p>
      </div>

      <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm text-slate-500">Manuais</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ formatarMoeda(totalPorOrigem.MANUAL) }}</p>
        <p class="mt-1 text-xs text-slate-500">Lançados por você</p>
      </div>

      <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm text-slate-500">Por tipo</p>
        <ul class="mt-2 space-y-1 text-sm">
          <li
            v-for="(label, tipoCusto) in TIPO_CUSTO_LABEL"
            :key="tipoCusto"
            class="flex justify-between gap-2"
          >
            <span class="text-slate-600">{{ label }}</span>
            <span class="font-medium text-slate-900">{{ formatarMoeda(totalPorTipo[tipoCusto]) }}</span>
          </li>
        </ul>
      </div>
    </section>

    <form
      @submit.prevent="salvar"
      class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h3 class="mb-4 text-lg font-semibold text-slate-900">
        Lançar custo manual
      </h3>

      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Tipo
          </label>

          <select
            v-model="tipo"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            required
          >
            <option
              v-for="(label, valor) in TIPO_CUSTO_LABEL"
              :key="valor"
              :value="valor"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Valor (R$)
          </label>

          <input
            v-model.number="valor"
            type="number"
            min="0.01"
            step="0.01"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Data
          </label>

          <input
            v-model="data"
            type="date"
            :max="dataHoje"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div class="md:col-span-3">
          <span class="mb-1 block text-sm font-medium text-slate-700">
            Vinculado a
          </span>

          <div class="inline-flex rounded-md bg-slate-100 p-1 text-sm">
            <button
              v-for="(label, destino) in DESTINO_LABEL"
              :key="destino"
              type="button"
              @click="alterarDestino(destino)"
              class="rounded px-3 py-1.5 font-medium transition"
              :class="tipoDestino === destino ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="md:col-span-3 grid gap-4 md:grid-cols-2">
          <div>
            <label for="custo-propriedade" class="mb-1 block text-sm font-medium text-slate-700">
              Propriedade
            </label>

            <SearchableSelect
              id="custo-propriedade"
              v-model="destinoPropriedadeId"
              :options="opcoesPropriedade"
              :disabled="loading"
              placeholder="Digite o nome da propriedade"
              @change="trocarPropriedadeDestino"
            />
          </div>

          <div v-if="tipoDestino === 'lote'">
            <label for="custo-lote" class="mb-1 block text-sm font-medium text-slate-700">
              Lote
            </label>

            <SearchableSelect
              id="custo-lote"
              v-model="destinoLoteId"
              :options="opcoesLoteDestino"
              :disabled="destinoPropriedadeId === null"
              :placeholder="destinoPropriedadeId === null ? 'Escolha a propriedade primeiro' : 'Digite o número do lote'"
              texto-vazio="Nenhum lote nesta propriedade."
            />
          </div>

          <div v-if="tipoDestino === 'animal'">
            <label for="custo-animal" class="mb-1 block text-sm font-medium text-slate-700">
              Animal
            </label>

            <SearchableSelect
              id="custo-animal"
              v-model="destinoAnimalId"
              :options="opcoesAnimalDestino"
              :disabled="destinoPropriedadeId === null"
              :placeholder="destinoPropriedadeId === null ? 'Escolha a propriedade primeiro' : 'Digite o brinco'"
              texto-vazio="Nenhum animal nesta propriedade."
            />
          </div>
        </div>
      </div>

      <div class="mt-5">
        <button
          type="submit"
          :disabled="salvando || loading"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {{ salvando ? 'Salvando...' : 'Lançar custo' }}
        </button>
      </div>

      <p v-if="erro" class="mt-3 text-sm text-red-600">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="mt-3 text-sm text-green-700">
        {{ sucesso }}
      </p>
    </form>

    <section>
      <h3 class="mb-3 text-lg font-semibold text-slate-900">
        Lançamentos
      </h3>

      <div class="mb-4 grid gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-5">
        <div class="md:col-span-2">
          <label for="filtro-propriedade" class="mb-1 block text-xs font-medium text-slate-600">
            Propriedade
          </label>

          <SearchableSelect
            id="filtro-propriedade"
            v-model="filtroPropriedadeId"
            :options="opcoesPropriedade"
            placeholder="Todas"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Tipo</label>

          <select
            v-model="filtroTipo"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option
              v-for="(label, valor) in TIPO_CUSTO_LABEL"
              :key="valor"
              :value="valor"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Origem</label>

          <select
            v-model="filtroOrigem"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            <option
              v-for="(label, valor) in ORIGEM_CUSTO_LABEL"
              :key="valor"
              :value="valor"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600">De</label>
            <input
              v-model="filtroDe"
              type="date"
              class="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600">Até</label>
            <input
              v-model="filtroAte"
              type="date"
              class="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <p v-if="erroLista" class="mb-3 text-sm text-red-600">
        {{ erroLista }}
      </p>

      <p v-if="loading" class="text-slate-500">
        Carregando...
      </p>

      <div
        v-else-if="custosFiltrados.length > 0"
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Data</th>
              <th class="px-4 py-3 font-medium">Tipo</th>
              <th class="px-4 py-3 font-medium">Origem</th>
              <th class="px-4 py-3 font-medium">Vinculado a</th>
              <th class="px-4 py-3 font-medium">Propriedade</th>
              <th class="px-4 py-3 text-right font-medium">Valor</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="custo in custosFiltrados" :key="custo.id">
              <td class="whitespace-nowrap px-4 py-3 text-slate-700">
                {{ formatarData(custo.data) }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ TIPO_CUSTO_LABEL[custo.tipo] }}
              </td>

              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="custo.origem === 'MANUAL' ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-800'"
                >
                  {{ ORIGEM_CUSTO_LABEL[custo.origem] }}
                </span>
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ descricaoDestino(custo) }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ propriedadeDoCusto(custo)?.nome ?? '-' }}
              </td>

              <td class="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">
                {{ formatarMoeda(custo.valor) }}
              </td>
            </tr>
          </tbody>

          <tfoot class="bg-slate-50 font-medium text-slate-900">
            <tr>
              <td class="px-4 py-3" colspan="5">Total</td>
              <td class="whitespace-nowrap px-4 py-3 text-right">{{ formatarMoeda(total) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p v-else-if="custos.length > 0" class="text-slate-500">
        Nenhum custo encontrado com os filtros selecionados.
      </p>

      <p v-else class="text-slate-500">
        Nenhum custo registrado ainda.
      </p>
    </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import SearchableSelect from '@/components/SearchableSelect.vue'
import { animalService } from '@/services/animalService'
import { custoService } from '@/services/custoService'
import { loteService } from '@/services/loteService'
import { propriedadeService } from '@/services/propriedadeService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { dataHojeIso, formatarData, formatarMoeda } from '@/utils/formatters'
import { STATUS_ANIMAL_LABEL, type Animal } from '@/types/animal'
import {
  ORIGEM_CUSTO_LABEL,
  TIPO_CUSTO_LABEL,
  type Custo,
  type OrigemCusto,
  type TipoCusto,
} from '@/types/custo'
import type { Lote } from '@/types/lote'
import type { Propriedade } from '@/types/propriedade'
import type { OpcaoSelect } from '@/types/select'

type TipoDestino = 'propriedade' | 'lote' | 'animal'

const DESTINO_LABEL: Record<TipoDestino, string> = {
  propriedade: 'Propriedade',
  lote: 'Lote',
  animal: 'Animal',
}

const custos = ref<Custo[]>([])
const animais = ref<Animal[]>([])
const lotes = ref<Lote[]>([])
const propriedades = ref<Propriedade[]>([])

const loading = ref(true)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')
const erroLista = ref('')

const dataHoje = dataHojeIso()

const tipo = ref<TipoCusto>('MAO_DE_OBRA')
const valor = ref<number | ''>('')
const data = ref(dataHoje)
const tipoDestino = ref<TipoDestino>('propriedade')
const destinoPropriedadeId = ref<number | null>(null)
const destinoLoteId = ref<number | null>(null)
const destinoAnimalId = ref<number | null>(null)

const filtroPropriedadeId = ref<number | null>(null)
const filtroTipo = ref<TipoCusto | ''>('')
const filtroOrigem = ref<OrigemCusto | ''>('')
const filtroDe = ref('')
const filtroAte = ref('')

const lotePorId = computed(() => new Map(lotes.value.map((lote) => [lote.id, lote])))

const animalPorId = computed(() => new Map(animais.value.map((animal) => [animal.id, animal])))

const propriedadePorId = computed(
  () => new Map(propriedades.value.map((propriedade) => [propriedade.id, propriedade])),
)

const opcoesPropriedade = computed<OpcaoSelect[]>(() =>
  [...propriedades.value]
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((propriedade) => ({
      value: propriedade.id,
      label: propriedade.nome,
      detalhe: propriedade.localizacao,
    })),
)

const opcoesLoteDestino = computed<OpcaoSelect[]>(() =>
  lotes.value
    .filter((lote) => lote.propriedadeId === destinoPropriedadeId.value)
    .sort((a, b) => a.numero - b.numero)
    .map((lote) => ({ value: lote.id, label: `Lote ${lote.numero}` })),
)

const opcoesAnimalDestino = computed<OpcaoSelect[]>(() =>
  animais.value
    .filter((animal) => lotePorId.value.get(animal.loteId)?.propriedadeId === destinoPropriedadeId.value)
    .sort((a, b) => a.brinco - b.brinco)
    .map((animal) => ({
      value: animal.id,
      label: `Brinco ${animal.brinco}`,
      detalhe: `${nomeLote(animal.loteId)}${animal.status !== 'ATIVO' ? ` - ${STATUS_ANIMAL_LABEL[animal.status]}` : ''}`,
    })),
)

const custosFiltrados = computed(() =>
  custos.value
    .filter((custo) => filtroPropriedadeId.value === null || propriedadeDoCusto(custo)?.id === filtroPropriedadeId.value)
    .filter((custo) => !filtroTipo.value || custo.tipo === filtroTipo.value)
    .filter((custo) => !filtroOrigem.value || custo.origem === filtroOrigem.value)
    .filter((custo) => !filtroDe.value || custo.data >= filtroDe.value)
    .filter((custo) => !filtroAte.value || custo.data <= filtroAte.value)
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id),
)

const total = computed(() => custosFiltrados.value.reduce((soma, custo) => soma + custo.valor, 0))

const totalPorOrigem = computed(() => {
  const totais: Record<OrigemCusto, number> = { MANUAL: 0, AUTOMATICO: 0 }

  for (const custo of custosFiltrados.value) {
    totais[custo.origem] += custo.valor
  }

  return totais
})

const totalPorTipo = computed(() => {
  const totais: Record<TipoCusto, number> = {
    ALIMENTACAO: 0,
    MEDICAMENTO: 0,
    VACINA: 0,
    MAO_DE_OBRA: 0,
    OUTROS: 0,
  }

  for (const custo of custosFiltrados.value) {
    totais[custo.tipo] += custo.valor
  }

  return totais
})

function nomeLote(id: number): string {
  const lote = lotePorId.value.get(id)
  return lote ? `Lote ${lote.numero}` : `Lote #${id}`
}

function propriedadeDoCusto(custo: Custo): Propriedade | undefined {
  if (custo.propriedadeId !== null) {
    return propriedadePorId.value.get(custo.propriedadeId)
  }

  const loteId = custo.loteId ?? (custo.animalId !== null ? animalPorId.value.get(custo.animalId)?.loteId : undefined)
  const lote = loteId !== undefined ? lotePorId.value.get(loteId) : undefined

  return lote ? propriedadePorId.value.get(lote.propriedadeId) : undefined
}

function descricaoDestino(custo: Custo): string {
  if (custo.animalId !== null) {
    const animal = animalPorId.value.get(custo.animalId)
    return animal ? `Animal ${animal.brinco} (${nomeLote(animal.loteId)})` : `Animal #${custo.animalId}`
  }

  if (custo.loteId !== null) {
    return nomeLote(custo.loteId)
  }

  return 'Propriedade'
}

function alterarDestino(destino: TipoDestino) {
  tipoDestino.value = destino
  destinoLoteId.value = null
  destinoAnimalId.value = null
}

function trocarPropriedadeDestino() {
  destinoLoteId.value = null
  destinoAnimalId.value = null
}

function limparFormulario() {
  valor.value = ''
  data.value = dataHoje
  destinoLoteId.value = null
  destinoAnimalId.value = null
}

async function carregarCustos() {
  custos.value = await custoService.listAll()
}

async function salvar() {
  erro.value = ''
  sucesso.value = ''

  if (typeof valor.value !== 'number' || valor.value <= 0 || !data.value) {
    erro.value = 'Informe o valor e a data.'
    return
  }

  const destino = {
    propriedadeId: tipoDestino.value === 'propriedade' ? destinoPropriedadeId.value : null,
    loteId: tipoDestino.value === 'lote' ? destinoLoteId.value : null,
    animalId: tipoDestino.value === 'animal' ? destinoAnimalId.value : null,
  }

  if (destino.propriedadeId === null && destino.loteId === null && destino.animalId === null) {
    erro.value = `Selecione ${tipoDestino.value === 'propriedade' ? 'a propriedade' : tipoDestino.value === 'lote' ? 'o lote' : 'o animal'} do custo.`
    return
  }

  salvando.value = true

  try {
    await custoService.create({
      tipo: tipo.value,
      valor: valor.value,
      data: data.value,
      ...destino,
    })

    sucesso.value = `Custo de ${formatarMoeda(valor.value)} lançado com sucesso.`
    limparFormulario()
    await carregarCustos()
  } catch (err) {
    console.error('Falha ao lançar custo', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível lançar o custo.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    const [dadosCustos, dadosAnimais, dadosLotes, dadosPropriedades] = await Promise.all([
      custoService.listAll(),
      animalService.listAll(),
      loteService.listAll(),
      propriedadeService.listAll(),
    ])

    custos.value = dadosCustos
    animais.value = dadosAnimais
    lotes.value = dadosLotes
    propriedades.value = dadosPropriedades

    if (dadosPropriedades.length === 1) {
      destinoPropriedadeId.value = dadosPropriedades[0]!.id
    }
  } catch (err) {
    console.error('Falha ao carregar custos', err)
    erroLista.value = getApiErrorMessage(err, 'Não foi possível carregar os custos.')
  } finally {
    loading.value = false
  }
})
</script>
