<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await auth.fetchPerfil()
})

function sair() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

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
          {{ auth.isProdutor ? 'Área do produtor' : 'Painel administrativo' }}
        </p>
      </div>

      <button
        @click="sair"
        class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Sair
      </button>
    </header>

    <main class="mx-auto max-w-6xl p-6">

      <!-- HOME DO PRODUTOR -->

      <template v-if="auth.isProdutor">

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-slate-900">
            Olá! 👋
          </h2>

          <p class="mt-1 text-slate-500">
            Gerencie suas propriedades e acompanhe seus animais.
          </p>
        </section>

        <section>
          <h3 class="mb-4 text-lg font-semibold text-slate-900">
            Gestão
          </h3>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            <RouterLink
              to="/propriedades"
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl"
              >
                🏠
              </div>

              <h4 class="text-lg font-semibold text-slate-900">
                Propriedades
              </h4>

              <p class="mt-2 text-sm leading-6 text-slate-500">
                Cadastre e gerencie suas propriedades.
              </p>
            </RouterLink>

            <RouterLink
              to="/lotes"
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl"
              >
                📋
              </div>

              <h4 class="text-lg font-semibold text-slate-900">
                Lotes
              </h4>

              <p class="mt-2 text-sm leading-6 text-slate-500">
                Organize os lotes das suas propriedades.
              </p>
            </RouterLink>

            <RouterLink
              to="/animais"
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl"
              >
                🐄
              </div>

              <h4 class="text-lg font-semibold text-slate-900">
                Animais
              </h4>

              <p class="mt-2 text-sm leading-6 text-slate-500">
                Cadastre e acompanhe seus animais.
              </p>
            </RouterLink>

            <RouterLink
              to="/pesagens"
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl"
              >
                ⚖️
              </div>

              <h4 class="text-lg font-semibold text-slate-900">
                Pesagens
              </h4>

              <p class="mt-2 text-sm leading-6 text-slate-500">
                Registre e consulte pesagens.
              </p>
            </RouterLink>

            <RouterLink
              to="/desempenho"
              class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl"
              >
                📊
              </div>

              <h4 class="text-lg font-semibold text-slate-900">
                Desempenho
              </h4>

              <p class="mt-2 text-sm leading-6 text-slate-500">
                Acompanhe a evolução e o desempenho zootécnico.
              </p>
            </RouterLink>

          </div>
        </section>

      </template>

      <!-- HOME DO ADMIN -->

      <template v-else>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-slate-900">
            Olá! 👋
          </h2>

          <p class="mt-1 text-slate-500">
            Bem-vindo ao painel administrativo do PecuCore.
          </p>
        </section>

        <section>
          <h3 class="mb-4 text-lg font-semibold text-slate-900">
            Gerenciamento
          </h3>

          <RouterLink
            to="/usuarios"
            class="block max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl"
            >
              👤
            </div>

            <h4 class="text-lg font-semibold text-slate-900">
              Usuários
            </h4>

            <p class="mt-2 text-sm leading-6 text-slate-500">
              Cadastre, consulte, edite e exclua os usuários do sistema.
            </p>

            <div class="mt-5 text-sm font-medium text-slate-900">
              Gerenciar usuários →
            </div>
          </RouterLink>
        </section>

      </template>

    </main>
  </div>
</template>