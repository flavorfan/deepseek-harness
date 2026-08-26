# 06-composition-and-hmr 超精简面试速记版

参考：[06-composition-and-hmr.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/06-composition-and-hmr.zh.md)
配置：[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)
示例插件：[hello.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/hello.ts)

> 只记第 6 章新增点：默认你已会插件、effect、服务、事件、配置。

## 你要会说的 5 句话

1. `cordis.yml` 是应用组合入口；`id` 是配置项稳定身份，决定增量更新行为。
2. HMR（Hot Module Replacement）是“先卸载旧实例，再加载新模块并重挂载”，不是整进程重启。
3. HMR 依赖 logger（可观测日志）和 timer（去抖）；缺依赖会卡在 `PENDING`。
4. `disabled: true` 可以保留条目但卸载插件，恢复后再加载。
5. 插件“没输出”时先查 fiber state；`PENDING` 常见于 `inject` 依赖无人提供。

## 30 秒调用链复述

读取 `cordis.yml` 组合插件 -> HMR 监听文件变化 -> 保存 `hello.ts` 时卸载旧 `hello` 并加载新版本 -> 新 `apply` 生效输出新日志。

## 高频追问一句话

- 为什么要固定 `id`：让 loader 识别“同一配置项更新”，避免无意义删建重挂载。
- `PENDING` 是报错吗：不是；它是合法等待态，说明依赖图未满足。
