# 05-config 超精简面试速记版

参考：[05-config.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/05-config.zh.md)
代码：[config-demo.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/config-demo.ts)
配置：[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)

> 只记第 5 章新增点：默认你已会插件加载、effect、服务、事件。

## 你要会说的 5 句话

1. 插件配置由 `cordis.yml` 的 `config` 提供，加载时先走 schema 验证再执行 `apply`。
2. `interface Config` 是类型层，`const Config: Schema<Config>` 是运行时验证层。
3. `default(...)` 让缺省字段在加载期自动补齐，`apply` 拿到完整配置。
4. 配置非法时插件进入 `FAILED`，不会“带病启动”。
5. `!!js` 可在 `config`（以及条目 `disabled`）里做加载期表达式求值。

## 30 秒调用链复述

`cordis.yml` 读到插件 `config` -> schema 校验并补默认值 -> 成功则 `apply(ctx, config)`；失败则报 ValidationError 并拒绝加载。

## 高频追问一句话

- 为什么要 schema，不在 `apply` 里判空就好？
因为 schema 能把错误前移到加载期，统一、可诊断、可阻断。
- 同名 `Config` 会冲突吗？
不会；TypeScript 的类型命名空间和值命名空间是分离的。
