<template>
  <div ref="raiz" class="relative">
    <div class="relative">
      <input
        ref="campo"
        type="text"
        role="combobox"
        autocomplete="off"
        :id="id"
        :aria-expanded="aberto"
        :aria-controls="`${idBase}-lista`"
        :aria-activedescendant="aberto && indiceAtivo >= 0 ? `${idBase}-opcao-${indiceAtivo}` : undefined"
        :placeholder="selecionada ? selecionada.label : placeholder"
        :disabled="disabled"
        :value="aberto ? termo : selecionada?.label ?? ''"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-16 text-sm placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
        :class="aberto && selecionada ? 'placeholder:text-slate-500' : ''"
        @focus="abrir"
        @click="abrir"
        @input="aoDigitar"
        @keydown.down.prevent="mover(1)"
        @keydown.up.prevent="mover(-1)"
        @keydown.enter.prevent="confirmarAtiva"
        @keydown.esc="fechar"
        @keydown.tab="fechar"
      />

      <div class="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
        <button
          v-if="selecionada && !disabled"
          type="button"
          aria-label="Limpar seleção"
          class="rounded px-1 text-lg leading-none text-slate-400 hover:text-slate-700"
          @mousedown.prevent
          @click="limpar"
        >
          ×
        </button>

        <span class="pointer-events-none text-xs text-slate-400">▾</span>
      </div>
    </div>

    <ul
      v-if="aberto"
      :id="`${idBase}-lista`"
      role="listbox"
      class="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-slate-200"
    >
      <li
        v-for="(opcao, indice) in filtradas"
        :id="`${idBase}-opcao-${indice}`"
        :key="String(opcao.value)"
        role="option"
        :aria-selected="opcao.value === modelValue"
        class="cursor-pointer px-3 py-2"
        :class="[
          indice === indiceAtivo ? 'bg-slate-100' : '',
          opcao.value === modelValue ? 'font-medium text-slate-900' : 'text-slate-700',
        ]"
        @mousedown.prevent
        @mouseenter="indiceAtivo = indice"
        @click="selecionar(opcao)"
      >
        {{ opcao.label }}
        <span v-if="opcao.detalhe" class="ml-1 text-xs text-slate-500">{{ opcao.detalhe }}</span>
      </li>

      <li v-if="filtradas.length === 0" class="px-3 py-2 text-slate-500">
        {{ textoVazio }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import type { OpcaoSelect } from '@/types/select'

const props = withDefaults(
  defineProps<{
    modelValue: T | null
    options: OpcaoSelect<T>[]
    placeholder?: string
    textoVazio?: string
    disabled?: boolean
    id?: string
  }>(),
  {
    placeholder: 'Digite para buscar',
    textoVazio: 'Nenhum resultado encontrado.',
    disabled: false,
    id: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [valor: T | null]
  change: [valor: T | null]
}>()

const idBase = useId()
const raiz = ref<HTMLElement | null>(null)
const campo = ref<HTMLInputElement | null>(null)
const aberto = ref(false)
const termo = ref('')
const indiceAtivo = ref(-1)

const selecionada = computed(
  () => props.options.find((opcao) => opcao.value === props.modelValue) ?? null,
)

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

const filtradas = computed(() => {
  const busca = normalizar(termo.value)

  if (!busca) {
    return props.options
  }

  return props.options.filter((opcao) =>
    normalizar(`${opcao.label} ${opcao.detalhe ?? ''}`).includes(busca),
  )
})

function abrir() {
  if (props.disabled || aberto.value) {
    return
  }

  aberto.value = true
  termo.value = ''
  indiceAtivo.value = filtradas.value.findIndex((opcao) => opcao.value === props.modelValue)
}

function fechar() {
  aberto.value = false
  termo.value = ''
  indiceAtivo.value = -1
}

function aoDigitar(evento: Event) {
  termo.value = (evento.target as HTMLInputElement).value
  aberto.value = true
  indiceAtivo.value = filtradas.value.length > 0 ? 0 : -1
}

function mover(direcao: number) {
  if (!aberto.value) {
    abrir()
    return
  }

  const total = filtradas.value.length

  if (total === 0) {
    return
  }

  indiceAtivo.value = (indiceAtivo.value + direcao + total) % total
}

function selecionar(opcao: OpcaoSelect<T>) {
  emit('update:modelValue', opcao.value)
  emit('change', opcao.value)
  fechar()
  campo.value?.blur()
}

function confirmarAtiva() {
  const opcao = filtradas.value[indiceAtivo.value]

  if (aberto.value && opcao) {
    selecionar(opcao)
  }
}

function limpar() {
  emit('update:modelValue', null)
  emit('change', null)
  fechar()
}

function cliqueFora(evento: MouseEvent) {
  if (aberto.value && raiz.value && !raiz.value.contains(evento.target as Node)) {
    fechar()
  }
}

onMounted(() => document.addEventListener('mousedown', cliqueFora))
onBeforeUnmount(() => document.removeEventListener('mousedown', cliqueFora))
</script>
