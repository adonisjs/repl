/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class ReplCommand extends BaseCommand {
	public static settings = {
		loadApp: true,
		appEnvironment: 'repl',
		stayAlive: true,
	}

	public async run() {
		this.application.container.use('Adonis/Addons/Repl').start()
	}
}
