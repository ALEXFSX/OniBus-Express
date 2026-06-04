import './index.css'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />
      <main className="flex-1" />
      <Footer />
    </div>
  )
}

export default App

