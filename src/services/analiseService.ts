import { http } from '@/services/http'
import type { AnaliseIA } from '@/types/analiseIA'

export const analiseService = {
  listByAnimal(animalId: number) {
    return http.get<AnaliseIA[]>(`/analises/animal/${animalId}`)
  },

  getById(id: number) {
    return http.get<AnaliseIA>(`/analises/${id}`)
  },

  gerarIndividual(animalId: number) {
    return http.post<AnaliseIA>(`/analises/animal/${animalId}`)
  },
}
