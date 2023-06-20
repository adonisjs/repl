import { ApplicationService } from '@adonisjs/core/types'
import { Repl } from './repl.js'

function setupReplState(repl: any, key: string, value: any) {
  repl.server.context[key] = value
  repl.notify(
    `Loaded ${key} module. You can access it using the "${repl.colors.underline(key)}" variable`,
  )
}

export function defineReplBindings(application: ApplicationService, replService: Repl) {
  /**
   * Load the encryption module
   */
  replService.addMethod(
    'loadEncryption',
    async (repl) => {
      setupReplState(repl, 'encryption', await application.container.make('encryption'))
    },
    {
      description: 'Load encryption provider and save reference to the "encryption" variable',
    },
  )

  /**
   * Load the hash module
   */
  replService.addMethod(
    'loadHash',
    async (repl) => {
      setupReplState(repl, 'hash', await application.container.make('hash'))
    },
    {
      description: 'Load hash provider and save reference to the "hash" variable',
    },
  )

  /**
   * Load the HTTP router
   */
  replService.addMethod(
    'loadRouter',
    async (repl) => {
      setupReplState(repl, 'router', await application.container.make('router'))
    },
    {
      description: 'Load router and save reference to the "router" variable',
    },
  )

  /**
   * Load config
   */
  replService.addMethod(
    'loadConfig',
    async (repl) => {
      setupReplState(repl, 'config', await application.container.make('config'))
    },
    {
      description: 'Load config and save reference to the "config" variable',
    },
  )
}
