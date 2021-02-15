/*
 * @adonisjs/repl
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { homedir } from 'os'
import { Repl } from '../src/Repl'

/**
 * Reference to the compiler symbol to get the reference
 * to the compiler from the global object
 */
const COMPILER_SYMBOL = Symbol.for('REQUIRE_TS_COMPILER')

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

new Repl(global[COMPILER_SYMBOL], join(homedir(), '.adonis_repl_history'))
  .addMethod(
    'getDb',
    function loadDatabase(repl) {
      repl.server.context.db = db
      repl.notify(
        `Loaded database. You can access it using the ${repl.colors.underline('"db"')} property`
      )
    },
    {
      description: 'Loads database to the "db" property.',
    }
  )
  .addMethod(
    'getModels',
    (repl) => {
      repl.server.context.models = models
      repl.notify('Loaded models. You can access them using the "models" property')
      repl.server.displayPrompt()
    },
    {
      description: 'Loads database to the "models" property.',
    }
  )
  .start()
