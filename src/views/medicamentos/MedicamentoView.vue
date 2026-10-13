<template>
  <PageLayout
    titulo="Medicamentos"
    subtitulo="Manejo"
  >
    <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="medicamento-propriedade" class="mb-1 block text-sm font-medium text-slate-700">
            Propriedade
          </label>

          <SearchableSelect
            id="medicamento-propriedade"
            v-model="propriedadeId"
            :options="opcoesPropriedade"
            :disabled="loading || propriedades.length === 0"
            placeholder="Digite o nome da propriedade"
            texto-vazio="Nenhuma propriedade encontrada."
            @change="trocarPropriedade"
          />
        </div>

        <div>
          <label for="medicamento-animal" class="mb-1 block text-sm font-medium text-slate-700">
            Animal
          </label>

          <SearchableSelect
            id="medicamento-animal"
            v-model="brinco"
            :options="opcoesAnimal"
            :disabled="propriedadeId === null"
            :placeholder="propriedadeId === null ? 'Escolha a propriedade primeiro' : 'Digite o brinco'"
            texto-vazio="Nenhum animal encontrado nesta propriedade."
            @change="selecionarAnimal"
          />
        </div>
      </div>

      <p v-if="erroInicial" class="mt-3 text-sm text-red-600">
        {{ erroInicial }}
      </p>
    </section>

    <p
      v-if="carenciaAtiva"
      class="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
    >
      Animal em período de carência por medicamento até <strong>{{ formatarData(carenciaAtiva.dataFimCarencia!) }}</strong>
      ({{ carenciaAtiva.nome }}). Não pode ser vendido nem abatido até lá.
    </p>

    <form
      v-if="animalSelecionado && animalSelecionado.status === 'ATIVO'"
      @submit.prevent="salvar"
      class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h3 class="mb-4 text-lg font-semibold text-slate-900">
        Registrar medicamento - brinco {{ animalSelecionado.brinco }}
      </h3>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Medicamento
          </label>

          <input
            v-model="nome"
            type="text"
            maxlength="100"
            list="medicamentos-usados"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />

          <datalist id="medicamentos-usados">
            <option v-for="sugestao in nomesUsados" :key="sugestao" :value="sugestao" />
          </datalist>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Motivo
          </label>

          <input
            v-model="motivo"
            type="text"
            maxlength="100"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Dosagem (mL)
          </label>

          <input
            v-model.number="dosagem"
            type="number"
            min="0.01"
            step="0.01"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Carência (dias)
          </label>

          <input
            v-model.number="carenciaDias"
            type="number"
            min="0"
            step="1"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />

          <p class="mt-1 text-xs text-slate-500">
            Conforme a bula. Use 0 se não houver.
          </p>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Data da aplicação
          </label>

          <input
            v-model="data"
            type="date"
            :min="animalSelecionado.dataNascimento"
            :max="dataHoje"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Valor (R$)
            <span class="font-normal text-slate-400">- opcional</span>
          </label>

          <input
            v-model.number="valor"
            type="number"
            min="0.01"
            step="0.01"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
          />

          <p class="mt-1 text-xs text-slate-500">
            Se informado, é lançado automaticamente nos custos.
          </p>
        </div>
      </div>

      <p
        v-if="data && typeof carenciaDias === 'number'"
        class="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200"
      >
        Fim da carência:
        <strong v-if="carenciaDias > 0">{{ formatarData(adicionarDias(data, carenciaDias)) }}</strong>
        <strong v-else>sem carência</strong>
      </p>

      <div class="mt-5">
        <button
          type="submit"
          :disabled="salvando"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {{ salvando ? 'Salvando...' : 'Registrar medicamento' }}
        </button>
      </div>

      <p v-if="erro" class="mt-3 text-sm text-red-600">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="mt-3 text-sm text-green-700">
        {{ sucesso }}
      </p>
    </form>

    <p
      v-else-if="animalSelecionado"
      class="rounded-md bg-slate-100 px-4 py-3 text-sm text-slate-600"
    >
      Este animal está com status {{ STATUS_ANIMAL_LABEL[animalSelecionado.status] }} e não recebe novos medicamentos. O histórico continua disponível abaixo.
    </p>

    <section v-if="animalSelecionado">
      <h3 class="mb-3 text-lg font-semibold text-slate-900">
        Histórico de medicamentos
      </h3>

      <p v-if="erroHistorico" class="mb-3 text-sm text-red-600">
        {{ erroHistorico }}
      </p>

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
              <th class="px-4 py-3 font-medium">Medicamento</th>
              <th class="px-4 py-3 font-medium">Dosagem</th>
              <th class="px-4 py-3 font-medium">Carência</th>
              <th class="px-4 py-3 font-medium">Valor</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="item in historico" :key="item.id" class="align-top">
              <td class="whitespace-nowrap px-4 py-3 text-slate-700">
                {{ formatarData(item.data) }}
              </td>

              <td class="px-4 py-3">
                <p class="font-medium text-slate-900">{{ item.nome }}</p>
                <p class="text-xs text-slate-500">{{ item.motivo }}</p>
              </td>

              <td class="whitespace-nowrap px-4 py-3 text-slate-700">
                {{ formatarNumero(item.dosagem) }} mL
              </td>

              <td class="whitespace-nowrap px-4 py-3">
                <span
                  v-if="item.dataFimCarencia && item.dataFimCarencia > dataHoje"
                  class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                >
                  Até {{ formatarData(item.dataFimCarencia) }}
                </span>
                <span v-else-if="item.carenciaDias === 0" class="text-slate-500">Sem carência</span>
                <span v-else class="text-slate-500">Encerrada</span>
              </td>

              <td class="whitespace-nowrap px-4 py-3 text-slate-700">
                {{ item.valor === null ? '-' : formatarMoeda(item.valor) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-slate-500">
        Nenhum medicamento registrado para este animal.
      </p>
    </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'
import SearchableSelect from '@/components/SearchableSelect.vue'
import { animalService } from '@/services/animalService'
import { loteService } from '@/services/loteService'
import { medicamentoService } from '@/services/medicamentoService'
import { propriedadeService } from '@/services/propriedadeService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import {
  adicionarDias,
  dataHojeIso,
  formatarData,
  formatarMoeda,
  formatarNumero,
} from '@/utils/formatters'
import { STATUS_ANIMAL_LABEL, type Animal } from '@/types/animal'
import type { Lote } from '@/types/lote'
import type { Medicamento } from '@/types/medicamento'
import type { Propriedade } from '@/types/propriedade'
import type { OpcaoSelect } from '@/types/select'

const route = useRoute()
const router = useRouter()

const animais = ref<Animal[]>([])
const lotes = ref<Lote[]>([])
const propriedades = ref<Propriedade[]>([])
const medicamentos = ref<Medicamento[]>([])

const loading = ref(true)
const carregandoHistorico = ref(false)
const salvando = ref(false)
const erroInicial = ref('')
const erroHistorico = ref('')
const erro = ref('')
const sucesso = ref('')

const dataHoje = dataHojeIso()

const propriedadeId = ref<number | null>(null)
const brinco = ref<number | null>(null)

const nome = ref('')
const motivo = ref('')
const dosagem = ref<number | ''>('')
const carenciaDias = ref<number | ''>('')
const data = ref(dataHoje)
const valor = ref<number | ''>('')

const lotePorId = computed(() => new Map(lotes.value.map((lote) => [lote.id, lote])))

const animalSelecionado = computed(
  () => animais.value.find((animal) => animal.brinco === brinco.value) ?? null,
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

const opcoesAnimal = computed<OpcaoSelect[]>(() =>
  animais.value
    .filter((animal) => lotePorId.value.get(animal.loteId)?.propriedadeId === propriedadeId.value)
    .sort((a, b) => a.brinco - b.brinco)
    .map((animal) => ({
      value: animal.brinco,
      label: `Brinco ${animal.brinco}`,
      detalhe: `${nomeLote(animal.loteId)}${animal.status !== 'ATIVO' ? ` - ${STATUS_ANIMAL_LABEL[animal.status]}` : ''}`,
    })),
)

const historico = computed(() => [...medicamentos.value].reverse())

const nomesUsados = computed(() =>
  [...new Set(medicamentos.value.map((item) => item.nome))].sort((a, b) => a.localeCompare(b)),
)

const carenciaAtiva = computed(() =>
  medicamentos.value
    .filter((item) => item.dataFimCarencia !== null && item.dataFimCarencia > dataHoje)
    .sort((a, b) => b.dataFimCarencia!.localeCompare(a.dataFimCarencia!))[0] ?? null,
)

function nomeLote(id: number): string {
  const lote = lotePorId.value.get(id)
  return lote ? `Lote ${lote.numero}` : `Lote #${id}`
}

function limparFormulario() {
  nome.value = ''
  motivo.value = ''
  dosagem.value = ''
  carenciaDias.value = ''
  data.value = dataHoje
  valor.value = ''
}

function limparMensagens() {
  erro.value = ''
  sucesso.value = ''
  erroHistorico.value = ''
}

function trocarPropriedade() {
  brinco.value = null
  medicamentos.value = []
  limparMensagens()
  limparFormulario()
  router.replace({ query: {} })
}

async function carregarHistorico() {
  medicamentos.value = []

  if (brinco.value === null) {
    return
  }

  carregandoHistorico.value = true

  try {
    medicamentos.value = await medicamentoService.listByBrinco(brinco.value)
  } catch (err) {
    console.error('Falha ao carregar histórico de medicamentos', err)
    erroHistorico.value = getApiErrorMessage(err, 'Não foi possível carregar o histórico de medicamentos.')
  } finally {
    carregandoHistorico.value = false
  }
}

async function selecionarAnimal() {
  limparMensagens()
  limparFormulario()
  router.replace({ query: brinco.value === null ? {} : { brinco: String(brinco.value) } })

  await carregarHistorico()
}

async function salvar() {
  limparMensagens()

  if (
    brinco.value === null ||
    !nome.value.trim() ||
    !motivo.value.trim() ||
    typeof dosagem.value !== 'number' ||
    dosagem.value <= 0 ||
    typeof carenciaDias.value !== 'number' ||
    carenciaDias.value < 0 ||
    !data.value
  ) {
    erro.value = 'Preencha medicamento, motivo, dosagem, carência e data.'
    return
  }

  salvando.value = true

  try {
    await medicamentoService.create({
      brinco: brinco.value,
      nome: nome.value.trim(),
      motivo: motivo.value.trim(),
      dosagem: dosagem.value,
      carenciaDias: carenciaDias.value,
      data: data.value,
      valor: typeof valor.value === 'number' && valor.value > 0 ? valor.value : null,
    })

    sucesso.value = 'Medicamento registrado com sucesso.'
    limparFormulario()
    await carregarHistorico()
  } catch (err) {
    console.error('Falha ao registrar medicamento', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível registrar o medicamento.')
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
    console.error('Falha ao carregar dados de medicamentos', err)
    erroInicial.value = getApiErrorMessage(err, 'Não foi possível carregar os dados da tela.')
  } finally {
    loading.value = false
  }

  const brincoDaUrl = Number(route.query.brinco)
  const animalDaUrl = animais.value.find((animal) => animal.brinco === brincoDaUrl)

  if (animalDaUrl) {
    propriedadeId.value = lotePorId.value.get(animalDaUrl.loteId)?.propriedadeId ?? null
    brinco.value = animalDaUrl.brinco
    await carregarHistorico()
  } else if (propriedades.value.length === 1) {
    propriedadeId.value = propriedades.value[0]!.id
  }
})
</script>
