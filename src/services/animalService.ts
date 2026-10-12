import { http } from '@/services/http'
import type { Animal, AnimalPayload, StatusAnimal } from '@/types/animal'

export const animalService = {
  listAll() {
    return http.get<Animal[]>('/animais')
  },

  getById(id: number | string) {
    return http.get<Animal>(`/animais/${id}`)
  },

  create(payload: AnimalPayload) {
    return http.post<Animal>('/animais', payload)
  },

  update(id: number | string, payload: AnimalPayload) {
    return http.put<Animal>(`/animais/${id}`, payload)
  },

  updateStatus(id: number | string, status: StatusAnimal) {
    return http.put<Animal>(`/animais/${id}/status`, { status })
  },
}
