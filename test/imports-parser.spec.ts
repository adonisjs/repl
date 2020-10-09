/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { ImportsParser } from '../src/ImportsParser'

test.group('Imports Parser', () => {
	test('parse namespace alias statements', async (assert) => {
		const parser = new ImportsParser()
		assert.equal(
			await parser.parse(`import * as foo from './some_module'`),
			`import * as repl_foo from './some_module'; var foo = repl_foo`
		)
	})

	test('parse default statements', async (assert) => {
		const parser = new ImportsParser()
		assert.equal(
			await parser.parse(`import foo from './some_module'`),
			`import repl_foo from './some_module'; var foo = repl_foo`
		)
	})

	test('parse named statements', async (assert) => {
		const parser = new ImportsParser()
		assert.equal(
			await parser.parse(`import { foo } from './some_module'`),
			`import {foo as repl_foo} from './some_module'; var foo = repl_foo`
		)
	})

	test('parse named + default statements', async (assert) => {
		const parser = new ImportsParser()
		assert.equal(
			await parser.parse(`import main, { foo } from './some_module'`),
			`import repl_main,{foo as repl_foo} from './some_module'; var main = repl_main; var foo = repl_foo`
		)
	})

	test('parse named with aliases', async (assert) => {
		const parser = new ImportsParser()
		assert.equal(
			await parser.parse(`import { foo as name } from './some_module'`),
			`import {foo as repl_name} from './some_module'; var name = repl_name`
		)
	})

	test('access imported value right away', async (assert) => {
		const parser = new ImportsParser()
		assert.equal(
			await parser.parse(`import foo from './some_module'; console.log(foo)`),
			`import repl_foo from './some_module'; var foo = repl_foo; console.log(foo)`
		)
	})

	test('define multiple import statements in one line', async (assert) => {
		const parser = new ImportsParser()
		assert.equal(
			await parser.parse(`import foo from './some_module'; import bar from './some_module'`),
			`import repl_foo from './some_module'; var foo = repl_foo; import repl_bar from './some_module'; var bar = repl_bar`
		)
	})
})
