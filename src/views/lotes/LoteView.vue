<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900">PecuCore</h1>

      <RouterLink
        :to="{ name: 'home' }"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Voltar para Home
      </RouterLink>
    </header>

    <main class="p-6">
      <h2 class="mb-4 text-xl font-semibold text-slate-900">
        Lotes
      </h2>

      <form
        @submit.prevent="salvarLote"
        class="mb-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          {{ editandoId ? 'Editar lote' : 'Cadastrar lote' }}
        </h3>

        <div class="grid gap-4 md:grid-cols-2">

          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Propriedade
            </label>

            <select
              v-model="propriedadeId"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              required
            >
              <option :value="null" disabled>
                Selecione a propriedade
              </option>

              <option
                v-for="propriedade in propriedades"
                :key="propriedade.id"
                :value="propriedade.id"
              >
                {{ descricaoPropriedade(propriedade) }}
              </option>
            </select>

            <p
              v-if="!loading && propriedades.length === 0"
              class="mt-1 text-xs text-amber-700"
            >
              Nenhuma propriedade cadastrada. Cadastre uma em Propriedades antes de criar lotes.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Número
            </label>

            <input
              v-model.number="numero"
              type="number"
              min="1"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />

            <p class="mt-1 text-xs text-slate-500">
              Deve ser único dentro da propriedade.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Finalidade
            </label>

            <select
              v-model="finalidade"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              required
            >
              <option
                v-for="(label, valor) in FINALIDADE_LOTE_LABEL"
                :key="valor"
                :value="valor"
              >
                {{ label }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Capacidade
            </label>

            <input
              v-model.number="capacidade"
              type="number"
              :min="capacidadeMinima"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />

            <p v-if="editandoId !== null && ativosNoLoteEditado > 0" class="mt-1 text-xs text-slate-500">
              Este lote tem {{ ativosNoLoteEditado }} animal(is) ativo(s); a capacidade não pode ser menor que isso.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Data de criação
            </label>

            <input
              v-model="dataCriacao"
              type="date"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>

        </div>

        <div class="mt-5 flex gap-2">
          <button
            type="submit"
            :disabled="salvando"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {{ salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar lote' }}
          </button>

          <button
            v-if="editandoId"
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

      <h3 class="mb-3 text-lg font-semibold text-slate-900">
        Lotes cadastrados
      </h3>

      <p v-if="loading" class="text-slate-500">
        Carregando...
      </p>

      <div
        v-else-if="lotes.length > 0"
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-2 font-medium">Número</th>
              <th class="px-4 py-2 font-medium">Finalidade</th>
              <th class="px-4 py-2 font-medium">Ocupação</th>
              <th class="px-4 py-2 font-medium">Data de criação</th>
              <th class="px-4 py-2 font-medium">Propriedade</th>
              <th v-if="auth.isAdmin" class="px-4 py-2 font-medium">Produtor</th>
              <th class="px-4 py-2 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="lote in lotes" :key="lote.id">
              <td class="px-4 py-2 font-medium text-slate-900">
                {{ lote.numero }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ FINALIDADE_LOTE_LABEL[lote.finalidade] }}
              </td>

              <td
                class="px-4 py-2"
                :class="(ativosPorLote.get(lote.id) ?? 0) >= lote.capacidade ? 'font-medium text-amber-700' : 'text-slate-700'"
              >
                {{ ativosPorLote.get(lote.id) ?? 0 }}/{{ lote.capacidade }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ formatarData(lote.dataCriacao) }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ propriedadePorId.get(lote.propriedadeId)?.nome ?? `Propriedade #${lote.propriedadeId}` }}
              </td>

              <td v-if="auth.isAdmin" class="px-4 py-2 text-slate-700">
                {{ nomeProdutor(propriedadePorId.get(lote.propriedadeId)?.usuarioId ?? null) }}
              </td>

              <td class="px-4 py-2">
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="editarLote(lote)"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    @click="excluirLote(lote)"
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
        Nenhum lote encontrado.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { animalService } from '@/services/animalService'
import { loteService } from '@/services/loteService'
import { propriedadeService } from '@/services/propriedadeService'
import { usuarioService } from '@/services/usuarioService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import type { Animal } from '@/types/animal'
import { FINALIDADE_LOTE_LABEL, type FinalidadeLote, type Lote } from '@/types/lote'
import type { Propriedade } from '@/types/propriedade'
import type { Usuario } from '@/types/usuario'

