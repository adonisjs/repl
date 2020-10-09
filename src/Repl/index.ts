/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Script } from 'vm'
import stringWidth from 'string-width'
import { getBest } from '@poppinss/colors'
import { start, REPLServer, Recoverable } from 'repl'
import { inspect, promisify as utilPromisify } from 'util'
import { ReplContract, Handler, ContextOptions } from '@ioc:Adonis/Core/Repl'
import { Compiler as TsCompiler } from '@adonisjs/require-ts/build/src/Compiler'

import { Compiler } from '../Compiler'

/**
 * List of node global properties to remove from the
 * ls inspect
 */
const GLOBAL_NODE_PROPERTIES = [
	'global',
	'clearInterval',
	'clearTimeout',
	'setInterval',
	'setTimeout',
	'queueMicrotask',
	'clearImmediate',
	'setImmediate',
	'exports',
	'__importDefault',
]

const icons =
	process.platform === 'win32' && !process.env.WT_SESSION
		? {
				tick: '√',
				pointer: '>',
		  }
		: {
				tick: '✔',
				pointer: '❯',
		  }

/**
 * Exposes the API to work the REPL server
 */
export class Repl implements ReplContract {
	/**
	 * Compiler to compile REPL input
	 */
	private compiler = new Compiler(this.tsCompiler)

	/**
	 * Length of the longest custom method name. We need to show a
	 * symmetric view of custom methods and their description
	 */
	private longestCustomMethodName = 0

	/**
	 * A set of registered custom methods
	 */
	private customMethods: {
		[name: string]: { handler: Handler; options: ContextOptions & { width: number } }
	} = {}

	/**
	 * Reference to the underlying REPL server. Available
	 * after `start` is invoked.
	 */
	public server: REPLServer

	/**
	 * Reference to the colors to print colorful messages
	 */
	public colors = getBest(false)

	constructor(private tsCompiler?: TsCompiler, private historyFilePath?: string) {}

	/**
	 * Find if the error is recoverable or not
	 */
	private isRecoverableError(error: any) {
		if (error.name === 'SyntaxError') {
			return /^(Unexpected end of input|Unexpected token)/.test(error.message)
		}
		return false
	}

	/**
	 * Custom eval method to execute the user code
	 */
	private async eval(
		cmd: string,
		_: any,
		filename: string,
		callback: (err: Error | null, result: any) => void
	): Promise<void> {
		try {
			let response: any
			const { compiled, awaitPromise } = await this.compiler.compile(cmd, filename)

			if (awaitPromise) {
				response = await new Script(compiled, { filename }).runInThisContext()
			} else {
				response = new Script(compiled, { filename }).runInThisContext()
			}
			callback(null, response)
		} catch (error) {
			if (this.isRecoverableError(error)) {
				callback(new Recoverable(error), null)
				return
			}
			callback(error, null)
		}
	}

	/**
	 * Register custom methods with the server context
	 */
	private registerCustomMethodsWithContext() {
		Object.keys(this.customMethods).forEach((name) => {
			const customMethod = this.customMethods[name]

			const handler = (...args: any[]) => {
				return customMethod.handler(this, ...args)
			}

			Object.defineProperty(handler, 'name', { value: customMethod.handler.name })
			this.server!.context[name] = handler
		})
	}

	/**
	 * Setup context with default globals
	 */
	private setupContext() {
		this.addMethod(
			'clear',
			function clear(repl: Repl, key: string) {
				if (!key) {
					console.log(repl.colors.red('Define a property name to remove from the context'))
				} else {
					delete repl.server!.context[key]
				}
				repl.server.displayPrompt()
			},
			{
				description: 'Clear a property from the REPL context',
				usage: `clear ${this.colors.gray('(propertyName)')}`,
			}
		)

		this.addMethod(
			'p',
			function promisify(_: Repl, fn: Function) {
				return utilPromisify(fn)
			},
			{
				description: 'Promisify a function. Similar to Node.js "util.promisify"',
				usage: `p ${this.colors.gray('(function)')}`,
			}
		)

		this.registerCustomMethodsWithContext()
	}

