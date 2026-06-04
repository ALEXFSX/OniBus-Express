import { useEffect, useState } from 'react'
import './index.css'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchForm from './components/SearchForm'
import Benefits from './components/Benefits'
import TripResults from './components/TripResults'
import TripCardSkeleton from './components/TripCardSkeleton'
import Footer from './components/Footer'
import { viagensService } from './services/api'
import type { Viagem } from './types/viagem'
import SeatSelectionPage from './pages/SeatSelectionPage'

interface SearchState {
  viagens: Viagem[]
  origem: string
  destino: string
  duracaoEstimadaMinutos: number
}

interface NavigationState {
  tripId?: string
}

function App() {
  const [searchResult, setSearchResult] = useState<SearchState | null>(null)
  const [loading, setLoading] = useState(false)
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [navigationState, setNavigationState] = useState<NavigationState | null>(() => window.history.state)

  useEffect(() => {
    const syncLocation = () => {
      setPathname(window.location.pathname)
      setNavigationState(window.history.state)
    }

    window.addEventListener('popstate', syncLocation)

    return () => {
      window.removeEventListener('popstate', syncLocation)
    }
  }, [])

  function navigate(path: string, state: NavigationState = {}) {
    window.history.pushState(state, '', path)
    setPathname(window.location.pathname)
    setNavigationState(window.history.state)
  }

  const seatSelectionTripId = pathname === '/reserva/assento' ? navigationState?.tripId ?? null : null

  useEffect(() => {
    if (pathname === '/reserva/assento' && !seatSelectionTripId) {
      navigate('/')
    }
  }, [pathname, seatSelectionTripId])

  if (seatSelectionTripId) {
    return <SeatSelectionPage tripId={seatSelectionTripId} onBackToSearch={() => navigate('/')} />
  }

  if (pathname === '/reserva/assento') {
    return null
  }

  async function handleSearch(fields: { origin: string; destination: string; departureDate: string; duracaoEstimadaMinutos: number }) {
    setLoading(true)
    try {
      const viagens = await viagensService.buscar({ origem: fields.origin, destino: fields.destination })
      setSearchResult({ viagens, origem: fields.origin, destino: fields.destination, duracaoEstimadaMinutos: fields.duracaoEstimadaMinutos })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />
      <main className="flex-1 bg-linear-to-r from-blue-100 to-slate-50">
        <Hero />
        <SearchForm onSearch={handleSearch} isLoading={loading} />
        {loading ? (
          <section className="mx-auto w-full max-w-7xl px-4 pt-10 pb-16 sm:px-6">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          </section>
        ) : searchResult ? (
          <TripResults
            viagens={searchResult.viagens}
            origem={searchResult.origem}
            destino={searchResult.destino}
            duracaoEstimadaMinutos={searchResult.duracaoEstimadaMinutos}
            onSelectTrip={viagem => navigate('/reserva/assento', { tripId: viagem.id })}
          />
        ) : (
          <Benefits />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App

