import Montar from '../Montar'

const module = {
  number: 4,
  title: 'Listas de contêineres',
  description: 'Veja como uma lista agrupa cargas e facilita a consulta por posição.',
  steps: [
    { title: 'Agrupe os códigos', description: 'Uma lista guarda vários valores em uma única estrutura.', example: 'cargas = ["CT-204", "CT-318"]' },
    { title: 'Acesse uma posição', description: 'A contagem começa em zero: a posição 0 é o primeiro item.', example: 'primeira_carga = cargas[0]' },
    { title: 'Acesse outro item', description: 'Use a posição 1 para consultar o segundo código da lista.', example: 'segunda_carga = cargas[1]' },
  ],
}

function ListasConteineres({ onBack }) {
  return <Montar module={module} onBack={onBack} />
}

export default ListasConteineres