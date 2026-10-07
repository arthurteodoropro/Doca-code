import { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'

const RECTANGULAR_RENDERER = 'pyblocks_rectangular'
const CONTAINER_THEME = 'pyblocks_container'

// ---------------------------------------------------------------------------
// Visual "container de carga"
// Cada bloco é um retângulo com:
//  - nervuras verticais (as ondulações da lateral do container)
//  - frame interno (moldura da porta)
//  - dobradiças/travas metálicas nas duas bordas
//  - luz no topo e sombra na base para dar volume
// ---------------------------------------------------------------------------

const RIB_SPACING = 12
const HARDWARE = { fill: '#cbd5e1', stroke: '#64748b' }

// Path object próprio: guarda camadas extras de decoração dentro do <g> do bloco.
class ContainerPathObject extends Blockly.zelos.PathObject {
  constructor(root, style, constants) {
    super(root, style, constants)
    const layer = (attrs) =>
      Blockly.utils.dom.createSvgElement('path', { 'pointer-events': 'none', ...attrs }, this.svgRoot)

    // Ordem = ordem de empilhamento (o texto dos campos fica por cima de tudo)
    this.decor = {
      ribShadow: layer({ fill: 'none', stroke: 'rgba(0,0,0,0.26)', 'stroke-width': 3 }),
      ribLight: layer({ fill: 'none', stroke: 'rgba(255,255,255,0.20)', 'stroke-width': 1 }),
      topLight: layer({ fill: 'none', stroke: 'rgba(255,255,255,0.45)', 'stroke-width': 2 }),
      bottomShade: layer({ fill: 'none', stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 2 }),
      hardware: layer({ fill: HARDWARE.fill, stroke: HARDWARE.stroke, 'stroke-width': 0.8, 'stroke-linejoin': 'round' }),
    }
  }

  // Marca blocos "sólidos" (não-shadow). Os shadows (ex.: o número dentro de
  // um bloco de soma) mantêm a caixinha branca padrão do Zelos.
  applyColour(block) {
    super.applyColour(block)
    this.svgRoot.classList.toggle('pb-solid', !block.isShadow())
  }

  setDecor(paths) {
    for (const [key, element] of Object.entries(this.decor)) {
      element.setAttribute('d', paths ? paths[key] : '')
    }
  }
}

class RectangularConstants extends Blockly.zelos.ConstantProvider {
  init() {
    super.init()
    this.CORNER_RADIUS = 0
    this.ROUNDED = this.makeSquared()
    this.HEXAGONAL = this.makeSquared()
  }
}

class RectangularDrawer extends Blockly.zelos.Drawer {
  drawOutline_() {
    // Deixa o Blockly calcular as conexões e depois troca o contorno de
    // peça de quebra-cabeça por um retângulo com moldura interna (porta).
    super.drawOutline_()
    const { startX, startY, width, height } = this.info_
    const inset = 5
    const innerLeft = startX + inset
    const innerTop = startY + inset
    const innerRight = width - inset
    const innerBottom = height - inset

    this.outlinePath_ = `M ${startX} ${startY} H ${width} V ${height} H ${startX} Z M ${innerLeft} ${innerTop} H ${innerRight} V ${innerBottom} H ${innerLeft} Z`
  }

  draw() {
    super.draw()
    this.block_.pathObject.setDecor?.(this.buildDecor())
  }

  buildDecor() {
    const { startX, startY, width, height } = this.info_
    const bodyW = width - startX
    const bodyH = height - startY
    if (this.block_.isInsertionMarker() || this.block_.isShadow() || bodyW < 30 || bodyH < 24) return null

    // As nervuras ficam só na parte "pintada" da peça: terminam onde começa
    // o encaixe da direita (por onde entram as próximas peças da linha).
    let ribLimit = width - 16
    for (const row of this.info_.rows ?? []) {
      for (const element of row.elements ?? []) {
        if (Blockly.blockRendering.Types.isInlineInput(element)) {
          ribLimit = Math.min(ribLimit, element.xPos - 4)
        }
      }
    }

    // Nervuras verticais
    let ribShadow = ''
    let ribLight = ''
    for (let x = startX + 18; x < ribLimit; x += RIB_SPACING) {
      ribShadow += `M ${x} ${startY + 8} V ${height - 8} `
      ribLight += `M ${x + 2} ${startY + 8} V ${height - 8} `
    }

    // Dobradiças / travas nas duas bordas
    const latches = bodyH > 70 ? 3 : 2
    const latchW = 6
    const latchH = 11
    let hardware = ''
    for (let i = 1; i <= latches; i++) {
      const y = startY + (bodyH * i) / (latches + 1) - latchH / 2
      for (const x of [startX + 1, width - latchW - 1]) {
        hardware += `M ${x} ${y} h ${latchW} v ${latchH} h ${-latchW} Z `
      }
    }

    return {
      ribShadow,
      ribLight,
      topLight: `M ${startX + 1} ${startY + 1} H ${width - 1}`,
      bottomShade: `M ${startX + 1} ${height - 1} H ${width - 1}`,
      hardware,
    }
  }
}

const ALIGN_CENTRE = Blockly.inputs?.Align?.CENTRE ?? 0

// Centraliza o conteúdo (texto/campos) de todas as linhas do bloco.
class RectangularRenderInfo extends Blockly.zelos.RenderInfo {
  alignRowElements_() {
    for (const row of this.rows) {
      if (Blockly.blockRendering.Types.isInputRow(row) && !row.hasStatement) {
        row.align = ALIGN_CENTRE
      }
    }
    super.alignRowElements_()
  }
}

class RectangularRenderer extends Blockly.zelos.Renderer {
  makeConstants_() {
    return new RectangularConstants()
  }

  makeRenderInfo_(block) {
    return new RectangularRenderInfo(this, block)
  }

  makeDrawer_(block, info) {
    return new RectangularDrawer(block, info)
  }

  makePathObject(root, style) {
    return new ContainerPathObject(root, style, this.getConstants())
  }
}

if (!Blockly.registry.hasItem(Blockly.registry.Type.RENDERER, RECTANGULAR_RENDERER)) {
  Blockly.blockRendering.register(RECTANGULAR_RENDERER, RectangularRenderer)
}

// Tema: texto em negrito (parece pintura de container) e fundo azul-claro de pátio.
const containerTheme = Blockly.Theme.defineTheme(CONTAINER_THEME, {
  name: CONTAINER_THEME,
  base: Blockly.Themes.Zelos,
  fontStyle: { family: 'Inter, system-ui, sans-serif', weight: '700', size: 11 },
  componentStyles: {
    workspaceBackgroundColour: '#f1f6fd',
    flyoutBackgroundColour: '#dbe7f5',
    flyoutOpacity: 1,
  },
})

// ---------------------------------------------------------------------------
// Edição de valores: popup "porta do container"
// Clicar em qualquer parte da peça (ou direto no valor) abre uma caixa com os
// campos editáveis dela, como se o valor estivesse guardado dentro do container.
// ---------------------------------------------------------------------------

const CONTAINER_CSS = `
/* Blocos sólidos: o valor aparece escrito direto na peça (pintura do container). */
.pb-solid > .blocklyEditableField > rect:not(.blocklyDropdownRect),
.pb-solid > .blocklyEditableText > rect:not(.blocklyDropdownRect) {
  fill: transparent !important;
  stroke: none !important;
}
.pb-solid > .blocklyEditableField > text:not(.blocklyDropdownText),
.pb-solid > .blocklyEditableText > text:not(.blocklyDropdownText) {
  fill: #ffffff !important;
  font-weight: 700;
}

/* Popup de preenchimento */
.pb-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.18);
}
.pb-popup {
  position: fixed;
  z-index: 1001;
  width: 290px;
  box-sizing: border-box;
  background-color: #e2e8f0;
  background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 3px, transparent 3px 12px);
  border: 3px solid #475569;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.38);
  font-family: Inter, system-ui, sans-serif;
  color: #1e293b;
}
.pb-popup::before,
.pb-popup::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 6px;
  height: 30px;
  transform: translateY(-50%);
  background: #cbd5e1;
  border: 1px solid #64748b;
}
.pb-popup::before { left: -7px; }
.pb-popup::after { right: -7px; }
.pb-popup-title {
  margin: 0;
  padding: 8px 12px;
  background: #475569;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pb-popup-body { padding: 12px; display: grid; gap: 10px; }
.pb-popup label { display: grid; gap: 4px; font-size: 11px; font-weight: 700; color: #334155; }
.pb-popup input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 2px solid #94a3b8;
  background: #ffffff;
  color: #0f172a;
  font: 600 13px Inter, system-ui, sans-serif;
  outline: none;
}
.pb-popup input:focus { border-color: #0ea5e9; }
.pb-popup-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 2px; }
.pb-popup-actions button {
  padding: 7px 12px;
  border: 2px solid #475569;
  background: #f8fafc;
  color: #334155;
  font: 700 12px Inter, system-ui, sans-serif;
  cursor: pointer;
}
.pb-popup-actions button[type='submit'] { background: #0ea5e9; border-color: #0369a1; color: #ffffff; }
`

const InputField = Blockly.FieldInput ?? Blockly.FieldTextInput

const BLOCK_TITLES = {
  py_comment: 'Comentário',
  py_input: 'Entrada',
  py_assign: 'Definir variável',
  py_variable: 'Variável',
  text_print: 'Imprimir',
  text: 'Texto',
  math_number: 'Número',
  math_arithmetic: 'Operação',
  logic_compare: 'Comparação',
  controls_for: 'Contar com',
  py_num: 'Número',
  py_text: 'Texto',
}
const FIELD_LABELS = { NAME: 'Nome', VALUE: 'Valor', TEXT: 'Texto', PROMPT: 'Pergunta', NUM: 'Número' }
const INPUT_LABELS = { A: 'Valor A', B: 'Valor B', FROM: 'De', TO: 'Até', BY: 'Passo', TEXT: 'Texto' }

// Campos editáveis do bloco + os dos blocos shadow encaixados nele.
function collectFields(block) {
  const items = []
  const push = (source, labels, useInputName) => {
    for (const input of source.inputList) {
      for (const field of input.fieldRow) {
        if (field instanceof InputField && field.isClickable()) {
          const label = (useInputName && INPUT_LABELS[useInputName]) || labels[field.name] || 'Valor'
          items.push({ field, label })
        }
      }
    }
  }
  push(block, FIELD_LABELS, null)
  for (const input of block.inputList) {
    const child = input.connection?.targetBlock()
    if (child && child.isShadow()) push(child, FIELD_LABELS, input.name)
  }
  return items
}

// Ponte entre o Blockly (fora do React) e o popup (dentro do React).
let openFieldEditor = null
let lastOpenAt = 0

// Substitui a caixinha nativa de edição pelo popup. Se o popup não estiver
// disponível (ex.: componente desmontado), cai no editor nativo.
if (InputField && !InputField.prototype.__pbPatched) {
  const nativeShowEditor = InputField.prototype.showEditor_
  InputField.prototype.showEditor_ = function (e, quietInput) {
    const block = this.getSourceBlock?.()
    if (openFieldEditor && block && !block.isInFlyout && openFieldEditor(block, this)) return
    nativeShowEditor.call(this, e, quietInput)
  }
  InputField.prototype.__pbPatched = true
}

// Peças já encaixadas nos slots (blocos reais, não shadows), para que o
// aluno possa arrastá-las, trocá-las ou continuar a linha à direita delas.
const num = (n) => ({ block: { type: 'py_num', fields: { NUM: n } } })
const txt = (t) => ({ block: { type: 'py_text', fields: { TEXT: t } } })
const op = (type, symbol) => ({ kind: 'block', type, fields: { OP: symbol } })

const toolbox = { kind: 'categoryToolbox', contents: [
  { kind: 'category', name: 'Básico', colour: '#64748b', contents: [{ kind: 'block', type: 'py_comment' }] },
  { kind: 'category', name: 'Entrada/Saída', colour: '#0ea5e9', contents: [
    { kind: 'block', type: 'text_print', inputs: { TEXT: txt('Olá, mundo!') } },
    { kind: 'block', type: 'py_text' },
    { kind: 'block', type: 'py_input' },
  ] },
  { kind: 'category', name: 'Variáveis', colour: '#8b5cf6', contents: [
    { kind: 'block', type: 'py_assign', inputs: { VALUE: num(20) } },
    { kind: 'block', type: 'py_variable' },
  ] },
  { kind: 'category', name: 'Matemática', colour: '#f59e0b', contents: [
    { kind: 'block', type: 'py_num' },
    op('py_op_math', '+'),
    op('py_op_math', '-'),
    op('py_op_math', '*'),
    op('py_op_math', '/'),
    op('py_op_math', '//'),
    op('py_op_math', '%'),
    op('py_op_math', '**'),
    { kind: 'block', type: 'py_paren', fields: { OP: '(' } },
    { kind: 'block', type: 'py_paren', fields: { OP: ')' } },
  ] },
  { kind: 'category', name: 'Lógica', colour: '#e11d48', contents: [
    op('py_op_compare', '=='),
    op('py_op_compare', '!='),
    op('py_op_compare', '<'),
    op('py_op_compare', '>'),
    op('py_op_compare', '<='),
    op('py_op_compare', '>='),
    op('py_op_logic', 'and'),
    op('py_op_logic', 'or'),
    op('py_op_logic', 'not'),
  ] },
  { kind: 'category', name: 'Condições', colour: '#ec4899', contents: [{ kind: 'block', type: 'controls_if' }] },
  { kind: 'category', name: 'Repetição', colour: '#14b8a6', contents: [
    { kind: 'block', type: 'controls_whileUntil' },
    { kind: 'block', type: 'controls_for', inputs: { FROM: num(1), TO: num(10), BY: num(1) } },
  ] },
  { kind: 'category', name: 'Funções', colour: '#6366f1', custom: 'PROCEDURE' },
] }

// ---------------------------------------------------------------------------
// Expressões em linha
// Toda peça de expressão tem um encaixe à direita (input RIGHT). Encaixar uma
// peça ali acrescenta o código dela à direita no Python gerado, então
// `idade + 1 > 3` é montado como uma fileira: [idade][+][1][>][3].
// ---------------------------------------------------------------------------

const RIGHT = 'RIGHT'

// Une o código da peça com o resto da linha, sem espaço colado em parênteses.
function joinTokens(left, right) {
  if (!right) return left
  if (left.endsWith('(') || right.startsWith(')')) return left + right
  return `${left} ${right}`
}

function defineToken(type, colour, buildFields, ownCode) {
  Blockly.Blocks[type] = {
    init() {
      buildFields(this)
      this.appendValueInput(RIGHT)
      this.setInputsInline(true)
      this.setOutput(true)
      this.setColour(colour)
    },
  }
  pythonGenerator.forBlock[type] = (block) => {
    const rest = pythonGenerator.valueToCode(block, RIGHT, pythonGenerator.ORDER_NONE)
    return [joinTokens(ownCode(block), rest), pythonGenerator.ORDER_NONE]
  }
}

const sanitizeName = (raw) => raw.trim().replace(/[^a-zA-Z0-9_]/g, '_') || 'variavel'

function defineCustomBlocks() {
  // Na peça aparece só o nome. Os demais valores ficam num input invisível:
  // continuam existindo (geram código, são salvos e aparecem no popup),
  // mas não são desenhados no bloco.
  const addHiddenField = (block, name, text) => {
    const input = block.appendDummyInput(`${name}_HIDDEN`)
    input.appendField(new Blockly.FieldTextInput(text), name)
    input.setVisible(false)
  }

  Blockly.Blocks.py_comment = {
    init() {
      this.appendDummyInput().appendField('comentário')
      addHiddenField(this, 'TEXT', 'Explique seu código')
      this.setPreviousStatement(true)
      this.setNextStatement(true)
      this.setColour('#64748b')
    },
  }
  pythonGenerator.forBlock.py_comment = (block) => `# ${block.getFieldValue('TEXT')}\n`

  // Atribuição: nome = <linha de expressão encaixada à direita do "=">
  Blockly.Blocks.py_assign = {
    init() {
      this.appendDummyInput().appendField(new Blockly.FieldTextInput('idade'), 'NAME').appendField('=')
      this.appendValueInput('VALUE')
      this.setInputsInline(true)
      this.setPreviousStatement(true)
      this.setNextStatement(true)
      this.setColour('#8b5cf6')
    },
  }
  pythonGenerator.forBlock.py_assign = (block) => {
    const value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_NONE) || 'None'
    return `${sanitizeName(block.getFieldValue('NAME'))} = ${value}\n`
  }

  // Peças de expressão (todas com encaixe à direita)
  defineToken('py_num', '#f59e0b',
    (b) => b.appendDummyInput().appendField(new Blockly.FieldNumber(0), 'NUM'),
    (b) => String(b.getFieldValue('NUM')))

  defineToken('py_text', '#0ea5e9',
    (b) => b.appendDummyInput().appendField(new Blockly.FieldTextInput('texto'), 'TEXT'),
    (b) => pythonGenerator.quote_(b.getFieldValue('TEXT')))

  defineToken('py_variable', '#8b5cf6',
    (b) => b.appendDummyInput().appendField(new Blockly.FieldTextInput('idade'), 'NAME'),
    (b) => sanitizeName(b.getFieldValue('NAME')))

  defineToken('py_input', '#0ea5e9',
    (b) => {
      b.appendDummyInput().appendField('entrada')
      addHiddenField(b, 'PROMPT', 'Digite um valor')
    },
    (b) => `input(${JSON.stringify(b.getFieldValue('PROMPT'))})`)

  const opField = (options) => (b) => b.appendDummyInput().appendField(new Blockly.FieldDropdown(options), 'OP')
  const opCode = (b) => b.getFieldValue('OP')

  defineToken('py_op_math', '#f59e0b',
    opField([['+', '+'], ['−', '-'], ['×', '*'], ['÷', '/'], ['// (divisão inteira)', '//'], ['% (resto)', '%'], ['** (potência)', '**']]),
    opCode)

  defineToken('py_op_compare', '#e11d48',
    opField([['==', '=='], ['≠', '!='], ['<', '<'], ['>', '>'], ['≤', '<='], ['≥', '>=']]),
    opCode)

  defineToken('py_op_logic', '#e11d48',
    opField([['e', 'and'], ['ou', 'or'], ['não', 'not']]),
    opCode)

  defineToken('py_paren', '#f59e0b',
    opField([['(', '('], [')', ')']]),
    opCode)
}

