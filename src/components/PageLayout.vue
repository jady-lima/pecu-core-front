<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 class="text-lg font-semibold text-slate-900">
            PecuCore
          </h1>

          <p v-if="subtitulo" class="text-sm text-slate-500">
            {{ subtitulo }}
          </p>
        </div>

        <RouterLink
          :to="voltarPara"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {{ voltarTexto }}
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div
        v-if="titulo"
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <h2 class="text-2xl font-semibold text-slate-900">
          {{ titulo }}
        </h2>

        <div v-if="$slots.acoes" class="shrink-0">
          <slot name="acoes" />
        </div>
      </div>

      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    titulo?: string
    subtitulo?: string
    voltarPara?: RouteLocationRaw
    voltarTexto?: string
  }>(),
  {
    voltarPara: () => ({ name: 'home' }),
    voltarTexto: 'Voltar',
  },
)
</script>
