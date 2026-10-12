<template>
  <div class="min-h-screen bg-slate-50">

    <header
      class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"
    >
      <div>
        <h1 class="text-lg font-semibold text-slate-900">
          PecuCore
        </h1>

        <p class="text-sm text-slate-500">
          Gerenciamento de usuários
        </p>
      </div>

      <RouterLink
        to="/"
        class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Voltar
      </RouterLink>
    </header>

    <main class="mx-auto max-w-7xl p-6">

      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">
            Usuários
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Cadastre, edite e exclua usuários do sistema.
          </p>
        </div>

        <button
          @click="novoUsuario"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo usuário
        </button>
      </div>

      <!-- FORMULÁRIO -->

      <form
        v-if="mostrarFormulario"
        @submit.prevent="salvarUsuario"
        class="mb-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >

        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          {{ editandoId ? 'Editar usuário' : 'Cadastrar usuário' }}
        </h3>

        <div class="grid gap-4 md:grid-cols-2">

          <div>
            <label
              class="mb-1 block text-sm font-medium text-slate-700"
            >
              Nome
            </label>

            <input
              v-model="nome"
              type="text"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              class="mb-1 block text-sm font-medium text-slate-700"
            >
              E-mail
            </label>

            <input
              v-model="username"
              type="email"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              class="mb-1 block text-sm font-medium text-slate-700"
            >
              Senha
            </label>

            <input
              v-model="senha"
              type="password"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              class="mb-1 block text-sm font-medium text-slate-700"
            >
              Perfil
            </label>

            <select
              v-model="perfil"
              class="w-full rounded-md border border-slate-300 px-3 py-2"
              required
            >
              <option value="ADMIN">
                Administrador
              </option>

              <option value="PRODUTOR">
                Produtor
              </option>

              <option value="VETERINARIO">
                Veterinário
              </option>
            </select>
          </div>

        </div>

        <div class="mt-5 flex gap-2">

          <button
            type="submit"
            class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            {{ editandoId ? 'Salvar alterações' : 'Cadastrar usuário' }}
          </button>

          <button
            type="button"
            @click="cancelarFormulario"
            class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancelar
          </button>

        </div>

        <p
          v-if="erro"
          class="mt-3 text-sm text-red-600"
        >
          {{ erro }}
        </p>

      </form>

      <!-- CARREGANDO -->

      <p
        v-if="loading"
        class="text-slate-500"
      >
        Carregando usuários...
      </p>

      <!-- TABELA -->

      <div
        v-else-if="usuarios.length > 0"
        class="overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
      >

        <table class="w-full text-left text-sm">

          <thead class="bg-slate-100 text-slate-600">

            <tr>
              <th class="px-4 py-3 font-medium">
                ID
              </th>

              <th class="px-4 py-3 font-medium">
                Nome
              </th>

              <th class="px-4 py-3 font-medium">
                E-mail
              </th>

              <th class="px-4 py-3 font-medium">
                Perfil
              </th>

              <th class="px-4 py-3 font-medium">
                Data de criação
              </th>

              <th class="px-4 py-3 font-medium">
                Ações
              </th>
            </tr>

          </thead>

          <tbody class="divide-y divide-slate-200">

            <tr
              v-for="usuario in usuarios"
              :key="usuario.id"
            >

              <td class="px-4 py-3 text-slate-700">
                {{ usuario.id }}
              </td>

              <td class="px-4 py-3 font-medium text-slate-900">
                {{ usuario.nome }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ usuario.username }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ usuario.perfil }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ usuario.dataCriacao }}
              </td>

              <td class="px-4 py-3">

                <div class="flex gap-2">

                  <button
                    @click="editarUsuario(usuario)"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </button>

                  <button
                    @click="excluirUsuario(usuario.id)"
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

      <p
        v-else
        class="text-slate-500"
      >
        Nenhum usuário encontrado.
      </p>

    </main>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usuarioService } from '@/services/usuarioService'
import type { Usuario, Perfil } from '@/types/usuario'

const usuarios = ref<Usuario[]>([])
const loading = ref(true)
const erro = ref('')

const mostrarFormulario = ref(false)
const editandoId = ref<number | null>(null)

const nome = ref('')
const username = ref('')
const senha = ref('')
const perfil = ref<Perfil>('PRODUTOR')

async function carregarUsuarios() {
  const response = await usuarioService.listAll()

  usuarios.value = response
}

function novoUsuario() {
  limparFormulario()

  mostrarFormulario.value = true
}

function limparFormulario() {
  nome.value = ''
  username.value = ''
  senha.value = ''
  perfil.value = 'PRODUTOR'
  editandoId.value = null
  erro.value = ''
}

function cancelarFormulario() {
  limparFormulario()

  mostrarFormulario.value = false
}

function editarUsuario(usuario: Usuario) {
  editandoId.value = usuario.id

  nome.value = usuario.nome
  username.value = usuario.username
  senha.value = ''
  perfil.value = usuario.perfil

  erro.value = ''
  mostrarFormulario.value = true

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

async function salvarUsuario() {
  erro.value = ''

  try {
    const dados = {
      nome: nome.value,
      username: username.value,
      senha: senha.value,
      perfil: perfil.value,
    }

    if (editandoId.value !== null) {
      await usuarioService.update(
        editandoId.value,
        dados
      )
    } else {
      await usuarioService.create(dados)
    }

    await carregarUsuarios()

    cancelarFormulario()

  } catch (err) {
    console.error('Falha ao salvar usuário', err)

    erro.value = 'Não foi possível salvar o usuário.'
  }
}

async function excluirUsuario(id: number) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) {
    return
  }

  erro.value = ''

  try {
    await usuarioService.delete(id)

    await carregarUsuarios()

  } catch (err) {
    console.error('Falha ao excluir usuário', err)

    erro.value = 'Não foi possível excluir o usuário.'
  }
}

onMounted(async () => {
  try {
    await carregarUsuarios()
  } catch (err) {
    console.error('Falha ao carregar usuários', err)

    erro.value = 'Não foi possível carregar os usuários.'
  } finally {
    loading.value = false
  }
})
</script>