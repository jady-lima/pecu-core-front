<template>
  <PageLayout
    :titulo="propriedade ? `Veterinários - ${propriedade.nome}` : 'Veterinários'"
    subtitulo="Cadastros"
    :voltar-para="{ name: 'propriedades' }"
  >
      <p v-if="loading" class="text-slate-500">
        Carregando...
      </p>

      <div
        v-else-if="erroInicial"
        class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <p class="text-sm text-red-600">{{ erroInicial }}</p>
      </div>

      <template v-else-if="propriedade">
        <form
          @submit.prevent="vincular"
          class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h3 class="mb-4 text-lg font-semibold text-slate-900">
            Vincular veterinário
          </h3>

          <div class="flex flex-col gap-3 md:flex-row md:items-end">
            <div class="flex-1">
              <label class="mb-1 block text-sm font-medium text-slate-700">
                Veterinário
              </label>

              <select
                v-model="veterinarioSelecionado"
                class="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                :disabled="disponiveis.length === 0"
                required
              >
                <option :value="null" disabled>
                  Selecione o veterinário
                </option>

                <option
                  v-for="veterinario in disponiveis"
                  :key="veterinario.id"
                  :value="veterinario.id"
                >
                  {{ veterinario.nome }} ({{ veterinario.username }})
                </option>
              </select>
            </div>

            <button
              type="submit"
              :disabled="salvando || veterinarioSelecionado === null"
              class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {{ salvando ? 'Vinculando...' : 'Vincular' }}
            </button>
          </div>

          <p
            v-if="totalVeterinarios === 0"
            class="mt-2 text-xs text-amber-700"
          >
            Nenhum usuário com perfil Veterinário cadastrado. Cadastre um em Usuários.
          </p>

          <p
            v-else-if="disponiveis.length === 0"
            class="mt-2 text-xs text-slate-500"
          >
            Todos os veterinários cadastrados já estão vinculados a esta propriedade.
          </p>

          <p v-if="erro" class="mt-3 text-sm text-red-600">
            {{ erro }}
          </p>

          <p v-if="sucesso" class="mt-3 text-sm text-green-700">
            {{ sucesso }}
          </p>
        </form>

        <section>
        <h3 class="mb-3 text-lg font-semibold text-slate-900">
          Veterinários vinculados
        </h3>

        <div
          v-if="vinculados.length > 0"
          class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
        >
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Nome</th>
                <th class="px-4 py-3 font-medium">E-mail</th>
                <th class="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200">
              <tr v-for="veterinario in vinculados" :key="veterinario.id">
                <td class="px-4 py-3 font-medium text-slate-900">
                  {{ veterinario.nome }}
                </td>

                <td class="px-4 py-3 text-slate-700">
                  {{ veterinario.username }}
                </td>

                <td class="px-4 py-3">
                  <button
                    type="button"
                    @click="desvincular(veterinario)"
                    class="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                  >
                    Desvincular
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="text-slate-500">
          Nenhum veterinário vinculado a esta propriedade.
        </p>
        </section>
      </template>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { useRoute } from 'vue-router'
import { propriedadeService } from '@/services/propriedadeService'
import { usuarioService } from '@/services/usuarioService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import type { Propriedade } from '@/types/propriedade'
import type { Usuario } from '@/types/usuario'

const route = useRoute()
const propriedadeId = String(route.params.id)

const propriedade = ref<Propriedade | null>(null)
const vinculados = ref<Usuario[]>([])
const usuarios = ref<Usuario[]>([])
const veterinarioSelecionado = ref<number | null>(null)

const loading = ref(true)
const salvando = ref(false)
const erroInicial = ref('')
const erro = ref('')
const sucesso = ref('')

const totalVeterinarios = computed(
  () => usuarios.value.filter((usuario) => usuario.perfil === 'VETERINARIO').length,
)

const disponiveis = computed(() => {
  const idsVinculados = new Set(vinculados.value.map((veterinario) => veterinario.id))

  return usuarios.value.filter(
    (usuario) => usuario.perfil === 'VETERINARIO' && !idsVinculados.has(usuario.id),
  )
})

async function carregarVinculados() {
  vinculados.value = await propriedadeService.listVeterinarios(propriedadeId)
}

async function vincular() {
  if (veterinarioSelecionado.value === null) {
    return
  }

  erro.value = ''
  sucesso.value = ''
  salvando.value = true

  try {
    await propriedadeService.vincularVeterinario(propriedadeId, veterinarioSelecionado.value)
    await carregarVinculados()
    veterinarioSelecionado.value = null
    sucesso.value = 'Veterinário vinculado com sucesso.'
  } catch (err) {
    console.error('Falha ao vincular veterinário', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível vincular o veterinário.')
  } finally {
    salvando.value = false
  }
}

async function desvincular(veterinario: Usuario) {
  if (!confirm(`Desvincular o veterinário "${veterinario.nome}" desta propriedade?`)) {
    return
  }

  erro.value = ''
  sucesso.value = ''

  try {
    await propriedadeService.desvincularVeterinario(propriedadeId, veterinario.id)
    await carregarVinculados()
    sucesso.value = 'Veterinário desvinculado com sucesso.'
  } catch (err) {
    console.error('Falha ao desvincular veterinário', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível desvincular o veterinário.')
  }
}

onMounted(async () => {
  try {
    const [dadosPropriedade, dadosVinculados, dadosUsuarios] = await Promise.all([
      propriedadeService.getById(propriedadeId),
      propriedadeService.listVeterinarios(propriedadeId),
      usuarioService.listAll(),
    ])

    propriedade.value = dadosPropriedade
    vinculados.value = dadosVinculados
    usuarios.value = dadosUsuarios
  } catch (err) {
    console.error('Falha ao carregar veterinários da propriedade', err)
    erroInicial.value = getApiErrorMessage(err, 'Não foi possível carregar os dados da propriedade.')
  } finally {
    loading.value = false
  }
})
</script>
