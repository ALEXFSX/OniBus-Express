interface SeatSelectionCardProps {
  tripData: {
    route: string;
    date: string;
    departureTime: string;
    duration: string;
    price: string;
  };
  totalSeats: number;
  occupiedSeats: number[];
  onSeatSelect: (seatNumber: number) => void;
  selectedSeat: number | null;
}

const COLUMNS = 4;

// Legend indicators
const Legend = () => (
  <div className="mb-6 flex items-center gap-8">
    {[
      {
        label: "Livre",
        state: "available",
        bg: "bg-white border border-border",
      },
      { label: "Selecionado", state: "selected", bg: "bg-primary" },
      { label: "Ocupado", state: "occupied", bg: "bg-background" },
    ].map((item) => (
      <div key={item.state} className="flex items-center gap-2">
        <div className={`h-5 w-5 rounded-full ${item.bg}`} />
        <span className="text-sm font-medium text-text-main">{item.label}</span>
      </div>
    ))}
  </div>
);

// Seat component
interface SeatProps {
  number: number;
  isHidden?: boolean;
  isOccupied: boolean;
  isSelected: boolean;
  onSelect: (seatNumber: number) => void;
}

const Seat = ({
  number,
  isHidden = false,
  isOccupied,
  isSelected,
  onSelect,
}: SeatProps) => {
  if (isHidden) {
    return <div className="h-8 w-8" aria-hidden="true" />;
  }

  const handleClick = () => {
    if (!isOccupied) {
      onSelect(number);
    }
  };

  let seatClasses =
    "h-8 w-8 rounded-md font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer";

  if (isOccupied) {
    seatClasses +=
      " bg-background border border-background text-text-muted line-through cursor-not-allowed";
  } else if (isSelected) {
    seatClasses += " bg-primary border border-primary text-white";
  } else {
    seatClasses +=
      " bg-white border border-border text-text-main hover:border-primary";
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isOccupied}
      className={seatClasses}
      aria-label={`Assento ${number}`}
    >
      {number}
    </button>
  );
};

const BusLayout = ({
  totalSeats,
  occupiedSeats,
  selectedSeat,
  onSeatSelect,
}: {
  totalSeats: number;
  occupiedSeats: number[];
  selectedSeat: number | null;
  onSeatSelect: (seatNumber: number) => void;
}) => {
  const rows = Math.ceil(totalSeats / COLUMNS);
  const getSeatNumber = (rowIdx: number, colIdx: number) =>
    rowIdx * COLUMNS + colIdx + 1;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Front label */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-semibold text-text-muted">
          FRENTE · MOTORISTA
        </span>
      </div>

      {/* Bus container */}
      <div className="relative">
        <div className="w-auto max-w-sm  px-7 pt-20 pb-10 z-10 relative">
          {/* Seat rows */}
          <div className="space-y-3">
            {Array.from({ length: rows }, (_, rowIdx) => (
              <div
                key={`row-${rowIdx}`}
                className="flex items-center justify-center gap-3"
              >
                {/* Left seats */}
                <div className="flex gap-2">
                  {[0, 1].map((colIdx) => {
                    const seatNumber = getSeatNumber(rowIdx, colIdx);
                    const isHidden = seatNumber > totalSeats;
                    return (
                      <Seat
                        key={`seat-${seatNumber}`}
                        number={seatNumber}
                        isHidden={isHidden}
                        isOccupied={occupiedSeats.includes(seatNumber)}
                        isSelected={selectedSeat === seatNumber}
                        onSelect={onSeatSelect}
                      />
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-1 border-l border-dashed border-border" />

                {/* Right seats */}
                <div className="flex gap-2">
                  {[2, 3].map((colIdx) => {
                    const seatNumber = getSeatNumber(rowIdx, colIdx);
                    const isHidden = seatNumber > totalSeats;
                    return (
                      <Seat
                        key={`seat-${seatNumber}`}
                        number={seatNumber}
                        isHidden={isHidden}
                        isOccupied={occupiedSeats.includes(seatNumber)}
                        isSelected={selectedSeat === seatNumber}
                        onSelect={onSeatSelect}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* elementoOnibus (Ajusta-se 100% ao tamanho da div acima) */}
        <div className="elementoOnibus absolute inset-0 z-0 opacity-50">
          <div className="relative w-full h-full bg-zinc-700 bg-opacity-15 rounded-t-3xl rounded-b-xl  shadow-2xl transition-colors duration-300">
            {/* Retrovisores (Ancorados nas laterais superiores externas) */}
            <div className="retrovisor absolute left-[-12px] top-[25px] w-[12px] h-[6px] bg-zinc-800 after:content-[''] after:absolute after:w-[6px] after:h-[18px] after:bg-zinc-800 after:top-[-6px] after:left-[-4px] after:rounded-[2px]"></div>
            <div className="retrovisor absolute right-[-12px] top-[25px] w-[12px] h-[6px] bg-zinc-800 after:content-[''] after:absolute after:w-[6px] after:h-[18px] after:bg-zinc-800 after:top-[-6px] after:right-[-4px] after:rounded-[2px]"></div>
 
            {/* Rodas Dianteiras */}
            <div className="absolute -z-10 top-[70px] left-[-10px] w-[16px] h-[45px] bg-zinc-900 border border-zinc-950 rounded shadow-md"></div>
            <div className="absolute -z-10 top-[70px] right-[-10px] w-[16px] h-[45px] bg-zinc-900 border border-zinc-950 rounded shadow-md"></div>

            {/* Rodas Traseiras */}
            <div className="absolute -z-10 bottom-[50px] left-[-10px] w-[16px] h-[55px] bg-zinc-900 border border-zinc-950 rounded shadow-md"></div>
            <div className="absolute -z-10 bottom-[50px] right-[-10px] w-[16px] h-[55px] bg-zinc-900 border border-zinc-950 rounded shadow-md"></div>

            {/* Para-brisa dianteiro (Estica na horizontal via left/right) */}
            <div className="absolute top-[12px] left-[10px] right-[10px] h-[15px] bg-sky-300  rounded-t-xl rounded-b-[3px]"></div>

            {/* Interior do ônibus (Usa propriedades direcionais para manter as margens internas e se esticar) */}
            <div className="absolute top-10 bottom-[10px] left-[10px] right-[10px]  rounded-t rounded-b-md shadow-inner transition-colors duration-300 bg-zinc-300 bg-opacity-30">
              {/* Linha guia do corredor */}
              <div className="w-[2px] h-full bg-gray-700 mx-auto opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SeatSelectionCard({
  tripData,
  totalSeats,
  occupiedSeats,
  onSeatSelect,
  selectedSeat,
}: SeatSelectionCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-7">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-text-main">
            {tripData.route}
          </h2>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h14m-7 0v7m0-7L5 5m14 2v7m-2-10H5"
                />
              </svg>
              {tripData.date}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {tripData.departureTime} · {tripData.duration}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-primary">{tripData.price}</p>
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-text-muted">
        Selecione seu assento
      </h3>

      {/* Legend */}
      <Legend />

      {/* Bus Layout */}
      <BusLayout
        totalSeats={totalSeats}
        occupiedSeats={occupiedSeats}
        selectedSeat={selectedSeat}
        onSeatSelect={onSeatSelect}
      />
    </div>
  );
}
