import Footer from "../components/Footer";
import Header from "../components/Header";

export default function SeatSelectionPage() {
 
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />

      <main className="flex-1 bg-linear-to-b from-background-alt to-white">
        <section className="mx-auto w-full max-w-245 px-6 py-10">
          <button
            type="button"
          
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-transparent px-0 py-0 text-sm font-medium text-text-muted transition hover:text-text-main"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
            Voltar à busca
          </button>

      
        </section>
      </main>

      <Footer />
    </div>
  )
}