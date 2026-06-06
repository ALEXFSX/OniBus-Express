import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { ApiError, reservasService, type ReservaResponse } from "../services/api";

interface ReservationDetailsPageProps {
  initialBookingCode?: string;
  onBackToSearch: () => void;
}

interface BookingCodeValidation {
  isValid: boolean;
  message?: string;
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

function normalizeBookingCode(value: string) {
  return value.replace(/\s+/g, "").trim().toUpperCase();
}

function validateBookingCode(value: string): BookingCodeValidation {
  if (!value) {
    return { isValid: false, message: "Informe o codigo da reserva." };
  }

  if (value.length < 6) {
    return { isValid: false, message: "O codigo da reserva parece incompleto." };
  }

  if (value.length > 12) {
    return { isValid: false, message: "O codigo da reserva deve ter no maximo 12 caracteres." };
  }

  if (!/^[A-Z0-9-]+$/.test(value)) {
    return { isValid: false, message: "Use apenas letras e numeros." };
  }

  return { isValid: true };
}

export default function ReservationDetailsPage({
  initialBookingCode,
  onBackToSearch,
}: ReservationDetailsPageProps) {
  const [reservation, setReservation] = useState<ReservaResponse | null>(null);
  const [bookingCode, setBookingCode] = useState(initialBookingCode ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  async function loadReservation(normalizedCode: string) {
    setIsLoading(true);
    setErrorMessage(null);
    setFieldError(null);
    setCancelMessage(null);

    try {
      const data = await reservasService.buscarPorCodigo(normalizedCode);
      setReservation(data);
    } catch (error) {
      setReservation(null);

      if (error instanceof ApiError && error.status === 404) {
        setErrorMessage("Reserva não encontrada. Verifique o código e tente novamente.");
      } else {
        setErrorMessage("Não foi possível consultar a reserva agora. Tente novamente em instantes.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = normalizeBookingCode(bookingCode);
    const validation = validateBookingCode(normalizedCode);
    setBookingCode(normalizedCode);

    if (!validation.isValid) {
      setFieldError(validation.message ?? "Informe o codigo da reserva.");
      setErrorMessage(null);
      setReservation(null);
      return;
    }

    void loadReservation(normalizedCode);
  }

  async function handleCancelReservation() {
    if (!reservation) {
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar esta reserva? O assento sera liberado para outros passageiros.",
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);
    setCancelMessage(null);
    setErrorMessage(null);

    try {
      await reservasService.cancelar(reservation.codigoReserva);
      setReservation(current =>
        current
          ? {
              ...current,
              status: "Cancelada",
              canceladaEmUtc: new Date().toISOString(),
            }
          : current,
      );
      setCancelMessage("Reserva cancelada com sucesso.");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Não foi possível cancelar a reserva agora. Tente novamente em instantes.");
      }
    } finally {
      setIsCancelling(false);
    }
  }

  useEffect(() => {
    if (!initialBookingCode) {
      return;
    }

    const normalizedCode = normalizeBookingCode(initialBookingCode);
    const validation = validateBookingCode(normalizedCode);
    setBookingCode(normalizedCode);

    if (!validation.isValid) {
      setFieldError(validation.message ?? "Informe o codigo da reserva.");
      return;
    }

    void loadReservation(normalizedCode);
  }, [initialBookingCode]);

  const canCancel = reservation && !reservation.status.toLowerCase().includes("cancelad");

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
      passengerEmail: reservation.passageiro.email,
    };
  }, [reservation]);

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />

      <main className="flex-1 bg-linear-to-b from-background-alt to-white">
        <section className="mx-auto w-full max-w-155 px-6 py-10 text-center">
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

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-primary">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18M7 5h10a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V6a1 1 0 011-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 12h4" />
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-black text-text-main">Consultar reserva</h1>
          <p className="mt-2 text-sm text-text-muted">
            Digite o codigo que voce recebeu ao finalizar a compra.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 rounded-2xl border border-border bg-white p-5 text-left"
          >
            <label htmlFor="bookingCode" className="mb-2 block text-sm font-semibold text-text-main">
              Codigo da reserva
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <input
                id="bookingCode"
                name="bookingCode"
                type="text"
                value={bookingCode}
                onChange={event => setBookingCode(event.target.value)}
                placeholder="GBC7C66Y"
                disabled={isLoading}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? "bookingCode-error" : undefined}
                className="h-10 w-full rounded-xl border border-border px-3 text-sm text-text-main outline-none transition focus:border-primary focus:ring-3 focus:ring-blue-100 disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {fieldError && (
              <p id="bookingCode-error" className="mt-2 text-sm text-red-600" role="alert">
                {fieldError}
              </p>
            )}
          </form>

          {errorMessage && (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-main">
              {errorMessage}
            </div>
          )}

          {cancelMessage && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              {cancelMessage}
            </div>
          )}

          {reservation && summary && (
            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-white text-left">
              <div className="flex flex-col gap-4 bg-primary px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-white/75">CODIGO DA RESERVA</p>
                  <p className="mt-1 text-2xl font-black tracking-wider text-white">{reservation.codigoReserva}</p>
                </div>

                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-primary">
                  {reservation.status}
                </span>
              </div>

              <div className="space-y-2.5 px-6 py-5">
               
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Passageiro</span>
                  <strong className="text-right text-text-main font-medium">{summary.passengerName}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">CPF</span>
                  <strong className="text-right text-text-main font-medium">{summary.passengerCpf}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">E-mail</span>
                  <strong className="text-right text-text-main font-medium">{summary.passengerEmail}</strong>
                </div>

                <div className="my-5 border-t border-dashed border-border" />

                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Rota</span>
                  <strong className="text-right text-text-main font-medium">{summary.route}</strong>
                </div>
                      <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Codigo da viagem</span>
                  <strong className="text-right text-text-main font-medium">{reservation.viagem.id}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Data</span>
                  <strong className="text-right text-text-main font-medium">{summary.date}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Partida</span>
                  <strong className="text-right text-text-main font-medium">{summary.departureTime}</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-text-muted">Assento</span>
                  <strong className="text-right text-text-main font-medium">Nº {reservation.numeroAssento}</strong>
                </div>
          

                <div className="my-5 border-t border-dashed border-border" />

                <div className="flex items-center justify-between gap-6">
                  <span className="text-lg text-text-muted">Total pago</span>
                  <strong className="text-2xl font-black text-primary">{summary.totalPrice}</strong>
                </div>
              </div>

              <div className="border-t border-border bg-slate-50 px-6 py-5">
                <button
                  type="button"
                  onClick={handleCancelReservation}
                  disabled={!canCancel || isCancelling}
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {isCancelling ? "Cancelando..." : "Cancelar reserva"}
                </button>
                <p className="mt-2 text-center text-xs text-text-muted">
                  O cancelamento libera seu assento para outros passageiros.
                </p>
              </div>

            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
