/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Repl' {
	import { REPLServer } from 'repl'
	import { getBest } from '@poppinss/colors'

	/**
	 * Custom method callback
	 */
	export type Handler = (repl: ReplContract, ...args: any[]) => any

	/**
	 * Options that can be set when defining a loader
	 * method
	 */
	export type ContextOptions = {
		description?: string
		usage?: string
	}

	/**
	 * Shape of the REPL class
	 */
	export interface ReplContract {
		colors: ReturnType<typeof getBest>

		/**
		 * Reference to the REPL server
		 */
		server: REPLServer

		/**
		 * Start the repl
		 */
		start(): this

		/**
		 * Notify by writing message to the console
		 * and resuming the prompt
		 */
		notify(message: string): void

		/**
		 * Add a method. Loader methods works as a shortcut for
		 */
		addMethod(name: string, handler: Handler, options?: ContextOptions): this
	}

	const Repl: ReplContract
	export default Repl
}
