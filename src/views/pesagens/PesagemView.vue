<template>
  <PageLayout
    titulo="Pesagens"
    subtitulo="Manejo"
  >
      <form
        @submit.prevent="salvarPesagem"
        class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          Registrar pesagem
        </h3>

        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Animal
            </label>

            <select
              v-model.number="brinco"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
              :disabled="animais.length === 0"
            >
              <option :value="null" disabled>
                Selecione um animal
              </option>

              <option
                v-for="animal in animais"
                :key="animal.id"
                :value="animal.brinco"
              >
                Brinco {{ animal.brinco }}
              </option>
            </select>

            <p
              v-if="!loadingAnimais && animais.length === 0"
              class="mt-1 text-sm text-slate-500"
            >
              Nenhum animal disponível. Cadastre um animal primeiro.
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
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              Data da pesagem
            </label>

            <input
              v-model="dataPesagem"
              type="date"
              :max="dataHoje"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>
        </div>

        <div class="mt-5">
          <button
            type="submit"
            :disabled="loadingAnimais || animais.length === 0"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Registrar pesagem
          </button>
        </div>

        <p v-if="erro" class="mt-3 text-sm text-red-600">
          {{ erro }}
        </p>

        <p v-if="sucesso" class="mt-3 text-sm text-green-700">
          {{ sucesso }}
        </p>

        <p v-if="aviso" class="mt-3 text-sm text-amber-700">
          {{ aviso }}
        </p>
      </form>

      <section class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          Histórico de pesagens
        </h3>

        <div class="mb-4 max-w-md">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Consultar animal
          </label>

          <select
            v-model.number="brinco"
            @change="carregarHistorico"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
            :disabled="animais.length === 0"
          >
            <option :value="null">
              Selecione um animal para consultar
            </option>

            <option
              v-for="animal in animais"
              :key="animal.id"
              :value="animal.brinco"
            >
              Brinco {{ animal.brinco }}
            </option>
          </select>
        </div>

        <p v-if="loadingHistorico" class="text-slate-500">
          Carregando histórico...
        </p>

        <p v-else-if="!brinco" class="text-slate-500">
          Selecione um animal para visualizar suas pesagens.
        </p>

        <div
          v-else-if="pesagens.length > 0"
          class="overflow-x-auto rounded-lg ring-1 ring-slate-200"
        >
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Data</th>
                <th class="px-4 py-3 font-medium">Brinco</th>
                <th class="px-4 py-3 font-medium">Peso</th>
                <th class="px-4 py-3 font-medium">GMD</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="pesagem in pesagens"
                :key="pesagem.id"
              >
                <td class="px-4 py-3 text-slate-700">
                  {{ formatarData(pesagem.dataPesagem) }}
                </td>

                <td class="px-4 py-3 text-slate-700">
                  {{ pesagem.brinco }}
                </td>

                <td class="px-4 py-3 text-slate-700">
                  {{ formatarNumero(pesagem.peso) }} kg
                </td>

                <td class="px-4 py-3 text-slate-700">
                  <span v-if="pesagem.gmdCalculado != null">
                    {{ formatarNumero(pesagem.gmdCalculado) }} kg/dia
                  </span>

                  <span v-else>
                    -
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="text-slate-500">
          Nenhuma pesagem encontrada para este animal.
        </p>
      </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { animalService } from '@/services/animalService'
import { http } from '@/services/http'
import type { Animal } from '@/types/animal'

interface Pesagem {
  id: number
  brinco: number
  peso: number
  dataPesagem: string
  gmdCalculado: number | null
  aviso: string | null
}

function obterDataHoje() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

const animais = ref<Animal[]>([])
const pesagens = ref<Pesagem[]>([])

const loadingAnimais = ref(true)
const loadingHistorico = ref(false)

const erro = ref('')
const sucesso = ref('')
const aviso = ref('')

const brinco = ref<number | null>(null)
const pesoAtual = ref<number | null>(null)
const dataPesagem = ref(obterDataHoje())
const dataHoje = obterDataHoje()

async function carregarAnimais() {
  const response = await animalService.listAll()
  animais.value = response
}

async function carregarHistorico() {
  pesagens.value = []
  erro.value = ''

  if (brinco.value == null) {
    return
  }

  loadingHistorico.value = true

  try {
    const response = await http.get<Pesagem[]>(
      `/pesagens/animal/${brinco.value}`
    )

    pesagens.value = response
  } catch (err) {
    console.error('Falha ao carregar histórico de pesagens', err)
    erro.value = 'Não foi possível carregar o histórico de pesagens.'
  } finally {
    loadingHistorico.value = false
  }
}

async function salvarPesagem() {
  erro.value = ''
  sucesso.value = ''
  aviso.value = ''

  if (brinco.value == null || pesoAtual.value == null || !dataPesagem.value) {
    erro.value = 'Preencha todos os campos da pesagem.'
    return
  }

  try {
    const dados = {
      brinco: brinco.value,
      pesoAtual: pesoAtual.value,
      dataPesagem: dataPesagem.value,
    }

    const resultado = await http.post<Pesagem>('/pesagens', dados)

    sucesso.value = 'Pesagem registrada com sucesso.'
    aviso.value = resultado.aviso || ''

    pesoAtual.value = null
    dataPesagem.value = obterDataHoje()

    await carregarHistorico()
  } catch (err) {
    console.error('Falha ao registrar pesagem', err)
    erro.value = 'Não foi possível registrar a pesagem. Verifique os dados e tente novamente.'
  }
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarNumero(valor: number) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

onMounted(async () => {
  try {
    await carregarAnimais()
  } catch (err) {
    console.error('Falha ao carregar animais', err)
    erro.value = 'Não foi possível carregar os animais.'
  } finally {
    loadingAnimais.value = false
  }
})
</script>