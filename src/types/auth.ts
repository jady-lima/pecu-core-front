export interface LoginCredentials {
  username: string
  senha: string
}

export interface LoginResponse {
  token: string
}

export interface UsuarioLogado {
  perfil: string
  [key: string]: unknown
}
