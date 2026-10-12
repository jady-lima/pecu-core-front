<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <h1 class="text-lg font-semibold text-slate-900">PecuCore</h1>

      <RouterLink
        to="/"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Voltar para Home
      </RouterLink>
    </header>

    <main class="p-6">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-slate-900">
          Desempenho
        </h2>

        <p class="mt-1 text-sm text-slate-600">
          Acompanhe a evolução do peso e o desempenho zootécnico dos seus animais.
        </p>
      </div>

      <section class="mb-6">
        <h3 class="mb-3 text-lg font-semibold text-slate-900">
          Visão geral
        </h3>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div class="mb-3 flex items-center gap-3">
              <span class="text-2xl">⚖️</span>

              <h4 class="text-sm font-medium text-slate-600">
                Ganho médio diário
              </h4>
            </div>

            <p class="text-2xl font-semibold text-slate-900">
              —
            </p>

            <p class="mt-2 text-sm text-slate-500">
              Medido em kg por dia.
            </p>
          </div>

          <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div class="mb-3 flex items-center gap-3">
              <span class="text-2xl">🐄</span>

              <h4 class="text-sm font-medium text-slate-600">
                Animais acompanhados
              </h4>
            </div>

            <p class="text-2xl font-semibold text-slate-900">
              —
            </p>

            <p class="mt-2 text-sm text-slate-500">
              Animais com histórico de pesagens.
            </p>
          </div>

          <div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div class="mb-3 flex items-center gap-3">
              <span class="text-2xl">📊</span>

              <h4 class="text-sm font-medium text-slate-600">
                Evolução do peso
              </h4>
            </div>

            <p class="text-2xl font-semibold text-slate-900">
              —
            </p>

            <p class="mt-2 text-sm text-slate-500">
              Variação entre pesagens.
            </p>
          </div>
        </div>
      </section>

      <section class="mb-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 class="text-lg font-semibold text-slate-900">
          Evolução do peso
        </h3>

        <p class="mt-1 text-sm text-slate-600">
          Acompanhe as alterações de peso dos animais ao longo do tempo.
        </p>

        <div class="mt-5 flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
          <span class="mb-3 text-4xl">📈</span>

          <h4 class="font-medium text-slate-800">
            Histórico de evolução
          </h4>

          <p class="mt-2 max-w-lg text-sm text-slate-500">
            O gráfico será exibido após a integração com os dados de pesagem e os cálculos de desempenho.
          </p>
        </div>
      </section>

      <section class="mb-6 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 class="text-lg font-semibold text-slate-900">
          Indicadores de desempenho
        </h3>

        <p class="mt-1 text-sm text-slate-600">
          Informações para ajudar a acompanhar o desenvolvimento do rebanho.
        </p>

        <div class="mt-4 divide-y divide-slate-200">
          <div class="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-medium text-slate-800">
                Ganho médio diário (GMD)
              </p>

              <p class="mt-1 text-sm text-slate-500">
                Média de ganho ou perda de peso por dia.
              </p>
            </div>

            <span class="text-sm text-slate-500">
              Aguardando integração
            </span>
          </div>

          <div class="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-medium text-slate-800">
                Queda de peso
              </p>

              <p class="mt-1 text-sm text-slate-500">
                Identificação de animais que perderam peso entre pesagens.
              </p>
            </div>

            <span class="text-sm text-slate-500">
              Aguardando integração
            </span>
          </div>

          <div class="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-medium text-slate-800">
                Desempenho por animal
              </p>

              <p class="mt-1 text-sm text-slate-500">
                Comparação dos resultados individuais ao longo do tempo.
              </p>
            </div>

            <span class="text-sm text-slate-500">
              Aguardando integração
            </span>
          </div>
        </div>
      </section>

      <p class="text-sm text-slate-500">
        Os indicadores serão preenchidos com dados reais após a integração das regras de desempenho.
      </p>
    </main>
  </div>
</template>