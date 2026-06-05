import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PassengerDataCard, {
  type PassengerErrors,
  type PassengerFormData,
} from "../components/PassengerDataCard";
import PurchaseSummaryCard from "../components/PurchaseSummaryCard";
import {
  ApiError,
  reservasService,
  type ReservaResponse,
  viagensService,
} from "../services/api";
import type { ViagemDetalhe } from "../types/viagemDetalhe";

interface CheckoutPageProps {
  tripId: string;
  seatNumber: number;
  onBackToSeatSelection: () => void;
  onBuyAnotherTicket: () => void;
  onViewBooking: (bookingCode: string) => void;
}

const CHECKOUT_FORM_ID = "passenger-checkout-form";

function applyCpfMask(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcDigit = (base: string, factor: number) => {
    let sum = 0;
    for (const digit of base) {
      sum += Number(digit) * factor;
      factor -= 1;
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcDigit(cpf.slice(0, 9), 10);
  const secondDigit = calcDigit(cpf.slice(0, 10), 11);

  return `${firstDigit}${secondDigit}` === cpf.slice(9);
}

function validatePassengerData(passenger: PassengerFormData): PassengerErrors {
  const errors: PassengerErrors = {};
  const fullName = passenger.fullName.trim();
  const fullNameParts = fullName.split(/\s+/).filter(Boolean);

  if (!fullName) {
    errors.fullName = "Informe o nome completo.";
  } else if (fullName.length < 3) {
    errors.fullName = "O nome deve ter pelo menos 3 caracteres.";
  } else if (fullNameParts.length < 2) {
    errors.fullName = "Informe nome e sobrenome.";
  }

  if (!passenger.cpf.trim()) {
    errors.cpf = "Informe o CPF.";
  } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(passenger.cpf)) {
    errors.cpf = "Informe um CPF no formato correto.";
  } else if (!isValidCpf(passenger.cpf)) {
    errors.cpf = "Informe um CPF valido.";
  }

  if (!passenger.email.trim()) {
    errors.email = "Informe o e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
    errors.email = "Informe um e-mail valido.";
  }

  if (!passenger.birthDate) {
    errors.birthDate = "Informe a data de nascimento.";
  }

  return errors;
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

function formatDateTimeForApi(dateValue: string) {
  return new Date(`${dateValue}T00:00:00.000Z`).toISOString();
}

export default function CheckoutPage({
  tripId,
  seatNumber,
  onBackToSeatSelection,
  onBuyAnotherTicket,
  onViewBooking,
}: CheckoutPageProps) {
  const [tripDetail, setTripDetail] = useState<ViagemDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ReservaResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string>("");
  const [passenger, setPassenger] = useState<PassengerFormData>({
    fullName: "",
    cpf: "",
    email: "",
    birthDate: "",
  });
  const [errors, setErrors] = useState<PassengerErrors>({});

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();

    async function loadTripDetail() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const detail = await viagensService.buscarPorId(tripId, abortController.signal);
        if (!isActive) {
          return;
        }

        setTripDetail(detail);
      } catch {
        if (!isActive) {
          return;
        }

        setLoadError("Nao foi possivel carregar o resumo da compra. Tente novamente.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadTripDetail();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [tripId]);

  const summary = useMemo(() => {
    if (!tripDetail) {
      return null;
    }

    return {
      route: `${tripDetail.origem} → ${tripDetail.destino}`,
      date: formatTripDate(tripDetail.dataHoraPartidaUtc),
      departureTime: formatTripTime(tripDetail.dataHoraPartidaUtc),
      totalPrice: formatCurrency(tripDetail.precoBase),
    };
  }, [tripDetail]);

  function handlePassengerChange(field: keyof PassengerFormData, value: string) {
    const nextValue = field === "cpf" ? applyCpfMask(value) : value;

    setPassenger(current => ({
      ...current,
      [field]: nextValue,
    }));

    setErrors(current => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validatePassengerData(passenger);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await reservasService.criar({
        nome: passenger.fullName.trim(),
        cpf: passenger.cpf,
        email: passenger.email.trim(),
        dataNascimento: formatDateTimeForApi(passenger.birthDate),
        viagemId: tripId,
        numeroAssento: seatNumber,
      });

      setConfirmedBooking(result);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Nao foi possivel confirmar a compra agora. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyBookingCode() {
    if (!confirmedBooking) {
      return;
    }

    try {
      await navigator.clipboard.writeText(confirmedBooking.codigoReserva);
      setCopyFeedback("Codigo copiado");
      window.setTimeout(() => setCopyFeedback(""), 1800);
    } catch {
      setCopyFeedback("Nao foi possivel copiar");
      window.setTimeout(() => setCopyFeedback(""), 1800);
    }
  }

  const confirmationData = useMemo(() => {
    if (!confirmedBooking) {
      return null;
    }

    return {
      email: confirmedBooking.passageiro.email,
      passengerName: confirmedBooking.passageiro.nome,
      passengerCpf: formatCpfDisplay(confirmedBooking.passageiro.cpf),
      route: `${confirmedBooking.viagem.origem} → ${confirmedBooking.viagem.destino}`,
      date: formatTripDate(confirmedBooking.viagem.dataHoraPartidaUtc),
      departureTime: formatTripTime(confirmedBooking.viagem.dataHoraPartidaUtc),
      totalPrice: formatCurrency(confirmedBooking.viagem.precoBase),
      bookingCode: confirmedBooking.codigoReserva,
      bookedSeat: confirmedBooking.numeroAssento,
    };
  }, [confirmedBooking]);

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />

      <main className="flex-1 bg-linear-to-b from-background-alt to-white">
        <section className="mx-auto w-full max-w-6xl px-6 py-10">
          <button
            type="button"
            onClick={onBackToSeatSelection}
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
            Voltar para assentos
          </button>

          {isLoading && (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-muted">
              Carregando dados da compra...
            </div>
          )}

          {!isLoading && loadError && (
            <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-main">
              {loadError}
            </div>
          )}

          {!isLoading && !loadError && confirmationData && (
            <div className="mx-auto w-full max-w-[670px] py-3 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  className="h-10 w-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="mt-6 text-3xl font-black text-text-main">Reserva confirmada!</h1>
              <p className="mt-3 text-lg text-text-muted">
                Enviamos os detalhes da viagem para <span className="font-bold text-text-main">{confirmationData.email}</span>.
              </p>

              <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-white text-left">
                <div className="flex flex-col gap-4 bg-primary px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-white/75">CODIGO DA RESERVA</p>
                    <p className="mt-1 text-2xl font-black tracking-wider text-white">{confirmationData.bookingCode}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyBookingCode}
                    aria-label={`Copiar codigo da reserva ${confirmationData.bookingCode}`}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-100 px-5 py-3 text-sm font-bold text-text-main transition hover:bg-blue-200"
                  >
                    {copyFeedback || "Copiar"}
                  </button>
                </div>

                <div className="space-y-2.5 px-6 py-5">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-text-muted">Passageiro</span>
                    <strong className="text-right text-text-main font-medium">{confirmationData.passengerName}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-text-muted">CPF</span>
                    <strong className="text-right text-text-main font-medium">{confirmationData.passengerCpf}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-text-muted">Rota</span>
                    <strong className="text-right text-text-main font-medium">{confirmationData.route}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-text-muted">Data</span>
                    <strong className="text-right text-text-main font-medium">{confirmationData.date}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-text-muted">Partida</span>
                    <strong className="text-right text-text-main font-medium">{confirmationData.departureTime}</strong>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-text-muted">Assento</span>
                    <strong className="text-right text-text-main font-medium">Nº {confirmationData.bookedSeat}</strong>
                  </div>

                  <div className="my-5 border-t border-dashed border-border" />

                  <div className="flex items-center justify-between gap-6">
                    <span className="text-lg text-text-muted">Total pago</span>
                    <strong className="text-2xl font-black text-primary">{confirmationData.totalPrice}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onBuyAnotherTicket}
                  className="h-13 rounded-xl border border-border bg-white px-5 text-base font-bold text-text-main shadow-[0_2px_6px_rgba(7,20,38,0.08)] transition hover:bg-background-alt"
                >
                  Comprar outra passagem
                </button>
                <button
                  type="button"
                  onClick={() => onViewBooking(confirmationData.bookingCode)}
                  className="h-13 rounded-xl bg-primary px-5 text-base font-extrabold text-white shadow-[0_4px_8px_rgba(7,87,168,0.24)] transition hover:brightness-95"
                >
                  Ver minha reserva
                </button>
              </div>

              <p className="sr-only" aria-live="polite">
                {copyFeedback}
              </p>
            </div>
          )}

          {!isLoading && !loadError && !confirmationData && summary && (
            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr]">
              <div>
                <PassengerDataCard
                  formId={CHECKOUT_FORM_ID}
                  passenger={passenger}
                  errors={errors}
                  onChange={handlePassengerChange}
                  onSubmit={handleSubmit}
                />

                {submitError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                    {submitError}
                  </div>
                )}
              </div>

              <PurchaseSummaryCard
                route={summary.route}
                date={summary.date}
                departureTime={summary.departureTime}
                seatNumber={seatNumber}
                totalPrice={summary.totalPrice}
                formId={CHECKOUT_FORM_ID}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
