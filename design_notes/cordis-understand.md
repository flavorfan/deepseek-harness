

# cordis-primer comment

## Registrations are reversible effects

这句话是 Cordis 框架（以及 DeepSeek Harness 基于它的设计）中**热重载（Hot Reload）**和**状态管理**的基石。为了让你直观理解，我们先把它“翻译”成人话：
> **“在 Cordis 中，你做的任何‘添加动作’（注册工具、监听事件、挂载路由），本质上都是一笔可以‘撤销’的临时账。框架会记下这笔账，当插件重载或卸载时，框架会自动帮你‘冲账（撤销）’，保证系统状态干干净净，绝不留下残留的监听器或脏数据。”**
下面我通过 **“错误做法 vs Cordis 做法”** 的对比，以及具体的 TypeScript 代码示例，来展开说明。

---

### 1. 核心机制：什么是“可逆效果（Reversible Effects）”？

在传统 Node.js 开发中，如果你往全局数组里 `push` 一个工具，或者用 `app.on` 绑定了事件，想要撤销就必须手动 `splice` 或 `off`，极其容易遗漏。

在 Cordis 中，**任何注册动作都必须返回一个“撤销函数（dispose）”**。`ctx.effect()` 和 `ctx.on()` 就是用来包装这种“注册 + 撤销”逻辑的。框架会在插件销毁时，**按照注册的逆序**自动调用这些撤销函数。

---

### 2. 具体示例：注册一个“天气查询工具（Tool Schema）”

假设你的插件要向大模型注册一个 `get_weather` 工具。

#### ❌ 传统不可逆写法（Cordis 中严禁）：
```typescript
// 这样写会导致重载后 AI 看到两个同名的工具！
ctx.tools.register('get_weather', handlerFunction);
```

#### ✅ Cordis 的可逆写法（使用 `ctx.effect`）：
```typescript
// my-plugin.ts
export function apply(ctx: Context) {
  // effect 接收一个函数，该函数返回一个“清理函数（cleanup）”
  ctx.effect(() => {
    // 1. 注册动作：向 AI 工具库添加 schema
    const toolId = ctx.tools.register({
      name: 'get_weather',
      schema: { city: 'string' },
      handler: async (params) => await fetchWeather(params.city)
    });

    console.log('✅ 天气工具已注册');

    // 2. 返回撤销函数：Cordis 会在卸载时自动执行它
    return () => {
      ctx.tools.unregister(toolId);
      console.log('🧹 天气工具已自动注销');
    };
  });
}
```

**效果**：当你修改代码保存，Cordis 热重载该插件时，控制台会先输出 `🧹 天气工具已自动注销`，再输出 `✅ 天气工具已注册`。AI 模型始终只看到一个工具，绝无残留。

---

### 3. 具体示例：事件监听（`ctx.on` 是特化的 `effect`）

对于事件监听，Cordis 提供了语法糖 `ctx.on()`，它**自动**返回撤销函数，无需手动 `off`。

```typescript
// 监听用户消息
export function apply(ctx: Context) {
  // ctx.on 内部自动调用了 ctx.effect，帮你封装好了 off 逻辑
  const dispose = ctx.on('message', (session) => {
    if (session.content === 'ping') session.reply('pong');
  });

  // 如果你愿意，也可以手动调用 dispose() 提前撤销监听
  // 但通常不手动调用，交给框架即可
}
```

当插件重载时，旧的消息监听会被自动移除，新代码的监听接上。**绝对不会出现“刷新页面后，机器人一次回复两条消息”的经典 Bug**。

---

### 4. 组合场景：注册“Prompt 提示词片段”和“适配器”

假设你写了一个插件，同时干了三件事：

1. 添加一段系统提示词（Prompt Section）。
2. 注册一个数据库适配器（Adapter）。
3. 监听一个自定义事件。

