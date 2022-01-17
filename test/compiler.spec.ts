/*
 * @adonisjs/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EOL } from 'os'
import test from 'japa'
import { Compiler } from '../src/Compiler'

const COMPILER_SYMBOL = Symbol.for('REQUIRE_TS_COMPILER')

function removeSourceMap(line: string) {
  return line.replace(/\/\*\*# sourceMappingURL.* \*\//g, '')
}

function getImportDefaultStatement() {
  return [
    '"use strict";',
    'var __importDefault = (this && this.__importDefault) || function (mod) {',
    '    return (mod && mod.__esModule) ? mod : { "default": mod };',
    '};',
    'Object.defineProperty(exports, "__esModule", { value: true });',
  ].join(EOL)
}

function getAsyncImportDefaultStatement() {
  return [
    '(async () => { "use strict";',
    'void (__importDefault = (this && this.__importDefault) || function (mod) {',
    '    return (mod && mod.__esModule) ? mod : { "default": mod };',
    '});',
    'Object.defineProperty(exports, "__esModule", { value: true });',
  ].join(EOL)
}

test.group('Compiler', () => {
  test('compile single line statement', async (assert) => {
    const compiler = new Compiler(global[COMPILER_SYMBOL])
    const { compiled, awaitPromise } = await compiler.compile('2 + 2', __filename)
    assert.equal(removeSourceMap(compiled).trim(), '2 + 2;')
    assert.isFalse(awaitPromise)
  })

  test('compile single line import statements', async (assert) => {
    const compiler = new Compiler(global[COMPILER_SYMBOL])
    const { compiled, awaitPromise } = await compiler.compile(
      `import User from 'App/Models/User'`,
      __filename
    )

    assert.equal(
      removeSourceMap(compiled).trim(),
      [
        getImportDefaultStatement(),
        'const User_1 = __importDefault(require("App/Models/User"));',
        'var User = User_1.default;',
      ].join(EOL)
    )
    assert.isFalse(awaitPromise)
  })

  test('compile await keyword', async (assert) => {
    const compiler = new Compiler(global[COMPILER_SYMBOL])
    const { compiled, awaitPromise } = await compiler.compile(`await getDb()`, __filename)

    assert.equal(
      removeSourceMap(compiled).trim(),
      ['(async () => { return (await getDb());\n })()'].join(EOL)
    )
    assert.isTrue(awaitPromise)
  })

  test('compile await keyword with variable assignment', async (assert) => {
    const compiler = new Compiler(global[COMPILER_SYMBOL])
    const { compiled, awaitPromise } = await compiler.compile(
      `const db = await getDb()`,
      __filename
    )

    assert.equal(
      removeSourceMap(compiled).trim(),
      ['(async () => { void (db = await getDb());', ' })()'].join(EOL)
    )
    assert.isTrue(awaitPromise)
  })

  test('compile await keyword with destructuring assignment', async (assert) => {
    const compiler = new Compiler(global[COMPILER_SYMBOL])
    const { compiled, awaitPromise } = await compiler.compile(
      `const { db } = await getDb()`,
      __filename
    )

    assert.equal(
      removeSourceMap(compiled).trim(),
      ['(async () => { void ({ db } = await getDb());', ' })()'].join(EOL)
    )
    assert.isTrue(awaitPromise)
  })

  test('compile multi-line import statements', async (assert) => {
    const compiler = new Compiler(global[COMPILER_SYMBOL])
    const { compiled, awaitPromise } = await compiler.compile(
      `
			import User from 'App/Models/User'
			await User.find()
			`,
      __filename
    )

    assert.equal(
      removeSourceMap(compiled).trim(),
      [
        getAsyncImportDefaultStatement(),
        'void (User_1 = __importDefault(require("App/Models/User")));',
        'return (await User_1.default.find());',
        ' })()',
      ].join(EOL)
    )
    assert.isTrue(awaitPromise)
  })
})
