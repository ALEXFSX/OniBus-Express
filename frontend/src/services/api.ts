import type { Rota } from '../types/rota'
import type { Viagem } from '../types/viagem'
import type { ViagemDetalhe } from '../types/viagemDetalhe'

// Em produção, defina VITE_API_URL com a URL completa do backend.
// Em desenvolvimento o proxy do Vite encaminha /api → localhost:8080.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  status: number
  path: string

  constructor(path: string, status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  query?: Record<string, string | number | undefined>
  body?: unknown
  signal?: AbortSignal
}

function buildPath(path: string, query?: RequestOptions['query']) {
  if (!query) return path

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const fullPath = buildPath(path, options.query)
  const response = await fetch(`${BASE_URL}${fullPath}`, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (!response.ok) {
    throw new ApiError(fullPath, response.status, `Erro ao buscar ${fullPath}: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const rotasService = {
  listar: (signal?: AbortSignal) => request<Rota[]>('/rotas', { signal }),
}

interface BuscarViagensParams {
  origem: string
  destino: string
  data?: string
}

export const viagensService = {
  buscar: ({ origem, destino, data }: BuscarViagensParams, signal?: AbortSignal) =>
    request<Viagem[]>('/viagens', {
      query: { origem, destino, data },
      signal,
    }),
  buscarPorId: (tripId: string, signal?: AbortSignal) =>
    request<ViagemDetalhe>(`/viagens/${tripId.trim().toUpperCase()}`, { signal }),
}
