import assert from 'node:assert/strict'
import test from 'node:test'
import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'
import { registerPythonBlocks } from '../src/pythonBlocks.js'

test('mantém tokens em expressão horizontal e comandos em sequência vertical', () => {
  registerPythonBlocks()
  const workspace = new Blockly.Workspace()

  const assignment = workspace.newBlock('py_assign')
  const variable = workspace.newBlock('py_variable')
  const equals = workspace.newBlock('py_op_assign')
  const assignedNumber = workspace.newBlock('py_num')
  const print = workspace.newBlock('text_print')
  const printedVariable = workspace.newBlock('py_variable')
  const plus = workspace.newBlock('py_op_math')
  const addend = workspace.newBlock('py_num')

  variable.setFieldValue('idade', 'NAME')
  assignedNumber.setFieldValue(20, 'NUM')
  printedVariable.setFieldValue('idade', 'NAME')
  plus.setFieldValue('+', 'OP')
  addend.setFieldValue(5, 'NUM')

  assignment.getInput('EXPRESSION').connection.connect(variable.outputConnection)
  variable.getInput('RIGHT').connection.connect(equals.outputConnection)
  equals.getInput('RIGHT').connection.connect(assignedNumber.outputConnection)
  assignment.nextConnection.connect(print.previousConnection)
  print.getInput('TEXT').connection.connect(printedVariable.outputConnection)
  printedVariable.getInput('RIGHT').connection.connect(plus.outputConnection)
  plus.getInput('RIGHT').connection.connect(addend.outputConnection)

  assert.ok(assignment.previousConnection)
  assert.ok(assignment.nextConnection)
  assert.equal(assignment.outputConnection, null)
  assert.equal(variable.outputConnection.getCheck()[0], 'Expression')
  assert.equal(assignment.getInput('EXPRESSION').connection.targetBlock(), variable)

  assert.equal(pythonGenerator.workspaceToCode(workspace).trim(), 'idade = 20\nprint(idade + 5)')
  workspace.dispose()
})
