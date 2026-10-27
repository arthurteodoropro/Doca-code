import Montar from '../Montar'

const module = {
  number: 7,
  title: 'Funções e conclusão do sistema',
  description: 'Reúna etapas do sistema em funções que podem ser chamadas novamente.',
  steps: [
    { title: 'Dê um nome à tarefa', description: 'O bloco Funções cria uma rotina para uma ação do sistema.', example: 'def registrar_carga():' },
    { title: 'Agrupe os passos', description: 'Conecte dentro da função os blocos que realizam essa tarefa.', example: '    print("Carga registrada")' },
    { title: 'Execute quando precisar', description: 'Chame a função para reutilizar o conjunto de instruções.', example: 'registrar_carga()' },
  ],
}

function Funcoes({ onBack }) {
  return <Montar module={module} onBack={onBack} />
}

export default Funcoes