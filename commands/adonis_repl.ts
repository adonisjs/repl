/*
 * @adonisjs/repl
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class ReplCommand extends BaseCommand {
  static commandName = 'repl'
  static description = 'Start a new REPL session'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  async run() {
    this.app.container.resolving('router', (router) => router.commit())

    /**
     * Start the repl
     */
    const repl = await this.app.container.make('repl')
    repl.start()

    /**
     * Gracefully shutdown the app
     */
    repl.server!.on('exit', async () => {
      await this.app.terminate()
    })
  }
}
