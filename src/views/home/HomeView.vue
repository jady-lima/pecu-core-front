<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PERFIL_LABEL } from '@/types/usuario'

interface ModuloCard {
  rota: string
  icone: string
  titulo: string
  descricao: string
}

interface GrupoModulos {
  titulo: string
  modulos: ModuloCard[]
}

const auth = useAuthStore()
const router = useRouter()

const MODULOS_ADMIN: GrupoModulos[] = [
  {
    titulo: 'Administração',
    modulos: [
      {
        rota: 'usuarios',
        icone: '👤',
        titulo: 'Usuários',
        descricao: 'Cadastre, consulte, edite e exclua os usuários do sistema.',
      },
    ],
  },
  {
    titulo: 'Cadastros',
    modulos: [
      {
        rota: 'propriedades',
        icone: '🏠',
        titulo: 'Propriedades',
        descricao: 'Consulte e gerencie as propriedades de todos os produtores.',
      },
      {
        rota: 'lotes',
        icone: '📋',
        titulo: 'Lotes',
        descricao: 'Consulte e gerencie os lotes de todas as propriedades.',
      },
      {
        rota: 'animais',
        icone: '🐄',
        titulo: 'Animais',
        descricao: 'Consulte e gerencie os animais de todo o rebanho.',
      },
    ],
  },
  {
    titulo: 'Catálogos',
    modulos: [
      {
        rota: 'vacinas',
        icone: '💉',
        titulo: 'Vacinas',
        descricao: 'Cadastre as vacinas usadas nos registros de vacinação.',
      },
      {
        rota: 'metas-desempenho',
        icone: '🎯',
        titulo: 'Metas de desempenho',
        descricao: 'Defina o GMD esperado para cada finalidade de lote.',
      },
    ],
  },
]

const MODULOS_PRODUTOR: GrupoModulos[] = [
  {
    titulo: 'Gestão',
    modulos: [
      {
        rota: 'propriedades',
        icone: '🏠',
        titulo: 'Propriedades',
        descricao: 'Cadastre e gerencie suas propriedades.',
      },
      {
        rota: 'lotes',
        icone: '📋',
        titulo: 'Lotes',
        descricao: 'Organize os lotes das suas propriedades.',
      },
      {
        rota: 'animais',
        icone: '🐄',
        titulo: 'Animais',
        descricao: 'Cadastre e acompanhe seus animais.',
      },
      {
        rota: 'pesagens',
        icone: '⚖️',
        titulo: 'Pesagens',
        descricao: 'Registre e consulte pesagens.',
      },
      {
        rota: 'alimentacoes',
        icone: '🌾',
        titulo: 'Alimentação',
        descricao: 'Registre a alimentação por animal ou por lote.',
      },
      {
        rota: 'desempenho',
        icone: '📊',
        titulo: 'Desempenho',
        descricao: 'Acompanhe a evolução e o desempenho zootécnico.',
      },
    ],
  },
]

const subtitulo = computed(() => {
  if (auth.isAdmin) return 'Painel administrativo'
  if (auth.isProdutor) return 'Área do produtor'
  return auth.perfil ? `Área do ${PERFIL_LABEL[auth.perfil].toLowerCase()}` : ''
})

const boasVindas = computed(() => {
  if (auth.isAdmin) return 'Bem-vindo ao painel administrativo do PecuCore.'
  if (auth.isProdutor) return 'Gerencie suas propriedades e acompanhe seus animais.'
  return 'Bem-vindo ao PecuCore.'
})

const grupos = computed<GrupoModulos[]>(() => {
  if (auth.isAdmin) return MODULOS_ADMIN
  if (auth.isProdutor) return MODULOS_PRODUTOR
  return []
})

const chaveBoasVindas = computed(() =>
  auth.userId !== null ? `pecu_boas_vindas_fechado_${auth.userId}` : null,
)

function boasVindasJaFechado(chave: string): boolean {
  try {
    return localStorage.getItem(chave) === '1'
  } catch {
    return false
  }
}

const mostrarBoasVindas = ref(
  chaveBoasVindas.value !== null && !boasVindasJaFechado(chaveBoasVindas.value),
)

function fecharBoasVindas() {
  mostrarBoasVindas.value = false

  if (chaveBoasVindas.value === null) {
    return
  }

  try {
    localStorage.setItem(chaveBoasVindas.value, '1')
  } catch {
    return
  }
}

function sair() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">

    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 class="text-lg font-semibold text-slate-900">
            PecuCore
          </h1>

          <p class="text-sm text-slate-500">
            {{ subtitulo }}
          </p>
        </div>

        <button
          @click="sair"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Sair
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8">

      <section
        v-if="mostrarBoasVindas"
        role="status"
        class="mb-8 flex items-start justify-between gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
      >
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">
            Olá{{ auth.nome ? `, ${auth.nome}` : '' }}! 👋
          </h2>

          <p class="mt-1 text-slate-500">
            {{ boasVindas }}
          </p>
        </div>

        <button
          type="button"
          aria-label="Remover mensagem de boas-vindas"
          title="Remover"
          @click="fecharBoasVindas"
          class="shrink-0 rounded-md px-2 py-1 text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>
      </section>

      <section
        v-for="grupo in grupos"
        :key="grupo.titulo"
        class="mb-8"
      >
        <h3 class="mb-4 text-lg font-semibold text-slate-900">
          {{ grupo.titulo }}
        </h3>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          <RouterLink
            v-for="modulo in grupo.modulos"
            :key="modulo.rota"
            :to="{ name: modulo.rota }"
            class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl"
            >
              {{ modulo.icone }}
            </div>

            <h4 class="text-lg font-semibold text-slate-900">
              {{ modulo.titulo }}
            </h4>

            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ modulo.descricao }}
            </p>
          </RouterLink>

        </div>
      </section>

      <!-- Perfil ainda sem área própria (ex.: veterinário, que será tratado depois). -->
      <p
        v-if="grupos.length === 0"
        class="rounded-lg bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200"
      >
        As funcionalidades do seu perfil ainda estão em desenvolvimento.
      </p>

    </main>
  </div>
</template>
