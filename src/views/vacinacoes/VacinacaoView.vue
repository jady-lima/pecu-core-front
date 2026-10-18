<template>
  <PageLayout
    titulo="Vacinação"
    subtitulo="Manejo"
  >
    <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label for="vacinacao-propriedade" class="mb-1 block text-sm font-medium text-slate-700">
            Propriedade
          </label>

          <SearchableSelect
            id="vacinacao-propriedade"
            v-model="propriedadeId"
            :options="opcoesPropriedade"
            :disabled="loading || propriedades.length === 0"
            placeholder="Digite o nome da propriedade"
            texto-vazio="Nenhuma propriedade encontrada."
            @change="trocarPropriedade"
          />
        </div>

        <div>
          <label for="vacinacao-animal" class="mb-1 block text-sm font-medium text-slate-700">
            Animal
          </label>

          <SearchableSelect
            id="vacinacao-animal"
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

    <form
      v-if="animalSelecionado && (animalSelecionado.status === 'ATIVO' || vacinacaoEditando)"
      @submit.prevent="salvar"
      class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h3 class="mb-4 text-lg font-semibold text-slate-900">
        {{ vacinacaoEditando ? 'Editar' : 'Registrar' }} vacinação - brinco {{ animalSelecionado.brinco }}
      </h3>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="vacinacao-vacina" class="mb-1 block text-sm font-medium text-slate-700">
            Vacina
          </label>

          <SearchableSelect
            id="vacinacao-vacina"
            v-model="vacinaId"
            :options="opcoesVacina"
            :disabled="vacinas.length === 0"
            placeholder="Digite o nome ou o fabricante"
            texto-vazio="Nenhuma vacina encontrada no catálogo."
          />

          <p v-if="!loading && vacinas.length === 0" class="mt-1 text-xs text-amber-700">
            O catálogo de vacinas está vazio.
            <RouterLink :to="{ name: 'vacinas' }" class="font-medium underline">Cadastre as vacinas no catálogo.</RouterLink>
          </p>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Aplicada por
          </label>

          <select
            v-model="aplicadorId"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            :disabled="carregandoVeterinarios"
            required
          >
            <option
              v-for="aplicador in aplicadores"
              :key="aplicador.value"
              :value="aplicador.value"
            >
              {{ aplicador.label }}
            </option>
          </select>

          <p class="mt-1 text-xs text-slate-500">
            Você ou um veterinário vinculado a esta propriedade.
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
            Lote da vacina
          </label>

          <input
            v-model="loteVacina"
            type="text"
            maxlength="50"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Dose aplicada (mL)
          </label>

          <input
            v-model.number="doseAplicada"
            type="number"
            min="0.01"
            step="0.01"
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
            Se informado, é lançado automaticamente nos custos{{ auth.isVeterinario ? ' do produtor' : '' }}.
          </p>
        </div>

        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Observações
            <span class="font-normal text-slate-400">- opcional</span>
          </label>

          <textarea
            v-model="observacoes"
            rows="2"
            maxlength="500"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
          />

          <p class="mt-1 text-right text-xs text-slate-400">
            {{ observacoes.length }}/500
          </p>
        </div>
      </div>

      <div
        v-if="vacinaSelecionada && data"
        class="mt-2 grid gap-3 rounded-md bg-slate-50 px-4 py-3 text-sm ring-1 ring-slate-200 sm:grid-cols-2"
      >
        <p class="text-slate-700">
          Fim da carência:
          <strong v-if="vacinaSelecionada.carenciaDias > 0">
            {{ formatarData(adicionarDias(data, vacinaSelecionada.carenciaDias)) }}
          </strong>
          <strong v-else>sem carência</strong>
        </p>

        <p class="text-slate-700">
          Próxima dose:
          <strong v-if="vacinaSelecionada.intervaloDoseDias">
            {{ formatarData(adicionarDias(data, vacinaSelecionada.intervaloDoseDias)) }}
          </strong>
          <strong v-else>dose única</strong>
        </p>
      </div>

      <p v-if="vacinacaoEditando" class="mt-4 text-xs text-amber-700">
        Ao salvar, a próxima dose e o fim da carência são recalculados com base na vacina e na data informadas.
      </p>

      <div class="mt-5 flex gap-2">
        <button
          type="submit"
          :disabled="salvando"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {{ salvando ? 'Salvando...' : vacinacaoEditando ? 'Salvar alterações' : 'Registrar vacinação' }}
        </button>

        <button
          v-if="vacinacaoEditando"
          type="button"
          @click="cancelarEdicao"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Cancelar
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
      Este animal está com status {{ STATUS_ANIMAL_LABEL[animalSelecionado.status] }} e não recebe novas vacinações. O histórico continua disponível abaixo.
    </p>

    <section v-if="animalSelecionado">
      <h3 class="mb-3 text-lg font-semibold text-slate-900">
        Histórico de vacinação
      </h3>

      <p v-if="erroHistorico" class="mb-3 text-sm text-red-600">
        {{ erroHistorico }}
      </p>

      <p v-if="sucessoHistorico" class="mb-3 text-sm text-green-700">
        {{ sucessoHistorico }}
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
              <th class="px-4 py-3 font-medium">Vacina</th>
              <th class="px-4 py-3 font-medium">Dose</th>
              <th class="px-4 py-3 font-medium">Aplicada por</th>
              <th class="px-4 py-3 font-medium">Próxima dose</th>
              <th class="px-4 py-3 font-medium">Carência</th>
              <th class="px-4 py-3 font-medium">Valor</th>
              <th class="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in historico"
              :key="item.id"
              class="align-top"
              :class="vacinacaoEditando?.id === item.id ? 'bg-amber-50' : ''"
            >
              <td class="whitespace-nowrap px-4 py-3 text-slate-700">
                {{ formatarData(item.data) }}
              </td>

              <td class="px-4 py-3">
                <p class="font-medium text-slate-900">{{ item.nomeVacina }}</p>
                <p class="text-xs text-slate-500">Lote {{ item.loteVacina }}</p>
                <p v-if="item.observacoes" class="mt-1 text-xs text-slate-500">{{ item.observacoes }}</p>
              </td>

              <td class="whitespace-nowrap px-4 py-3 text-slate-700">
                {{ formatarNumero(item.doseAplicada) }} mL
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ item.aplicador }}
                <p v-if="item.registradoPor !== item.aplicador" class="text-xs text-slate-500">
                  Registrado por {{ item.registradoPor }}
                </p>
              </td>

              <td class="whitespace-nowrap px-4 py-3">
                <span
                  v-if="situacaoProximaDose(item).classe"
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="situacaoProximaDose(item).classe"
                >
                  {{ situacaoProximaDose(item).texto }}
                </span>
                <span v-else class="text-slate-700">{{ situacaoProximaDose(item).texto }}</span>
              </td>

              <td class="whitespace-nowrap px-4 py-3">
                <span
                  v-if="item.dataFimCarencia && item.dataFimCarencia > dataHoje"
                  class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                >
                  Até {{ formatarData(item.dataFimCarencia) }}
                </span>
                <span v-else class="text-slate-500">Encerrada</span>
              </td>

              <td class="whitespace-nowrap px-4 py-3 text-slate-700">
                {{ item.valor === null ? '-' : formatarMoeda(item.valor) }}
              </td>

              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="editarVacinacao(item)"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </button>

                  <button
                    v-if="podeExcluir"
                    type="button"
                    @click="excluirVacinacao(item)"
                    class="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-slate-500">
        Nenhuma vacinação registrada para este animal.
      </p>
    </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'
