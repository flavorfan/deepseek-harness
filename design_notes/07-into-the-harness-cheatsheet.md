# 07-into-the-harness 超精简面试速记版

参考：[07-into-the-harness.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/07-into-the-harness.zh.md)
代码：[greet-tool.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/greet-tool.ts)、[tool-logger.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/tool-logger.ts)
配置：[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)

> 只记第 7 章新增点：默认你已会前六章基础。

## 你要会说的 5 句话

1. `defineTool` 把参数 schema、输出 schema、执行逻辑统一为可注册工具定义。
2. `ctx.tools.register(...)` 注册工具到 harness 工具服务，生命周期随插件自动管理。
3. `ctx.tools.execute(...)` 可直接驱动真实工具流水线（无需模型），`CallId` 用于调用关联。
4. `tools/result` 事件让观察插件与工具实现解耦；`tool-logger` 就是旁路观测器。
5. 最小组合要有 `dsh-system-prompt` + `dsh-tools` + 消费插件，缺依赖会 `PENDING`。

## 30 秒调用链复述

注册 `greet` 工具 -> 触发一次 `tools.execute` -> 工具返回规范值并渲染为 `result.content` -> `tools/result` 事件触发 `tool-logger` 输出。

## 高频追问一句话

- 为什么 `tool-logger` 能拿到结果而不调用 `greet-tool`？
因为它订阅的是工具总线事件，不依赖具体工具实现。
- `import type {} from '@deepseek-ai/dsh-tools'` 做什么？
只为引入声明合并，让 `'tools/result'` 事件有类型；运行时无副作用。
