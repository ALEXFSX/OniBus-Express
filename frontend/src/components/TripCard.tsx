import type { Viagem } from '../types/viagem'

interface TripCardProps {
  viagem: Viagem
  duracaoEstimadaMinutos: number
  onSelect: (viagem: Viagem) => void
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}



export default function TripCard({ viagem, duracaoEstimadaMinutos, onSelect }: TripCardProps) {
  const departure = new Date(viagem.dataHoraPartidaUtc)
  const arrival = new Date(departure.getTime() + duracaoEstimadaMinutos * 60_000)

  return (
    <article
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all w-full  bg-white pb-4.5"
      aria-label={`Viagem de ${viagem.origem} para ${viagem.destino}, saída às ${formatTime(departure)}, chegada às ${formatTime(arrival)}, preço ${formatPrice(viagem.precoBase)}`}
    >
      {/* Main content */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-4 lg:grid-cols-[auto_1fr_auto_1fr_auto]">

        {/* Departure */}
        <div>
          <p className="text-[28px] font-extrabold leading-none text-text-main">
            {formatTime(departure)}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-[15px] text-text-muted">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin size-3.5" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {viagem.origem}
          </p>
        </div>

        {/* Duration */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" d="M12 6v6l4 2"/>
            </svg>
            {formatDuration(duracaoEstimadaMinutos)}
          </p>
          <div className="relative flex w-full items-center max-w-2xs">
            <div className="h-px flex-1 bg-[#AAB4C0]" />
            <svg className="ml-0.5 h-3 w-3 text-[#AAB4C0]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.293 5.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L17.586 13H4a1 1 0 1 1 0-2h13.586l-4.293-4.293a1 1 0 0 1 0-1.414Z"/>
            </svg>
          </div>
          {/* <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Direto
          </p> */}
        </div>

        {/* Arrival */}
        <div>
          <p className="text-[28px] font-extrabold leading-none text-text-main">
            {formatTime(arrival)}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-[15px] text-text-muted">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin size-3.5" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {viagem.destino}
          </p>
        </div>

        {/* Spacer */}
        <div className="hidden h-full lg:relative lg:block after:absolute after:left-1/2 after:block after:h-full after:w-px after:-translate-x-1/2 after:bg-slate-200" />

        {/* Price + action */}
        <div className="col-span-full flex flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4 lg:col-auto lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
          <p className="text-[28px] font-extrabold leading-none text-primary">
            {formatPrice(viagem.precoBase)}
          </p>
      
          <button
            onClick={() => onSelect(viagem)}
            className="mt-3 cursor-pointer rounded-lg bg-primary px-5 py-2.75 text-sm font-bold text-white transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 w-auto"
          >
            Selecionar
          </button>
        </div>
      </div>

      {/* Footer metadata */}
      <div className="mt-4 flex  justify-between w-full items-center gap-2 border-t border-dashed border-slate-200 pt-3.5 text-sm text-text-muted">
      <div className='flex items-center'>

        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span className='ml-1.5'>{formatDate(departure)}</span>

      </div>

            <p className="flex items-center gap-1.5 text-[13px] text-text-muted">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {viagem.assentosDisponiveis} vagas restantes
          </p>
      </div>
    </article>
  )
}
