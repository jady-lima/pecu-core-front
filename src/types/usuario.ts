export type Perfil = 'ADMIN' | 'PRODUTOR' | 'VETERINARIO'

export interface Usuario {
  id: number | string
  username?: string
  nome?: string
  email?: string
  role?: string
  perfil?: Perfil
  dataCriacao?: string
  [key: string]: unknown
}

export interface NovoUsuarioPayload {
  nome: string
  username: string
  senha: string
  perfil: Perfil
}
