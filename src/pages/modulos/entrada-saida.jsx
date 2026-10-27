import Montar from '../Montar'

const module = {
  number: 2,
  title: 'Entrada e saída de dados',
  description: 'Receba informações e apresente o resultado no programa.',
  steps: [
    { title: 'Peça uma informação', description: 'O bloco Entrada solicita um valor a quem está usando o programa.', example: 'codigo = input("Código da carga: ")' },
    { title: 'Mostre uma resposta', description: 'Use Imprimir para exibir uma mensagem ou o conteúdo recebido.', example: 'print(codigo)' },
    { title: 'Combine texto e valor', description: 'Uma mensagem ajuda a contextualizar o dado apresentado.', example: 'print("Carga registrada:", codigo)' },
  ],
}

function EntradaSaida({ onBack }) {
  return <Montar module={module} onBack={onBack} />
}

export default EntradaSaida