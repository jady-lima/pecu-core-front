<template>
  <PageLayout
    titulo="Meu perfil"
    subtitulo="Conta"
  >
    <p v-if="loading" class="text-slate-500">
      Carregando dados...
    </p>

    <p v-else-if="erroInicial" class="text-sm text-red-600">
      {{ erroInicial }}
    </p>

    <section
      v-else-if="usuario"
      class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h3 class="mb-4 text-lg font-semibold text-slate-900">
        Dados da conta
      </h3>

      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-medium uppercase text-slate-500">Nome</dt>
          <dd class="mt-1 text-slate-900">{{ usuario.nome }}</dd>
        </div>

        <div>
          <dt class="text-xs font-medium uppercase text-slate-500">E-mail</dt>
          <dd class="mt-1 text-slate-900">{{ usuario.username }}</dd>
        </div>

        <div>
          <dt class="text-xs font-medium uppercase text-slate-500">Perfil</dt>
          <dd class="mt-1 text-slate-900">{{ PERFIL_LABEL[usuario.perfil] }}</dd>
        </div>

        <div>
          <dt class="text-xs font-medium uppercase text-slate-500">Conta criada em</dt>
          <dd class="mt-1 text-slate-900">{{ formatarDataHora(usuario.dataCriacao) }}</dd>
        </div>
      </dl>

      <p class="mt-4 text-xs text-slate-500">
        Para alterar nome, e-mail ou perfil, fale com o administrador do sistema.
      </p>
    </section>

    <form
      @submit.prevent="alterarSenha"
      novalidate
      class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h3 class="mb-4 text-lg font-semibold text-slate-900">
        Alterar senha
      </h3>

      <div class="grid max-w-md gap-4">
        <div>
          <label for="senha-atual" class="mb-1 block text-sm font-medium text-slate-700">
            Senha atual
          </label>

          <input
            id="senha-atual"
            v-model="senhaAtual"
            :type="mostrarSenhas ? 'text' : 'password'"
            autocomplete="current-password"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label for="nova-senha" class="mb-1 block text-sm font-medium text-slate-700">
            Nova senha
          </label>

          <input
            id="nova-senha"
            v-model="novaSenha"
            :type="mostrarSenhas ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
          />

          <p class="mt-1 text-xs text-slate-500">
            Mínimo de {{ SENHA_MIN_LENGTH }} caracteres e diferente da senha atual.
          </p>
        </div>

        <div>
          <label for="confirmar-senha" class="mb-1 block text-sm font-medium text-slate-700">
            Confirmar nova senha
          </label>

          <input
            id="confirmar-senha"
            v-model="confirmacao"
            :type="mostrarSenhas ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input v-model="mostrarSenhas" type="checkbox" class="rounded border-slate-300" />
          Mostrar senhas
        </label>
      </div>

      <div class="mt-5">
        <button
          type="submit"
          :disabled="salvando"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {{ salvando ? 'Salvando...' : 'Alterar senha' }}
        </button>
      </div>

      <p v-if="erro" class="mt-3 text-sm text-red-600">
        {{ erro }}
      </p>

      <p v-if="sucesso" class="mt-3 text-sm text-green-700">
        {{ sucesso }}
      </p>
    </form>
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { formatarDataHora } from '@/utils/formatters'
import type { UsuarioLogado } from '@/types/auth'
import { PERFIL_LABEL } from '@/types/usuario'

const SENHA_MIN_LENGTH = 6

const usuario = ref<UsuarioLogado | null>(null)
const loading = ref(true)
const erroInicial = ref('')

const senhaAtual = ref('')
const novaSenha = ref('')
const confirmacao = ref('')
const mostrarSenhas = ref(false)
const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')

function validar(): string {
  if (!senhaAtual.value || !novaSenha.value || !confirmacao.value) {
    return 'Preencha a senha atual, a nova senha e a confirmação.'
  }

  if (novaSenha.value.length < SENHA_MIN_LENGTH) {
    return `A nova senha deve ter ao menos ${SENHA_MIN_LENGTH} caracteres.`
  }

  if (novaSenha.value === senhaAtual.value) {
    return 'A nova senha deve ser diferente da senha atual.'
  }

  if (novaSenha.value !== confirmacao.value) {
    return 'A confirmação não confere com a nova senha.'
  }

  return ''
}

async function alterarSenha() {
  sucesso.value = ''
  erro.value = validar()

  if (erro.value) {
    return
  }

  salvando.value = true

  try {
    await authService.alterarSenha({
      senhaAtual: senhaAtual.value,
      novaSenha: novaSenha.value,
    })

    senhaAtual.value = ''
    novaSenha.value = ''
    confirmacao.value = ''
    mostrarSenhas.value = false
    sucesso.value = 'Senha alterada com sucesso. Use a nova senha no próximo login.'
  } catch (err) {
    console.error('Falha ao alterar senha', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível alterar a senha.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    usuario.value = await authService.me()
  } catch (err) {
    console.error('Falha ao carregar dados do perfil', err)
    erroInicial.value = getApiErrorMessage(err, 'Não foi possível carregar os dados da conta.')
  } finally {
    loading.value = false
  }
})
</script>
