<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900">PecuCore</h1>
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
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Finalidade
            </label>

            <select
              v-model="finalidade"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="CORTE">Corte</option>
              <option value="RECRIA">Recria</option>
              <option value="ENGORDA">Engorda</option>
              <option value="REPRODUCAO">Reprodução</option>
              <option value="QUARENTENA">Quarentena</option>
              <option value="DESMAME">Desmame</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Capacidade
            </label>

            <input
              v-model.number="capacidade"
              type="number"
              min="1"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
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

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              ID da propriedade
            </label>

            <input
              v-model.number="propriedadeId"
              type="number"
              min="1"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>

        </div>

        <div class="mt-5 flex gap-2">
          <button
            type="submit"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            {{ editandoId ? 'Salvar alterações' : 'Cadastrar lote' }}
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
      </form>

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
              <th class="px-4 py-2 font-medium">Capacidade</th>
              <th class="px-4 py-2 font-medium">Data de criação</th>
              <th class="px-4 py-2 font-medium">Propriedade</th>
              <th class="px-4 py-2 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="lote in lotes" :key="lote.id">
              <td class="px-4 py-2 text-slate-700">
                {{ lote.numero }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ lote.finalidade }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ lote.capacidade }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ lote.dataCriacao }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ lote.propriedadeId }}
              </td>

              <td class="px-4 py-2">
                <div class="flex gap-2">
                  <button
                    @click="editarLote(lote)"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </button>

                  <button
                    @click="excluirLote(lote.id)"
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
import { onMounted, ref } from 'vue'
import { loteService } from '@/services/loteService'
import type { FinalidadeLote, Lote } from '@/types/lote'

const lotes = ref<Lote[]>([])
const loading = ref(true)
const erro = ref('')

const editandoId = ref<number | null>(null)

const numero = ref<number | null>(null)
const finalidade = ref<FinalidadeLote>('CORTE')
const capacidade = ref<number | null>(null)
const dataCriacao = ref('')
const propriedadeId = ref<number | null>(null)

async function carregarLotes() {
  const response = await loteService.listAll()
  lotes.value = response.data
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

  try {
    const dados = {
      numero: numero.value!,
      finalidade: finalidade.value,
      capacidade: capacidade.value!,
      dataCriacao: dataCriacao.value,
      propriedadeId: propriedadeId.value!,
    }

    if (editandoId.value) {
      await loteService.update(editandoId.value, dados)
    } else {
      await loteService.create(dados)
    }

    await carregarLotes()
    limparFormulario()
  } catch (err) {
    console.error('Falha ao salvar lote', err)
    erro.value = 'Não foi possível salvar o lote.'
  }
}

function editarLote(lote: Lote) {
  editandoId.value = lote.id
  numero.value = lote.numero
  finalidade.value = lote.finalidade
  capacidade.value = lote.capacidade
  dataCriacao.value = lote.dataCriacao
  propriedadeId.value = lote.propriedadeId

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
  erro.value = ''
}

async function excluirLote(id: number) {
  if (!confirm('Tem certeza que deseja excluir este lote?')) {
    return
  }

  erro.value = ''

  try {
    await loteService.delete(id)
    await carregarLotes()
  } catch (err) {
    console.error('Falha ao excluir lote', err)
    erro.value = 'Não foi possível excluir o lote. Verifique se existem animais ativos nesse lote.'
  }
}

onMounted(async () => {
  try {
    await carregarLotes()
  } catch (err) {
    console.error('Falha ao carregar lotes', err)
    erro.value = 'Não foi possível carregar os lotes.'
  } finally {
    loading.value = false
  }
})
</script>



