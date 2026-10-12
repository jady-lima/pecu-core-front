<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900">PecuCore</h1>
    </header>

    <main class="p-6">
      <h2 class="mb-4 text-xl font-semibold text-slate-900">
        Animais
      </h2>

      <form
        @submit.prevent="salvarAnimal"
        class="mb-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          {{ editandoId ? 'Editar animal' : 'Cadastrar animal' }}
        </h3>

        <div class="grid gap-4 md:grid-cols-2">

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
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Sexo
            </label>

            <select
              v-model="sexo"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="Macho">Macho</option>
              <option value="Femea">Fêmea</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Data de nascimento
            </label>

            <input
              v-model="dataNascimento"
              type="date"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
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
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Lote
            </label>

            <select
              v-model.number="loteId"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
              :disabled="lotes.length === 0"
            >
              <option disabled value="">
                Selecione um lote
              </option>

              <option
                v-for="lote in lotes"
                :key="lote.id"
                :value="lote.id"
              >
                Lote {{ lote.numero }} - Propriedade {{ lote.propriedadeId }}
              </option>
            </select>

            <p v-if="lotes.length === 0" class="mt-1 text-sm text-slate-500">
              Nenhum lote disponível. Cadastre um lote antes de cadastrar um animal.
            </p>
          </div>

        </div>

        <div class="mt-5 flex gap-2">
          <button
            type="submit"
            :disabled="lotes.length === 0"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ editandoId ? 'Salvar alterações' : 'Cadastrar animal' }}
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
        v-else-if="animais.length > 0"
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-2 font-medium">Brinco</th>
              <th class="px-4 py-2 font-medium">Sexo</th>
              <th class="px-4 py-2 font-medium">Nascimento</th>
              <th class="px-4 py-2 font-medium">Peso atual</th>
              <th class="px-4 py-2 font-medium">Lote</th>
              <th class="px-4 py-2 font-medium">Status</th>
              <th class="px-4 py-2 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="animal in animais" :key="animal.id">
              <td class="px-4 py-2 text-slate-700">
                {{ animal.brinco }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ animal.sexo }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ animal.dataNascimento }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ animal.pesoAtual }} kg
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ nomeLote(animal.loteId) }}
              </td>

              <td class="px-4 py-2 text-slate-700">
                {{ animal.status }}
              </td>

              <td class="px-4 py-2">
                <div class="flex gap-2">
                  <button
                    @click="editarAnimal(animal)"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </button>

                  <button
                    @click="excluirAnimal(animal.id)"
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
        Nenhum animal encontrado.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { animalService } from '@/services/animalService'
import { http } from '@/services/http'
import type { Animal, SexoAnimal } from '@/types/animal'

interface LoteOpcao {
  id: number
  numero: number
  propriedadeId: number
}

const animais = ref<Animal[]>([])
const lotes = ref<LoteOpcao[]>([])
const loading = ref(true)
const erro = ref('')

const editandoId = ref<number | null>(null)

const brinco = ref<number | null>(null)
const dataNascimento = ref('')
const pesoAtual = ref<number | null>(null)
const sexo = ref<SexoAnimal>('Macho')
const loteId = ref<number | null>(null)

async function carregarAnimais() {
  const response = await animalService.listAll()
  animais.value = response
}

async function carregarLotes() {
  const response = await http.get<LoteOpcao[]>('/lotes')
  lotes.value = response
}

function nomeLote(id: number): string {
  const lote = lotes.value.find((lote) => lote.id === id)

  if (!lote) {
    return 'Lote não encontrado'
  }

  return `Lote ${lote.numero} - Propriedade ${lote.propriedadeId}`
}

function limparFormulario() {
  brinco.value = null
  dataNascimento.value = ''
  pesoAtual.value = null
  sexo.value = 'Macho'
  loteId.value = null
  editandoId.value = null
}

async function salvarAnimal() {
  erro.value = ''

  try {
    const dados = {
      brinco: brinco.value!,
      dataNascimento: dataNascimento.value,
      pesoAtual: pesoAtual.value!,
      sexo: sexo.value,
      loteId: loteId.value!,
    }

    if (editandoId.value) {
      await animalService.update(editandoId.value, dados)
    } else {
      await animalService.create(dados)
    }

    await carregarAnimais()
    limparFormulario()
  } catch (err) {
    console.error('Falha ao salvar animal', err)
    erro.value = 'Não foi possível salvar o animal. Verifique o brinco e o lote selecionado.'
  }
}

function editarAnimal(animal: Animal) {
  editandoId.value = animal.id
  brinco.value = animal.brinco
  dataNascimento.value = animal.dataNascimento
  pesoAtual.value = animal.pesoAtual
  sexo.value = animal.sexo
  loteId.value = animal.loteId

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicao() {
  limparFormulario()
  erro.value = ''
}

async function excluirAnimal(id: number) {
  if (!confirm('Tem certeza que deseja excluir este animal?')) {
    return
  }

  erro.value = ''

  try {
    await animalService.delete(id)
    await carregarAnimais()
  } catch (err) {
    console.error('Falha ao excluir animal', err)
    erro.value = 'Não foi possível excluir o animal.'
  }
}

onMounted(async () => {
  try {
    await carregarAnimais()
  } catch (err) {
    console.error('Falha ao carregar animais', err)
    erro.value = 'Não foi possível carregar os animais.'
  }

  try {
    await carregarLotes()
  } catch (err) {
    console.error('Falha ao carregar lotes', err)

    if (!erro.value) {
      erro.value = 'Não foi possível carregar os lotes disponíveis.'
    }
  }

  loading.value = false
})
</script>