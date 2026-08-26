# 04-events 教程第四章学习笔记

参考文档：[04-events.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/04-events.zh.md)
示例代码：[stats.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/stats.ts)、[reporter.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/reporter.ts)

> 前置：默认已掌握前几章（插件入口、effect、服务注入）。本章只聚焦“事件协作”新增内容。

## 1. 本章核心问题

在不直接调用对方方法的前提下，插件如何广播状态变化并被其他插件感知。

---

## 2. 事件生产者：状态更新后 `emit`

关键代码（[stats.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/stats.ts)）：

```ts
bump(name: string) {
  const next = (this.counts.get(name) ?? 0) + 1
  this.counts.set(name, next)
  this.ctx.emit('stats/report', name, next)
}
```

要点：

- `counts` 保存计数状态。
- `bump` 先更新状态，再发出 `'stats/report'` 事件。
- 事件参数是 `(name, count)`，即“哪个指标、当前值是多少”。

---

## 3. 事件类型声明：`interface Events`

关键代码（[stats.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/stats.ts)）：

```ts
declare module '@deepseek-ai/cordis' {
  interface Events {
    'stats/report'(name: string, count: number): void
  }
}
```

要点：

- 通过声明合并定义事件名与监听器签名。
- `ctx.emit` 与 `ctx.on` 因此都具备完整类型检查。
- 这是编译期约束，不生成运行时代码。

---

## 4. 事件消费者：`on` 监听 + `inject` 就绪保证

关键代码（[reporter.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/reporter.ts)）：

```ts
import type {} from './stats.ts'

export const inject = ['stats']

export function apply(ctx: Context) {
  ctx.on('stats/report', (name, count) => {
    console.log(`[stats] ${name} -> ${count}`)
  })
  ctx.stats.bump('tool_call')
  ctx.stats.bump('tool_call')
  ctx.stats.bump('prompt')
}
```

要点：

- `inject = ['stats']` 保证 `ctx.stats` 可用后才运行。
- `ctx.on('stats/report', ...)` 注册监听器。
- `import type {} from './stats.ts'` 只为让 TypeScript 看见声明合并（无运行时导入副作用）。

预期输出：

```txt
[stats] tool_call -> 1
[stats] tool_call -> 2
[stats] prompt -> 1
```

---

## 5. 分发模式选择（本章重点概念）

文档给出 5 种模式：`emit`、`parallel`、`serial`、`bail`、`waterfall`。

本示例选择 `emit`，因为它是“广播通知”语义：
只负责通知监听器，不聚合返回值，也不等待决策结果。

最小选型规则：

- 只通知：`emit`
- 需要并发等待全部完成：`parallel`
- 需要按顺序并允许早停：`serial` / `bail`
- 需要中间件链式改写或短路：`waterfall`

---

## 6. Waterfall 的唯一高风险点

`waterfall` 监听器如果只是观察，不应吞掉链路，必须调用 `next()`。
不调用 `next()` 并直接返回，语义上就是有意短路后续逻辑。

---

## 7. 本章新增心智模型（相对前三章）

- 服务是“可调用能力”；事件是“解耦通知通道”。
- 服务注入解决“我需要谁”；事件分发解决“谁关心我发生了什么”。
- 事件模式本身是接口设计的一部分，错误模式会导致协作语义错误。

---

## 8. Python 工程师最小映射

```python
def bump(name):
    next_value = counts.get(name, 0) + 1
    counts[name] = next_value
    emit("stats/report", name, next_value)

on("stats/report", lambda name, count: print(f"[stats] {name} -> {count}"))
```

一句话：
第 4 章解决的是“状态变更如何以类型安全、低耦合方式广播给其他插件”。
