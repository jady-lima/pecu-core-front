<template>
  <PageLayout
    titulo="Metas de desempenho"
    subtitulo="Catálogos"
  >
      <p
        v-if="!loading && fasesSemMeta > 0"
        class="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200"
      >
        {{ fasesSemMeta }} finalidade(s) sem meta. Animais em lotes dessas finalidades não podem ser comparados no Desempenho.
      </p>

      <p v-if="erro" class="text-sm text-red-600">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="text-sm text-green-700">
        {{ sucesso }}
      </p>

      <section>
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
              <th class="px-4 py-3 font-medium">Finalidade</th>
              <th class="px-4 py-3 font-medium">GMD esperado</th>
              <th class="px-4 py-3 font-medium">Situação</th>
              <th class="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="fase in FASES"
              :key="fase"
              :class="editandoFase === fase ? 'bg-amber-50' : ''"
            >
              <td class="px-4 py-3 font-medium text-slate-900">
                {{ FINALIDADE_LOTE_LABEL[fase] }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                <span v-if="metaPorFase.get(fase) && editandoFase !== fase">
                  {{ formatarNumero(metaPorFase.get(fase)!.gmdEsperado, 3) }} kg/dia
                </span>

                <form
                  v-else
                  class="flex items-center gap-2"
                  @submit.prevent="salvarMeta(fase)"
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
                    {{ salvandoFase === fase ? 'Salvando...' : editandoFase === fase ? 'Salvar' : 'Cadastrar' }}
                  </button>

                  <button
                    v-if="editandoFase === fase"
                    type="button"
                    @click="cancelarEdicao"
                    class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancelar
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

              <td class="px-4 py-3">
                <div v-if="metaPorFase.get(fase) && editandoFase !== fase" class="flex gap-2">
                  <button
                    type="button"
                    @click="editarMeta(fase)"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    @click="excluirMeta(fase)"
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

      <p class="mt-3 text-xs text-slate-500">
        Alterar a meta padrão afeta todos os lotes da finalidade que não têm meta própria definida.
      </p>
      </section>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { metaDesempenhoService } from '@/services/metaDesempenhoService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { formatarNumero } from '@/utils/formatters'
import { FINALIDADE_LOTE_LABEL, type FinalidadeLote } from '@/types/lote'
import type { MetaDesempenho } from '@/types/metaDesempenho'

const FASES = Object.keys(FINALIDADE_LOTE_LABEL) as FinalidadeLote[]

const metas = ref<MetaDesempenho[]>([])
const valores = reactive<Partial<Record<FinalidadeLote, number | ''>>>({})
const loading = ref(true)
const salvandoFase = ref<FinalidadeLote | null>(null)
const editandoFase = ref<FinalidadeLote | null>(null)
const erro = ref('')
const sucesso = ref('')

const metaPorFase = computed(() => new Map(metas.value.map((meta) => [meta.fase, meta])))

const fasesSemMeta = computed(() => FASES.filter((fase) => !metaPorFase.value.has(fase)).length)

async function carregarMetas() {
  metas.value = await metaDesempenhoService.listAll()
}

async function salvarMeta(fase: FinalidadeLote) {
  erro.value = ''
  sucesso.value = ''

  const gmdEsperado = valores[fase]

  if (typeof gmdEsperado !== 'number' || gmdEsperado <= 0) {
    erro.value = `Informe um GMD maior que zero para ${FINALIDADE_LOTE_LABEL[fase]}.`
    return
  }

  const metaExistente = metaPorFase.value.get(fase)

  salvandoFase.value = fase

  try {
    if (metaExistente) {
      await metaDesempenhoService.update(metaExistente.id, { fase, gmdEsperado })
      sucesso.value = `Meta de ${FINALIDADE_LOTE_LABEL[fase]} atualizada com sucesso.`
    } else {
      await metaDesempenhoService.create({ fase, gmdEsperado })
      sucesso.value = `Meta de ${FINALIDADE_LOTE_LABEL[fase]} cadastrada com sucesso.`
    }

    await carregarMetas()
    delete valores[fase]
    editandoFase.value = null
  } catch (err) {
    console.error('Falha ao salvar meta de desempenho', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível salvar a meta.')
  } finally {
    salvandoFase.value = null
  }
}

function editarMeta(fase: FinalidadeLote) {
  if (editandoFase.value !== null) {
    delete valores[editandoFase.value]
  }

  editandoFase.value = fase
  valores[fase] = metaPorFase.value.get(fase)?.gmdEsperado ?? ''
  erro.value = ''
  sucesso.value = ''
}

function cancelarEdicao() {
  if (editandoFase.value !== null) {
    delete valores[editandoFase.value]
  }

  editandoFase.value = null
  erro.value = ''
}

async function excluirMeta(fase: FinalidadeLote) {
  const meta = metaPorFase.value.get(fase)

  if (!meta) {
    return
  }

  if (!confirm(`Excluir a meta padrão de ${FINALIDADE_LOTE_LABEL[fase]}? Lotes dessa finalidade sem meta própria deixam de ser comparados no Desempenho.`)) {
    return
  }

  erro.value = ''
  sucesso.value = ''

  try {
    await metaDesempenhoService.remove(meta.id)
    await carregarMetas()
    sucesso.value = `Meta de ${FINALIDADE_LOTE_LABEL[fase]} excluída com sucesso.`
  } catch (err) {
    console.error('Falha ao excluir meta de desempenho', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível excluir a meta.')
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
