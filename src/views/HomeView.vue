<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900">PecuCore</h1>
      <div class="flex items-center gap-3">
        <RouterLink v-if="auth.isAdmin" class="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
          :to="{ name: 'usuarios-novo' }"
        >
          Novo usuário
        </RouterLink>
        <button class="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
          @click="handleLogout"
        >
          Sair
        </button>
      </div>
    </header>

    <main class="p-6">
      <p v-if="loading" class="text-slate-500">Carregando...</p>

      <div v-else-if="auth.isProdutor" class="rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">Bem-vindo(a) ao PecuCore!</h2>
        <p class="mt-2 text-slate-600">
          Aplicação Vue + TypeScript pronta para consumir a API Spring Boot.
        </p>
      </div>

      <div v-else-if="usuarios.length > 0" class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <p v-if="actionError" class="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
          {{ actionError }}
        </p>
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th v-for="column in columns" :key="column" class="px-4 py-2 font-medium">
                {{ formatColumnLabel(column) }}
              </th>
              <th v-if="auth.isAdmin" class="px-4 py-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="usuario in usuarios" :key="usuario.id">
              <td v-for="column in columns" :key="column" class="px-4 py-2 text-slate-700">
                {{ formatCell(column, usuario[column]) }}
              </td>
              <td v-if="auth.isAdmin" class="px-4 py-2">
                <div class="flex items-center gap-1">
                  <RouterLink class="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    :to="{ name: 'usuarios-editar', params: { id: usuario.id } }"
                    title="Editar"
                    aria-label="Editar usuário"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5v4.75A2.25 2.25 0 0117.25 20.5H5.75A2.25 2.25 0 013.5 18.25V6.75A2.25 2.25 0 015.75 4.5h4.75" />
                    </svg>
                  </RouterLink>
                  <button class="rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                    type="button"
                    :title="isSelf(usuario) ? 'Não é possível excluir o próprio usuário' : 'Excluir'"
                    aria-label="Excluir usuário"
                    :disabled="isSelf(usuario) || deletingId === usuario.id"
                    @click="handleDelete(usuario)"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else-if="!isAdmin" class="text-slate-600">
        Aplicação Vue + TypeScript pronta para consumir a API Spring Boot.
      </p>

      <p v-else class="text-slate-500">Nenhum usuário encontrado.</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usuarioService } from '@/services/usuarioService'
import { HttpError } from '@/services/http'
import { getApiErrorMessage } from '@/utils/apiErrors'
import type { Usuario } from '@/types/usuario'

const router = useRouter()
const auth = useAuthStore()

const usuarios = ref<Usuario[]>([])
const loading = ref(true)
const isAdmin = ref(false)
const deletingId = ref<number | string | null>(null)
const actionError = ref('')

const columns = computed(() =>
  usuarios.value.length > 0 ? Object.keys(usuarios.value[0]) : [],
)

const DATE_COLUMNS = ['dataCriacao']

const COLUMN_LABELS: Record<string, string> = {
  id: 'ID',
  nome: 'Nome',
  username: 'Username',
  perfil: 'Perfil',
  dataCriacao: 'Data Cadastro',
}

function formatColumnLabel(column: string): string {
  return COLUMN_LABELS[column] ?? column
}

function formatCell(column: string, value: unknown): unknown {
  if (DATE_COLUMNS.includes(column) && typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
  }
  return value
}

onMounted(async () => {
  try {
    await auth.fetchPerfil()

    if (auth.isProdutor) {
      return
    }

    usuarios.value = await usuarioService.listAll()
    isAdmin.value = true
  } catch (err) {
    if (!(err instanceof HttpError && err.status === 403)) {
      console.error('Falha ao carregar dados do usuário', err)
    }
  } finally {
    loading.value = false
  }
})

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}

function isSelf(usuario: Usuario): boolean {
  return auth.userId !== null && String(usuario.id) === String(auth.userId)
}

async function handleDelete(usuario: Usuario) {
  if (isSelf(usuario)) {
    actionError.value = 'Não é possível excluir o próprio usuário logado.'
    return
  }

  const nome = usuario.nome ?? usuario.username ?? `#${usuario.id}`
  if (!window.confirm(`Tem certeza que deseja excluir o usuário "${nome}"?`)) {
    return
  }

  actionError.value = ''
  deletingId.value = usuario.id
  try {
    await usuarioService.remove(usuario.id)
    usuarios.value = usuarios.value.filter((item) => item.id !== usuario.id)
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      router.push({ name: 'login' })
      return
    }
    actionError.value = getApiErrorMessage(err, 'Não foi possível excluir o usuário. Tente novamente.')
  } finally {
    deletingId.value = null
  }
}
</script>
