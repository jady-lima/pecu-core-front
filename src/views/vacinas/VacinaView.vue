<template>
  <PageLayout
    titulo="Catálogo de vacinas"
    subtitulo="Catálogos"
  >
      <form
        @submit.prevent="salvarVacina"
        class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          {{ editandoId ? 'Editar vacina' : 'Cadastrar vacina' }}
        </h3>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Nome
            </label>

            <input
              v-model="nome"
              type="text"
              maxlength="100"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />

            <p class="mt-1 text-xs text-slate-500">
              Salvo em letras maiúsculas. Não pode repetir o nome de outra vacina.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Fabricante
            </label>

            <input
              v-model="fabricante"
              type="text"
              maxlength="100"
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
              Dias após a aplicação em que o animal não pode ser vendido nem abatido. Use 0 se não houver.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Intervalo entre doses (dias)
              <span class="font-normal text-slate-400">- opcional</span>
            </label>

            <input
              v-model.number="intervaloDoseDias"
              type="number"
              min="1"
              step="1"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
            />

            <p class="mt-1 text-xs text-slate-500">
              Usado para calcular a próxima dose. Deixe em branco para dose única.
            </p>
          </div>
        </div>

        <p v-if="editandoId" class="mt-4 text-xs text-amber-700">
          Alterar carência ou intervalo vale apenas para as próximas vacinações; registros já feitos mantêm as datas calculadas.
        </p>

        <div class="mt-5 flex gap-2">
          <button
            type="submit"
            :disabled="salvando"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {{ salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar vacina' }}
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

      <section>
      <div class="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 class="text-lg font-semibold text-slate-900">
          Vacinas cadastradas
        </h3>

        <input
          v-model="busca"
          type="search"
          placeholder="Buscar por nome ou fabricante"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm md:w-72"
        />
      </div>

      <p v-if="loading" class="text-slate-500">
        Carregando...
      </p>

      <div
        v-else-if="vacinasFiltradas.length > 0"
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Nome</th>
              <th class="px-4 py-3 font-medium">Fabricante</th>
              <th class="px-4 py-3 font-medium">Carência</th>
              <th class="px-4 py-3 font-medium">Intervalo entre doses</th>
              <th class="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="vacina in vacinasFiltradas" :key="vacina.id">
              <td class="px-4 py-3 font-medium text-slate-900">
                {{ vacina.nome }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ vacina.fabricante }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ vacina.carenciaDias === 0 ? 'Sem carência' : `${vacina.carenciaDias} dia(s)` }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ vacina.intervaloDoseDias ? `${vacina.intervaloDoseDias} dia(s)` : 'Dose única' }}
              </td>

              <td class="px-4 py-3">
                <button
                  type="button"
                  @click="editarVacina(vacina)"
                  class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                >
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else-if="busca" class="text-slate-500">
        Nenhuma vacina encontrada para "{{ busca }}".
      </p>

      <p v-else class="text-slate-500">
        Nenhuma vacina cadastrada.
      </p>
      </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { vacinaService } from '@/services/vacinaService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import type { Vacina } from '@/types/vacina'

const vacinas = ref<Vacina[]>([])
const loading = ref(true)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')
const busca = ref('')

const editandoId = ref<number | null>(null)
const nome = ref('')
const fabricante = ref('')
const carenciaDias = ref<number | null>(null)
const intervaloDoseDias = ref<number | '' | null>(null)

const vacinasFiltradas = computed(() => {
  const termo = busca.value.trim().toLowerCase()

  const ordenadas = [...vacinas.value].sort((a, b) => a.nome.localeCompare(b.nome))

  if (!termo) {
    return ordenadas
  }

  return ordenadas.filter(
    (vacina) =>
      vacina.nome.toLowerCase().includes(termo) ||
      vacina.fabricante.toLowerCase().includes(termo),
  )
})

async function carregarVacinas() {
  vacinas.value = await vacinaService.listAll()
}

function limparFormulario() {
  nome.value = ''
  fabricante.value = ''
  carenciaDias.value = null
  intervaloDoseDias.value = null
  editandoId.value = null
}

async function salvarVacina() {
  erro.value = ''
  sucesso.value = ''

  if (!nome.value.trim() || !fabricante.value.trim() || carenciaDias.value === null) {
    erro.value = 'Preencha nome, fabricante e carência.'
    return
  }

  salvando.value = true

  try {
    const payload = {
      nome: nome.value.trim(),
      fabricante: fabricante.value.trim(),
      carenciaDias: carenciaDias.value,
      intervaloDoseDias:
        typeof intervaloDoseDias.value === 'number' ? intervaloDoseDias.value : null,
    }

    if (editandoId.value !== null) {
      await vacinaService.update(editandoId.value, payload)
      sucesso.value = 'Vacina atualizada com sucesso.'
    } else {
      await vacinaService.create(payload)
      sucesso.value = 'Vacina cadastrada com sucesso.'
    }

    await carregarVacinas()
    limparFormulario()
  } catch (err) {
    console.error('Falha ao salvar vacina', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível salvar a vacina.')
  } finally {
    salvando.value = false
  }
}

function editarVacina(vacina: Vacina) {
  editandoId.value = vacina.id
  nome.value = vacina.nome
  fabricante.value = vacina.fabricante
  carenciaDias.value = vacina.carenciaDias
  intervaloDoseDias.value = vacina.intervaloDoseDias
  erro.value = ''
  sucesso.value = ''

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
  erro.value = ''
  sucesso.value = ''
}

onMounted(async () => {
  try {
    await carregarVacinas()
  } catch (err) {
    console.error('Falha ao carregar vacinas', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível carregar as vacinas.')
  } finally {
    loading.value = false
  }
})
</script>
