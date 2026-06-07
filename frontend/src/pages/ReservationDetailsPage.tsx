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
  });
}

function formatTripTime(utcIsoDate: string) {
  return new Date(utcIsoDate).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
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
            {/* <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18M7 5h10a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V6a1 1 0 011-1z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 12h4" />
            </svg> */}


            <svg  className="h-7 w-7" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.694 0H10.806C12.644 0 14.1 0 15.239 0.153C16.411 0.311 17.36 0.643 18.109 1.391C18.857 2.14 19.189 3.089 19.347 4.261C19.45 5.025 19.483 5.931 19.494 7H19.75C20.716 7 21.5 7.784 21.5 8.75V9.75C21.5 10.3 21.24 10.82 20.8 11.15L19.497 12.127C19.49 13.359 19.461 14.387 19.347 15.239C19.189 16.411 18.857 17.36 18.109 18.109C17.919 18.2983 17.716 18.4627 17.5 18.602V19.75C17.5 20.2141 17.3156 20.6592 16.9874 20.9874C16.6592 21.3156 16.2141 21.5 15.75 21.5H14.25C13.7859 21.5 13.3408 21.3156 13.0126 20.9874C12.6844 20.6592 12.5 20.2141 12.5 19.75V19.494C11.976 19.4987 11.4113 19.5007 10.806 19.5H10.694C10.088 19.5013 9.52333 19.4993 9 19.494V19.75C9 20.2141 8.81563 20.6592 8.48744 20.9874C8.15925 21.3156 7.71413 21.5 7.25 21.5H5.75C5.28587 21.5 4.84075 21.3156 4.51256 20.9874C4.18437 20.6592 4 20.2141 4 19.75V18.602C3.78012 18.4597 3.57598 18.2944 3.391 18.109C2.643 17.36 2.311 16.411 2.153 15.239C2.039 14.387 2.01 13.359 2.003 12.127L0.7 11.15C0.26 10.82 0 10.3 0 9.75V8.75C0 7.784 0.784 7 1.75 7H2.005C2.017 5.931 2.05 5.025 2.153 4.261C2.311 3.089 2.643 2.14 3.391 1.391C4.14 0.643 5.089 0.311 6.261 0.153C7.401 0 8.856 0 10.694 0ZM2 8.5H1.75C1.6837 8.5 1.62011 8.52634 1.57322 8.57322C1.52634 8.62011 1.5 8.6837 1.5 8.75V9.75C1.5 9.78881 1.50904 9.82709 1.52639 9.8618C1.54375 9.89652 1.56895 9.92671 1.6 9.95L2 10.25V8.5ZM3.506 12.5C3.516 13.534 3.548 14.358 3.64 15.04C3.775 16.045 4.029 16.625 4.452 17.048C4.875 17.471 5.455 17.725 6.461 17.86C7.489 17.998 8.843 18 10.75 18C12.657 18 14.012 17.998 15.04 17.86C16.045 17.725 16.625 17.471 17.048 17.048C17.471 16.625 17.725 16.045 17.86 15.039C17.952 14.359 17.983 13.534 17.994 12.5H3.506ZM18 11H3.5V8.75C3.5 6.867 3.502 5.523 3.635 4.5H17.865C17.998 5.523 18 6.867 18 8.75V11ZM19.5 10.25L19.9 9.95C19.931 9.92671 19.9562 9.89652 19.9736 9.8618C19.991 9.82709 20 9.78881 20 9.75V8.75C20 8.6837 19.9737 8.62011 19.9268 8.57322C19.8799 8.52634 19.8163 8.5 19.75 8.5H19.5V10.25ZM17.451 3C17.3446 2.79837 17.2088 2.61368 17.048 2.452C16.625 2.029 16.045 1.775 15.039 1.64C14.011 1.502 12.657 1.5 10.75 1.5C8.843 1.5 7.489 1.502 6.46 1.64C5.455 1.775 4.875 2.029 4.452 2.452C4.29125 2.61368 4.15543 2.79837 4.049 3H17.451ZM5.5 19.21V19.75C5.5 19.888 5.612 20 5.75 20H7.25C7.3163 20 7.37989 19.9737 7.42678 19.9268C7.47366 19.8799 7.5 19.8163 7.5 19.75V19.454C7.0857 19.4355 6.67234 19.3998 6.261 19.347C6.00527 19.3136 5.75131 19.2679 5.5 19.21ZM14 19.454V19.75C14 19.888 14.112 20 14.25 20H15.75C15.8163 20 15.8799 19.9737 15.9268 19.9268C15.9737 19.8799 16 19.8163 16 19.75V19.21C15.758 19.266 15.5043 19.3117 15.239 19.347C14.8277 19.3998 14.4143 19.4355 14 19.454ZM5 14.75C5 14.5511 5.07902 14.3603 5.21967 14.2197C5.36032 14.079 5.55109 14 5.75 14H7.25C7.44891 14 7.63968 14.079 7.78033 14.2197C7.92098 14.3603 8 14.5511 8 14.75C8 14.9489 7.92098 15.1397 7.78033 15.2803C7.63968 15.421 7.44891 15.5 7.25 15.5H5.75C5.55109 15.5 5.36032 15.421 5.21967 15.2803C5.07902 15.1397 5 14.9489 5 14.75ZM13.5 14.75C13.5 14.5511 13.579 14.3603 13.7197 14.2197C13.8603 14.079 14.0511 14 14.25 14H15.75C15.9489 14 16.1397 14.079 16.2803 14.2197C16.421 14.3603 16.5 14.5511 16.5 14.75C16.5 14.9489 16.421 15.1397 16.2803 15.2803C16.1397 15.421 15.9489 15.5 15.75 15.5H14.25C14.0511 15.5 13.8603 15.421 13.7197 15.2803C13.579 15.1397 13.5 14.9489 13.5 14.75Z" fill="#0857A8"/>
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
            <div className="mt-5 rounded-2xl border border-border bg-white p-6 text-sm text-text-main">
              {errorMessage}
            </div>
          )}

          {cancelMessage && (
            <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
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
