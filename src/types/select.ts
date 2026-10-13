export interface OpcaoSelect<V extends string | number = number> {
  value: V
  label: string
  detalhe?: string
}
