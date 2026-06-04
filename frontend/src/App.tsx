import './index.css'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchForm from './components/SearchForm'
import Footer from './components/Footer'

function App() {
  function handleSearch(fields: { origin: string; destination: string; departureDate: string }) {
    console.log('Buscar:', fields)
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />
      <main className="flex-1">
        <Hero />
        <SearchForm onSearch={handleSearch} />
      </main>
      <Footer />
    </div>
  )
}

export default App

