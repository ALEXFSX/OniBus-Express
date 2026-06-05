interface BookingSummaryCardProps {
  tripData: {
    route: string;
    date: string;
    departureTime: string;
    duration: string;
    price: string;
  };
  selectedSeat: number | null;
  onContinue: () => void;
}

export default function BookingSummaryCard({
  tripData,
  selectedSeat,
  onContinue,
}: BookingSummaryCardProps) {
  const isDisabled = selectedSeat === null;

  return (
    <div className="sticky top-24 h-fit rounded-2xl border border-border bg-white p-6">
      {/* Title */}
      <h3 className="mb-6 text-base font-black text-text-main">Resumo</h3>

      {/* Summary rows */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Rota</span>
          <span className="font-medium text-text-main">{tripData.route}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Data</span>
          <span className="font-medium text-text-main">{tripData.date}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Partida</span>
          <span className="font-medium text-text-main">{tripData.departureTime}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Duração</span>
          <span className="font-medium text-text-main">{tripData.duration}</span>
        </div>

        {/* Seat - highlight */}
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Assento</span>
          <span className={`font-medium ${selectedSeat ? "text-primary" : "text-text-main"}`}>
            {selectedSeat ? `N˚ ${selectedSeat}` : "—"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-border" />

      {/* Total */}
      <div className="mb-6 flex justify-between">
        <span className="text-sm font-medium text-text-muted">Total</span>
        <span className="text-2xl font-black text-primary">{tripData.price}</span>
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={onContinue}
        disabled={isDisabled}
        className={`w-full rounded-lg py-2.5 font-semibold text-white transition-colors ${
          isDisabled
            ? "cursor-not-allowed bg-primary/50"
            : "bg-primary hover:bg-primary-dark"
        }`}
      >
        Continuar
      </button>

      {/* Helper text */}
      <p className="mt-4 text-center text-xs text-text-muted">
        Você poderá revisar os dados antes de confirmar.
      </p>
    </div>
  );
}
