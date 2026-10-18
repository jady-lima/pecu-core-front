<script setup lang="ts">
import { computed,onMounted,ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PERFIL_LABEL } from '@/types/usuario'
import {listarAlertas,atualizarStatusAlerta,type Alerta,type StatusAlerta} from '@/services/alertaService'

type Secao = 'Administração' | 'Gestão' | 'Manejo' | 'Financeiro' | 'Catálogos'

interface ModuloCard {
  rota: string
  secao: Secao
  icone: string
  titulo: string
  descricao: string
}

interface GrupoModulos {
  titulo: Secao
  modulos: ModuloCard[]
}

const ORDEM_SECOES: Secao[] = ['Administração', 'Gestão', 'Manejo', 'Financeiro', 'Catálogos']

const MODULOS: ModuloCard[] = [
  { 
    rota: 'usuarios', 
    secao: 'Administração', 
    icone: '👤', 
    titulo: 'Usuários', 
    descricao: 'Cadastre, consulte, edite e exclua os usuários do sistema.' 
  },
  { 
    rota: 'propriedades', 
    secao: 'Gestão', 
    icone: '🏠', 
    titulo: 'Propriedades', 
    descricao: 'Consulte e gerencie as propriedades.' 
  },
  { 
    rota: 'lotes', 
    secao: 'Gestão', 
    icone: '📋', 
    titulo: 'Lotes', 
    descricao: 'Consulte os lotes, a ocupação e a meta de GMD de cada um.' 
  },
  { 
    rota: 'animais', 
    secao: 'Gestão', 
    icone: '🐄', 
    titulo: 'Animais', 
    descricao: 'Consulte os animais e abra a ficha de cada um.' 
  },
  { 
    rota: 'pesagens', 
    secao: 'Manejo', 
    icone: '⚖️', 
    titulo: 'Pesagens', 
    descricao: 'Registre e consulte pesagens.' 
  },
  { 
    rota: 'alimentacoes', 
    secao: 'Manejo', 
    icone: '🌾', 
    titulo: 'Alimentação', 
    descricao: 'Registre a alimentação por animal ou por lote.' 
  },
  { 
    rota: 'vacinacoes', 
    secao: 'Manejo', 
    icone: '💉', 
    titulo: 'Vacinação', 
    descricao: 'Registre vacinas e acompanhe próximas doses e carência.' 
  },
  { 
    rota: 'medicamentos', 
    secao: 'Manejo', 
    icone: '💊', 
    titulo: 'Medicamentos', 
    descricao: 'Registre tratamentos e acompanhe o período de carência.' 
  },
  { 
    rota: 'desempenho', 
    secao: 'Manejo', 
    icone: '📊', 
    titulo: 'Desempenho', 
    descricao: 'Acompanhe a evolução e o desempenho zootécnico.' 
  },
  { 
    rota: 'custos', 
    secao: 'Financeiro', 
    icone: '💰', 
    titulo: 'Custos', 
    descricao: 'Acompanhe os gastos e lance custos manuais.' 
  },
  { 
    rota: 'vacinas', 
    secao: 'Catálogos', 
    icone: '💉', 
    titulo: 'Vacinas', 
    descricao: 'Cadastre as vacinas usadas nos registros de vacinação.' 
  },
  { 
    rota: 'metas-desempenho', 
    secao: 'Catálogos', 
    icone: '🎯', 
    titulo: 'Metas de desempenho', 
    descricao: 'Defina o GMD esperado para cada finalidade de lote.' 
  },
]

const auth = useAuthStore()
const router = useRouter()

function perfilPodeAcessar(rota: string): boolean {
  const roles = router.resolve({ name: rota }).meta.roles
  return !roles || (auth.perfil !== null && roles.includes(auth.perfil))
}

const subtitulo = computed(() => {
  if (auth.isAdmin) return 'Painel administrativo'
  if (auth.isProdutor) return 'Área do produtor'
  if (auth.isVeterinario) return 'Área do veterinário'
  return auth.perfil ? `Área do ${PERFIL_LABEL[auth.perfil].toLowerCase()}` : ''
})

const boasVindas = computed(() => {
  if (auth.isAdmin) return 'Bem-vindo ao painel administrativo do PecuCore.'
  if (auth.isProdutor) return 'Gerencie suas propriedades e acompanhe seus animais.'
  if (auth.isVeterinario) return 'Acompanhe e registre o manejo sanitário dos animais das propriedades em que você atende.'
  return 'Bem-vindo ao PecuCore.'
})

const grupos = computed<GrupoModulos[]>(() =>
  ORDEM_SECOES
    .map((secao) => ({
      titulo: secao,
      modulos: MODULOS.filter((modulo) => modulo.secao === secao && perfilPodeAcessar(modulo.rota)),
    }))
    .filter((grupo) => grupo.modulos.length > 0),
)

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

const mostrarAlertas = ref(false)
const alertas = ref<Alerta[]>([])
const carregandoAlertas = ref(false)
const erroAlertas = ref('')

