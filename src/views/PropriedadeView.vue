<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900">PecuCore</h1>

      <RouterLink
        to="/"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Voltar para Home
      </RouterLink>
    </header>

    <main class="p-6">
      <h2 class="mb-4 text-xl font-semibold text-slate-900">
        Propriedades
      </h2>

      <form
        @submit.prevent="salvarPropriedade"
        class="mb-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          {{ editandoId ? 'Editar propriedade' : 'Cadastrar propriedade' }}
        </h3>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Nome da propriedade
            </label>

            <input
              v-model.trim="nome"
              type="text"
              maxlength="255"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Localização
            </label>

            <input
              v-model.trim="localizacao"
              type="text"
              maxlength="255"
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
            {{ editandoId ? 'Salvar alterações' : 'Cadastrar propriedade' }}
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
        Propriedades cadastradas
      </h3>

      <p v-if="loading" class="text-slate-500">
        Carregando...
      </p>

      <div
        v-else-if="propriedades.length > 0"
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Nome</th>
              <th class="px-4 py-3 font-medium">Localização</th>
              <th class="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="propriedade in propriedades" :key="propriedade.id">
              <td class="px-4 py-3 text-slate-700">
                {{ propriedade.nome }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ propriedade.localizacao }}
              </td>

              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="editarPropriedade(propriedade)"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    @click="excluirPropriedade(propriedade.id)"
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
        Nenhuma propriedade encontrada.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { http } from '@/services/http'

interface Propriedade {
  id: number
  nome: string
  localizacao: string
  usuarioId: number
}

const propriedades = ref<Propriedade[]>([])
const loading = ref(true)
const erro = ref('')
const sucesso = ref('')

const editandoId = ref<number | null>(null)
const nome = ref('')
const localizacao = ref('')

async function carregarPropriedades() {
  const response = await http.get<Propriedade[]>('/propriedades')
  propriedades.value = response
}

function limparFormulario() {
  nome.value = ''
  localizacao.value = ''
  editandoId.value = null
}

async function salvarPropriedade() {
  erro.value = ''
  sucesso.value = ''

  try {
    const dados = {
      nome: nome.value,
      localizacao: localizacao.value,
    }

    if (editandoId.value !== null) {
      await http.put<Propriedade>(
        `/propriedades/${editandoId.value}`,
        dados
      )

      sucesso.value = 'Propriedade atualizada com sucesso.'
    } else {
      await http.post<Propriedade>('/propriedades', dados)

      sucesso.value = 'Propriedade cadastrada com sucesso.'
    }

    await carregarPropriedades()
    limparFormulario()
  } catch (err) {
    console.error('Falha ao salvar propriedade', err)
    erro.value = 'Não foi possível salvar a propriedade. Verifique os dados e tente novamente.'
  }
}

function editarPropriedade(propriedade: Propriedade) {
  editandoId.value = propriedade.id
  nome.value = propriedade.nome
  localizacao.value = propriedade.localizacao
  erro.value = ''
  sucesso.value = ''

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
  erro.value = ''
  sucesso.value = ''
}

async function excluirPropriedade(id: number) {
  if (!confirm('Tem certeza que deseja excluir esta propriedade?')) {
    return
  }

  erro.value = ''
  sucesso.value = ''

  try {
    await http.delete<void>(`/propriedades/${id}`)

    if (editandoId.value === id) {
      limparFormulario()
    }

    await carregarPropriedades()
    sucesso.value = 'Propriedade excluída com sucesso.'
  } catch (err) {
    console.error('Falha ao excluir propriedade', err)
    erro.value = 'Não foi possível excluir a propriedade. Verifique se existem lotes ou outros registros associados.'
  }
}

onMounted(async () => {
  try {
    await carregarPropriedades()
  } catch (err) {
    console.error('Falha ao carregar propriedades', err)
    erro.value = 'Não foi possível carregar as propriedades.'
  } finally {
    loading.value = false
  }
})
</script>