const auth = useAuthStore()

const lotes = ref<Lote[]>([])
const animais = ref<Animal[]>([])
const propriedades = ref<Propriedade[]>([])
const usuarios = ref<Usuario[]>([])
const loading = ref(true)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')

const editandoId = ref<number | null>(null)

const numero = ref<number | null>(null)
const finalidade = ref<FinalidadeLote>('CORTE')
const capacidade = ref<number | null>(null)
const dataCriacao = ref('')
const propriedadeId = ref<number | null>(null)

const propriedadePorId = computed(
  () => new Map(propriedades.value.map((propriedade) => [propriedade.id, propriedade])),
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

const ativosNoLoteEditado = computed(() =>
  editandoId.value === null ? 0 : ativosPorLote.value.get(editandoId.value) ?? 0,
)

const capacidadeMinima = computed(() => Math.max(1, ativosNoLoteEditado.value))

function nomeProdutor(id: number | null): string {
  if (id === null) {
    return '-'
  }

  return usuarios.value.find((usuario) => usuario.id === id)?.nome ?? `Usuário #${id}`
}

function descricaoPropriedade(propriedade: Propriedade): string {
  if (auth.isAdmin) {
    return `${propriedade.nome} - ${nomeProdutor(propriedade.usuarioId)}`
  }

  return `${propriedade.nome} (${propriedade.localizacao})`
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

async function carregarLotes() {
  lotes.value = await loteService.listAll()
}

function limparFormulario() {
  numero.value = null
  finalidade.value = 'CORTE'
  capacidade.value = null
  dataCriacao.value = ''
  propriedadeId.value = null
  editandoId.value = null
}

async function salvarLote() {
  erro.value = ''
  sucesso.value = ''

  if (
    numero.value === null ||
    capacidade.value === null ||
    propriedadeId.value === null ||
    !dataCriacao.value
  ) {
    erro.value = 'Preencha todos os campos do lote.'
    return
  }

  salvando.value = true

  try {
    const payload = {
      numero: numero.value,
      finalidade: finalidade.value,
      capacidade: capacidade.value,
      dataCriacao: dataCriacao.value,
      propriedadeId: propriedadeId.value,
    }

    if (editandoId.value !== null) {
      await loteService.update(editandoId.value, payload)
      sucesso.value = 'Lote atualizado com sucesso.'
    } else {
      await loteService.create(payload)
      sucesso.value = 'Lote cadastrado com sucesso.'
    }

    await carregarLotes()
    limparFormulario()
  } catch (err) {
    console.error('Falha ao salvar lote', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível salvar o lote.')
  } finally {
    salvando.value = false
  }
}

function editarLote(lote: Lote) {
  editandoId.value = lote.id
  numero.value = lote.numero
  finalidade.value = lote.finalidade
  capacidade.value = lote.capacidade
  dataCriacao.value = lote.dataCriacao
  propriedadeId.value = lote.propriedadeId
  erro.value = ''
  sucesso.value = ''

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
  erro.value = ''
  sucesso.value = ''
}

async function excluirLote(lote: Lote) {
  if (!confirm(`Tem certeza que deseja excluir o lote ${lote.numero}?`)) {
    return
  }

  erro.value = ''
  sucesso.value = ''

  try {
    await loteService.remove(lote.id)

    if (editandoId.value === lote.id) {
      limparFormulario()
    }

    await carregarLotes()
    sucesso.value = 'Lote excluído com sucesso.'
  } catch (err) {
    console.error('Falha ao excluir lote', err)
    erro.value = getApiErrorMessage(
      err,
      'Não foi possível excluir o lote. Verifique se existem animais ativos nesse lote.',
    )
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      carregarLotes(),
      animalService.listAll().then((dados) => {
        animais.value = dados
      }),
      propriedadeService.listAll().then((dados) => {
        propriedades.value = dados
      }),
      auth.isAdmin
        ? usuarioService.listAll().then((dados) => {
            usuarios.value = dados
          })
        : Promise.resolve(),
    ])
  } catch (err) {
    console.error('Falha ao carregar lotes', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível carregar os lotes.')
  } finally {
    loading.value = false
  }
})
</script>
