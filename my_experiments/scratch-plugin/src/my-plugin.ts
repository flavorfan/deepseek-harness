// ----- index
// import type { Context } from '@deepseek-ai/cordis'

// export const name = 'hello-plugin'

// export function apply(ctx: Context) {
//   // Required dependencies are ready before apply runs.
//   console.log('[hello-plugin] plugin loaded!')
// }


// ----- tool:greet tool implementation
// import type { Context } from '@deepseek-ai/cordis'
// import { defineTool } from '@deepseek-ai/dsh-tools'

// export const name = 'greet-tool'
// export const inject = ['tools']

// export function apply(ctx: Context) {
//   ctx.tools.register(defineTool({
//     name: 'greet',
//     description: 'Greet someone by name.',
//     parameters: {
//       name: { type: 'string', required: true, description: 'The name to greet' },
//     },
//     output: {
//       schema: { type: 'string' },
//       render: (_args, value) => [{ type: 'text', text: value }],
//     },
//     async execute(args) {
//       return `Hello, ${args.name}!`
//     },
//   }))
// }

// ----- config: my-plugin configuration schema and application
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'

export const name = 'my-plugin'

export interface Config {
  greeting: string
  maxRetries: number
  verbose?: boolean
}

export const Config: Schema<Config> = Schema.object({
  greeting: Schema.string().default('Hello'),
  maxRetries: Schema.number().default(3),
  verbose: Schema.boolean().default(false),
})

export function apply(ctx: Context, config: Config) {
  console.log(config.greeting)  // User value or schema default.
}
