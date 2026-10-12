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
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-slate-900">
          Metas de desempenho
        </h2>

        <p class="mt-1 max-w-3xl text-sm text-slate-500">
          GMD (ganho médio diário) esperado para cada finalidade de lote, em kg/dia. Essas metas valem como padrão para todas as propriedades e são usadas na comparação de desempenho dos animais.
        </p>
      </div>

      <p
        v-if="!loading && fasesSemMeta > 0"
        class="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
      >
        {{ fasesSemMeta }} finalidade(s) sem meta. Animais em lotes dessas finalidades não podem ser comparados no Desempenho.
      </p>

      <p v-if="erro" class="mb-4 text-sm text-red-600">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="mb-4 text-sm text-green-700">
        {{ sucesso }}
      </p>

      <p v-if="loading" class="text-slate-500">
        Carregando...
      </p>

      <div
        v-else
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-2 font-medium">Finalidade</th>
              <th class="px-4 py-2 font-medium">GMD esperado</th>
              <th class="px-4 py-2 font-medium">Situação</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="fase in FASES" :key="fase">
              <td class="px-4 py-3 font-medium text-slate-900">
                {{ FINALIDADE_LOTE_LABEL[fase] }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                <span v-if="metaPorFase.get(fase)">
                  {{ formatarGmd(metaPorFase.get(fase)!.gmdEsperado) }} kg/dia
                </span>

                <form
                  v-else
                  class="flex items-center gap-2"
                  @submit.prevent="cadastrarMeta(fase)"
                >
                  <input
                    v-model.number="valores[fase]"
                    type="number"
                    min="0.001"
                    step="0.001"
                    placeholder="Ex.: 0,8"
                    class="w-32 rounded-md border border-slate-300 px-3 py-1.5"
                    required
                  />

                  <span class="text-slate-500">kg/dia</span>

                  <button
                    type="submit"
                    :disabled="salvandoFase !== null"
                    class="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
                  >
                    {{ salvandoFase === fase ? 'Salvando...' : 'Cadastrar' }}
                  </button>
                </form>
              </td>

              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="metaPorFase.get(fase) ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ metaPorFase.get(fase) ? 'Definida' : 'Sem meta' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="mt-3 text-xs text-slate-500">
        Uma meta cadastrada ainda não pode ser alterada.
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { metaDesempenhoService } from '@/services/metaDesempenhoService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { FINALIDADE_LOTE_LABEL, type FinalidadeLote } from '@/types/lote'
import type { MetaDesempenho } from '@/types/metaDesempenho'

const FASES = Object.keys(FINALIDADE_LOTE_LABEL) as FinalidadeLote[]

const metas = ref<MetaDesempenho[]>([])
const valores = reactive<Partial<Record<FinalidadeLote, number | ''>>>({})
const loading = ref(true)
const salvandoFase = ref<FinalidadeLote | null>(null)
const erro = ref('')
const sucesso = ref('')

const metaPorFase = computed(() => new Map(metas.value.map((meta) => [meta.fase, meta])))

const fasesSemMeta = computed(() => FASES.filter((fase) => !metaPorFase.value.has(fase)).length)

function formatarGmd(valor: number) {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

async function carregarMetas() {
  metas.value = await metaDesempenhoService.listAll()
}

async function cadastrarMeta(fase: FinalidadeLote) {
  erro.value = ''
  sucesso.value = ''

  const gmdEsperado = valores[fase]

  if (typeof gmdEsperado !== 'number' || gmdEsperado <= 0) {
    erro.value = `Informe um GMD maior que zero para ${FINALIDADE_LOTE_LABEL[fase]}.`
    return
  }

  salvandoFase.value = fase

  try {
    await metaDesempenhoService.create({ fase, gmdEsperado })
    await carregarMetas()
    delete valores[fase]
    sucesso.value = `Meta de ${FINALIDADE_LOTE_LABEL[fase]} cadastrada com sucesso.`
  } catch (err) {
    console.error('Falha ao cadastrar meta de desempenho', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível cadastrar a meta.')
  } finally {
    salvandoFase.value = null
  }
}

onMounted(async () => {
  try {
    await carregarMetas()
  } catch (err) {
    console.error('Falha ao carregar metas de desempenho', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível carregar as metas.')
  } finally {
    loading.value = false
  }
})
</script>
