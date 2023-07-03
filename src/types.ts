/*
 * @adonisjs/repl
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Repl } from './repl.js'

/**
 * Custom method handler
 */
export type Handler = (repl: Repl, ...args: any[]) => any

/**
 * Options that can be set when defining a loader
 * method
 */
export type ContextOptions = {
  description?: string
  usage?: string
}

/**
 * Shape of the Compiler that must be passed to the
 * repl constructor
 */
export type Compiler = {
  compile: (code: string, fileName: string) => string
  supportsTypescript: boolean
}
