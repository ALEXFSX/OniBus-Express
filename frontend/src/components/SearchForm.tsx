import { useState, useEffect, type FormEvent } from 'react'
import { rotasService } from '../services/api'
import type { Rota } from '../types/rota'

interface SearchFields {
  origin: string
  destination: string
  departureDate: string
}

interface SearchFormProps {
  onSearch: (fields: SearchFields) => void
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [rotas, setRotas] = useState<Rota[]>([])
  const [loadingRotas, setLoadingRotas] = useState(true)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [errors, setErrors] = useState<Partial<SearchFields>>({})

  useEffect(() => {
    rotasService
      .listar()
      .then(setRotas)
      .finally(() => setLoadingRotas(false))
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
    if (validate()) onSearch({ origin, destination, departureDate })
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
          <div>
            <label htmlFor="origin" className={labelClass}>Origem</label>
            <select
              id="origin"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              disabled={loadingRotas}
              className={inputClass}
            >
              <option value="">{loadingRotas ? 'Carregando...' : 'Selecione'}</option>
              {origins.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.origin && (
              <p className="mt-1 text-xs text-red-500">{errors.origin}</p>
            )}
          </div>

          {/* Destino */}
          <div>
            <label htmlFor="destination" className={labelClass}>Destino</label>
            <select
              id="destination"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              disabled={loadingRotas}
              className={inputClass}
            >
              <option value="">{loadingRotas ? 'Carregando...' : 'Selecione'}</option>
              {destinations.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.destination && (
              <p className="mt-1 text-xs text-red-500">{errors.destination}</p>
            )}
          </div>

          {/* Data de ida */}
          <div>
            <label htmlFor="departureDate" className={labelClass}>Data de ida</label>
            <input
              id="departureDate"
              type="date"
              value={departureDate}
              onChange={e => setDepartureDate(e.target.value)}
              className={inputClass}
            />
            {errors.departureDate && (
              <p className="mt-1 text-xs text-red-500">{errors.departureDate}</p>
            )}
          </div>

          {/* Botão */}
          <div>
            <button
              type="submit"
              aria-label="Buscar passagens de ônibus"
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-[0_4px_8px_rgba(7,87,168,0.24)] transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3a6 6 0 1 0 3.768 10.674l3.279 3.279a1 1 0 0 0 1.414-1.414l-3.279-3.279A6 6 0 0 0 9 3Zm-4 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd"/>
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