```typescript
export function apply(ctx: Context) {
  // 注册提示词（可逆）
  ctx.effect(() => {
    const id = ctx.prompts.register('safety_rules', 'You must refuse illegal requests.');
    return () => ctx.prompts.unregister(id);
  });

  // 注册适配器（可逆）
  ctx.effect(() => {
    const adapter = new MySQLAdapter(connString);
    ctx.adapters.register('mysql', adapter);
    return () => ctx.adapters.unregister('mysql');
  });

  // 监听事件（可逆，语法糖）
  ctx.on('before-llm-call', (payload) => {
    console.log('正在调用大模型...');
  });
}
```

**当插件卸载或重载时**，Cordis 的执行顺序是：
1. 先移除 `before-llm-call` 监听。
2. 再撤销 MySQL 适配器（断开连接池）。
3. 最后移除 `safety_rules` 提示词。

整个过程**完全可预测**，不会因为异步顺序导致内存泄漏或连接堆积。

---

### 5. 为什么特别强调“通过 ctx.effect 或 ctx.on”？

因为**这是 Cordis 依赖注入（DI）和上下文系统的核心契约**。`ctx` 是有生命周期的（例如：根上下文存活于整个进程，插件上下文存活于插件加载期间）。框架通过 `ctx.effect` 收集当前上下文的“副作用清单”，当 `ctx` 被 `dispose` 时，清单里的清理函数会被依次执行。

如果你绕过 `ctx.effect`，直接去操作全局变量，**热重载时这些“野操作”不会被撤销**，导致状态污染——这正是传统框架（如早期的 Express 或 Koa 中间件热更新）最头疼的问题，而 Cordis 从设计根源上杜绝了它。

---

### 总结一句话：

> **`ctx.effect()` 让你写“注册代码”时，必须顺手把“注销代码”写在旁边；`ctx.on()` 则是针对事件的便捷封装。框架保证在重载/拆卸时，这些“注销代码”会被自动、有序地执行，所以你可以安心地频繁修改插件代码，无需重启进程，系统状态始终如新。**


## Loader Configuration: parses !!js into expression nodes.
要理解这句话，我们首先要抓住 Cordis 配置系统的核心哲学：**配置不是死的 JSON，而是活的“代码”**。

在传统的 `config.json` 或 `config.yaml` 中，你只能写静态的值（如 `port: 3000`）。但 Cordis 的加载器（Loader）允许你在配置文件里**嵌入 JavaScript 逻辑**，而 `!!js` 就是触发这个魔法的大门。

**“解析为表达式节点（Expression Nodes）”**，用大白话翻译就是：

> **加载器看到 `!!js` 后，不会立刻算出它的最终结果（比如算出 100），而是把它“掰开揉碎”变成一棵“语法树（AST）”，暂时存起来。等到将来需要真正使用这个值的那一刻（比如插件激活时），再把这棵树拿出来，在正确的环境（上下文）下执行，算出最终结果。**

这样做的好处是：**延迟执行（Lazy Evaluation）** 和 **上下文绑定（Context Binding）**。

---

### 1. 第一个场景：插件的配置项（针对插件上下文）

假设你有一个数据库插件，需要根据当前插件的上下文（`ctx`）动态决定连接池大小。

**配置文件 `deepseek.yml`：**
```yaml
plugins:
  - name: my-database
    config:
      host: 'localhost'
      # ⚠️ 注意这里：我们希望连接池大小 = CPU 核心数 * 2
      poolSize: !!js ctx.cpus * 2
```

**加载器看到 `!!js ctx.cpus * 2` 时：**
它**不会**把这个字符串变成数字 `16`（假设 8 核 * 2）。它会解析成一个**表达式节点**，在内存中大致长这样（伪代码）：
```json
{
  "type": "BinaryExpression",
  "operator": "*",
  "left": { "type": "MemberExpression", "object": "ctx", "property": "cpus" },
  "right": { "type": "Literal", "value": 2 }
}
```