// ---------------------------------------------------------------------------
// Execução com Pyodide (Python rodando no navegador)
// Carregado sob demanda via CDN na primeira vez que o aluno clica em Executar.
// ---------------------------------------------------------------------------

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
let pyodidePromise = null

function loadPyodideOnce() {
  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      const start = () => window.loadPyodide({ indexURL: PYODIDE_URL }).then(resolve, reject)
      if (window.loadPyodide) return start()
      const script = document.createElement('script')
      script.src = `${PYODIDE_URL}pyodide.js`
      script.onload = start
      script.onerror = () => reject(new Error('Não foi possível baixar o Pyodide. Verifique a conexão com a internet.'))
      document.head.appendChild(script)
    }).catch((error) => {
      pyodidePromise = null
      throw error
    })
  }
  return pyodidePromise
}

// input() do Python passa a usar a janelinha do navegador e ecoa a pergunta e a resposta no console.
const PYODIDE_SETUP = `
import builtins
def _pb_input(prompt=''):
    answer = __pb_prompt(str(prompt))
    print(str(prompt) + answer)
    return answer
builtins.input = _pb_input
`

// Caixa de preenchimento aberta sobre a peça clicada.
function FieldPopup({ editor, onChange, onCommit, onCancel }) {
  const focusRef = useRef(null)

  useEffect(() => {
    // Pequeno atraso: o Blockly devolve o foco ao workspace logo após o clique.
    const timer = setTimeout(() => {
      focusRef.current?.focus()
      focusRef.current?.select()
    }, 30)
    return () => clearTimeout(timer)
  }, [])

  const submit = (event) => {
    event.preventDefault()
    onCommit()
  }

  return (
    <>
      <div className="pb-backdrop" onMouseDown={onCancel} />
      <form
        className="pb-popup"
        style={{ left: editor.left, top: editor.top }}
        onSubmit={submit}
        onKeyDown={(event) => { if (event.key === 'Escape') onCancel() }}
        role="dialog"
        aria-label={`Preencher ${editor.title}`}
      >
        <h3 className="pb-popup-title">▣ {editor.title}</h3>
        <div className="pb-popup-body">
          {editor.items.map((item, index) => (
            <label key={index}>
              {item.label}
              <input
                ref={index === editor.focus ? focusRef : null}
                value={item.value}
                onChange={(event) => onChange(index, event.target.value)}
              />
            </label>
          ))}
          <div className="pb-popup-actions">
            <button type="button" onClick={onCancel}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>
        </div>
      </form>
    </>
  )
}

