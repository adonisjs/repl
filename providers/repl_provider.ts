/*
 * @adonisjs/repl
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { homedir } from 'node:os'
import { ApplicationService } from '@adonisjs/core/types'
import { isModuleInstalled } from '../src/utils.js'
import { fileURLToPath } from 'node:url'
import { defineReplBindings } from '../src/adonis_bindings.js'

export default class ReplProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Create the typescript compiler to be used for compiling
   * the user code inside the REPL
   */
  async #createCompiler() {
    const { create } = await import('ts-node')

    const tsConfigPath = new URL('./tsconfig.json', this.app.appRoot)

    const tsNode = create({
      project: fileURLToPath(tsConfigPath),
      compilerOptions: { module: 'ESNext' },
    })

    return {
      supportsTypescript: true,
      compile(code: string, fileName: string) {
        return tsNode.compile(code, fileName)
      },
    }
  }

  register() {
    this.app.container.singleton('repl', async () => {
      const { Repl } = await import('../src/repl.js')

      let compiler
      if (isModuleInstalled('ts-node')) {
        compiler = await this.#createCompiler()
      }

      const repl = new Repl({
        compiler,
        historyFilePath: join(homedir(), '.adonis_repl_history'),
      })

      defineReplBindings(this.app, repl)

      return repl
    })
  }
}
