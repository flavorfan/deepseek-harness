# 06-composition-and-hmr 教程第六章学习笔记

参考文档：[06-composition-and-hmr.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/06-composition-and-hmr.zh.md)
示例配置：[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)
示例插件：[hello.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/hello.ts)

> 前置：默认已掌握前几章（插件、生命周期、服务、事件、配置）。本章只聚焦“组合增量更新 + HMR + PENDING 诊断”新增内容。

## 1. 本章核心问题

如何把 `cordis.yml` 当作“可演进的应用组合”，并在不重启进程的前提下替换运行中的插件。

---

## 2. Cordis 配置项的关键元数据

关键示例（[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)）：

```yaml
- id: logger
  name: '@deepseek-ai/cordis-plugin-logger-console'
- id: timer
  name: '@deepseek-ai/cordis-plugin-timer'
- id: hmr
  name: '@deepseek-ai/cordis-plugin-hmr'
  config:
    root: ['.']
- id: hello
  name: './hello.ts'
```

要点：

- `name`：插件模块定位（包名或路径）。
- `config`：该插件实例配置。
- `id`：稳定身份；loader 依据 `id` 判断“更新同一条目”还是“删除后新增”。
- `disabled: true`（文档提到）可保留配置项但卸载插件，恢复后可再加载。

---

## 3. HMR 的本质：卸载旧实例，再加载新实例

HMR = Hot Module Replacement（热模块替换）。

文档中的运行语义：

1. 监控文件变化。
2. 目标插件先卸载（触发生命周期清理，effect 回卷）。
3. 加载新模块代码。
4. 重新挂载并执行新版 `apply`。

所以保存 [hello.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/hello.ts) 后，会看到旧输出后接新输出，而无需重启进程。

---

## 4. HMR 依赖不是隐式的

文档强调：

- `@deepseek-ai/cordis-plugin-hmr` 需要 logger 服务输出监控/重载日志；
- 还依赖 `timer` 服务做去抖。

如果缺少 `timer`，HMR 会停在 `PENDING`（合法等待态）并可能表现为“没有任何重载效果”。

---

## 5. 为什么第 6 章强调 `id`

当编辑 `cordis.yml` 时，loader 会按 `id` 做差异对比，只对变化项执行挂载/卸载/重配置。

如果条目没有固定 `id`，每次读取可能被视作“新条目”，即使文本没变也可能触发不必要重挂载。

结论：在需要稳定热更新行为时，`id` 是组合层契约，不是装饰字段。

---

## 6. 诊断“没输出也不报错”：看 PENDING

文档给出的典型场景：

- 插件 `inject` 了一个没人提供的服务（如 `timer`）；
- 插件长期停留 `PENDING`，因此不执行 `apply`；
- 进程可能静默结束（没有活跃事件循环工作项）。

实用排障方法：遍历 `ctx.registry`，检查 fiber 状态并打印 `PENDING` 项。

---

## 7. 本章新增心智模型（相对前五章）

- 前几章讲“插件如何正确工作”；本章讲“应用如何在运行中被安全重组”。
- HMR 不只是文件监听，而是依赖生命周期卸载/加载语义的受控替换流程。
- “无输出”要先当作依赖图问题看（PENDING），而不是立即当作崩溃。

---

## 8. Python 工程师最小映射

```python
compose = load_yaml("cordis.yml")   # with stable ids
mount(compose)

watch(".")
on_change("hello.ts"):
    dispose(plugin_id="hello")
    reload_and_mount(plugin_id="hello")

if plugin.dep_missing:
    plugin.state = "PENDING"
```

一句话：
第 6 章解决的是“组合配置驱动的增量重载与状态化诊断”，而不是简单的文件热刷新。
