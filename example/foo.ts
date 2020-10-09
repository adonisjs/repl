/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { homedir } from 'os'
import { Repl } from '../src/Repl'

/**
 * Reference to the compiler symbol to get the reference
 * to the compiler from the global object
 */
const COMPILER_SYMBOL = Symbol.for('REQUIRE_TS_COMPILER')

const repl = new Repl(global[COMPILER_SYMBOL], join(homedir(), '.adonis_repl_history'))

repl.addMethod(
	'getUsers',
	() => {
		return [
			{ id: 1, name: 'virk' },
			{ id: 2, name: 'romain' },
		]
	},
	{
		description: 'Returns a list of users',
	}
)

repl.start()
repl.server.context.getAllUsers = () => {
	return [
		{ id: 1, name: 'virk' },
		{ id: 2, name: 'romain' },
	]
}