function Montar({ onBack }) {
  const editorRef = useRef(null)
  const workspaceRef = useRef(null)
  const [code, setCode] = useState('# Arraste blocos para começar\n')
  const [consoleText, setConsoleText] = useState('> Pronto para montar seu programa.')
  const [hasBlocks, setHasBlocks] = useState(false)
  const [popup, setPopup] = useState(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    defineCustomBlocks()
    const workspace = Blockly.inject(editorRef.current, { toolbox, renderer: RECTANGULAR_RENDERER, theme: containerTheme, trashcan: true, grid: { spacing: 20, length: 3, colour: '#d7e4f6', snap: true }, zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 1.35, minScale: 0.55 } })
    workspaceRef.current = workspace

    // Abre o popup para o bloco (ou, se for um shadow, para o bloco que o contém).
    const openEditor = (block, clickedField) => {
      const host = block.isShadow() && block.getParent() ? block.getParent() : block
      const items = collectFields(host)
      if (!items.length) return false

      const rect = host.getSvgRoot().getBoundingClientRect()
      const popupWidth = 290
      const popupHeight = 120 + items.length * 62
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - popupWidth - 16))
      const top = Math.max(8, Math.min(rect.bottom + 10, window.innerHeight - popupHeight - 8))

      lastOpenAt = Date.now()
      setPopup({
        title: BLOCK_TITLES[host.type] ?? 'Peça',
        left,
        top,
        focus: Math.max(0, items.findIndex((item) => item.field === clickedField)),
        items: items.map(({ field, label }) => ({ field, label, value: String(field.getValue() ?? '') })),
        openedAt: lastOpenAt,
      })
      return true
    }
    openFieldEditor = openEditor

    const updateCode = () => {
      setCode(pythonGenerator.workspaceToCode(workspace).trim() || '# Arraste blocos para começar')
      setHasBlocks(workspace.getAllBlocks(false).length > 0)
    }
    workspace.addChangeListener(updateCode)

    // Clicar em qualquer parte da peça abre o popup com o valor dela.
    // (Clicar direto no valor já abre via showEditor_; o "lastOpenAt" evita abrir duas vezes.)
    workspace.addChangeListener((event) => {
      if (event.type !== Blockly.Events.CLICK || event.targetType !== 'block' || !event.blockId) return
      const block = workspace.getBlockById(event.blockId)
      if (!block || block.isInFlyout) return
      setTimeout(() => {
        if (Date.now() - lastOpenAt < 250) return
        // Se o clique abriu um dropdown (ex.: operador + − × ÷), deixa ele em paz.
        if (Blockly.DropDownDiv?.isVisible?.()) return
        openEditor(block, null)
      }, 0)
    })

    const resize = () => Blockly.svgResize(workspace)
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      openFieldEditor = null
      workspace.dispose()
    }
  }, [])

  const changePopupValue = (index, value) => {
    setPopup((current) => current && {
      ...current,
      items: current.items.map((item, i) => (i === index ? { ...item, value } : item)),
    })
  }

  const commitPopup = () => {
    if (popup) {
      for (const { field, value } of popup.items) {
        if (value !== String(field.getValue() ?? '')) field.setValue(value)
      }
    }
    setPopup(null)
  }

  const clearWorkspace = () => { workspaceRef.current?.clear(); setConsoleText('> Workspace limpo.\n✓ Pronto para um novo programa.') }
  const saveWorkspace = () => { if (workspaceRef.current) localStorage.setItem('pyblocks-workspace', JSON.stringify(Blockly.serialization.workspaces.save(workspaceRef.current))); setConsoleText('✓ Projeto salvo neste navegador.') }
  const runProgram = async () => {
    if (running) return
    setRunning(true)
    setConsoleText('> Carregando o Python (Pyodide)...\n(na primeira vez pode levar alguns segundos)')
    let namespace = null
    try {
      const pyodide = await loadPyodideOnce()
      let output = ''
      pyodide.setStdout({ batched: (text) => { output += `${text}\n` } })
      pyodide.setStderr({ batched: (text) => { output += `${text}\n` } })
      pyodide.globals.set('__pb_prompt', (question) => window.prompt(question) ?? '')
      await pyodide.runPythonAsync(PYODIDE_SETUP)

      // Namespace novo a cada execução: variáveis de uma execução não vazam para a próxima.
      namespace = pyodide.globals.get('dict')()
      await pyodide.runPythonAsync(code, { globals: namespace })
      setConsoleText(`> Executando programa...\n\n${output || '(o programa não imprimiu nada)'}\n✓ Programa finalizado`)
    } catch (error) {
      // O erro do Python vem com o traceback inteiro; as últimas linhas são as que importam.
      const lines = String(error?.message ?? error).trim().split('\n')
      setConsoleText(`> Executando programa...\n\n✗ Erro:\n${lines.slice(-4).join('\n')}`)
    } finally {
      namespace?.destroy?.()
      setRunning(false)
    }
  }
  const copyCode = async () => { await navigator.clipboard?.writeText(code); setConsoleText('✓ Código Python copiado para a área de transferência.') }

  return (
    <section className="pyblocks-page">
      <style>{CONTAINER_CSS}</style>
      <main className="pyblocks-main"><section className="pyblocks-workspace"><div ref={editorRef} className="blockly-editor" aria-label="Workspace de blocos" />{!hasBlocks && <div className="pyblocks-empty-state" aria-hidden="true"><span>▣</span><strong>Arraste os blocos para começar</strong><p>Monte seu programa usando as categorias à esquerda.</p></div>}</section><section className="pyblocks-code"><div className="pyblocks-panel-heading"><h2><span aria-hidden="true">⌘</span> Python</h2><button type="button" onClick={copyCode}>▣ Copiar</button></div><pre>{code.split('\n').map((line, index) => <code key={`${index}-${line}`}><span>{index + 1}</span>{line || ' '}</code>)}</pre></section></main>
      <section className="pyblocks-console"><div className="pyblocks-status"><span aria-hidden="true" /> <strong>Pronto</strong><small>Sua vez de criar!</small></div><pre aria-label="Console">{consoleText}</pre><nav aria-label="Ações do editor"><button type="button" onClick={onBack}>← Voltar</button><button type="button" onClick={saveWorkspace}>💾 Salvar</button><button type="button" onClick={clearWorkspace}>↻ Limpar</button><button type="button" className="pyblocks-run" onClick={runProgram} disabled={running}>{running ? '⏳ Executando...' : '▶ Executar'}</button></nav></section>
      {popup && (
        <FieldPopup
          key={popup.openedAt}
          editor={popup}
          onChange={changePopupValue}
          onCommit={commitPopup}
          onCancel={() => setPopup(null)}
        />
      )}
    </section>
  )
}

export default Montar