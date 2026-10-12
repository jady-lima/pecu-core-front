import type { Usuario } from '@/types/usuario'

export interface LoginCredentials {
  username: string
  senha: string
}

export interface LoginResponse {
  token: string
}

export type UsuarioLogado = Usuario
