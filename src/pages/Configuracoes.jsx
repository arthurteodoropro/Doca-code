import { useState } from 'react'

function Configuracoes({ onBack }) {
  const [som, setSom] = useState(true)
  const [modoEscuro, setModoEscuro] = useState(false)

  return (
    <section className={`content-page settings-page ${modoEscuro ? 'settings-page-dark' : ''}`}>
      <button type="button" className="back-button" onClick={onBack}>
        Voltar
      </button>

      <div className="settings-heading">
        <p className="eyebrow">Preferências</p>
        <h1>Configurações</h1>
        <p>Personalize sua experiência de aprendizado.</p>
      </div>

      <div className="settings-panel">
        <button type="button" className="setting-option" onClick={() => setSom(!som)} aria-pressed={som}>
          <span className="setting-option-icon" aria-hidden="true">♪</span>
          <span className="setting-option-copy">
            <strong>Som</strong>
            <small>Ativa efeitos sonoros da experiência.</small>
          </span>
          <span className={`settings-switch ${som ? 'is-active' : ''}`} aria-hidden="true"><span /></span>
        </button>

        <button type="button" className="setting-option" onClick={() => setModoEscuro(!modoEscuro)} aria-pressed={modoEscuro}>
          <span className="setting-option-icon" aria-hidden="true">☾</span>
          <span className="setting-option-copy">
            <strong>Modo escuro</strong>
            <small>Altera a aparência desta tela para tons escuros.</small>
          </span>
          <span className={`settings-switch ${modoEscuro ? 'is-active' : ''}`} aria-hidden="true"><span /></span>
        </button>
      </div>
    </section>
  )
}

export default Configuracoes
