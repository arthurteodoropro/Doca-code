import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'

const RIGHT = 'RIGHT'

const sanitizeName = (raw) => raw.trim().replace(/[^a-zA-Z0-9_]/g, '_') || 'variavel'

function addStatementConnections(block) {
  block.setPreviousStatement(true)
  block.setNextStatement(true)
}

function addHiddenField(block, name, value) {
  block.appendDummyInput(`${name}_HIDDEN`).appendField(new Blockly.FieldTextInput(value), name).setVisible(false)
}

function defineToken(type, colour, buildFields, ownCode) {
  Blockly.Blocks[type] = {
    init() {
      const input = this.appendValueInput(RIGHT).setCheck('Expression')
      buildFields(input, this)
      this.setInputsInline(false)
      this.setOutput(true, 'Expression')
      this.setColour(colour)
    },
  }
  pythonGenerator.forBlock[type] = (block) => {
    const rest = pythonGenerator.valueToCode(block, RIGHT, pythonGenerator.ORDER_NONE)
    const left = ownCode(block)
    if (!rest) return [left, pythonGenerator.ORDER_NONE]
    if (left.endsWith('(') || rest.startsWith(')')) return [`${left}${rest}`, pythonGenerator.ORDER_NONE]
    return [`${left} ${rest}`, pythonGenerator.ORDER_NONE]
  }
}

function defineOperator(type, colour, options) {
  defineToken(
    type,
    colour,
    (input) => input.appendField(new Blockly.FieldDropdown(options), 'OP'),
    (block) => block.getFieldValue('OP'),
  )
}

export function registerPythonBlocks() {
  Blockly.Blocks.py_comment = {
    init() {
      this.appendDummyInput().appendField('comentário')
      addHiddenField(this, 'TEXT', 'Explique seu código')
      addStatementConnections(this)
      this.setColour('#64748b')
    },
  }
  pythonGenerator.forBlock.py_comment = (block) => `# ${block.getFieldValue('TEXT')}\n`

  Blockly.Blocks.py_assign = {
    init() {
      this.appendValueInput('EXPRESSION').setCheck('Expression').appendField('definir')
      this.setInputsInline(false)
      addStatementConnections(this)
      this.setColour('#8b5cf6')
    },
  }
  pythonGenerator.forBlock.py_assign = (block) => {
    const expression = pythonGenerator.valueToCode(block, 'EXPRESSION', pythonGenerator.ORDER_NONE)
    return expression ? `${expression}\n` : 'pass\n'
  }

  Blockly.Blocks.text_print = {
    init() {
      this.appendValueInput('TEXT').setCheck('Expression').appendField('imprimir')
      this.setInputsInline(false)
      addStatementConnections(this)
      this.setColour('#0ea5e9')
    },
  }
  pythonGenerator.forBlock.text_print = (block) => {
    const value = pythonGenerator.valueToCode(block, 'TEXT', pythonGenerator.ORDER_NONE) || "''"
    return `print(${value})\n`
  }

  defineToken('py_num', '#f59e0b',
    (input) => input.appendField(new Blockly.FieldNumber(0), 'NUM'),
    (block) => String(block.getFieldValue('NUM')))

  defineToken('py_text', '#0ea5e9',
    (input) => input.appendField(new Blockly.FieldTextInput('texto'), 'TEXT'),
    (block) => pythonGenerator.quote_(block.getFieldValue('TEXT')))

  defineToken('py_variable', '#8b5cf6',
    (input) => input.appendField(new Blockly.FieldTextInput('idade'), 'NAME'),
    (block) => sanitizeName(block.getFieldValue('NAME')))

  defineToken('py_input', '#0ea5e9',
    (input, block) => {
      input.appendField('entrada')
      addHiddenField(block, 'PROMPT', 'Digite um valor')
    },
    (block) => `input(${JSON.stringify(block.getFieldValue('PROMPT'))})`)

  defineOperator('py_op_assign', '#8b5cf6', [['=', '=']])
  defineOperator('py_op_math', '#f59e0b', [['+', '+'], ['−', '-'], ['×', '*'], ['÷', '/'], ['// (divisão inteira)', '//'], ['% (resto)', '%'], ['** (potência)', '**']])
  defineOperator('py_op_compare', '#e11d48', [['==', '=='], ['≠', '!='], ['<', '<'], ['>', '>'], ['≤', '<='], ['≥', '>=']])
  defineOperator('py_op_logic', '#e11d48', [['e', 'and'], ['ou', 'or'], ['não', 'not']])
  defineOperator('py_paren', '#f59e0b', [['(', '('], [')', ')']])

  Blockly.Blocks.controls_for = {
    init() {
      this.appendDummyInput().appendField('para').appendField(new Blockly.FieldTextInput('i'), 'VAR')
      this.appendValueInput('FROM').setCheck('Expression').appendField('de')
      this.appendValueInput('TO').setCheck('Expression').appendField('até')
      this.appendValueInput('BY').setCheck('Expression').appendField('passo')
      this.appendStatementInput('DO').appendField('faça')
      this.setInputsInline(false)
      addStatementConnections(this)
      this.setColour('#14b8a6')
    },
  }
  pythonGenerator.forBlock.controls_for = (block) => {
    const variable = sanitizeName(block.getFieldValue('VAR'))
    const from = pythonGenerator.valueToCode(block, 'FROM', pythonGenerator.ORDER_NONE) || '0'
    const to = pythonGenerator.valueToCode(block, 'TO', pythonGenerator.ORDER_NONE) || '0'
    const by = pythonGenerator.valueToCode(block, 'BY', pythonGenerator.ORDER_NONE) || '1'
    const body = pythonGenerator.statementToCode(block, 'DO') || '  pass\n'
    return `for ${variable} in range(${from}, ${to}, ${by}):\n${body}`
  }
}