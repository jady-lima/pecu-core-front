<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <form class="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200"
      @submit.prevent="handleSubmit"
    >
      <h1 class="mb-6 text-xl font-semibold text-slate-900">Entrar</h1>

      <div class="mb-4">
        <label for="username" class="mb-1 block text-sm font-medium text-slate-700">Usuário</label>
        <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          id="username"
          v-model="username"
          type="text"
          required
        />
      </div>

      <div class="mb-6">
        <label for="senha" class="mb-1 block text-sm font-medium text-slate-700">Senha</label>
        <input class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          id="senha"
          v-model="senha"
          type="password"
          required
        />
      </div>

      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>

      <button class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        type="submit"
        :disabled="loading"
      >
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const senha = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ username: username.value, senha: senha.value })
    const redirect = (router.currentRoute.value.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    error.value = 'Usuário ou senha inválidos.'
  } finally {
    loading.value = false
  }
}
</script>