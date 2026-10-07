import aprenderButton from '../assets/Aprender.png'
import configurarButton from '../assets/Configurar.png'
import logo from '../assets/Logo.svg'
import montarButton from '../assets/Montar.png'

function Home({ onNavigate }) {
  return (
    <section className="home">
      <img className="home-logo" src={logo} alt="Logo" />

      <nav className="home-actions" aria-label="Páginas principais">
        <button
        
          type="button"
          className="image-button"
          onClick={() => onNavigate('aprender')}
        >
          <img src={aprenderButton} alt="Aprender" />
        </button>
        <button
          type="button"
          className="image-button"
          onClick={() => onNavigate('montar')}
        >
          <img src={montarButton} alt="Montar" />
        </button>
        <button
          type="button"
          className="image-button"
          onClick={() => onNavigate('configuracoes')}
        >
          <img src={configurarButton} alt="Configurações" />
        </button>
      </nav>
    </section>
  )
}

export default Home
