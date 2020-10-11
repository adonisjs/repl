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
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class ReplProvider {
	constructor(protected app: ApplicationContract) {}
	public static needsApplication = true

	public register() {
		this.app.container.singleton('Adonis/Addons/Repl', () => {
			const compiler = global[Symbol.for('REQUIRE_TS_COMPILER')]
			const { Repl } = require('../src/Repl')
			return new Repl(compiler, join(homedir(), '.adonis_repl_history'))
		})
	}
}
