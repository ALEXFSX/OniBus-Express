const BENEFITS = [
  {
    title: 'Reserva em 2 minutos',
    description: 'Escolha o assento e finalize com seus dados — pronto.',
  },
  {
    title: 'Frota com conforto',
    description: 'Ônibus modernos, ar condicionado e Wi-Fi a bordo.',
  },
  {
    title: 'Cancele quando quiser',
    description: 'Política flexível direto na consulta da reserva.',
  },
]

export default function Benefits() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-10 pb-16 sm:px-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {BENEFITS.map(b => (
          <div
            key={b.title}
            className="rounded-2xl border border-border bg-white/75 p-6"
          >
            <h3 className="mb-2 text-lg font-bold leading-snug text-text-main">{b.title}</h3>
            <p className="text-base leading-relaxed text-text-muted">{b.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
