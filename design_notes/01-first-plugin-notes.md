# 01-first-plugin 教程第一章学习笔记

参考文档：[01-first-plugin.zh.md](/Users/frank_fan/Source/repos/playground/deepseek-harness/docs/cordis-tutorial/01-first-plugin.zh.md)
示例代码：[hello.ts](/Users/frank_fan/Source/repos/playground/deepseek-harness/tmp/cordis-tutorial/hello.ts)

## 1. 本章目标

编写并运行一个最小 Cordis 插件，理解：

- 插件模块的最小导出结构（`name` + `apply`）
- 框架如何加载并调用插件
- 运行成功路径与常见失败路径

---

## 2. 示例代码（最小插件）

```ts
import type { Context } from '@deepseek-ai/cordis'

export const name = 'hello'

export function apply(ctx: Context) {
  console.log('hello from my first plugin')
}
```

## 3. 代码逐点理解（Python 工程师视角）

### 3.1 `name` 导出

- `export const name = 'hello'` 是插件显示元数据（可选）。
- 主要用于诊断和识别插件。

Python 类比：模块级常量。

### 3.2 `apply(ctx)` 导出

- `apply` 是插件入口函数，由 Cordis 在加载插件时调用。
- 文件本身不负责启动应用，只描述“被挂载时做什么”。

Python 类比：

```python
name = "hello"

def apply(ctx):
    print("hello from my first plugin")
```

### 3.3 `import type` 与 `Context`

- `import type { Context } ...` 是仅类型导入。
- 用于 TypeScript 静态检查，不直接参与运行时行为。
- `ctx: Context` 类似 Python 类型注解。

---

## 4. 运行命令含义

```sh
node --import tsx ../../vendor/cordis/bin.js
```

拆解：

1. `node`：启动 Node.js 运行时。
2. `--import tsx`：预加载 `tsx`，使 Node 能直接处理 TypeScript 模块。
3. `../../vendor/cordis/bin.js`：执行 Cordis 启动器。

启动器会读取 `cordis.yml`，加载配置中的插件（如 `./hello.ts`），再调用导出的 `apply(ctx)`。

---

## 5. 主调用链（从启动到输出）

1. 运行 Cordis 启动命令。
2. Loader 读取 `cordis.yml`。
3. 解析并挂载 `./hello.ts`。
4. Cordis 调用 `apply(ctx)`。
5. 输出 `hello from my first plugin`。
6. 无后续活动时进程退出。

---

## 6. 成功与失败路径

### 成功路径

- `apply` 正常执行，打印日志，程序按生命周期结束。

### 失败路径 A：`apply` 抛错

- 例如 `throw new Error('apply exploded')`。
- 属于插件执行失败，启动流程会被错误终止。

### 失败路径 B：模块解析失败（路径/包名错误）

- 属于加载阶段问题，Cordis 会通过 logger 报错。
- 启动早期可能出现“看起来没输出”，要优先检查模块名和路径拼写。

---

## 7. 一句话心智模型（Python 类比）

Cordis 第一章插件可以理解为：
“在配置文件里注册一个模块，框架按约定调用该模块的 `apply(ctx)` 钩子函数。”

---

## 8. 本章关键记忆点

- 最小函数插件：`export function apply(ctx)`。
- `name` 是可选元数据，不是执行入口。
- `import type` 只影响类型检查，不直接影响运行时。
- 启动由框架负责，插件只负责声明贡献行为。
