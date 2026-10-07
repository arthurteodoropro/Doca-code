import { useState } from 'react'
import Aprender from './pages/Aprender'
import Configuracoes from './pages/Configuracoes'
import Home from './pages/Home'
import Montar from './pages/Montar'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const goHome = () => setCurrentPage('home')
  const pageClass = currentPage === 'home'
    ? 'home-shell'
    : currentPage === 'aprender' || currentPage === 'montar'
      ? 'learning-shell'
      : 'inner-shell'

  const pages = {
    aprender: <Aprender onBack={goHome} />,
    montar: <Montar onBack={goHome} />,
    configuracoes: <Configuracoes onBack={goHome} />,
    home: <Home onNavigate={setCurrentPage} />,
  }

  return (
    <main className={`page-shell ${pageClass}`}>
      {pages[currentPage]}
    </main>
  )
}

export default App
