<template>
  <PageLayout subtitulo="Gerenciamento de usuários" :voltar-para="{ name: 'usuarios' }">
    <div class="flex justify-center">
      <p v-if="initialLoading" class="text-slate-500">Carregando dados do usuário...</p>

      <div v-else-if="initialError" class="w-full max-w-md rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p class="text-sm text-red-600">{{ initialError }}</p>
        <RouterLink class="mt-4 inline-block text-sm font-medium text-slate-700 underline" :to="{ name: 'usuarios' }">
          Voltar para a listagem
        </RouterLink>
      </div>

      <form v-else class="w-full max-w-md rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200"
        @submit.prevent="handleSubmit"
        novalidate
      >
        <h2 class="mb-6 text-xl font-semibold text-slate-900">
          {{ isEdicao ? 'Editar usuário' : 'Cadastro de novo usuário' }}
        </h2>

        <div class="mb-4">
          <label for="nome" class="mb-1 block text-sm font-medium text-slate-700">Nome</label>
          <input class="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
            :class="fieldErrors.nome ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'"
            id="nome"
            v-model="form.nome"
            type="text"
            autocomplete="name"
            maxlength="100"
            @blur="validateNome"
            @input="fieldErrors.nome && validateNome()"
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
            @input="fieldErrors.username && validateUsername()"
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
              @input="fieldErrors.senha && validateSenha()"
            />
            <button class="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-700"
              type="button"
              @click="showSenha = !showSenha"
            >
              {{ showSenha ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <p v-if="fieldErrors.senha" class="mt-1 text-xs text-red-600">{{ fieldErrors.senha }}</p>
          <p v-else-if="isEdicao" class="mt-1 text-xs text-slate-500">
            Deixe em branco para manter a senha atual, ou preencha para definir uma nova.
          </p>
        </div>

        <div class="mb-6">
          <label for="perfil" class="mb-1 block text-sm font-medium text-slate-700">Perfil</label>
          <select class="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
            :class="fieldErrors.perfil ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-slate-500'"
            id="perfil"
            v-model="form.perfil"
            :disabled="isProprioUsuario"
            @change="validatePerfil"
          >
            <option value="" disabled>Selecione um perfil</option>
            <option v-for="(label, value) in PERFIL_LABEL" :key="value" :value="value">
              {{ label }}
            </option>
          </select>
          <p v-if="fieldErrors.perfil" class="mt-1 text-xs text-red-600">{{ fieldErrors.perfil }}</p>
          <p v-else-if="isProprioUsuario" class="mt-1 text-xs text-slate-500">
            Você não pode alterar o seu próprio perfil.
          </p>
        </div>

        <p v-if="generalError" class="mb-4 text-sm text-red-600">{{ generalError }}</p>
        <p v-if="successMessage" class="mb-4 text-sm text-green-600">{{ successMessage }}</p>

        <button class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Cadastrar usuário' }}
        </button>
      </form>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { useRoute, useRouter } from 'vue-router'
import { usuarioService } from '@/services/usuarioService'
import { useAuthStore } from '@/stores/auth'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { HttpError } from '@/services/http'
import { PERFIL_LABEL, type AtualizarUsuarioPayload, type NovoUsuarioPayload, type Perfil } from '@/types/usuario'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SENHA_MIN_LENGTH = 6

const route = useRoute()
const router = useRouter()

const usuarioId = computed(() => {
  const raw = route.params.id
  return typeof raw === 'string' && raw !== '' ? raw : null
})
const isEdicao = computed(() => usuarioId.value !== null)

const auth = useAuthStore()
const isProprioUsuario = computed(
  () => isEdicao.value && auth.userId !== null && String(auth.userId) === usuarioId.value,
)

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
const initialLoading = ref(false)
const initialError = ref('')
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
    fieldErrors.senha = isEdicao.value ? '' : 'Informe a senha.'
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

async function loadUsuario(id: string) {
  resetForm()
  initialError.value = ''
  initialLoading.value = true
  try {
    const usuario = await usuarioService.getById(id)
    form.nome = usuario.nome ?? ''
    form.username = usuario.username ?? ''
    form.perfil = usuario.perfil ?? ''
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      router.push({ name: 'login' })
      return
    }
    initialError.value = getApiErrorMessage(err, 'Não foi possível carregar os dados do usuário.')
  } finally {
    initialLoading.value = false
  }
}

watch(
  usuarioId,
  (id) => {
    if (id) {
      loadUsuario(id)
    } else {
      resetForm()
      initialError.value = ''
    }
  },
  { immediate: true },
)

async function handleSubmit() {
  generalError.value = ''
  successMessage.value = ''

  if (!validate()) {
    return
  }

  loading.value = true
  try {
    const id = usuarioId.value
    if (id) {
      const payload: AtualizarUsuarioPayload = {
        nome: form.nome.trim(),
        username: form.username.trim(),
        perfil: form.perfil as Perfil,
      }
      if (form.senha !== '') {
        payload.senha = form.senha
      }
      await usuarioService.update(id, payload)
      successMessage.value = 'Usuário atualizado com sucesso!'
    } else {
      const payload: NovoUsuarioPayload = {
        nome: form.nome.trim(),
        username: form.username.trim(),
        senha: form.senha,
        perfil: form.perfil as Perfil,
      }
      await usuarioService.create(payload)
      successMessage.value = 'Usuário cadastrado com sucesso!'
      resetForm()
    }

    setTimeout(() => {
      router.push({ name: 'usuarios' })
    }, 1200)
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      router.push({ name: 'login' })
      return
    }
    generalError.value = getApiErrorMessage(
      err,
      isEdicao.value
        ? 'Não foi possível atualizar o usuário. Tente novamente.'
        : 'Não foi possível cadastrar o usuário. Tente novamente.',
    )
  } finally {
    loading.value = false
  }
}
</script>
