import { useRef, useState } from 'react'
import moduleOne from '../assets/Módulo 1.png'
import moduleTwo from '../assets/modulo 2.png'
import moduleThree from '../assets/Modulo 3.png'
import moduleFour from '../assets/Módulo 4.png'
import moduleFive from '../assets/Modulo 5.png'
import moduleSix from '../assets/Modulo 6.png'
import moduleSeven from '../assets/Modulo 7.png'
import DeclaracaoVariaveis from './modulos/declaracao-variaveis'
import EntradaSaida from './modulos/entrada-saida'
import OperacoesMatematicas from './modulos/operacoes-matematicas'
import ListasConteineres from './modulos/listas-conteineres'
import Condicionais from './modulos/condicionais'
import LacosRepeticao from './modulos/lacos-repeticao'
import Funcoes from './modulos/funcoes'

const modules = [
  { title: 'Declaração de variáveis e introdução ao sistema', description: 'Identifique sua primeira carga e mova os primeiros blocos.', image: moduleOne },
  { title: 'Entrada e saída de dados', description: 'Cadastre e visualize as informações do contêiner.', image: moduleTwo },
  { title: 'Operações matemáticas', description: 'Calcule valores importantes para organizar a carga.', image: moduleThree },
  { title: 'Listas de contêineres', description: 'Organize a fila de contêineres e encontre cada carga.', image: moduleFour },
  { title: 'Condicionais e tomada de decisões', description: 'Defina quando a entrada de um contêiner é autorizada.', image: moduleFive },
  { title: 'Laços de repetição e processamento de cargas', description: 'Cadastre e processe diversas cargas sem repetir instruções.', image: moduleSix },
  { title: 'Funções e conclusão do sistema', description: 'Organize tudo em funções e conclua seu sistema.', image: moduleSeven },
]

const modulePages = [
  DeclaracaoVariaveis,
  EntradaSaida,
  OperacoesMatematicas,
  ListasConteineres,
  Condicionais,
  LacosRepeticao,
  Funcoes,
]

function Aprender({ onBack }) {
  const [selectedModule, setSelectedModule] = useState(null)
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(true)
  const carouselRef = useRef(null)
  const moveCarousel = (direction) => {
    const carousel = carouselRef.current
    const card = carousel.querySelector('.module-card')
    carousel.scrollBy({ left: direction * (card.offsetWidth + 20), behavior: 'smooth' })
  }

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // O navegador pode bloquear tela cheia quando o recurso não estiver disponível.
    }
    setShowFullscreenPrompt(false)
  }

  if (selectedModule !== null) {
    const ModulePage = modulePages[selectedModule]
    return <ModulePage onBack={() => setSelectedModule(null)} />
  }

  return (
    <section className="modules-page">
      <div className="modules-intro">
        <button type="button" className="back-button modules-home-button" onClick={onBack} aria-label="Voltar para página inicial">←</button>
        <span className="modules-kicker">7 módulos de ensino</span>
        <h2>Sua jornada de aprendizado</h2>
        <p>Explore cada módulo e construa seu sistema passo a passo.</p>
      </div>

      <div className="modules-carousel">
        <div ref={carouselRef} className="modules-grid" aria-label="Carrossel de módulos">
          {modules.map((module, index) => (
            <button key={module.title} type="button" className="module-card" onClick={() => setSelectedModule(index)} aria-label={`Abrir módulo ${index + 1}: ${module.title}`}>
              <span className="module-card-inner">
                <span className="module-card-face module-card-front">
                  <span className="module-label">Módulo {index + 1}</span>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <img src={module.image} alt="" />
                </span>
                <span className="module-card-face module-card-back">
                  <span className="module-label">Módulo {index + 1}</span>
                  <h3>{module.title}</h3>
                  <span className="module-card-action">Acessar módulo <span aria-hidden="true">→</span></span>
                </span>
              </span>
            </button>
          ))}
        </div>

        <nav className="modules-carousel-controls" aria-label="Navegação do carrossel">
          <button type="button" onClick={() => moveCarousel(-1)} aria-label="Mostrar módulos anteriores">←</button>
          <button type="button" onClick={() => moveCarousel(1)} aria-label="Mostrar próximos módulos">→</button>
        </nav>
      </div>

      {showFullscreenPrompt && (
        <aside className="fullscreen-prompt" aria-label="Sugestão de tela cheia">
          <button type="button" className="fullscreen-prompt-close" onClick={() => setShowFullscreenPrompt(false)} aria-label="Fechar mensagem">×</button>
          <strong>Melhor experiência em tela cheia</strong>
          <p>Amplie a área para visualizar os módulos com mais conforto.</p>
          <button type="button" className="fullscreen-prompt-action" onClick={enterFullscreen}>Usar tela cheia</button>
        </aside>
      )}
    </section>
  )
}

export default Aprender
