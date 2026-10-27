import Montar from '../Montar'

const module = {
  number: 5,
  title: 'Condicionais e tomada de decisões',
  description: 'Use comparações para escolher o que o programa deve fazer.',
  steps: [
    { title: 'Defina uma condição', description: 'Compare o valor informado com um limite usando os blocos de Lógica.', example: 'peso <= limite' },
    { title: 'Crie os caminhos', description: 'O bloco Condições separa o que acontece quando a condição é verdadeira ou falsa.', example: 'if peso <= limite:' },
    { title: 'Trate cada resultado', description: 'Mostre uma mensagem adequada em cada caminho.', example: '    print("Carga autorizada")' },
  ],
}

function Condicionais({ onBack }) {
  return <Montar module={module} onBack={onBack} />
}

export default Condicionais