const quantidadeAlertas = computed(() =>
  alertas.value.filter(
    (alerta) =>
      alerta.status === 'ABERTO' ||
      alerta.status === 'EM_ANALISE',
  ).length,
)

async function carregarAlertas() {
  carregandoAlertas.value = true
  erroAlertas.value = ''

  try {
    alertas.value = await listarAlertas()
  } catch (erro) {
    erroAlertas.value = 'Não foi possível carregar os alertas.'
    console.error(erro)
  } finally {
    carregandoAlertas.value = false
  }
}

async function abrirAlertas() {
  mostrarAlertas.value = !mostrarAlertas.value

  if (mostrarAlertas.value) {
    await carregarAlertas()
  }
}

async function marcarEmAnalise(alerta: Alerta) {
  try {
    const atualizado = await atualizarStatusAlerta(
      alerta.id,
      'EM_ANALISE',
    )

    const indice = alertas.value.findIndex(
      (item) => item.id === alerta.id,
    )

    if (indice !== -1) {
      alertas.value[indice] = atualizado
    }
  } catch (erro) {
    erroAlertas.value = 'Erro ao atualizar o status do alerta.'
    console.error(erro)
  }
}

async function alterarStatus(
  alerta: Alerta,
  status: StatusAlerta,
) {
  try {
    const atualizado = await atualizarStatusAlerta(
      alerta.id,
      status,
    )

    const indice = alertas.value.findIndex(
      (item) => item.id === alerta.id,
    )

    if (indice !== -1) {
      alertas.value[indice] = atualizado
    }
  } catch (erro) {
    erroAlertas.value = 'Erro ao atualizar o status do alerta.'
    console.error(erro)
  }
}

onMounted(carregarAlertas)

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

        <div class="flex gap-2">
        <!-- Sino de alertas -->
        <div class="relative">
          <button
            type="button"
            @click="abrirAlertas"
            class="relative rounded-md border border-slate-300 bg-white px-3 py-2 text-lg hover:bg-slate-100"
            title="Alertas"
            aria-label="Abrir alertas"
          >
            🔔

            <span
              v-if="quantidadeAlertas > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white"
            >
              {{ quantidadeAlertas }}
            </span>
          </button>

          <!-- Painel de alertas -->
          <div
            v-if="mostrarAlertas"
            class="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 max-w-[85vw] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div class="mb-3 flex items-center justify-between">
              <h2 class="font-bold text-slate-900">Alertas do PecuCore</h2>

              <button
                type="button"
                @click="mostrarAlertas = false"
                class="text-xl text-slate-500 hover:text-slate-900"
                aria-label="Fechar alertas"
              >
                ×
              </button>
            </div>

            <p v-if="carregandoAlertas" class="text-sm text-slate-500">
              Carregando alertas...
            </p>

            <p v-else-if="erroAlertas" class="text-sm text-red-600">
              {{ erroAlertas }}

              <button
                type="button"
                @click="carregarAlertas"
                class="ml-1 underline"
              >
                Tentar novamente
              </button>
            </p>

            <p
              v-else-if="alertas.length === 0"
              class="text-sm text-slate-500"
            >
              Nenhum alerta registrado.
            </p>

            <div
              v-for="alerta in alertas"
              :key="alerta.id"
              class="mb-3 rounded-lg border border-slate-200 p-3"
            >
              <div class="flex items-start justify-between gap-2">
                <strong class="text-sm">
                  {{ alerta.tipo.replaceAll('_', ' ') }}
                </strong>

                <span
                  class="text-xs font-bold"
                  :class="{
                    'text-red-600': alerta.severidade === 'ALTA',
                    'text-amber-600': alerta.severidade === 'MEDIA',
                    'text-slate-600': alerta.severidade === 'BAIXA',
                  }"
                >
                  {{ alerta.severidade }}
                </span>
              </div>

              <p class="mt-2 text-sm text-slate-600">
                {{ alerta.mensagem }}
              </p>

              <p class="mt-2 text-xs text-slate-500">
                Status: {{ alerta.status.replaceAll('_', ' ') }}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                Criado em:
                {{ new Date(alerta.dataCriacao).toLocaleString('pt-BR') }}
              </p>

              <div
                v-if="alerta.status === 'ABERTO' || alerta.status === 'EM_ANALISE'"
                class="mt-3 flex flex-wrap gap-2"
              >
                <button
                  v-if="alerta.status === 'ABERTO'"
                  type="button"
                  @click="marcarEmAnalise(alerta)"
                  class="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Marcar em análise
                </button>

                <button
                  type="button"
                  @click="alterarStatus(alerta, 'RESOLVIDO')"
                  class="rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Resolver
                </button>

                <button
                  type="button"
                  @click="alterarStatus(alerta, 'IGNORADO')"
                  class="rounded bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Ignorar
                </button>
              </div>
            </div>
          </div>
        </div>
          <RouterLink
            :to="{ name: 'perfil' }"
            class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Meu perfil
          </RouterLink>

          <button
            @click="sair"
            class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Sair
          </button>
        </div>
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
