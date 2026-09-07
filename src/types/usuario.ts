export interface Usuario {
  id: number | string
  username?: string
  nome?: string
  email?: string
  role?: string
  [key: string]: unknown
}
