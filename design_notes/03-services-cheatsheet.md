# 03-services 超精简面试速记版

参考：[03-services.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/03-services.zh.md)
代码：[greeter.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/greeter.ts)、[consumer.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/consumer.ts)

> 只记第 3 章新增点：默认你已会前两章的入口与生命周期。

## 你要会说的 5 句话

1. `Service` 子类通过 `super(ctx, 'greeter')` 把实例注册为具名服务。
2. `ctx.plugin(GreeterService)` 挂载提供方，其他插件可经 `ctx.greeter` 消费。
3. `declare module ... interface Context { greeter: GreeterService }` 只做编译期类型扩展，不生成运行时代码。
4. `inject = ['greeter']` 是硬依赖声明：服务未就绪则插件保持 `PENDING`。
5. 依赖关系是动态跟踪的：提供方下线会触发依赖方卸载，恢复后再加载。

## 30 秒调用链复述

挂载 `GreeterService` 提供 `greeter` -> consumer 声明 `inject` 等待依赖 -> 依赖满足后执行 `ctx.greeter.greet('world')` 输出结果。

## 高频追问一句话

- 为什么不靠 `cordis.yml` 顺序：Cordis 依据依赖图决定插件启动时机。
- 什么时候不用 `inject`：依赖是可选时，改用 `ctx.get('name')` + 判空分支。
