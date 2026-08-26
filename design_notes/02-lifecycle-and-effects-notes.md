# 02-lifecycle-and-effects 教程第二章学习笔记

参考文档：[02-lifecycle-and-effects.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/02-lifecycle-and-effects.zh.md)
示例代码：[lifecycle.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/lifecycle.ts)

> 前置：默认你已掌握第 1 章（插件最小结构、`apply` 入口、基础启动命令）。本笔记只覆盖新增知识点。

## 1. 本章核心目标

理解 Cordis 的插件生命周期管理，重点是：

- 如何把“非 Cordis 管理资源”纳入生命周期（`ctx.effect`）。
- 如何手动卸载已挂载插件（`fiber.dispose()`）。
- 为什么清理逻辑要可等待、可组合、可递归。

---

## 2. 代码里的两个关键动作

## 2.1 `ctx.plugin(heartbeat)`：挂载子插件并拿到 fiber

```ts
const fiber = ctx.plugin(heartbeat)
```

- `heartbeat` 被当作子插件挂载，而不是普通函数调用。
- 返回值 `fiber` 是该插件实例的运行时句柄，可用于后续 `dispose()`。

Python 类比：返回一个“已注册实例句柄”，可显式触发 teardown。

## 2.2 `ctx.effect(...)`：资源获取 + 资源释放绑定

```ts
ctx.effect(() => {
  const timer = setInterval(() => console.log('tick'), 200)
  return () => {
    clearInterval(timer)
    console.log('heartbeat cleaned up')
  }
})
```

- effect 主体在加载期运行：创建资源（timer/连接/watcher）。
- 返回 disposer 在卸载期运行：释放资源。
- 你不需要在业务代码里“到处记得清理”，框架会在卸载时调用 disposer。

一句话：**acquire in effect, release in disposer**。

---

## 3. 运行时时序（本例）

1. 主插件 `apply` 执行，挂载 `heartbeat` 子插件。
2. `heartbeat` 立即打印 `heartbeat plugin loading`。
3. `heartbeat` 的 interval 每 200ms 输出 `tick`。
4. 主插件内的 timeout 到 700ms 触发：`await fiber.dispose()`。
5. 卸载触发 `heartbeat` disposer：清 interval，打印 `heartbeat cleaned up`。
6. 卸载完成后打印 `disposed`，然后 `process.exit(0)`。

预期输出顺序：

```txt
heartbeat plugin loading
tick
tick
tick
heartbeat cleaned up
disposed
```

---

## 4. 为什么 `await fiber.dispose()` 必须要有

```ts
await fiber.dispose()
console.log('disposed')
```

- `dispose()` 可能包含异步清理步骤。
- `await` 保证“清理完成后”再进入下一步动作。
- 没有 `await` 时，日志和退出可能早于资源释放，导致时序错误或资源泄漏风险。

---

## 5. Fiber 状态机（概念）

文档给出的状态流转：

`PENDING -> LOADING -> ACTIVE -> UNLOADING -> DISPOSED`（异常分支到 `FAILED`）

面向排障的最小理解：

- `PENDING`：通常是依赖尚未满足，不是代码没执行。
- `FAILED`：加载或校验阶段抛错。
- `UNLOADING/DISPOSED`：正在清理 / 已完成清理。

---

## 6. 与第一章相比，本章新增的心智模型

- 第 1 章回答“插件如何被调用”；第 2 章回答“插件如何被安全拆除”。
- `ctx.plugin` + `fiber.dispose` 提供“可控生命周期句柄”。
- `ctx.effect` 把手工资源管理变成框架托管的生命周期行为。

---

## 7. Python 工程师速记映射

```python
def child_plugin(ctx):
    timer = start_interval(...)
    ctx.effect(lambda: stop_interval(timer))

def apply(ctx):
    fiber = ctx.plugin(child_plugin)
    await sleep(0.7)
    await fiber.dispose()  # 等清理结束
```

可迁移经验：
在 Python 插件系统/服务框架中，任何“创建了外部资源”的代码，都应当有与其同生命周期的 teardown 绑定。
