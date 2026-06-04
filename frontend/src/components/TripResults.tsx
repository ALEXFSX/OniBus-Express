import type { Viagem } from '../types/viagem'
import TripCard from './TripCard'

interface TripResultsProps {
  viagens: Viagem[]
  origem: string
  destino: string
  duracaoEstimadaMinutos: number
  onSelectTrip: (viagem: Viagem) => void
}

export default function TripResults({ viagens, origem, destino, duracaoEstimadaMinutos, onSelectTrip }: TripResultsProps) {
  const now = new Date()
  const viagensFuturas = viagens.filter(v => new Date(v.dataHoraPartidaUtc) > now)

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-10 pb-16 sm:px-6">
      <p className="mb-6 text-sm font-semibold text-text-muted">
        <span className="font-bold text-text-main">{viagensFuturas.length}</span>{' '}
        {viagensFuturas.length === 1 ? 'viagem encontrada' : 'viagens encontradas'} de{' '}
        <span className="font-bold text-text-main">{origem}</span> para{' '}
        <span className="font-bold text-text-main">{destino}</span>
      </p>

      {viagensFuturas.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white/75 p-8 text-center">
          <p className="font-bold text-text-main">Nenhuma viagem encontrada</p>
          <p className="mt-1 text-text-muted">Tente outra data ou um destino diferente.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {viagensFuturas.map(v => (
            <TripCard
              key={v.id}
              viagem={v}
              duracaoEstimadaMinutos={duracaoEstimadaMinutos}
              onSelect={onSelectTrip}
            />
          ))}
        </div>
      )}
    </section>
  )
}

