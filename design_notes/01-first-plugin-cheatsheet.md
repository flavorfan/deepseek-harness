# 01-first-plugin 超精简面试速记版

参考：[01-first-plugin.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/01-first-plugin.zh.md)
代码：[hello.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/hello.ts)

## 你要会说的 5 句话

1. 这是一个 **Cordis 函数插件**，最小形态是导出 `apply(ctx)`。
2. `name` 是可选元数据，用于诊断标识，不是执行入口。
3. `import type { Context }` 只做 TypeScript 类型检查，运行时会被擦除。
4. 运行命令 `node --import tsx ../../vendor/cordis/bin.js` 的本质是：用 Node + tsx 启动 Cordis loader，再按 `cordis.yml` 加载插件并调用 `apply`。
5. 失败要分两类：`apply` 抛错是执行失败（会终止启动）；模块路径写错是解析失败（走 logger 报错路径）。

## 30 秒调用链复述

启动器 `bin.js` -> 读取 `cordis.yml` -> 加载 `./hello.ts` -> 调用 `apply(ctx)` -> 输出日志 -> 无后续任务则退出。

## Python 对照记忆

```python
name = "hello"  # 可选元数据

def apply(ctx):  # 框架约定入口
    print("hello from my first plugin")
```

一句话类比：
**“配置注册模块，框架反向调用钩子函数。”**
