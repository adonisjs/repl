/*
 * @adonisjs/repl
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { IgnitorFactory } from '@adonisjs/core/factories'
import { test } from '@japa/runner'
import { Repl } from '../index.js'
import { BASE_URL } from '../test_helpers/index.js'

export async function setupApp(
  environment: 'web' | 'repl',
  additionalConfig: Record<string, any> = {},
) {
  const IMPORTER = (filePath: string) => {
    if (filePath.startsWith('./') || filePath.startsWith('../')) {
      return import(new URL(filePath, BASE_URL).href)
    }
    return import(filePath)
  }

  const ignitor = new IgnitorFactory()
    .merge({
      rcFileContents: {
        providers: ['../../providers/repl_provider.js'],
      },
    })
    .withCoreConfig()
    .withCoreProviders()
    .merge({ config: additionalConfig })
    .create(BASE_URL, { importer: IMPORTER })

  const app = ignitor.createApp(environment)

  await app.init()
  await app.boot()

  return { app, ignitor }
}

test.group('Repl provider', () => {
  test('Register provider', async ({ assert, fs }) => {
    await fs.create('tsconfig.json', JSON.stringify({ compilerOptions: { module: 'ESNext' } }))

    const { app } = await setupApp('repl')
    const repl = await app.container.make('repl')
    assert.instanceOf(repl, Repl)
  })
})
