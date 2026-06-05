import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { ApiError, reservasService, type ReservaResponse } from "../services/api";

interface ReservationDetailsPageProps {
  bookingCode: string;
  onBackToSearch: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

function formatCpfDisplay(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) {
    return value;
  }

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function ReservationDetailsPage({ bookingCode, onBackToSearch }: ReservationDetailsPageProps) {
  const [reservation, setReservation] = useState<ReservaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    async function loadReservation() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await reservasService.buscarPorCodigo(bookingCode, abortController.signal);
        if (!isActive) {
          return;
        }

        setReservation(data);
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setErrorMessage("Reserva nao encontrada para o codigo informado.");
        } else {
          setErrorMessage("Nao foi possivel carregar os detalhes da reserva.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadReservation();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [bookingCode]);

  const summary = useMemo(() => {
    if (!reservation) {
      return null;
    }

    return {
      route: `${reservation.viagem.origem} → ${reservation.viagem.destino}`,
      date: formatTripDate(reservation.viagem.dataHoraPartidaUtc),
      departureTime: formatTripTime(reservation.viagem.dataHoraPartidaUtc),
      totalPrice: formatCurrency(reservation.viagem.precoBase),
      passengerName: reservation.passageiro.nome,
      passengerCpf: formatCpfDisplay(reservation.passageiro.cpf),
    };
  }, [reservation]);

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />

      <main className="flex-1 bg-linear-to-b from-background-alt to-white">
        <section className="mx-auto w-full max-w-4xl px-6 py-10">
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
            Voltar para busca
          </button>

          {isLoading && (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-muted">
              Carregando reserva...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-main">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && reservation && summary && (
            <div className="rounded-2xl border border-border bg-white p-7">
              <h1 className="text-3xl font-black text-text-main">Minha reserva</h1>
              <p className="mt-1 text-text-muted">Codigo: {reservation.codigoReserva}</p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Status</span>
                  <strong className="text-text-main">{reservation.status}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Passageiro</span>
                  <strong className="text-text-main">{summary.passengerName}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">CPF</span>
                  <strong className="text-text-main">{summary.passengerCpf}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Rota</span>
                  <strong className="text-right text-text-main">{summary.route}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Data</span>
                  <strong className="text-text-main">{summary.date}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Partida</span>
                  <strong className="text-text-main">{summary.departureTime}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Assento</span>
                  <strong className="text-text-main">Nº {reservation.numeroAssento}</strong>
                </div>

                <div className="my-2 border-t border-dashed border-border" />

                <div className="flex items-center justify-between gap-6">
                  <span className="text-lg text-text-muted">Total</span>
                  <strong className="text-2xl font-black text-primary">{summary.totalPrice}</strong>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
