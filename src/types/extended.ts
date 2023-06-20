/*
 * @adonisjs/repl
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Repl } from '../repl.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    repl: Repl
  }
}