import SearchableSelect from '@/components/SearchableSelect.vue'
import { useAuthStore } from '@/stores/auth'
import { animalService } from '@/services/animalService'
import { loteService } from '@/services/loteService'
import { propriedadeService } from '@/services/propriedadeService'
import { vacinaService } from '@/services/vacinaService'
import { vacinacaoService } from '@/services/vacinacaoService'
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
import type { Propriedade } from '@/types/propriedade'
import type { OpcaoSelect } from '@/types/select'
import type { Usuario } from '@/types/usuario'
import type { Vacina } from '@/types/vacina'
import type { Vacinacao } from '@/types/vacinacao'

const DIAS_ALERTA_PROXIMA_DOSE = 30

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const animais = ref<Animal[]>([])
const lotes = ref<Lote[]>([])
const propriedades = ref<Propriedade[]>([])
const vacinas = ref<Vacina[]>([])
const veterinarios = ref<Usuario[]>([])
const vacinacoes = ref<Vacinacao[]>([])

const loading = ref(true)
const carregandoHistorico = ref(false)
const carregandoVeterinarios = ref(false)
const salvando = ref(false)
const erroInicial = ref('')
const erroHistorico = ref('')
const erro = ref('')
const sucesso = ref('')
const sucessoHistorico = ref('')

