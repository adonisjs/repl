/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { processTopLevelAwait } from 'node-repl-await'
import { Compiler as TsCompiler } from '@adonisjs/require-ts/build/src/Compiler'

import { ImportsParser } from '../ImportsParser'

/**
 * Exposes the API to compile the user land code to be executed
 * inside Node.JS REPL.
 */
export class Compiler {
  public compilesTs: boolean = !!this.tsCompiler
  constructor(private tsCompiler?: TsCompiler) {}

  /**
   * Process the await keywords in the code
   */
  private processAwait(statement: string) {
    const potentialWrappedCode = processTopLevelAwait(statement)
    if (!potentialWrappedCode) {
      return { compiled: statement, awaitPromise: false }
    }

    return { compiled: potentialWrappedCode, awaitPromise: true }
  }

  /**
   * Compiles code using typescript
   */
  private async compileTypescript(statement: string, filename: string) {
    const lines = statement.split(/\n|\r\n/)
    let compiledOutput = statement

    /**
     * In case of a single line, we process the import
     * keywords and define local variables to hold
     * the import reference
     */
    if (lines.length <= 2) {
      compiledOutput = await new ImportsParser().parse(statement)
    }

    /**
     * Compile using typescript compiler and patch the
     * `sourceMappingUrl` comment to be a block level comment.
     */
    compiledOutput = this.tsCompiler!.compile(filename, compiledOutput)
    return `${compiledOutput.replace('//# sourceMappingURL=', '/**# sourceMappingURL=')} */`
  }

  /**
   * Compiles the code to be executed in the Node.js REPL. Under
   * the hood
   *
   * - Typescript code is compiled
   * - Await keywords are wrapped in async IIFE
   */
  public async compile(statement: string, filename: string) {
    if (this.tsCompiler) {
      statement = await this.compileTypescript(statement, filename)
    }
    return this.processAwait(statement)
  }
}
