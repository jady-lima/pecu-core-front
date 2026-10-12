import type { FinalidadeLote } from '@/types/lote'

export interface MetaDesempenho {
  id: number
  fase: FinalidadeLote
  gmdEsperado: number
}

export interface MetaDesempenhoPayload {
  fase: FinalidadeLote
  gmdEsperado: number
}
