import Montar from '../Montar'

const module = {
  number: 3,
  title: 'Operações matemáticas',
  description: 'Calcule totais e diferenças com os blocos de matemática.',
  steps: [
    { title: 'Some quantidades', description: 'O operador + combina valores numéricos.', example: 'total = caixas + paletes' },
    { title: 'Calcule o peso', description: 'Multiplique o peso unitário pela quantidade de itens.', example: 'peso_total = peso_unitario * quantidade' },
    { title: 'Organize a expressão', description: 'Parênteses deixam explícita a ordem dos cálculos.', example: 'custo = (unidades * preco) + taxa' },
  ],
}

function OperacoesMatematicas({ onBack }) {
  return <Montar module={module} onBack={onBack} />
}

export default OperacoesMatematicas