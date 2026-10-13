<template>
  <PageLayout
    titulo="Alimentação"
    subtitulo="Manejo"
  >
    <form
      @submit.prevent="salvar"
      class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 class="text-lg font-semibold text-slate-900">
          Registrar alimentação
        </h3>

        <div class="inline-flex rounded-md bg-slate-100 p-1 text-sm">
          <button
            type="button"
            @click="alterarModo('animal')"
            class="rounded px-3 py-1.5 font-medium transition"
            :class="modo === 'animal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            Um animal
          </button>

          <button
            type="button"
            @click="alterarModo('lote')"
            class="rounded px-3 py-1.5 font-medium transition"
            :class="modo === 'lote' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          >
            Lote inteiro
          </button>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="registro-propriedade" class="mb-1 block text-sm font-medium text-slate-700">
            Propriedade
          </label>

          <SearchableSelect
            id="registro-propriedade"
            v-model="propriedadeRegistro"
            :options="opcoesPropriedade"
            :disabled="loading || propriedades.length === 0"
            placeholder="Digite o nome da propriedade"
            texto-vazio="Nenhuma propriedade encontrada."
            @change="trocarPropriedadeRegistro"
          />
        </div>

        <div v-if="modo === 'animal'">
          <label for="registro-animal" class="mb-1 block text-sm font-medium text-slate-700">
            Animal
          </label>

          <SearchableSelect
            id="registro-animal"
            v-model="brincoRegistro"
            :options="opcoesAnimalRegistro"
            :disabled="propriedadeRegistro === null"
            :placeholder="propriedadeRegistro === null ? 'Escolha a propriedade primeiro' : 'Digite o brinco'"
            texto-vazio="Nenhum animal ativo nesta propriedade."
          />
        </div>

        <div v-else>
          <label for="registro-lote" class="mb-1 block text-sm font-medium text-slate-700">
            Lote
          </label>

          <SearchableSelect
            id="registro-lote"
            v-model="loteId"
            :options="opcoesLoteRegistro"
            :disabled="propriedadeRegistro === null"
            :placeholder="propriedadeRegistro === null ? 'Escolha a propriedade primeiro' : 'Digite o número do lote'"
            texto-vazio="Nenhum lote com animais ativos nesta propriedade."
          />
        </div>

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
              v-for="(label, valor) in TIPO_ALIMENTACAO_LABEL"
              :key="valor"
              :value="valor"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Data
          </label>

          <input
            v-model="data"
            type="date"
            :min="modo === 'animal' ? animalRegistro?.dataNascimento : undefined"
            :max="dataHoje"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Quantidade (kg){{ modo === 'lote' ? ' por animal' : '' }}
          </label>

          <input
            v-model.number="quantidade"
            type="number"
            min="0.01"
            step="0.01"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Valor (R$){{ modo === 'lote' ? ' por animal' : '' }}
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

      <div
        v-if="modo === 'lote' && loteId !== null && ativosNoLote > 0"
        class="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200"
      >
        Será registrado para <strong>{{ ativosNoLote }} animal(is) ativo(s)</strong> do lote.
        <template v-if="typeof quantidade === 'number' && quantidade > 0">
          Total: <strong>{{ formatarNumero(quantidade * ativosNoLote) }} kg</strong>
        </template>
        <template v-if="typeof valor === 'number' && valor > 0">
          e <strong>{{ formatarMoeda(valor * ativosNoLote) }}</strong> em custos
        </template>.
      </div>

      <div class="mt-5">
        <button
          type="submit"
          :disabled="salvando || loading"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {{ salvando ? 'Salvando...' : 'Registrar alimentação' }}
        </button>
      </div>

      <p v-if="erro" class="mt-3 text-sm text-red-600">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="mt-3 text-sm text-green-700">
        {{ sucesso }}
      </p>
    </form>

    <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 class="mb-4 text-lg font-semibold text-slate-900">
        Histórico por animal
      </h3>

      <div class="mb-4 grid gap-4 md:grid-cols-2">
        <div>
          <label for="historico-propriedade" class="mb-1 block text-sm font-medium text-slate-700">
            Propriedade
          </label>

          <SearchableSelect
            id="historico-propriedade"
            v-model="propriedadeHistorico"
            :options="opcoesPropriedade"
            :disabled="loading || propriedades.length === 0"
            placeholder="Digite o nome da propriedade"
            texto-vazio="Nenhuma propriedade encontrada."
            @change="trocarPropriedadeHistorico"
          />
        </div>

        <div>
          <label for="historico-animal" class="mb-1 block text-sm font-medium text-slate-700">
            Animal
          </label>

          <SearchableSelect
            id="historico-animal"
            v-model="brincoHistorico"
            :options="opcoesAnimalHistorico"
            :disabled="propriedadeHistorico === null"
            :placeholder="propriedadeHistorico === null ? 'Escolha a propriedade primeiro' : 'Digite o brinco'"
            texto-vazio="Nenhum animal encontrado nesta propriedade."
            @change="carregarHistorico"
          />
        </div>
      </div>

      <p v-if="erroHistorico" class="mb-4 text-sm text-red-600">
        {{ erroHistorico }}
      </p>

      <p v-if="brincoHistorico === null" class="text-slate-500">
        Selecione um animal para ver as alimentações registradas.
      </p>

      <p v-else-if="carregandoHistorico" class="text-slate-500">
        Carregando histórico...
      </p>

      <div
        v-else-if="historico.length > 0"
        class="overflow-x-auto rounded-lg ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Data</th>
              <th class="px-4 py-3 font-medium">Tipo</th>
              <th class="px-4 py-3 font-medium">Quantidade</th>
              <th class="px-4 py-3 font-medium">Valor</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="item in historico" :key="item.id">
              <td class="px-4 py-3 text-slate-700">
                {{ formatarData(item.data) }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ TIPO_ALIMENTACAO_LABEL[item.tipo] }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ formatarNumero(item.quantidade) }} kg
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ item.valor === null ? '-' : formatarMoeda(item.valor) }}
              </td>
            </tr>
          </tbody>

          <tfoot class="bg-slate-50 font-medium text-slate-900">
            <tr>
              <td class="px-4 py-3" colspan="2">Total</td>
              <td class="px-4 py-3">{{ formatarNumero(totalQuantidade) }} kg</td>
              <td class="px-4 py-3">{{ formatarMoeda(totalValor) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p v-else class="text-slate-500">
        Nenhuma alimentação registrada para este animal.
      </p>
    </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'
import SearchableSelect from '@/components/SearchableSelect.vue'
import { alimentacaoService } from '@/services/alimentacaoService'
import { animalService } from '@/services/animalService'
import { loteService } from '@/services/loteService'
import { propriedadeService } from '@/services/propriedadeService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { dataHojeIso, formatarData, formatarMoeda, formatarNumero } from '@/utils/formatters'
import { TIPO_ALIMENTACAO_LABEL, type Alimentacao, type TipoAlimentacao } from '@/types/alimentacao'
import { STATUS_ANIMAL_LABEL, type Animal } from '@/types/animal'
import type { Lote } from '@/types/lote'
import type { Propriedade } from '@/types/propriedade'
import type { OpcaoSelect } from '@/types/select'

type Modo = 'animal' | 'lote'

const route = useRoute()

const animais = ref<Animal[]>([])
const lotes = ref<Lote[]>([])
const propriedades = ref<Propriedade[]>([])
const alimentacoes = ref<Alimentacao[]>([])

const loading = ref(true)
const salvando = ref(false)
const carregandoHistorico = ref(false)
const erro = ref('')
const sucesso = ref('')
const erroHistorico = ref('')

const dataHoje = dataHojeIso()

const modo = ref<Modo>('animal')
const propriedadeRegistro = ref<number | null>(null)
const brincoRegistro = ref<number | null>(null)
const loteId = ref<number | null>(null)
const tipo = ref<TipoAlimentacao>('PASTO')
const quantidade = ref<number | ''>('')
const data = ref(dataHoje)
const valor = ref<number | ''>('')

const propriedadeHistorico = ref<number | null>(null)
const brincoHistorico = ref<number | null>(null)

const lotePorId = computed(() => new Map(lotes.value.map((lote) => [lote.id, lote])))


const animaisAtivos = computed(() => animais.value.filter((animal) => animal.status === 'ATIVO'))

const animalRegistro = computed(
  () => animais.value.find((animal) => animal.brinco === brincoRegistro.value) ?? null,
)

const ativosPorLote = computed(() => {
  const contagem = new Map<number, number>()

  for (const animal of animaisAtivos.value) {
    contagem.set(animal.loteId, (contagem.get(animal.loteId) ?? 0) + 1)
  }

  return contagem
})

const ativosNoLote = computed(() =>
  loteId.value === null ? 0 : ativosPorLote.value.get(loteId.value) ?? 0,
)

const opcoesAnimalRegistro = computed<OpcaoSelect[]>(() =>
  animaisAtivos.value
    .filter((animal) => lotePorId.value.get(animal.loteId)?.propriedadeId === propriedadeRegistro.value)
    .sort((a, b) => a.brinco - b.brinco)
    .map((animal) => ({
      value: animal.brinco,
      label: `Brinco ${animal.brinco}`,
      detalhe: nomeLote(animal.loteId),
    })),
)

const opcoesLoteRegistro = computed<OpcaoSelect[]>(() =>
  lotes.value
    .filter((lote) => lote.propriedadeId === propriedadeRegistro.value)
    .filter((lote) => (ativosPorLote.value.get(lote.id) ?? 0) > 0)
    .sort((a, b) => a.numero - b.numero)
    .map((lote) => ({
      value: lote.id,
      label: `Lote ${lote.numero}`,
      detalhe: `${ativosPorLote.value.get(lote.id)} animal(is) ativo(s)`,
    })),
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

const opcoesAnimalHistorico = computed<OpcaoSelect[]>(() =>
  animais.value
    .filter((animal) => lotePorId.value.get(animal.loteId)?.propriedadeId === propriedadeHistorico.value)
    .sort((a, b) => a.brinco - b.brinco)
    .map((animal) => ({
      value: animal.brinco,
      label: `Brinco ${animal.brinco}`,
      detalhe: `${nomeLote(animal.loteId)}${animal.status !== 'ATIVO' ? ` - ${STATUS_ANIMAL_LABEL[animal.status]}` : ''}`,
    })),
)

const historico = computed(() => [...alimentacoes.value].reverse())

const totalQuantidade = computed(() =>
  alimentacoes.value.reduce((total, item) => total + item.quantidade, 0),
)

const totalValor = computed(() =>
  alimentacoes.value.reduce((total, item) => total + (item.valor ?? 0), 0),
)

function nomeLote(id: number): string {
  const lote = lotePorId.value.get(id)
  return lote ? `Lote ${lote.numero}` : `Lote #${id}`
}

function trocarPropriedadeRegistro() {
  brincoRegistro.value = null
  loteId.value = null
}

function alterarModo(novoModo: Modo) {
  modo.value = novoModo
  erro.value = ''
  sucesso.value = ''
}

function limparFormulario() {
  quantidade.value = ''
  valor.value = ''
  data.value = dataHoje
}

function trocarPropriedadeHistorico() {
  brincoHistorico.value = null
  alimentacoes.value = []
  erroHistorico.value = ''
}

async function carregarHistorico() {
  alimentacoes.value = []
  erroHistorico.value = ''

  if (brincoHistorico.value === null) {
    return
  }

  carregandoHistorico.value = true

  try {
    alimentacoes.value = await alimentacaoService.listByBrinco(brincoHistorico.value)
  } catch (err) {
    console.error('Falha ao carregar histórico de alimentação', err)
    erroHistorico.value = getApiErrorMessage(err, 'Não foi possível carregar o histórico.')
  } finally {
    carregandoHistorico.value = false
  }
}

async function salvar() {
  erro.value = ''
  sucesso.value = ''

  if (typeof quantidade.value !== 'number' || quantidade.value <= 0 || !data.value) {
    erro.value = 'Informe a quantidade e a data.'
    return
  }

  const valorInformado = typeof valor.value === 'number' && valor.value > 0 ? valor.value : null

  salvando.value = true

  try {
    if (modo.value === 'animal') {
      if (brincoRegistro.value === null) {
        erro.value = 'Selecione o animal.'
        return
      }

      await alimentacaoService.createParaAnimal({
        brinco: brincoRegistro.value,
        tipo: tipo.value,
        quantidade: quantidade.value,
        data: data.value,
        valor: valorInformado,
      })

      sucesso.value = `Alimentação registrada para o animal ${brincoRegistro.value}.`

      propriedadeHistorico.value = animalRegistro.value
        ? lotePorId.value.get(animalRegistro.value.loteId)?.propriedadeId ?? null
        : null
      brincoHistorico.value = brincoRegistro.value
      await carregarHistorico()
    } else {
      if (loteId.value === null) {
        erro.value = 'Selecione o lote.'
        return
      }

      const registros = await alimentacaoService.createParaLote({
        loteId: loteId.value,
        tipo: tipo.value,
        quantidade: quantidade.value,
        data: data.value,
        valor: valorInformado,
      })

      sucesso.value = `Alimentação registrada para ${registros.length} animal(is) do ${nomeLote(loteId.value)}.`

      if (brincoHistorico.value !== null) {
        await carregarHistorico()
      }
    }

    limparFormulario()
  } catch (err) {
    console.error('Falha ao registrar alimentação', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível registrar a alimentação.')
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

    if (dadosPropriedades.length === 1) {
      propriedadeHistorico.value = dadosPropriedades[0]!.id
      propriedadeRegistro.value = dadosPropriedades[0]!.id
    }
  } catch (err) {
    console.error('Falha ao carregar dados de alimentação', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível carregar animais e lotes.')
  } finally {
    loading.value = false
  }

  const animalDaUrl = animais.value.find((animal) => animal.brinco === Number(route.query.brinco))

  if (animalDaUrl) {
    propriedadeHistorico.value = lotePorId.value.get(animalDaUrl.loteId)?.propriedadeId ?? null
    brincoHistorico.value = animalDaUrl.brinco

    if (animalDaUrl.status === 'ATIVO') {
      modo.value = 'animal'
      propriedadeRegistro.value = propriedadeHistorico.value
      brincoRegistro.value = animalDaUrl.brinco
    }

    await carregarHistorico()
  }
})
</script>
