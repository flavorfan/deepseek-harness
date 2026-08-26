# 07-into-the-harness 教程第七章学习笔记

参考文档：[07-into-the-harness.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/07-into-the-harness.zh.md)
示例代码：[greet-tool.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/greet-tool.ts)、[tool-logger.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/tool-logger.ts)
示例配置：[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)

> 前置：默认已掌握前几章（插件生命周期、服务、事件、配置与组合）。本章只聚焦“把能力接入 harness 的 tools 服务”新增内容。

## 1. 本章核心问题

如何把一个业务函数注册为 harness 工具，走真实工具执行流水线，并通过事件独立观测结果。

---

## 2. 工具插件：`defineTool` + `ctx.tools.register`

关键代码（[greet-tool.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/greet-tool.ts)）：

```ts
ctx.tools.register(defineTool({
  name: 'greet',
  description: 'Greet the named person.',
  parameters: {
    name: { type: 'string', required: true, description: 'Who to greet' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    return `Hello, ${args.name}!`
  },
}))
```

要点：

- `defineTool` 同时定义参数规约、输出规约与执行逻辑。
- `parameters` 会投影为模型可见 JSON Schema，并在执行前校验参数。
- `output.schema` 声明规范返回值；`output.render` 把值转为内容块（`result.content`）。
- `ctx.tools.register` 把工具挂入注册表，随插件生命周期自动注册/撤销。

---

## 3. 真实执行链：`ctx.tools.execute`

关键代码（[greet-tool.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/greet-tool.ts)）：

```ts
const result = await ctx.tools.execute({
  callId: CallId('demo-1'),
  name: 'greet',
  arguments: { name: 'Cordis' },
  signal: new AbortController().signal,
})
```

要点：

- 本章不依赖模型，直接驱动工具执行流水线。
- `CallId('demo-1')` 是品牌化调用关联 ID，用于链路跟踪。
- 返回值是结构化结果对象；常用观察面是 `result.content`。

---

## 4. 观察插件：监听 `tools/result` 事件

关键代码（[tool-logger.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/tool-logger.ts)）：

```ts
ctx.on('tools/result', (exec, result) => {
  const text = result.content
    .map(block => (block.type === 'text' ? block.text : ''))
    .join('')
  console.log(`[tool-logger] ${exec.name} -> ${text}`)
})
```

要点：

- 观察插件与工具实现解耦，只依赖事件协议。
- `tools/result` 在结果物化阶段发出，因此日志可能先于调用方 `await execute` 后的打印。
- `import type {} from '@deepseek-ai/dsh-tools'` 用于引入包级声明合并，使事件名与 payload 有类型提示（无运行时副作用）。

---

## 5. 组合依赖：最小可运行清单

配置（[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)）：

```yaml
- name: '@deepseek-ai/dsh-system-prompt'
- name: '@deepseek-ai/dsh-tools'
- name: './tool-logger.ts'
- name: './greet-tool.ts'
```

要点：

- `greet-tool` / `tool-logger` 都依赖 `tools` 服务，因此必须包含 `@deepseek-ai/dsh-tools`。
- `dsh-tools` 还依赖 `systemPrompt` 服务贡献工具 schema，因此需要 `@deepseek-ai/dsh-system-prompt`。
- 缺提供方时，消费插件会进入 `PENDING` 而非部分运行。

---

## 6. 本章新增心智模型（相对前六章）

- 前几章解决通用插件协作，本章落地到 harness 真实能力面（tools）。
- “工具调用”是服务注册 + 参数校验 + 执行 + 结果渲染 + 结果事件的一体化流水线。
- 观测、执行、定义可以在不同插件中完成，通过服务与事件连接。

---

## 7. Python 工程师最小映射

```python
tools.register(define_tool(
    name="greet",
    parameters={"name": str_required()},
    output_schema=str,
    execute=lambda args: f"Hello, {args['name']}!",
))

on("tools/result", lambda exec, result: log(exec.name, result.content))

result = await tools.execute(call_id="demo-1", name="greet", arguments={"name": "Cordis"})
```

一句话：
第 7 章解决的是“把插件能力接到 harness 工具总线，并用事件在旁路观测执行结果”。
