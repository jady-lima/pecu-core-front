import { http } from '@/services/http'
import type { Animal } from '@/types/animal'

export const animalService = {
  listAll() {
    return http.get<Animal[]>('/animais')
  },

  getById(id: number) {
    return http.get<Animal>(`/animais/${id}`)
  },

  create(animal: Omit<Animal, 'id' | 'status'>) {
    return http.post<Animal>('/animais', animal)
  },

  update(id: number, animal: Omit<Animal, 'id' | 'status'>) {
    return http.put<Animal>(`/animais/${id}`, animal)
  },

  delete(id: number) {
    return http.delete(`/animais/${id}`)
  },
}