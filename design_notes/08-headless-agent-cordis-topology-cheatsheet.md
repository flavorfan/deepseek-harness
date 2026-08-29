# headless-agent `cordis.yml` 依赖拓扑速记（半页）

主配置：[cordis.yml](/Users/frank_fan/Source/repos/playground/deepseek-harness/examples/headless-agent/cordis.yml)

## 你要会说的 5 句话

1. 这份配置是“agent-spine 核心运行时 + 多条工具能力链”的完整 headless 组合。
2. 依赖关系由 `inject` 决定，不由 `cordis.yml` 顺序决定。
3. 两个 `tool-subagent` 是同实现不同策略实例：`spawn+continuable` 与 `fork+one-shot`。
4. `workflow-worker-thread` 依赖 `subagents`，`tool-workflow/tool-ralph` 再依赖 `workflowEngine`。
5. 文件写改链是 `fs-local`（提供 fs）+ `fs-observation-policy`（门禁）+ `tool-fs`（模型入口）。

## 一眼拓扑（谁提供、谁消费）

- `agent-spine`：提供核心服务簇（`llm/tools/systemPrompt/sessions/...`）
- `llm-deepseek`：消费 `llm`，并在请求期读取 settings/credentials seam
- `subprocess-local -> bash-local`：bash 依赖 subprocess
- `subagent`：提供 `subagents`；`spawn/fork` provider 在其上注册
- `tool-subagent*`：消费 `tools + subagents (+ systemPrompt)`
- `workflow-worker-thread`：消费 `subagents`，提供 `workflowEngine`
- `tool-workflow/tool-ralph`：消费 `tools + workflowEngine (+subagents/systemPrompt)`
- `fs-local` 提供 `fs`，`tool-fs` 消费 `tools + fs + systemPrompt`

## 高频追问一句话

- 为什么“看起来没反应”？
优先查依赖是否满足导致 `PENDING`，而不是先怀疑业务代码崩溃。
- 为什么同包会挂两次？
因为 Cordis 允许“同实现多实例”，通过不同 `config` 形成不同能力面。
