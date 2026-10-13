<template>
  <PageLayout
    titulo="Animais"
    subtitulo="Cadastros"
  >
      <form
        v-if="animalStatus === null"
        @submit.prevent="salvarAnimal"
        class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          {{ animalEditando ? `Editar animal - brinco ${animalEditando.brinco}` : 'Cadastrar animal' }}
        </h3>

        <div class="grid gap-4 md:grid-cols-2">

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Lote
            </label>

            <select
              v-model="loteId"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              :disabled="lotes.length === 0"
              required
            >
              <option :value="null" disabled>
                Selecione o lote
              </option>

              <optgroup
                v-for="grupo in lotesPorPropriedade"
                :key="grupo.propriedadeId"
                :label="grupo.titulo"
              >
                <option
                  v-for="lote in grupo.lotes"
                  :key="lote.id"
                  :value="lote.id"
                  :disabled="loteBloqueado(lote)"
                >
                  Lote {{ lote.numero }} - {{ FINALIDADE_LOTE_LABEL[lote.finalidade] }}
                  ({{ ativosPorLote.get(lote.id) ?? 0 }}/{{ lote.capacidade }}{{ loteLotado(lote) ? ' - lotado' : '' }})
                </option>
              </optgroup>
            </select>

            <p
              v-if="!loading && lotes.length === 0"
              class="mt-1 text-xs text-amber-700"
            >
              Nenhum lote disponível. Cadastre um lote antes de cadastrar um animal.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Brinco
            </label>

            <input
              v-model.number="brinco"
              type="number"
              min="1"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />

            <p class="mt-1 text-xs text-slate-500">
              Deve ser único em todo o sistema.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Sexo
            </label>

            <select
              v-model="sexo"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              required
            >
              <option
                v-for="(label, valor) in SEXO_ANIMAL_LABEL"
                :key="valor"
                :value="valor"
              >
                {{ label }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Data de nascimento
            </label>

            <input
              v-model="dataNascimento"
              type="date"
              :max="dataHoje"
              :disabled="animalEditando !== null"
              class="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-500"
              required
            />

            <p v-if="animalEditando" class="mt-1 text-xs text-slate-500">
              A data de nascimento não pode ser alterada.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Peso atual (kg)
            </label>

            <input
              v-model.number="pesoAtual"
              type="number"
              min="0.1"
              step="0.1"
              :disabled="animalEditando !== null && animalEditando.status !== 'ATIVO'"
              class="w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-500"
              required
            />

            <p v-if="!animalEditando" class="mt-1 text-xs text-slate-500">
              Será registrado como a primeira pesagem do animal, com a data de hoje.
            </p>

            <p v-else-if="animalEditando.status !== 'ATIVO'" class="mt-1 text-xs text-slate-500">
              O peso não pode ser alterado porque o animal não está ativo.
            </p>

            <p v-else-if="pesoAlterado" class="mt-1 text-xs text-amber-700">
              Alterar o peso registra uma nova pesagem com a data de hoje.
            </p>
          </div>

        </div>

        <div class="mt-5 flex gap-2">
          <button
            type="submit"
            :disabled="salvando || lotes.length === 0"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ salvando ? 'Salvando...' : animalEditando ? 'Salvar alterações' : 'Cadastrar animal' }}
          </button>

          <button
            v-if="animalEditando"
            type="button"
            @click="cancelarEdicao"
            class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
        </div>
      </form>

      <form
        v-else
        @submit.prevent="salvarStatus"
        class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h3 class="mb-1 text-lg font-semibold text-slate-900">
          Alterar status - brinco {{ animalStatus.brinco }}
        </h3>

        <p class="mb-4 text-sm text-slate-500">
          Status atual:
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium"
            :class="STATUS_ANIMAL_CLASSE[animalStatus.status]"
          >
            {{ STATUS_ANIMAL_LABEL[animalStatus.status] }}
          </span>
        </p>

        <div class="max-w-sm">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Novo status
          </label>

          <select
            v-model="novoStatus"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            :disabled="verificandoCarencia"
            required
          >
            <option :value="null" disabled>
              {{ verificandoCarencia ? 'Verificando carência...' : 'Selecione o novo status' }}
            </option>

            <option
              v-for="status in STATUS_DESTINO"
              :key="status"
              :value="status"
              :disabled="statusBloqueadoPorCarencia(status)"
            >
              {{ STATUS_ANIMAL_LABEL[status] }}{{ statusBloqueadoPorCarencia(status) ? ' (em carência)' : '' }}
            </option>
          </select>
        </div>

        <p v-if="fimCarencia" class="mt-3 text-sm text-amber-700">
          Animal em período de carência até {{ formatarData(fimCarencia) }}. Não pode ser vendido nem abatido até lá.
        </p>

        <p class="mt-3 text-xs text-slate-500">
          A mudança de status é definitiva: o animal não volta a ficar Ativo e deixa de receber novos registros de pesagem, vacinação ou alimentação. Animais não podem ser excluídos, para manter o histórico.
        </p>

        <div class="mt-5 flex gap-2">
          <button
            type="submit"
            :disabled="salvando || verificandoCarencia || novoStatus === null"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {{ salvando ? 'Salvando...' : 'Confirmar status' }}
          </button>

          <button
            type="button"
            @click="cancelarStatus"
            class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
        </div>
      </form>

      <p v-if="erro" class="text-sm text-red-600">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="text-sm text-green-700">
        {{ sucesso }}
      </p>

      <section>
      <div class="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 class="text-lg font-semibold text-slate-900">
          Animais cadastrados
          <span
            v-if="!loading && animais.length > 0"
            class="ml-1 text-sm font-normal text-slate-500"
          >
            {{ filtroAtivo ? `${animaisFiltrados.length} de ${animais.length}` : animais.length }}
          </span>
        </h3>

        <div class="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <select
            v-model="filtroStatus"
            aria-label="Filtrar animais por status"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm sm:w-44"
          >
            <option value="">Todos os status</option>
            <option
              v-for="(label, status) in STATUS_ANIMAL_LABEL"
              :key="status"
              :value="status"
            >
              {{ label }}
            </option>
          </select>

          <input
            v-model="buscaBrinco"
            type="search"
            inputmode="numeric"
            placeholder="Buscar por brinco"
            aria-label="Buscar animal por brinco"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm sm:w-64"
          />
        </div>
      </div>

      <p v-if="loading" class="text-slate-500">
        Carregando...
      </p>

      <div
        v-else-if="animaisFiltrados.length > 0"
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Brinco</th>
              <th class="px-4 py-3 font-medium">Sexo</th>
              <th class="px-4 py-3 font-medium">Nascimento</th>
              <th class="px-4 py-3 font-medium">Peso atual</th>
              <th class="px-4 py-3 font-medium">Lote</th>
              <th class="px-4 py-3 font-medium">Propriedade</th>
              <th v-if="auth.isAdmin" class="px-4 py-3 font-medium">Produtor</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="animal in animaisFiltrados" :key="animal.id">
              <td class="px-4 py-3 font-medium text-slate-900">
                {{ animal.brinco }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ SEXO_ANIMAL_LABEL[animal.sexo] ?? animal.sexo }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ formatarData(animal.dataNascimento) }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ formatarPeso(animal.pesoAtual) }} kg
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ lotePorId.get(animal.loteId) ? `Lote ${lotePorId.get(animal.loteId)!.numero}` : `Lote #${animal.loteId}` }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ propriedadeDoLote(animal.loteId)?.nome ?? '-' }}
              </td>

              <td v-if="auth.isAdmin" class="px-4 py-3 text-slate-700">
                {{ nomeProdutor(propriedadeDoLote(animal.loteId)?.usuarioId ?? null) }}
              </td>

              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="STATUS_ANIMAL_CLASSE[animal.status]"
                >
                  {{ STATUS_ANIMAL_LABEL[animal.status] }}
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <RouterLink
                    :to="{ name: 'animais-ficha', params: { id: animal.id } }"
                    class="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                  >
                    Ficha
                  </RouterLink>

                  <button
                    type="button"
                    @click="editarAnimal(animal)"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </button>

                  <button
                    v-if="animal.status === 'ATIVO'"
                    type="button"
                    @click="abrirStatus(animal)"
                    class="whitespace-nowrap rounded-md bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
                  >
                    Alterar status
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else-if="filtroAtivo" class="text-slate-500">
        Nenhum animal encontrado com os filtros selecionados.
      </p>

      <p v-else class="text-slate-500">
        Nenhum animal encontrado.
      </p>
      </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { animalService } from '@/services/animalService'
