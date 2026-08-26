# 03-services 教程第三章学习笔记

参考文档：[03-services.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/03-services.zh.md)
示例代码：[greeter.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/greeter.ts)、[consumer.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/consumer.ts)

> 前置：默认已掌握前两章（插件入口与 effect 生命周期）。本章仅聚焦“服务提供与依赖注入”新增内容。

## 1. 本章核心问题

如何让一个插件提供能力，另一个插件不直接导入它、只通过 `ctx` 按名称消费它。

---

## 2. 提供服务：`Service` 子类 + 服务名注册

关键代码（[greeter.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/greeter.ts)）：

```ts
export class GreeterService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'greeter')
  }

  greet(who: string) {
    return `Hello, ${who}!`
  }
}

export function apply(ctx: Context) {
  ctx.plugin(GreeterService)
}
```

要点：

- `super(ctx, 'greeter')` 把实例注册为名为 `greeter` 的服务。
- `ctx.plugin(GreeterService)` 挂载类插件；服务在运行期变为 `ctx.greeter` 可访问。
- 服务注册本身属于生命周期 effect；提供方卸载时服务会自动撤销。

---

## 3. 编译时类型补全：`declare module` 合并 `Context`

关键代码（[greeter.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/greeter.ts)）：

```ts
declare module '@deepseek-ai/cordis' {
  interface Context {
    greeter: GreeterService
  }
}
```

要点：

- 这是 TypeScript 声明合并，只影响编译期类型检查，不产生运行时代码。
- 作用是让 `ctx.greeter` 在所有消费方获得静态类型与 IDE 补全。
- 即使不写这段，运行时服务仍可能可用，但消费代码失去类型安全。

---

## 4. 消费服务：`inject` 声明硬依赖

关键代码（[consumer.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/consumer.ts)）：

```ts
export const inject = ['greeter']

export function apply(ctx: Context) {
  console.log(ctx.greeter.greet('world'))
}
```

要点：

- `inject = ['greeter']` 表示硬依赖：缺服务则不启动。
- Cordis 会让消费插件保持 `PENDING`，直到 `greeter` 可用。
- 所以 `apply` 执行时可以直接调用 `ctx.greeter`，不用手动判空。

---

## 5. 依赖关系是动态跟踪，不是一次性检查

文档语义要点：

- 若运行中服务提供方卸载，依赖方也会随之卸载。
- 服务恢复后，依赖方会重新加载。
- 这保证消费者不会继续持有已失效的服务引用。

这也是服务可热替换的基础：依赖图驱动插件重启，而不是手动重连每个消费者。

---

## 6. 可选依赖与硬依赖的边界

- 硬依赖：使用 `inject`，缺失即不启动。
- 可选依赖：不写 `inject`，在运行时通过 `ctx.get('greeter')` 探测并判空。

示例（文档思路）：

```ts
const greeter = ctx.get('greeter')
console.log(greeter?.greet('maybe') ?? 'no greeter available')
```

---

## 7. 本章新增心智模型（相对前两章）

- 前两章关注“插件如何加载/卸载”；本章关注“插件之间如何解耦协作”。
- 服务名是协作协议，`inject` 是启动条件声明，`Context` 声明合并是类型系统投影。
- 依赖图决定可运行性，`cordis.yml` 文件顺序本身不保证执行先后。

---

## 8. Python 工程师最小映射

```python
class GreeterService(ServiceBase):
    def __init__(self, ctx):
        super().__init__(ctx, "greeter")
    def greet(self, who):
        return f"Hello, {who}!"

def greeter_apply(ctx):
    ctx.plugin(GreeterService)

inject = ["greeter"]
def consumer_apply(ctx):
    print(ctx.greeter.greet("world"))
```

一句话：
服务章节解决的是“按能力名解耦，而不是按模块导入耦合”。
