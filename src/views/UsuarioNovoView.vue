<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900">PecuCore</h1>
      <RouterLink class="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
        :to="{ name: 'home' }"
      >
        Voltar
      </RouterLink>
    </header>

    <main class="flex justify-center p-6">
      <form class="w-full max-w-md rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200"
        @submit.prevent="handleSubmit"
        novalidate
      >
        <h2 class="mb-6 text-xl font-semibold text-slate-900">Cadastro de novo usuário</h2>

        <div class="mb-4">
          <label for="nome" class="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input class="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            :class="fieldErrors.nome ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'"
            id="nome"
            v-model="form.nome"
            type="text"
            autocomplete="name"
            maxlength="150"
            @blur="validateNome"
            @input="if (fieldErrors.nome) validateNome()"
          />
          <p v-if="fieldErrors.nome" class="mt-1 text-xs text-red-600">{{ fieldErrors.nome }}</p>
        </div>

        <div class="mb-4">
          <label for="username" class="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
          <input class="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            :class="fieldErrors.username ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'"
            id="username"
            v-model="form.username"
            type="email"
            autocomplete="email"
            maxlength="150"
            @blur="validateUsername"
            @input="if (fieldErrors.username) validateUsername()"
          />
          <p v-if="fieldErrors.username" class="mt-1 text-xs text-red-600">{{ fieldErrors.username }}</p>
        </div>

        <div class="mb-4">
          <label for="senha" class="mb-1 block text-sm font-medium text-slate-700">Senha</label>
          <div class="relative">
            <input class="w-full rounded-md border px-3 py-2 pr-16 text-sm focus:outline-none"
              :class="fieldErrors.senha ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'"
              id="senha"
              v-model="form.senha"
              :type="showSenha ? 'text' : 'password'"
              autocomplete="new-password"
              @blur="validateSenha"
              @input="if (fieldErrors.senha) validateSenha()"
            />
            <button class="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-700"
              type="button"
              @click="showSenha = !showSenha"
            >
              {{ showSenha ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <p v-if="fieldErrors.senha" class="mt-1 text-xs text-red-600">{{ fieldErrors.senha }}</p>
        </div>

        <div class="mb-6">
          <label for="perfil" class="mb-1 block text-sm font-medium text-slate-700">Perfil</label>
          <select class="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none"
            :class="fieldErrors.perfil ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'"
            id="perfil"
            v-model="form.perfil"
            @change="validatePerfil"
          >
            <option value="" disabled>Selecione um perfil</option>
            <option v-for="option in PERFIL_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <p v-if="fieldErrors.perfil" class="mt-1 text-xs text-red-600">{{ fieldErrors.perfil }}</p>
        </div>

        <p v-if="generalError" class="mb-4 text-sm text-red-600">{{ generalError }}</p>
        <p v-if="successMessage" class="mb-4 text-sm text-green-600">{{ successMessage }}</p>

        <button class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Salvando...' : 'Cadastrar usuário' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usuarioService } from '@/services/usuarioService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { HttpError } from '@/services/http'
import type { Perfil } from '@/types/usuario'

const PERFIL_OPTIONS: { value: Perfil; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'PRODUTOR', label: 'Produtor' },
  { value: 'VETERINARIO', label: 'Veterinário' },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SENHA_MIN_LENGTH = 6

const router = useRouter()

const form = reactive({
  nome: '',
  username: '',
  senha: '',
  perfil: '' as Perfil | '',
})

const fieldErrors = reactive({
  nome: '',
  username: '',
  senha: '',
  perfil: '',
})

const showSenha = ref(false)
const loading = ref(false)
const generalError = ref('')
const successMessage = ref('')

function validateNome(): boolean {
  fieldErrors.nome = form.nome.trim() === '' ? 'Informe o nome.' : ''
  return !fieldErrors.nome
}

function validateUsername(): boolean {
  const username = form.username.trim()
  if (username === '') {
    fieldErrors.username = 'Informe o e-mail.'
  } else if (!EMAIL_REGEX.test(username)) {
    fieldErrors.username = 'Informe um e-mail válido.'
  } else {
    fieldErrors.username = ''
  }
  return !fieldErrors.username
}

function validateSenha(): boolean {
  if (form.senha === '') {
    fieldErrors.senha = 'Informe a senha.'
  } else if (form.senha.length < SENHA_MIN_LENGTH) {
    fieldErrors.senha = `A senha deve ter ao menos ${SENHA_MIN_LENGTH} caracteres.`
  } else {
    fieldErrors.senha = ''
  }
  return !fieldErrors.senha
}

function validatePerfil(): boolean {
  fieldErrors.perfil = form.perfil === '' ? 'Selecione um perfil.' : ''
  return !fieldErrors.perfil
}

function validate(): boolean {
  const nomeValido = validateNome()
  const usernameValido = validateUsername()
  const senhaValida = validateSenha()
  const perfilValido = validatePerfil()

  return nomeValido && usernameValido && senhaValida && perfilValido
}

function resetForm() {
  form.nome = ''
  form.username = ''
  form.senha = ''
  form.perfil = ''
  showSenha.value = false
}

async function handleSubmit() {
  generalError.value = ''
  successMessage.value = ''

  if (!validate()) {
    return
  }

  loading.value = true
  try {
    await usuarioService.create({
      nome: form.nome.trim(),
      username: form.username.trim(),
      senha: form.senha,
      perfil: form.perfil as Perfil,
    })

    successMessage.value = 'Usuário cadastrado com sucesso!'
    resetForm()
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 1200)
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      router.push({ name: 'login' })
      return
    }
    generalError.value = getApiErrorMessage(err, 'Não foi possível cadastrar o usuário. Tente novamente.')
  } finally {
    loading.value = false
  }
}
</script>