import { carenciaService } from '@/services/carenciaService'
import { loteService } from '@/services/loteService'
import { propriedadeService } from '@/services/propriedadeService'
import { usuarioService } from '@/services/usuarioService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import {
  SEXO_ANIMAL_LABEL,
  STATUS_ANIMAL_CLASSE,
  STATUS_ANIMAL_LABEL,
  type Animal,
  type SexoAnimal,
  type StatusAnimal,
} from '@/types/animal'
import { FINALIDADE_LOTE_LABEL, type Lote } from '@/types/lote'
import type { Propriedade } from '@/types/propriedade'
import type { Usuario } from '@/types/usuario'

const auth = useAuthStore()

const animais = ref<Animal[]>([])
const buscaBrinco = ref('')
const filtroStatus = ref<StatusAnimal | ''>('')

const filtroAtivo = computed(() => buscaBrinco.value.trim() !== '' || filtroStatus.value !== '')

const animaisFiltrados = computed(() => {
  const termo = buscaBrinco.value.replace(/\D/g, '')

  return [...animais.value]
    .sort((a, b) => a.brinco - b.brinco)
    .filter((animal) => !filtroStatus.value || animal.status === filtroStatus.value)
    .filter((animal) => !termo || String(animal.brinco).includes(termo))
})
const lotes = ref<Lote[]>([])
const propriedades = ref<Propriedade[]>([])
const usuarios = ref<Usuario[]>([])
const loading = ref(true)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')

