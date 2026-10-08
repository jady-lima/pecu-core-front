export type Perfil = 'ADMIN' | 'PRODUTOR' | 'VETERINARIO'

export interface Usuario {
  id: number
  nome: string
  username: string
  perfil: Perfil
  dataCriacao: string
}