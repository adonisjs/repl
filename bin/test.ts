import { assert } from '@japa/assert'
import { fileSystem } from '@japa/file-system'
import { processCLIArgs, configure, run } from '@japa/runner'
import { BASE_URL } from '../test_helpers/index.js'

processCLIArgs(process.argv.slice(2))
configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [assert(), fileSystem({ basePath: BASE_URL })],
})

run()