const animalEditando = ref<Animal | null>(null)
const brinco = ref<number | null>(null)
const dataNascimento = ref('')
const pesoAtual = ref<number | null>(null)
const sexo = ref<SexoAnimal>('Macho')
const loteId = ref<number | null>(null)

const STATUS_DESTINO: StatusAnimal[] = ['VENDIDO', 'OBITO', 'ABATIDO']

const animalStatus = ref<Animal | null>(null)
const novoStatus = ref<StatusAnimal | null>(null)
const fimCarencia = ref<string | null>(null)
const verificandoCarencia = ref(false)

const dataHoje = obterDataHoje()

const lotePorId = computed(() => new Map(lotes.value.map((lote) => [lote.id, lote])))

const propriedadePorId = computed(
  () => new Map(propriedades.value.map((propriedade) => [propriedade.id, propriedade])),
)

const lotesPorPropriedade = computed(() => {
  const grupos = new Map<number, { propriedadeId: number; titulo: string; lotes: Lote[] }>()

  for (const lote of [...lotes.value].sort((a, b) => a.numero - b.numero)) {
    if (!grupos.has(lote.propriedadeId)) {
      grupos.set(lote.propriedadeId, {
        propriedadeId: lote.propriedadeId,
        titulo: tituloPropriedade(lote.propriedadeId),
        lotes: [],
      })
    }

    grupos.get(lote.propriedadeId)!.lotes.push(lote)
  }

  return [...grupos.values()].sort((a, b) => a.titulo.localeCompare(b.titulo))
})

const pesoAlterado = computed(
  () => animalEditando.value !== null && pesoAtual.value !== animalEditando.value.pesoAtual,
)

const ativosPorLote = computed(() => {
  const contagem = new Map<number, number>()

  for (const animal of animais.value) {
    if (animal.status === 'ATIVO') {
      contagem.set(animal.loteId, (contagem.get(animal.loteId) ?? 0) + 1)
    }
  }

  return contagem
})

function loteLotado(lote: Lote): boolean {
  return (ativosPorLote.value.get(lote.id) ?? 0) >= lote.capacidade
}

function loteBloqueado(lote: Lote): boolean {
  if (!loteLotado(lote)) {
    return false
  }

  if (!animalEditando.value) {
    return true
  }

  return animalEditando.value.status === 'ATIVO' && animalEditando.value.loteId !== lote.id
}

function statusBloqueadoPorCarencia(status: StatusAnimal): boolean {
  return fimCarencia.value !== null && (status === 'VENDIDO' || status === 'ABATIDO')
}

