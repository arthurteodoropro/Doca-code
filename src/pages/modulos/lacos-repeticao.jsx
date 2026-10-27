import Montar from '../Montar'

const module = {
  number: 6,
  title: 'Laços de repetição e processamento de cargas',
  description: 'Repita operações para processar várias cargas com menos blocos.',
  steps: [
    { title: 'Escolha um intervalo', description: 'O bloco Contar com repete instruções para uma sequência numérica.', example: 'range(1, 4)' },
    { title: 'Defina o processamento', description: 'Coloque dentro do laço as ações que devem se repetir.', example: 'for numero in range(1, 4):' },
    { title: 'Acompanhe cada etapa', description: 'Use a variável do laço para identificar a carga processada.', example: '    print("Carga", numero)' },
  ],
}

function LacosRepeticao({ onBack }) {
  return <Montar module={module} onBack={onBack} />
}

export default LacosRepeticao