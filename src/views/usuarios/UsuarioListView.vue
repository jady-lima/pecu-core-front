<template>
  <PageLayout
    titulo="Usuários"
    subtitulo="Gerenciamento de usuários"
  >
      <template #acoes>
        <RouterLink
          :to="{ name: 'usuarios-novo' }"
          class="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo usuário
        </RouterLink>
      </template>

      <p
        v-if="erro"
        class="text-sm text-red-600"
      >
        {{ erro }}
      </p>

      <p
        v-if="sucesso"
        class="text-sm text-green-700"
      >
        {{ sucesso }}
      </p>

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
                <span
                  v-if="usuario.id === auth.userId"
                  class="ml-1 text-xs font-normal text-slate-500"
                >
                  (você)
                </span>
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ usuario.username }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ PERFIL_LABEL[usuario.perfil] }}
              </td>

              <td class="px-4 py-3 text-slate-700">
                {{ formatarDataHora(usuario.dataCriacao) }}
              </td>

              <td class="px-4 py-3">

                <div class="flex gap-2">

                  <RouterLink
                    :to="{ name: 'usuarios-editar', params: { id: usuario.id } }"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Editar
                  </RouterLink>

                  <button
                    v-if="usuario.id !== auth.userId"
                    @click="excluirUsuario(usuario)"
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
  </PageLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { usuarioService } from '@/services/usuarioService'
import { getApiErrorMessage } from '@/utils/apiErrors'
import { PERFIL_LABEL, type Usuario } from '@/types/usuario'

const auth = useAuthStore()

const usuarios = ref<Usuario[]>([])
const loading = ref(true)
const erro = ref('')
const sucesso = ref('')

async function carregarUsuarios() {
  usuarios.value = await usuarioService.listAll()
}

function formatarDataHora(valor: string) {
  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return valor
  }

  return data.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

async function excluirUsuario(usuario: Usuario) {
  if (usuario.id === auth.userId) {
    return
  }

  if (!confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) {
    return
  }

  erro.value = ''
  sucesso.value = ''

  try {
    await usuarioService.remove(usuario.id)
    await carregarUsuarios()
    sucesso.value = 'Usuário excluído com sucesso.'
  } catch (err) {
    console.error('Falha ao excluir usuário', err)
    erro.value = getApiErrorMessage(
      err,
      'Não foi possível excluir o usuário. Verifique se ele possui propriedades ou registros vinculados.',
    )
  }
}

onMounted(async () => {
  try {
    await carregarUsuarios()
  } catch (err) {
    console.error('Falha ao carregar usuários', err)
    erro.value = getApiErrorMessage(err, 'Não foi possível carregar os usuários.')
  } finally {
    loading.value = false
  }
})
</script>
