import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'text-stats'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'text_stats',
    description: 'Count characters and lines, then estimate token usage.',
    parameters: {
      text: {
        type: 'string',
        required: true,
        description: 'The text to inspect.',
      },
      charsPerToken: {
        type: 'number',
        description: 'Positive estimation ratio; defaults to 4.',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const ratio = args.charsPerToken ?? 4
      if (!Number.isFinite(ratio) || ratio <= 0) {
        throw new Error('charsPerToken must be a positive number.')
      }

      const characters = [...args.text].length
      const nonWhitespace = [...args.text].filter(char => !/\s/u.test(char)).length
      const lines = args.text.length === 0 ? 0 : args.text.split(/\r?\n/u).length
      const estimatedTokens = Math.ceil(characters / ratio)

      return JSON.stringify({
        characters,
        nonWhitespace,
        lines,
        estimatedTokens,
        charsPerToken: ratio,
      })
    },
  }))
}