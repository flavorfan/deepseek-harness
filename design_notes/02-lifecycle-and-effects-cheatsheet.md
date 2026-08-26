# 02-lifecycle-and-effects 超精简面试速记版

参考：[02-lifecycle-and-effects.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/02-lifecycle-and-effects.zh.md)
代码：[lifecycle.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/lifecycle.ts)

> 仅记第 2 章新增点：默认你已会第 1 章基础（`apply` 入口与启动流程）。

## 你要会说的 5 句话

1. `ctx.effect` 用于托管“Cordis 不自动管理的资源”，主体负责创建资源，返回 disposer 负责释放资源。
2. `ctx.plugin(child)` 挂载子插件并返回 `fiber`，`fiber` 是实例生命周期句柄。
3. `await fiber.dispose()` 的语义是“等待子插件及其清理逻辑全部完成”。
4. 本例时序：`loading -> tick* -> heartbeat cleaned up -> disposed -> exit`。
5. 生命周期核心不是“如何启动”，而是“如何可预测地卸载并避免资源泄漏”。

## 30 秒调用链复述

主插件挂载 `heartbeat` -> `heartbeat` 注册 interval effect -> 主插件注册 timeout effect -> timeout 到点后 `await fiber.dispose()` -> 子插件执行 disposer 清理 interval -> 打印 `disposed` 并退出。

## 面试高频追问一句话

- 为什么要 `await dispose`：因为清理可能异步，不等待会破坏清理完成的时序保证。
- `ctx.effect` 本质：把 acquire/release 绑定到插件生命周期，而不是散落在业务流程里手动管理。
