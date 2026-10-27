import Montar from '../Montar'

const module = {
  number: 1,
  title: 'Declaração de variáveis e introdução ao sistema',
  description: 'Guarde dados de cada carga em nomes fáceis de reconhecer.',
  steps: [
    { title: 'Escolha um nome', description: 'Use nomes claros e sem espaços para identificar cada informação.', example: 'codigo_carga' },
    { title: 'Atribua um valor', description: 'O bloco Variáveis permite definir o conteúdo inicial.', example: 'codigo_carga = "CT-204"' },
    { title: 'Reutilize a variável', description: 'Conecte-a a outros blocos sem digitar o valor novamente.', example: 'print(codigo_carga)' },
  ],
}

function DeclaracaoVariaveis({ onBack }) {
  return <Montar module={module} onBack={onBack} />
}

export default DeclaracaoVariaveis