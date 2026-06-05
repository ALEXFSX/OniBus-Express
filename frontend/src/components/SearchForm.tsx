import { useState, useEffect, type FormEvent } from 'react'
import { rotasService } from '../services/api'
import type { Rota } from '../types/rota'

interface SearchFields {
  origin: string
  destination: string
  departureDate: string
  duracaoEstimadaMinutos: number
}

interface SearchFormProps {
  onSearch: (fields: SearchFields) => void
  isLoading?: boolean
}

export default function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [rotas, setRotas] = useState<Rota[]>([])
  const [loadingRotas, setLoadingRotas] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [errors, setErrors] = useState<Partial<SearchFields>>({})

  useEffect(() => {
    const abortController = new AbortController()
    setLoadError(null)

    rotasService
      .listar(abortController.signal)
      .then(data => {
        setRotas(data)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setLoadError('Nao foi possivel carregar origens e destinos.')
      })
      .finally(() => setLoadingRotas(false))

    return () => {
      abortController.abort()
    }
  }, [])

  const origins = [...new Set(rotas.map(r => r.origem))].sort()
  const destinations = [...new Set(rotas.map(r => r.destino))].sort()

  function validate(): boolean {
    const next: Partial<SearchFields> = {}
    if (!origin) next.origin = 'Selecione uma origem.'
    if (!destination) next.destination = 'Selecione um destino.'
    if (!departureDate) next.departureDate = 'Selecione a data de ida.'
    if (origin && destination && origin === destination)
      next.destination = 'Origem e destino devem ser diferentes.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const rota = rotas.find(r => r.origem === origin && r.destino === destination)
    onSearch({ origin, destination, departureDate, duracaoEstimadaMinutos: rota?.duracaoEstimadaMinutos ?? 0 })
  }

  const inputClass =
    'h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-text-main shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

  const labelClass = 'mb-1.5 block text-sm font-bold text-text-main'

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-border bg-white p-6 shadow-[0_16px_32px_rgba(7,20,38,0.08)]"
      >
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Origem */}
          <div className="relative">
            <label htmlFor="origin" className={labelClass}>Origem</label>
            <select
              id="origin"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              disabled={loadingRotas || !!loadError}
              className={inputClass}
            >
              <option value="">{loadingRotas ? 'Carregando...' : 'Selecione'}</option>
              {origins.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.origin && (
              <p className="absolute left-0 top-full mt-0.5 text-xs text-red-500">{errors.origin}</p>
            )}
          </div>

          {/* Destino */}
          <div className="relative">
            <label htmlFor="destination" className={labelClass}>Destino</label>
            <select
              id="destination"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              disabled={loadingRotas || !!loadError}
              className={inputClass}
            >
              <option value="">{loadingRotas ? 'Carregando...' : 'Selecione'}</option>
              {destinations.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.destination && (
              <p className="absolute left-0 top-full mt-0.5 text-xs text-red-500">{errors.destination}</p>
            )}
          </div>

          {/* Data de ida */}
          <div className="relative">
            <label htmlFor="departureDate" className={labelClass}>Data de ida</label>
            <input
              id="departureDate"
              type="date"
              value={departureDate}
              onChange={e => setDepartureDate(e.target.value)}
              className={inputClass}
            />
            {errors.departureDate && (
              <p className="absolute left-0 top-full mt-0.5 text-xs text-red-500">{errors.departureDate}</p>
            )}
          </div>

          {/* Botão */}
          <div>
            <button
              type="submit"
              disabled={isLoading || loadingRotas || !!loadError}
              aria-label="Buscar passagens de ônibus"
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-[0_4px_8px_rgba(7,87,168,0.24)] transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3a6 6 0 1 0 3.768 10.674l3.279 3.279a1 1 0 0 0 1.414-1.414l-3.279-3.279A6 6 0 0 0 9 3Zm-4 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd"/>
                </svg>
              )}
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
        {loadError && <p className="mt-3 text-sm text-text-main">{loadError}</p>}
      </form>
    </div>
  )
}
