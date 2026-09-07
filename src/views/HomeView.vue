<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900">PecuCore</h1>
      <button class="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
        @click="handleLogout"
      >
        Sair
      </button>
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
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th v-for="column in columns" :key="column" class="px-4 py-2 font-medium">
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="usuario in usuarios" :key="usuario.id">
              <td v-for="column in columns" :key="column" class="px-4 py-2 text-slate-700">
                {{ usuario[column] }}
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
import type { Usuario } from '@/types/usuario'

const router = useRouter()
const auth = useAuthStore()

const usuarios = ref<Usuario[]>([])
const loading = ref(true)
const isAdmin = ref(false)

const columns = computed(() =>
  usuarios.value.length > 0 ? Object.keys(usuarios.value[0]) : [],
)

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
</script>
