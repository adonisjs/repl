import { createRequire } from 'node:module'

/**
 * Check if a given module is installed
 */
export function isModuleInstalled(moduleName: string) {
  const require = createRequire(import.meta.url)
  try {
    require.resolve(moduleName)
    return true
  } catch (error) {
    return false
  }
}