	/**
	 * Setup history file
	 */
	private setupHistory() {
		if (!this.historyFilePath) {
			return
		}

		this.server.setupHistory(this.historyFilePath, (error) => {
			if (!error) {
				return
			}

			console.log(this.colors.red('Unable to write to the history file. Exiting'))
			console.error(error)
			process.exit(1)
		})
	}

	/**
	 * Prints the welcome message
	 */
	private printWelcomeMessage() {
		console.log('')

		/**
		 * Log about typescript support
		 */
		if (this.compiler.compilesTs) {
			console.log(
				`${this.colors.dim(icons.tick)} ${this.colors.dim('typescript compilation supported')}`
			)
		}

		/**
		 * Log about top level imports
		 */
		console.log(`${this.colors.dim(icons.tick)} ${this.colors.dim('allows top level imports')}`)
		console.log('')

		/**
		 * Log about help command
		 */
		this.notify('Type ".ls" to a view list of available context methods/properties')
	}

	/**
	 * Returns context values by filtering node globals
	 * and custom methods
	 */
	private getInspectProperties() {
		return Object.keys(this.server?.context).reduce((result, key) => {
			if (!this.customMethods[key] && !GLOBAL_NODE_PROPERTIES.includes(key)) {
				result[key] = this.server?.context[key]
			}
			return result
		}, {})
	}

	/**
	 * Prints the context to the console
	 */
	private listContext() {
		/**
		 * Print loader methods
		 */
		console.log('')
		console.log(this.colors.green('GLOBAL METHODS:'))

		Object.keys(this.customMethods).forEach((method) => {
			const { options } = this.customMethods[method]
			const spaces = new Array(this.longestCustomMethodName - options.width + 2).join(' ')

			console.log(
				`${this.colors.yellow(options.usage || method)}${spaces}${this.colors.dim(
					options.description || ''
				)}`
			)
		})

		/**
		 * Print context properties
		 */
		console.log('')
		console.log(this.colors.green('CONTEXT PROPERTIES/METHODS:'))
		console.log(inspect(this.getInspectProperties(), false, 1, true))

		/**
		 * Display prompt
		 */
		this.server.displayPrompt()
	}

	/**
	 * Notify by writing to the console
	 */
	public notify(message: string) {
		console.log(this.colors.yellow().italic(message))
		if (this.server) {
			this.server.displayPrompt()
		}
	}

	/**
	 * Start the REPL session
	 */
	public start() {
		this.printWelcomeMessage()

		this.server = start({
			prompt: '> ',
			input: process.stdin,
			output: process.stdout,
			terminal: process.stdout.isTTY && !parseInt(process.env.NODE_NO_READLINE!, 10),
			useGlobal: true,
		})

		/**
		 * Define ls command
		 */
		this.server.defineCommand('ls', {
			help: 'View a list of available context methods/properties',
			action: this.listContext.bind(this),
		})

		/**
		 * Register loader methods
		 */
		this.setupContext()
		this.setupHistory()

		/**
		 * Assigning eval function like has better completion. Seriously
		 * I have no idea
		 */
		// @ts-ignore
		this.server['eval'] = this.eval.bind(this)

		/**
		 * Define exports variable
		 */
		new Script('exports = module.exports', { filename: __dirname }).runInThisContext()

		this.server.displayPrompt()
		return this
	}

	/**
	 * Register a custom loader function to be added to the context
	 */
	public addMethod(name: string, handler: Handler, options?: ContextOptions): this {
		const width = stringWidth(options?.usage || name)
		if (width > this.longestCustomMethodName) {
			this.longestCustomMethodName = width
		}

		this.customMethods[name] = { handler, options: Object.assign({ width }, options) }
		return this
	}
}
