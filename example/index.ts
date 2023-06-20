/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { homedir } from 'node:os'
import { Repl } from '../src/repl.js'
import { create } from 'ts-node'

/**
 * A dummy database object
 */
const db = {
  query() {
    return this
  },
  from(_table: string) {
    return this
  },
  fetch: async () => {
    return [
      { id: 1, name: 'virk' },
      { id: 2, name: 'romain' },
    ]
  },
}

class User {}
class Profile {}
class Team {}
class Account {}

const models = {
  User,
  Team,
  Profile,
  Account,
}

const tsNode = create({ project: '../tsconfig.json' })
const compiler = {
  supportsTypescript: true,
  compile(code: string, fileName: string) {
    return tsNode.compile(code, fileName)
  },
}

new Repl({
  compiler,
  historyFilePath: join(homedir(), '.adonis_repl_history'),
})
  .addMethod(
    'getDb',
    function loadDatabase(repl) {
      repl.server!.context.db = db
      repl.notify(
        `Loaded database. You can access it using the ${repl.colors.underline('"db"')} property`,
      )
    },
    {
      description: 'Loads database to the "db" property.',
    },
  )
  .addMethod(
    'getModels',
    (repl) => {
      repl.server!.context.models = models
      repl.notify('Loaded models. You can access them using the "models" property')
      repl.server!.displayPrompt()
    },
    {
      description: 'Loads database to the "models" property.',
    },
  )
  .start()