function obterDataHoje() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarPeso(valor: number) {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

function nomeProdutor(id: number | null): string {
  if (id === null) {
    return '-'
  }

  return usuarios.value.find((usuario) => usuario.id === id)?.nome ?? `Usuário #${id}`
}

function propriedadeDoLote(id: number): Propriedade | undefined {
  const lote = lotePorId.value.get(id)
  return lote ? propriedadePorId.value.get(lote.propriedadeId) : undefined
}

function tituloPropriedade(id: number): string {
  const propriedade = propriedadePorId.value.get(id)

  if (!propriedade) {
    return `Propriedade #${id}`
  }

  return auth.isAdmin
    ? `${propriedade.nome} - ${nomeProdutor(propriedade.usuarioId)}`
    : propriedade.nome
}

async function carregarAnimais() {
  animais.value = await animalService.listAll()
}

function limparMensagens() {
  erro.value = ''
  sucesso.value = ''
}

function limparFormulario() {
  brinco.value = null
  dataNascimento.value = ''
  pesoAtual.value = null
  sexo.value = 'Macho'
  loteId.value = null
  animalEditando.value = null
}

async function salvarAnimal() {
  limparMensagens()

  if (
    brinco.value === null ||
    pesoAtual.value === null ||
    loteId.value === null ||
    !dataNascimento.value
  ) {
    erro.value = 'Preencha todos os campos do animal.'
    return
  }

  salvando.value = true

  try {
    const payload = {
      brinco: brinco.value,
      dataNascimento: dataNascimento.value,
      pesoAtual: pesoAtual.value,
      sexo: sexo.value,
      loteId: loteId.value,
    }

    if (animalEditando.value) {
      await animalService.update(animalEditando.value.id, payload)
      sucesso.value = 'Animal atualizado com sucesso.'
    } else {
      await animalService.create(payload)
      sucesso.value = 'Animal cadastrado com sucesso.'
    }

    await carregarAnimais()
    limparFormulario()
  } catch (err) {
    console.error('Falha ao salvar animal', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível salvar o animal.')
  } finally {
    salvando.value = false
  }
}

function editarAnimal(animal: Animal) {
  cancelarStatus()
  limparMensagens()

  animalEditando.value = animal
  brinco.value = animal.brinco
  dataNascimento.value = animal.dataNascimento
  pesoAtual.value = animal.pesoAtual
  sexo.value = animal.sexo
  loteId.value = animal.loteId

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
  limparMensagens()
}

async function abrirStatus(animal: Animal) {
  if (animal.status !== 'ATIVO') {
    return
  }

  limparFormulario()
  limparMensagens()

  animalStatus.value = animal
  novoStatus.value = null
  fimCarencia.value = null

  window.scrollTo({ top: 0, behavior: 'smooth' })

  verificandoCarencia.value = true

  try {
    const fim = await carenciaService.fimCarencia(animal.brinco)

    if (animalStatus.value?.id === animal.id) {
      fimCarencia.value = fim
    }
  } catch (err) {
    console.error('Falha ao verificar carência do animal', err)
  } finally {
    verificandoCarencia.value = false
  }
}

function cancelarStatus() {
  animalStatus.value = null
  novoStatus.value = null
  fimCarencia.value = null
}

async function salvarStatus() {
  if (!animalStatus.value || novoStatus.value === null) {
    return
  }

  const animal = animalStatus.value
  const status = novoStatus.value

  if (!confirm(`Alterar o status do animal ${animal.brinco} para "${STATUS_ANIMAL_LABEL[status]}"?`)) {
    return
  }

  limparMensagens()
  salvando.value = true

  try {
    await animalService.updateStatus(animal.id, status)
    await carregarAnimais()
    cancelarStatus()
    sucesso.value = `Status do animal ${animal.brinco} alterado para ${STATUS_ANIMAL_LABEL[status]}.`
  } catch (err) {
    console.error('Falha ao alterar status do animal', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível alterar o status do animal.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    const [dadosAnimais, dadosLotes, dadosPropriedades, dadosUsuarios] = await Promise.all([
      animalService.listAll(),
      loteService.listAll(),
      propriedadeService.listAll(),
      auth.isAdmin ? usuarioService.listAll() : Promise.resolve([]),
    ])

    animais.value = dadosAnimais
    lotes.value = dadosLotes
    propriedades.value = dadosPropriedades
    usuarios.value = dadosUsuarios
  } catch (err) {
    console.error('Falha ao carregar animais', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível carregar os animais.')
  } finally {
    loading.value = false
  }
})
</script>