const podeExcluir = computed(() => auth.isAdmin || auth.isProdutor)
const vacinacaoEditando = ref<Vacinacao | null>(null)

const dataHoje = dataHojeIso()

const propriedadeId = ref<number | null>(null)
const brinco = ref<number | null>(null)

const vacinaId = ref<number | null>(null)
const aplicadorId = ref<number | null>(auth.userId)
const data = ref(dataHoje)
const loteVacina = ref('')
const doseAplicada = ref<number | ''>('')
const valor = ref<number | ''>('')
const observacoes = ref('')

const lotePorId = computed(() => new Map(lotes.value.map((lote) => [lote.id, lote])))

const animalSelecionado = computed(
  () => animais.value.find((animal) => animal.brinco === brinco.value) ?? null,
)

const vacinaSelecionada = computed(
  () => vacinas.value.find((vacina) => vacina.id === vacinaId.value) ?? null,
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

const opcoesVacina = computed<OpcaoSelect[]>(() =>
  [...vacinas.value]
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((vacina) => ({
      value: vacina.id,
      label: vacina.nome,
      detalhe: [
        vacina.fabricante,
        vacina.carenciaDias > 0 ? `carência ${vacina.carenciaDias} dia(s)` : 'sem carência',
        vacina.intervaloDoseDias ? `reforço a cada ${vacina.intervaloDoseDias} dia(s)` : 'dose única',
      ].join(' · '),
    })),
)

const aplicadores = computed<OpcaoSelect[]>(() => [
  ...(auth.userId !== null ? [{ value: auth.userId, label: `${auth.nome ?? 'Eu'} (eu)` }] : []),
  ...veterinarios.value
    .filter((veterinario) => veterinario.id !== auth.userId)
    .map((veterinario) => ({
      value: veterinario.id,
      label: `${veterinario.nome} (veterinário)`,
    })),
  ...(vacinacaoEditando.value &&
  vacinacaoEditando.value.aplicadorId !== auth.userId &&
  !veterinarios.value.some((veterinario) => veterinario.id === vacinacaoEditando.value!.aplicadorId)
    ? [{ value: vacinacaoEditando.value.aplicadorId, label: vacinacaoEditando.value.aplicador }]
    : []),
])

const historico = computed(() => [...vacinacoes.value].reverse())

function nomeLote(id: number): string {
  const lote = lotePorId.value.get(id)
  return lote ? `Lote ${lote.numero}` : `Lote #${id}`
}

function situacaoProximaDose(item: Vacinacao): { texto: string; classe: string } {
  if (!item.dataProximaDose) {
    return { texto: 'Dose única', classe: '' }
  }

  const reforcoAplicado = vacinacoes.value.some(
    (outra) => outra.vacinaId === item.vacinaId && outra.data > item.data,
  )

  if (reforcoAplicado) {
    return { texto: `${formatarData(item.dataProximaDose)} - aplicada`, classe: '' }
  }

  if (item.dataProximaDose < dataHoje) {
    return { texto: `Vencida em ${formatarData(item.dataProximaDose)}`, classe: 'bg-red-100 text-red-800' }
  }

  if (item.dataProximaDose <= adicionarDias(dataHoje, DIAS_ALERTA_PROXIMA_DOSE)) {
    return { texto: formatarData(item.dataProximaDose), classe: 'bg-amber-100 text-amber-800' }
  }

  return { texto: formatarData(item.dataProximaDose), classe: '' }
}

function limparFormulario() {
  vacinaId.value = null
  aplicadorId.value = auth.userId
  data.value = dataHoje
  loteVacina.value = ''
  doseAplicada.value = ''
  valor.value = ''
  observacoes.value = ''
  vacinacaoEditando.value = null
}

function limparMensagens() {
  erro.value = ''
  sucesso.value = ''
  erroHistorico.value = ''
  sucessoHistorico.value = ''
}

function editarVacinacao(item: Vacinacao) {
  limparMensagens()
  vacinacaoEditando.value = item
  vacinaId.value = item.vacinaId
  aplicadorId.value = item.aplicadorId
  data.value = item.data
  loteVacina.value = item.loteVacina
  doseAplicada.value = item.doseAplicada
  valor.value = item.valor ?? ''
  observacoes.value = item.observacoes ?? ''

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
  limparMensagens()
}

async function excluirVacinacao(item: Vacinacao) {
  if (!confirm(`Excluir a vacinação "${item.nomeVacina}" de ${formatarData(item.data)}?${item.valor !== null ? ' O custo lançado junto também será removido.' : ''}`)) {
    return
  }

  limparMensagens()

  try {
    await vacinacaoService.remove(item.id)

    if (vacinacaoEditando.value?.id === item.id) {
      limparFormulario()
    }

    await carregarHistorico()
    sucessoHistorico.value = 'Vacinação excluída com sucesso.'
  } catch (err) {
    console.error('Falha ao excluir vacinação', err)
    erroHistorico.value = getApiErrorMessage(err, 'Não foi possível excluir a vacinação.')
  }
}

function trocarPropriedade() {
  brinco.value = null
  vacinacoes.value = []
  veterinarios.value = []
  limparMensagens()
  limparFormulario()
  router.replace({ query: {} })
}

async function carregarVeterinarios() {
  veterinarios.value = []

  if (propriedadeId.value === null) {
    return
  }

  carregandoVeterinarios.value = true

  try {
    veterinarios.value = await propriedadeService.listVeterinarios(propriedadeId.value)
  } catch (err) {
    console.error('Falha ao carregar veterinários da propriedade', err)
  } finally {
    carregandoVeterinarios.value = false
  }
}

async function carregarHistorico() {
  vacinacoes.value = []

  if (brinco.value === null) {
    return
  }

  carregandoHistorico.value = true

  try {
    vacinacoes.value = await vacinacaoService.listByBrinco(brinco.value)
  } catch (err) {
    console.error('Falha ao carregar histórico de vacinação', err)
    erroHistorico.value = getApiErrorMessage(err, 'Não foi possível carregar o histórico de vacinação.')
  } finally {
    carregandoHistorico.value = false
  }
}

async function selecionarAnimal() {
  limparMensagens()
  limparFormulario()
  router.replace({ query: brinco.value === null ? {} : { brinco: String(brinco.value) } })

  await Promise.all([carregarHistorico(), carregarVeterinarios()])
}

async function salvar() {
  limparMensagens()

  if (
    brinco.value === null ||
    vacinaId.value === null ||
    aplicadorId.value === null ||
    !data.value ||
    !loteVacina.value.trim() ||
    typeof doseAplicada.value !== 'number' ||
    doseAplicada.value <= 0
  ) {
    erro.value = 'Preencha vacina, aplicador, data, lote da vacina e dose.'
    return
  }

  salvando.value = true

  try {
    const payload = {
      vacinaId: vacinaId.value,
      aplicadorId: aplicadorId.value,
      data: data.value,
      loteVacina: loteVacina.value.trim(),
      doseAplicada: doseAplicada.value,
      observacoes: observacoes.value.trim() || null,
      valor: typeof valor.value === 'number' && valor.value > 0 ? valor.value : null,
    }

    if (vacinacaoEditando.value) {
      await vacinacaoService.update(vacinacaoEditando.value.id, payload)
      sucesso.value = 'Vacinação atualizada com sucesso.'
    } else {
      await vacinacaoService.create({ brinco: brinco.value, ...payload })
      sucesso.value = 'Vacinação registrada com sucesso.'
    }

    limparFormulario()
    await carregarHistorico()
  } catch (err) {
    console.error('Falha ao salvar vacinação', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível salvar a vacinação.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    const [dadosAnimais, dadosLotes, dadosPropriedades, dadosVacinas] = await Promise.all([
      animalService.listAll(),
      loteService.listAll(),
      propriedadeService.listAll(),
      vacinaService.listAll(),
    ])

    animais.value = dadosAnimais
    lotes.value = dadosLotes
    propriedades.value = dadosPropriedades
    vacinas.value = dadosVacinas
  } catch (err) {
    console.error('Falha ao carregar dados de vacinação', err)
    erroInicial.value = getApiErrorMessage(err, 'Não foi possível carregar os dados da tela.')
  } finally {
    loading.value = false
  }

  const brincoDaUrl = Number(route.query.brinco)
  const animalDaUrl = animais.value.find((animal) => animal.brinco === brincoDaUrl)

  if (animalDaUrl) {
    propriedadeId.value = lotePorId.value.get(animalDaUrl.loteId)?.propriedadeId ?? null
    brinco.value = animalDaUrl.brinco
    await Promise.all([carregarHistorico(), carregarVeterinarios()])
  } else if (propriedades.value.length === 1) {
    propriedadeId.value = propriedades.value[0]!.id
    await carregarVeterinarios()
  }
})
</script>
