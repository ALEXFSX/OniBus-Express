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
import CheckoutPage from './pages/CheckoutPage'
import ReservationDetailsPage from './pages/ReservationDetailsPage'

interface SearchState {
  viagens: Viagem[]
  origem: string
  destino: string
  departureDate: string
  duracaoEstimadaMinutos: number
}

interface CheckoutSelectionState {
  tripId: string
  seatNumber: number
}

function getSeatSelectionTripId(pathname: string) {
  const match = pathname.match(/^\/viagem\/([^/]+)\/assento$/)

  return match?.[1] ?? null
}

function getCheckoutTripId(pathname: string) {
  const match = pathname.match(/^\/viagem\/([^/]+)\/checkout$/)

  return match?.[1] ?? null
}

function getTripShortcutCode(pathname: string) {
  const match = pathname.match(/^\/([a-zA-Z]{4}\d{8})$/)

  return match?.[1]?.toUpperCase() ?? null
}

function getReservationCode(pathname: string) {
  const match = pathname.match(/^\/reserva\/([^/]+)$/)

  return match?.[1]?.toUpperCase() ?? null
}

function isBookingLookupPath(pathname: string) {
  return pathname === '/minha-reserva'
}

function App() {
  const [searchResult, setSearchResult] = useState<SearchState | null>(null)
  const [checkoutSelection, setCheckoutSelection] = useState<CheckoutSelectionState | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const syncLocation = () => {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', syncLocation)

    return () => {
      window.removeEventListener('popstate', syncLocation)
    }
  }, [])

  function navigate(path: string, options: { replace?: boolean } = {}) {
    if (options.replace) {
      window.history.replaceState({}, '', path)
    } else {
      window.history.pushState({}, '', path)
    }

    setPathname(window.location.pathname)
  }

  const tripShortcutCode = getTripShortcutCode(pathname)
  const seatSelectionTripId = getSeatSelectionTripId(pathname)
  const checkoutTripId = getCheckoutTripId(pathname)
  const reservationCode = getReservationCode(pathname)
  const bookingLookupPath = isBookingLookupPath(pathname)

  useEffect(() => {
    if (!tripShortcutCode) {
      return
    }

    navigate(`/viagem/${tripShortcutCode}/assento`, { replace: true })
  }, [tripShortcutCode])

  useEffect(() => {
    if (!checkoutTripId) {
      return
    }

    if (!checkoutSelection || checkoutSelection.tripId !== checkoutTripId) {
      navigate(`/viagem/${checkoutTripId}/assento`, { replace: true })
    }
  }, [checkoutSelection, checkoutTripId])

  if (seatSelectionTripId) {
    return (
      <SeatSelectionPage
        tripId={seatSelectionTripId}
        onBackToSearch={() => navigate('/')}
        onContinueToCheckout={seatNumber => {
          setCheckoutSelection({ tripId: seatSelectionTripId, seatNumber })
          navigate(`/viagem/${seatSelectionTripId}/checkout`)
        }}
      />
    )
  }

  if (checkoutTripId && checkoutSelection && checkoutSelection.tripId === checkoutTripId) {
    return (
      <CheckoutPage
        tripId={checkoutSelection.tripId}
        seatNumber={checkoutSelection.seatNumber}
        onBackToSeatSelection={() => navigate(`/viagem/${checkoutSelection.tripId}/assento`)}
        onBuyAnotherTicket={() => {
          setCheckoutSelection(null)
          navigate('/')
        }}
        onViewBooking={bookingCode => navigate(`/reserva/${bookingCode}`)}
      />
    )
  }

  if (reservationCode) {
    return (
      <ReservationDetailsPage
        initialBookingCode={reservationCode}
        onBackToSearch={() => navigate('/')}
      />
    )
  }

  if (bookingLookupPath) {
    return (
      <ReservationDetailsPage
        onBackToSearch={() => navigate('/')}
      />
    )
  }

  if (checkoutTripId) {
    return null
  }

  async function handleSearch(fields: { origin: string; destination: string; departureDate: string; duracaoEstimadaMinutos: number }) {
    setLoading(true)
    setSearchError(null)
    try {
      const viagens = await viagensService.buscar({
        origem: fields.origin,
        destino: fields.destination,
        data: fields.departureDate,
      })
      setSearchResult({
        viagens,
        origem: fields.origin,
        destino: fields.destination,
        departureDate: fields.departureDate,
        duracaoEstimadaMinutos: fields.duracaoEstimadaMinutos,
      })
    } catch {
      setSearchResult(null)
      setSearchError('Nao foi possivel buscar viagens agora. Tente novamente.')
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
        {searchError && (
          <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
            <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-text-main">
              {searchError}
            </div>
          </section>
        )}
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
            selectedDate={searchResult.departureDate}
            duracaoEstimadaMinutos={searchResult.duracaoEstimadaMinutos}
            onSelectTrip={tripId => navigate(`/viagem/${tripId}/assento`)}
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

