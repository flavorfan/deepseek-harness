# 04-events 超精简面试速记版

参考：[04-events.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/04-events.zh.md)
代码：[stats.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/stats.ts)、[reporter.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/reporter.ts)

> 只记第 4 章新增点：默认你已会插件、effect、服务注入。

## 你要会说的 5 句话

1. 事件用于解耦通知：生产方 `emit`，消费方 `on`，双方无需直接互调。
2. `bump` 的标准顺序是“先更新状态，再广播事件”。
3. `interface Events` 声明事件签名，让 `emit/on` 都有参数类型检查。
4. `import type {} from './stats.ts'` 只为引入声明合并可见性，不触发运行时导入。
5. 模式要匹配语义：通知型用 `emit`，决策/拦截型考虑 `serial` 或 `waterfall`。

## 30 秒调用链复述

`stats.bump()` 更新计数并 `emit('stats/report', name, count)` -> `reporter` 的 `on('stats/report')` 监听器收到参数并打印。

## 高频追问一句话

- `emit` 和 `waterfall` 最大区别：`emit` 只广播，`waterfall` 是可 `next()` 传递或短路的中间件链。
- `waterfall` 观察者为什么必须 `next()`：不调用就等于主动短路下游逻辑。
