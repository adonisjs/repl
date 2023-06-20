/*
 * @adonisjs/repl
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Sheet, emphasize } from 'emphasize'
import useColors from '@poppinss/colors'
import { Colors } from '@poppinss/colors/types'

/**
 * Maps the token types to the colors
 */
const sheet = (colors: Colors): Sheet => ({
  'comment': (s) => colors.gray(s),
  'quote': (s) => colors.gray(s),

  'keyword': (s) => colors.cyan(s),
  'addition': (s) => colors.cyan(s),

  'number': (s) => colors.yellow(s),
  'string': (s) => colors.green(s),
  'meta meta-string': (s) => colors.cyan(s),
  'literal': (s) => colors.yellow(s),
  'doctag': (s) => colors.cyan(s),
  'regexp': (s) => colors.red(s),

  'attribute': (s) => colors.yellow(s),
  'attr': (s) => colors.yellow(s),
  'variable': (s) => colors.yellow(s),
  'template-variable': (s) => colors.yellow(s),
  'class title': (s) => colors.yellow(s),
  'function title': (s) => colors.yellow(s),
  'type': (s) => colors.yellow(s),

  'symbol': (s) => colors.green(s),
  'bullet': (s) => colors.magenta(s),
  'subst': (s) => colors.magenta(s),
  'meta': (s) => colors.magenta(s),
  'meta keyword': (s) => colors.magenta(s),
  'link': (s) => colors.magenta(s),

  'built_in': (s) => colors.cyan(s),
  'deletion': (s) => colors.red(s),

  'emphasis': (s) => colors.italic(s),
  'strong': (s) => colors.bold(s),
  'formula': (s) => colors.inverse(s),
})

export function colorizer() {
  const colors = useColors.ansi()
  const colorSheet = sheet(colors)

  const highlight = (s: string) => emphasize.highlight('ts', s, colorSheet).value
  highlight.colorizeMatchingBracket = (s: string) => colors.bgBlue(s)

  return highlight
}
