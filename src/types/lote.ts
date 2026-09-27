export type FinalidadeLote =
|"CORTE"
|"RECRIA"
|"ENGORDA"
|"REPRODUCAO"
|"QUARENTENA"
|"DESMAME"

export interface Lote{
    id: number
    numero: number
    finalidade: FinalidadeLote
    capacidade: number
    dataCriacao: string
    propriedadeId: number

    }