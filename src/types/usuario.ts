export type Perfil = 'ADMIN' | 'PRODUTOR' | 'VETERINARIO'

export const PERFIL_LABEL: Record<Perfil, string> = {
  ADMIN: 'Administrador',
  PRODUTOR: 'Produtor',
  VETERINARIO: 'Veterinário',
}

export interface Usuario {
  id: number
  nome: string
  username: string
  perfil: Perfil
  dataCriacao: string
}

export interface NovoUsuarioPayload {
  nome: string
  username: string
  senha: string
  perfil: Perfil
}

export interface AtualizarUsuarioPayload {
  nome: string
  username: string
  senha?: string
  perfil: Perfil
}
