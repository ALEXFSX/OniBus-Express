import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SeatSelectionCard from "../components/SeatSelectionCard";
import BookingSummaryCard from "../components/BookingSummaryCard";
import { rotasService, viagensService } from "../services/api";
import type { ViagemDetalhe } from "../types/viagemDetalhe";

interface SeatSelectionPageProps {
  tripId: string;
  onBackToSearch: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDuration(minutes: number | null) {
  if (minutes === null) {
    return "—";
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatTripDate(utcIsoDate: string) {
  return new Date(utcIsoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTripTime(utcIsoDate: string) {
  return new Date(utcIsoDate).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default function SeatSelectionPage({ tripId, onBackToSearch }: SeatSelectionPageProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [tripDetail, setTripDetail] = useState<ViagemDetalhe | null>(null);
  const [durationInMinutes, setDurationInMinutes] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    async function loadTripData() {
      setIsLoading(true);
      setErrorMessage(null);
      setSelectedSeat(null);

      try {
        const [detail, routes] = await Promise.all([
          viagensService.buscarPorId(tripId, abortController.signal),
          rotasService.listar(abortController.signal),
        ]);

        if (!isActive) {
          return;
        }

        const matchedRoute = routes.find(
          route =>
            route.origem.toLowerCase() === detail.origem.toLowerCase() &&
            route.destino.toLowerCase() === detail.destino.toLowerCase(),
        );

        setTripDetail(detail);
        setDurationInMinutes(matchedRoute?.duracaoEstimadaMinutos ?? null);

        if (new Date(detail.dataHoraPartidaUtc) < new Date()) {
          setErrorMessage("Esta viagem nao esta mais disponivel para reserva.");
        }
      } catch {
        if (!isActive) {
          return;
        }

        setErrorMessage("Nao foi possivel carregar os dados da viagem. Tente novamente.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadTripData();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [tripId]);

  const tripData = useMemo(() => {
    if (!tripDetail) {
      return null;
    }

    return {
      route: `${tripDetail.origem} → ${tripDetail.destino}`,
      date: formatTripDate(tripDetail.dataHoraPartidaUtc),
      departureTime: formatTripTime(tripDetail.dataHoraPartidaUtc),
      duration: formatDuration(durationInMinutes),
      price: formatCurrency(tripDetail.precoBase),
    };
  }, [durationInMinutes, tripDetail]);

  const occupiedSeats = tripDetail?.assentosOcupados ?? [];
  const totalSeats = tripDetail?.totalAssentos ?? 0;

  const handleContinue = () => {
    if (selectedSeat !== null) {
      console.log(`Prosseguindo com assento: ${selectedSeat}`);
      // TODO: Navegar para próxima etapa com selectedTrip e selectedSeat
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />

      <main className="flex-1 bg-linear-to-b from-background-alt to-white">
        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          {/* Back button */}
          <button
            type="button"
            onClick={onBackToSearch}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-transparent px-0 py-0 text-sm font-medium text-text-muted transition hover:text-text-main"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
            Voltar à busca
          </button>

          {isLoading && (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-muted">
              Carregando dados da viagem...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-main">
              {errorMessage}
            </div>
          )}

          {/* Two-column layout */}
          {!isLoading && !errorMessage && tripData && (
            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr]">
            {/* Left column - Seat Selection */}
            <SeatSelectionCard
              tripData={tripData}
              totalSeats={totalSeats}
              occupiedSeats={occupiedSeats}
              onSeatSelect={setSelectedSeat}
              selectedSeat={selectedSeat}
            />

            {/* Right column - Booking Summary */}
            <BookingSummaryCard
              tripData={tripData}
              selectedSeat={selectedSeat}
              onContinue={handleContinue}
            />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}