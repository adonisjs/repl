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
  public static commandName = 'repl'
  public static description = 'Start a new REPL session'

  public static settings = {
    loadApp: true,
    environment: 'repl' as const,
    stayAlive: true,
  }

  public async run() {
    this.application.container.withBindings(['Adonis/Core/Route'], (Route) => {
      Route.commit()
    })
    this.application.container.use('Adonis/Addons/Repl').start()

    /**
     * Gracefully shutdown the application
     */
    this.application.container.use('Adonis/Addons/Repl').server.on('exit', async () => {
      await this.application.shutdown()
    })
  }
}
