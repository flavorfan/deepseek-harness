# 05-config 教程第五章学习笔记

参考文档：[05-config.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/05-config.zh.md)
示例代码：[config-demo.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/config-demo.ts)
示例配置：[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)

> 前置：默认已掌握前几章（插件加载、生命周期、服务与事件）。本章只聚焦“配置 schema 与加载期校验”新增内容。

## 1. 本章核心问题

插件如何从 `cordis.yml` 接收配置，并在运行前完成校验与默认值补齐。

---

## 2. 双层 Config：类型层 + 运行时层

关键代码（[config-demo.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/config-demo.ts)）：

```ts
export interface Config {
  greeting: string
  targets: string[]
}

export const Config: Schema<Config> = Schema.object({
  greeting: Schema.string().default('Hello'),
  targets: Schema.array(String).default(['world']),
})
```

要点：

- `interface Config` 负责 TypeScript 编译期类型。
- `const Config` 负责运行时验证与默认值规则。
- 两者同名但处于不同命名空间；一个给类型系统，一个给 loader。

---

## 3. 配置注入路径：YAML -> schema -> apply

配置示例（[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/cordis.yml)）：

```yaml
- name: './config-demo.ts'
  config:
    targets: ['alpha', 'beta']
```

消费点（[config-demo.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/config-demo.ts)）：

```ts
export function apply(ctx: Context, config: Config) {
  for (const target of config.targets) {
    console.log(`${config.greeting}, ${target}!`)
  }
}
```

要点：

- `config` 块先经过 `Config` schema。
- 缺失的 `greeting` 会被默认值 `'Hello'` 补齐。
- `apply` 接收到的是“已验证且完整”的配置对象，而非原始 YAML。

---

## 4. 失败策略：配置非法即拒绝加载

错误示例（文档）：

```yaml
- name: './config-demo.ts'
  config:
    targets: 'not-an-array'
```

要点：

- `targets` 期望数组，却收到字符串，校验失败。
- 插件不会进入 `apply`，对应 fiber 进入 `FAILED`。
- 启动器输出明确错误并以非 0 退出（教程示例为 1）。

结论：配置错误不是运行时“降级处理”，而是加载期硬失败。

---

## 5. `!!js` 计算配置（loader 扩展能力）

文档示例：

```yaml
- name: './config-demo.ts'
  config:
    greeting: !!js process.env.DEMO_GREETING ?? 'Hello'
```

要点：

- `!!js` 允许在加载期计算配置值（常用于环境变量）。
- 在本教程 loader 语义里，`!!js` 仅在 `config` 与条目 `disabled` 字段内有效。
- 其他元数据（如 `name`）保持静态。

---

## 6. 本章新增心智模型（相对前几章）

- 前几章定义“插件如何运行”；本章定义“插件在什么输入条件下允许运行”。
- schema 是插件启动契约的一部分，而不是可选防御代码。
- 默认值用于补齐“可省略字段”，验证用于阻断“非法值”。

---

## 7. Python 工程师最小映射

```python
schema = {
    "greeting": str_default("Hello"),
    "targets": list_str_default(["world"]),
}

raw = {"targets": ["alpha", "beta"]}
config = validate_and_fill_defaults(schema, raw)
apply(ctx, config)
```

一句话：
第 5 章解决的是“配置作为启动前契约，被验证后再进入业务逻辑”。
