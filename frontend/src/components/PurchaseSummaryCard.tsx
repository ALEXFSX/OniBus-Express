interface PurchaseSummaryCardProps {
  route: string;
  date: string;
  departureTime: string;
  seatNumber: number;
  totalPrice: string;
  formId: string;
  isSubmitting: boolean;
}

export default function PurchaseSummaryCard({
  route,
  date,
  departureTime,
  seatNumber,
  totalPrice,
  formId,
  isSubmitting,
}: PurchaseSummaryCardProps) {
  return (
    <aside className="rounded-2xl border border-border bg-white p-7 lg:sticky lg:top-24">
      <h2 className="mb-7 text-2xl font-black text-text-main">Resumo da compra</h2>

      <dl className="space-y-4 text-sm">
        <div className="space-y-1">
          <dt className="text-text-muted">Rota</dt>
          <dd className="text-base font-extrabold text-text-main">{route}</dd>
        </div>

        <div className="space-y-1">
          <dt className="text-text-muted">Data</dt>
          <dd className="text-base font-extrabold text-text-main">{date}</dd>
        </div>

        <div className="space-y-1">
          <dt className="text-text-muted">Partida</dt>
          <dd className="text-base font-extrabold text-text-main">{departureTime}</dd>
        </div>

        <div className="space-y-1">
          <dt className="text-text-muted">Assento</dt>
          <dd className="text-base font-extrabold text-text-main">Nº {seatNumber}</dd>
        </div>
      </dl>

      <div className="my-7 h-px bg-border" />

      <div className="flex items-end justify-between gap-3">
        <span className="text-base text-text-muted">Total</span>
        <strong className="text-4xl font-black text-primary">{totalPrice}</strong>
      </div>

      <button
        type="submit"
        form={formId}
        aria-label="Confirmar compra da passagem"
        disabled={isSubmitting}
        className="mt-8 inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 text-lg font-extrabold text-white shadow-[0_4px_8px_rgba(7,87,168,0.24)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Confirmando..." : "Confirmar compra"}
      </button>
    </aside>
  );
}
