import type { FormEvent } from "react";

export interface PassengerFormData {
  fullName: string;
  cpf: string;
  email: string;
  birthDate: string;
}

export interface PassengerErrors {
  fullName?: string;
  cpf?: string;
  email?: string;
  birthDate?: string;
}

interface PassengerDataCardProps {
  formId: string;
  passenger: PassengerFormData;
  errors: PassengerErrors;
  onChange: (field: keyof PassengerFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

export default function PassengerDataCard({
  formId,
  passenger,
  errors,
  onChange,
  onSubmit,
}: PassengerDataCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-7">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-text-main">Dados do passageiro</h1>
        <p className="mt-2 text-lg text-text-muted">
          Use o nome exatamente como esta no documento de identidade.
        </p>
      </header>

      <form id={formId} onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="mb-2 block text-base font-bold text-text-main">
            Nome completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={passenger.fullName}
            onChange={event => onChange("fullName", event.target.value)}
            placeholder="Maria Silva Souza"
            autoComplete="name"
            aria-label="Nome completo do passageiro"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            className="h-12 w-full rounded-xl border border-border px-4 text-base text-text-main shadow-[0_2px_6px_rgba(7,20,38,0.08)] outline-none transition focus:border-primary focus:ring-3 focus:ring-blue-100"
          />
          <FieldError id="fullName-error" message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="cpf" className="mb-2 block text-base font-bold text-text-main">
            CPF
          </label>
          <input
            id="cpf"
            name="cpf"
            type="text"
            value={passenger.cpf}
            onChange={event => onChange("cpf", event.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            autoComplete="off"
            aria-label="CPF do passageiro"
            aria-invalid={Boolean(errors.cpf)}
            aria-describedby={errors.cpf ? "cpf-error" : undefined}
            className="h-12 w-full rounded-xl border border-border px-4 text-base text-text-main shadow-[0_2px_6px_rgba(7,20,38,0.08)] outline-none transition focus:border-primary focus:ring-3 focus:ring-blue-100"
          />
          <FieldError id="cpf-error" message={errors.cpf} />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-base font-bold text-text-main">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={passenger.email}
            onChange={event => onChange("email", event.target.value)}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            aria-label="E-mail do passageiro"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="h-12 w-full rounded-xl border border-border px-4 text-base text-text-main shadow-[0_2px_6px_rgba(7,20,38,0.08)] outline-none transition focus:border-primary focus:ring-3 focus:ring-blue-100"
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <label htmlFor="birthDate" className="mb-2 block text-base font-bold text-text-main">
            Data de nascimento
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            value={passenger.birthDate}
            onChange={event => onChange("birthDate", event.target.value)}
            aria-label="Data de nascimento do passageiro"
            aria-invalid={Boolean(errors.birthDate)}
            aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
            className="h-12 w-full rounded-xl border border-border px-4 text-base text-text-main shadow-[0_2px_6px_rgba(7,20,38,0.08)] outline-none transition focus:border-primary focus:ring-3 focus:ring-blue-100"
          />
          <FieldError id="birthDate-error" message={errors.birthDate} />
        </div>
      </form>

      <div className="mt-8 flex items-start gap-3 rounded-2xl bg-background-alt p-4 text-sm text-text-muted">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a4 4 0 00-4 4v2H6v7h12v-7h-2v-2a4 4 0 00-4-4zm0 0a4 4 0 014 4v2H8v-2a4 4 0 014-4z" />
        </svg>
        <p>
          Seus dados sao usados apenas para emissao da passagem e contato sobre a viagem.
        </p>
      </div>
    </div>
  );
}
