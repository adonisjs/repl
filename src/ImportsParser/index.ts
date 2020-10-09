/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import parseImports from 'parse-imports'

/**
 * This is a crazy attempt to hack around the Typescript behavior around un-used
 * imports. Writing half baked parsers is something I want to avoid everytime.
 * However, there isn't any other way (atleast I don't know about it).
 *
 * In REPL, you usually write one line of code at a time. For example:
 * - You write 2 + 2 and then press enter. The REPL prints 4
 * - You write `await Database.query().first()` and it prints the query result.
 *
 * However, when you write `import User from 'App/Models/User'` and expect to
 * access User variable then you are out of luck.
 *
 * - The import statement will go to the typescript compiler
 * - It will compile the code and sees that no one is using this import.
 *   And hence it will just remove it from the compiled output.
 *
 * Bang! No import/require exists and hence no `User` variable exists.
 *
 * To hack around it, we need to monitor and parse import statements and hold
 * a reference to them so that the compiler doesn't remove. For example:
 *
 * Converting
 * ```ts
 * 	import User from 'App/Models/User'
 * ```
 *
 * To
 * ```ts
 * 	import repl_User from 'App/Models/User'; var User = repl_User
 * ```
 *
 * Now you can access the `User` variable.
 *
 * The tough part is attempting to parse all styles in which an import
 * statement can be written. Lucikly, there are 4 different ways to
 * do that as per the spec http://www.ecma-international.org/ecma-262/6.0/#table-40
 *
 * 		import v from "mod";									(Import default)
 * 		import * as ns from "mod";						(Import alias)
 * 		import {x} from "mod";								(Import named)
 * 		import {x as v} from "mod";						(Import named + aliases)
 *
 * However, we have to be tolerant to the white spaces.
 */
export class ImportsParser {
	private async parseImport(statement: string): Promise<string> {
		statement = statement.trim()

		/**
		 * Return the value as it is when doesn't include the import
		 * keyword
		 */
		if (!statement.startsWith('import')) {
			return statement
		}

		/**
		 * Parse all imports in the current line
		 */
		const imports = await parseImports(statement)
		const importsAsArray = [...imports]

		return importsAsArray
			.map(({ moduleSpecifier, importClause }) => {
				const tokens: string[] = []
				const localVariables: string[] = []

				/**
				 * Has `* as` namespace import
				 */
				if (importClause && importClause.namespace) {
					const identifier = `repl_${importClause.namespace}`
					tokens.push(`* as ${identifier}`)
					localVariables.push(`var ${importClause.namespace} = ${identifier}`)
				}

				/**
				 * Has default namespace import
				 */
				if (importClause && importClause.default) {
					const identifier = `repl_${importClause.default}`
					tokens.push(identifier)
					localVariables.push(`var ${importClause.default} = ${identifier}`)
				}

				/**
				 * Has named imports
				 */
				if (importClause && importClause.named.length) {
					importClause.named.forEach((name, index) => {
						const identifier = `repl_${name.binding}`
						let expression = ''

						/**
						 * Add starting curly brace to named aliases
						 */
						if (index === 0) {
							expression += '{'
						}

						/**
						 * Setup expression
						 */
						expression += `${name.specifier} as ${identifier}`

						/**
						 * Add ending curly brace to named aliases
						 */
						if (index + 1 === importClause.named.length) {
							expression += '}'
						}

						tokens.push(expression)
						localVariables.push(`var ${name.binding} = ${identifier}`)
					})
				}

				const localVariablesDeclaration = `${localVariables.join('; ')}`
				return `import ${tokens.join(',')} from ${
					moduleSpecifier.code
				}; ${localVariablesDeclaration}`
			})
			.join('')
	}

	/**
	 * Parse a given line of code
	 */
	public async parse(line: string): Promise<string> {
		const parsedStatement = await Promise.all(
			line.split(';').map((statement) => {
				return this.parseImport(statement)
			})
		)

		return parsedStatement.join('; ')
	}
}