**激活阶段：**
当 Cordis 开始挂载 `my-database` 插件时，加载器取出这个节点，**把当前插件的 `ctx` 塞进去执行**，算出 `16`，然后传给插件的构造函数。如果另一个环境是 16 核，这里自动变成 `32`，无需修改配置文件。

---

### 2. 第二个场景：`disabled` 字段（针对加载器上下文）

配置中的 `disabled` 字段比较特殊，它是在**加载器决策（Mount Decision）**阶段执行的，而不是在插件激活阶段。因此，它的执行上下文通常是**加载器上下文（Loader Context）**，比如环境变量（`process.env`）。

**配置文件：**
```yaml
plugins:
  - name: analytics
    # 只有非生产环境才加载这个分析插件
    disabled: !!js process.env.NODE_ENV === 'production'
```

**解析过程：**
加载器将 `process.env.NODE_ENV === 'production'` 解析为表达式节点。在决定是否挂载该插件时，加载器会实时执行这个节点（此时的上下文是 Node.js 进程环境），如果返回 `true`，则跳过安装。

---

### 3. 第三个场景：`!include` 保留嵌套表达式（重点！）

这是你引文中提到的 **“Include preserves nested row expressions until target activation”**（Include 会保留嵌套的原始表达式直到目标激活）的精髓。

假设你有一个基础配置模板 `base.yml`：
```yaml
# base.yml
apiKey: !!js ctx.secrets.get('OPENAI_KEY')
```

然后你在主配置中引入它：
```yaml
# main.yml
plugins:
  - name: llm-provider
    config: !include base.yml
```

**关键点来了：**
如果加载器在 `!include` 的那一刻（外层加载时）就立刻计算 `!!js`，那么它会因为找不到 `ctx` 而报错（因为此时插件还没挂载，`ctx` 尚未绑定）。

**所以，Cordis 的做法是：**
当加载器解析 `!include base.yml` 时，它发现里面有个 `!!js` 表达式节点，它会**原封不动地（Preserve）**保留这个节点的 AST 结构，把它塞进 `config` 里。直到外层 `llm-provider` 插件开始激活，拥有了自己的 `ctx`，加载器才取出这个保存好的节点，传入 `ctx` 执行，从而获取真正的 `OPENAI_KEY`。

---

### 4. 对比：什么是“字面量（Literal）”？

引文中提到 **“Other entry metadata stays literal”**（其他条目元数据保持字面量）。

比如插件的 `name` 或 `version` 字段：
```yaml
plugins:
  - name: my-plugin   # 这是字面量字符串，直接原样使用，不做任何解析
    version: 1.0.0    # 这是字面量数字
    disabled: !!js process.env.DISABLE_ME # 只有显式加了 !!js 才会被解析为表达式节点
```

---

### 总结图解

| 写法 | 解析时机 | 执行上下文 | 结果 |
| :--- | :--- | :--- | :--- |
| `port: 8080` | 加载时立即 | 无 | 字面量数字 `8080` |
| `poolSize: !!js ctx.cpus * 2` | **延迟**到插件激活 | 插件自己的 `ctx` | 动态数字 `16` 或 `32` |
| `disabled: !!js process.env.TEST` | **延迟**到挂载决策时 | 加载器上下文（`process`） | `true` 或 `false` |
| `!include file.yml` 内的 `!!js` | **保留节点**，不提前求值 | 外层目标插件的 `ctx` | 直到目标激活才计算 |

**为什么要设计成“节点”而不是直接“eval 字符串”？**
因为 AST（表达式节点）是安全的、可序列化的，并且可以清晰地追踪它依赖了哪些变量（如 `ctx` 或 `process`）。框架可以根据当前执行的阶段（加载决策 vs 插件激活），精准地将不同的变量对象（`loaderContext` 或 `pluginContext`）注入到这个“节点”中执行，从而实现**配置的动态计算与环境解耦**。


## 2


## 3