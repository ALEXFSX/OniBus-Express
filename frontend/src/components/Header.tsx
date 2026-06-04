export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full rounded-b-xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-lg sm:px-6">
   <div className="mx-auto flex max-w-7xl items-center justify-between ">

      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-md">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
            <path
              fill="currentColor"
              d="M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-1.5a1.5 1.5 0 0 1-3 0H9.5a1.5 1.5 0 0 1-3 0H5a1 1 0 0 1-1-1V7Zm2.5 2.5A1.5 1.5 0 1 0 8 11a1.5 1.5 0 0 0-1.5-1.5Zm11 0A1.5 1.5 0 1 0 19 11a1.5 1.5 0 0 0-1.5-1.5ZM5 8v2h14V8H5Zm14 4H5v2h14v-2Zm-6.5 3h-1v2h1v-2Z"
              />
          </svg>
        </span>
        <div>
          <p className="text-base font-semibold text-slate-950">OniBus <br className="sm:hidden" />Express!</p>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500 hidden sm:block">Viagens pelo Brasil</p>
        </div>
      </div>

      <nav aria-label="Navegação principal" className="flex items-center gap-8 text-sm font-medium text-slate-800">
        <a href="#" className="transition hover:text-blue-600">Buscar</a>
        <a href="#" className="transition hover:text-blue-600">Minha reserva</a>
      </nav>
              </div>
    </header>
  )
}
