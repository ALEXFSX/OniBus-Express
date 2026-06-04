import type { Rota } from '../types/rota'
import type { Viagem } from '../types/viagem'
import type { ViagemDetalhe } from '../types/viagemDetalhe'

// Em produção, defina VITE_API_URL com a URL completa do backend.
// Em desenvolvimento o proxy do Vite encaminha /api → localhost:8080.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Erro ao buscar ${path}: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

export const rotasService = {
  listar: () => get<Rota[]>('/rotas'),
}

interface BuscarViagensParams {
  origem: string
  destino: string
}

export const viagensService = {
  buscar: ({ origem, destino }: BuscarViagensParams) => {
    const params = new URLSearchParams({ origem, destino })
    return get<Viagem[]>(`/viagens?${params.toString()}`)
  },
  buscarPorId: (id: string) => get<ViagemDetalhe>(`/viagens/${id}`),
}
