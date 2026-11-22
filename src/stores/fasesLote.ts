import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loteService } from '@/services/loteService'
import type { FaseLote } from '@/types/lote'

/**
 * Fases do lote da aplicação ativa (bovinos, equinos...), carregadas uma vez de GET /lotes/fases.
 * Se o carregamento falhar, a próxima chamada tenta de novo.
 */
export const useFasesLoteStore = defineStore('fasesLote', () => {
  const fases = ref<FaseLote[]>([])
  let carregamento: Promise<void> | null = null

  function carregarFases(): Promise<void> {
    if (!carregamento) {
      carregamento = loteService
        .listFases()
        .then((dados) => {
          fases.value = dados
        })
        .catch((erro: unknown) => {
          carregamento = null
          throw erro
        })
    }

    return carregamento
  }

  /** Nome da fase para exibir; sem a lista carregada, mostra o próprio código. */
  function descricaoFase(codigo: string) {
    return fases.value.find((fase) => fase.codigo === codigo)?.descricao ?? codigo
  }

  return { fases, carregarFases, descricaoFase }
})