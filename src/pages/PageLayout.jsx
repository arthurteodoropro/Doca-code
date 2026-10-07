function PageLayout({ title, description, onBack }) {
  return (
    <section className="content-page">
      <button type="button" className="back-button" onClick={onBack}>
        Voltar
      </button>
      <div>
        <p className="eyebrow">Página</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}

export default PageLayout
