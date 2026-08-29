# Docs Index for Learning DeepSeek Harness

## Scope

- Corpus: `docs/**/*.zh.md` plus the repository entry [`README.zh.md`](../README.zh.md) as the outermost overview.
- Rule: when both `xxx.md` and `xxx.zh.md` exist, this index only analyzes the Chinese side.
- Goal: support a learning path after completing [`docs/cordis-tutorial/index.zh.md`](../docs/cordis-tutorial/index.zh.md).

## Category Heatmap

| Category | What it is for | Priority after Cordis tutorial | Notes |
|---|---|---|---|
| `docs/user/develop/` | From "write one plugin" to "design a real harness capability" | Highest | Best immediate next steps |
| `docs/` root overview docs | Architecture, runtime flow, testing, graphs, terminology | Highest | Best bridge from tutorial to real code |
| `docs/subsystems/` | Exact types, services, events, seams, and ownership | High | Use after understanding the big picture |
| `docs/cookbook/` | Task-driven contributor playbooks | Medium | Useful when you start changing code |
| `docs/cordis-api/` | Raw Cordis API reference | Medium | Better as lookup than as first read |
| `docs/user/guide/` | End-user and operator usage | Medium | Useful for product usage, not core internals |
| `docs/postmortem/` | Failure case studies | Low for initial learning | Read when debugging similar classes of bugs |
| `docs/i18n/` | Bilingual documentation workflow | Low for runtime learning | Relevant only when editing paired docs |

## Core Learning Index

| Title | Path | Tags | Summary |
|---|---|---|---|
| DeepSeek Harness | `README.zh.md` | repo-entry, run, product-overview | Repository entry point: what DSH is, how to run it, and where docs fit in the contributor flow. |
| Cordis 教程 | `docs/cordis-tutorial/index.zh.md` | completed, tutorial, cordis, plugin-basics | Hands-on Cordis path: plugin, lifecycle, service, event, config, composition, and a first tool wired into the harness. This is the right prerequisite baseline. |
| Cordis 入门 | `docs/cordis-primer.zh.md` | overview, cordis, concepts, refresher | A compressed concept refresh for `Context`, `inject`, typed events, waterfall semantics, and reversible registration. Best used as a glossary-level recap after the tutorial. |
| DeepSeek Harness 架构 | `docs/architecture.zh.md` | architecture, overview, agent-loop, bundles, events | The repository-wide map: profile and bundle composition, core services, event domains, turn/step flow, and where new behavior should attach. This is the main bridge from Cordis concepts to DSH internals. |
| Agent 轮次与步骤生命周期 | `docs/agent-lifecycle.zh.md` | runtime, sequence, agent-loop, session-log | A sequence view of one turn: inbox claim, `agent/pre-step`, prompt assembly, model stream, tool calls, retries, and turn stop. Read this when architecture feels too high level. |
| 工具执行流水线 | `docs/tool-execution-pipeline.zh.md` | tools, policy, approval, sandbox, pipeline | Shows the real execution boundaries around a tool call: pre-hooks, guards, approval, execution, post-processing, normalization, and UI rendering. Essential before writing or modifying tools. |
| 能力 Seams 与核心服务 | `docs/capability-seams.zh.md` | seams, service-definition, provider, consumer, ownership | The codebase-wide service map. It answers which package defines a capability, which packages implement it, and which packages consume it. Best read after the architecture doc. |
| 文档图索引 | `docs/graph-atlas.zh.md` | maps, navigation, generated-graphs | A portal to the graph-style docs such as module graph, capability seams, event producers/consumers, lifecycle, and tool pipeline. Good for orienting further study. |
| 开发指南 | `docs/development.zh.md` | contributor, setup, tsconfig, build, workflow | Contributor reference for setup, TypeScript project layout, and build mechanics. Read this before making real code changes or when package/build ownership is unclear. |
| 测试策略 | `docs/testing.zh.md` | testing, snapshot, e2e, quality-gates | Explains the testing layers and what counts as valid evidence in this repo. Important once you start implementing or changing behavior. |
| 子系统 | `docs/subsystems/README.zh.md` | index, reference, subsystems, api-surface | Index of the subsystem reference corpus. Use it after the architecture and flow docs to zoom into the exact service or event family you want to inspect in code. |
| 核心 | `docs/subsystems/core.zh.md` | core, agent, agent-loop, ownership | Deep reference for the core spine: session, system prompt, tools, agent, loop, and scoped ownership. This is the best first subsystem page after the overview docs. |
| 会话 | `docs/subsystems/session.zh.md` | session-log, event-sourcing, replay, persistence-input | Explains the append-only session log, event vocabulary, and why model-visible state must be reconstructible from the log. Critical for understanding the source of truth in DSH. |
| 工具 | `docs/subsystems/tools.zh.md` | tool-definition, schema, ui, execution | Exact reference for `ToolDefinition`, schema DSL, concurrency hints, result materialization, and tool UI presentation. Read this before designing a non-trivial tool. |
| Bash 执行器 | `docs/subsystems/shell.zh.md` | shell, seam, resolve-spec, subprocess | A representative seam page showing request/spec split, managed environment, foreground/background execution, and sandbox facts. Good as the first concrete seam to trace into code. |
| Subagent | `docs/subsystems/subagent.zh.md` | subagent, delegation, continuation, provider-registry | Explains how DSH delegates work across child agents, including one-shot and continuable models. Important once you study orchestration beyond single-agent flows. |
| LLM（大语言模型）流式输出 | `docs/subsystems/llm-streaming.zh.md` | llm, messages, streamchunk, replay | Defines the shared message and block vocabulary that ties model requests, session history, and tool calls together. Important when reading the core loop or adapters. |
| 事件生产方与消费方矩阵 | `docs/event-producer-consumer.zh.md` | events, ownership, producer-consumer, lookup | A cross-reference showing who emits and who listens to each harness event. Best used while tracing extension points through code. |

## Immediate Post-Tutorial Path

| Order | Title | Path | Tags | Summary |
|---|---|---|---|---|
| 1 | 第一个插件 | `docs/user/develop/basic/index.zh.md` | next-step, hands-on, harness-plugin | The shortest bridge from tutorial code to a real DSH plugin loaded by `--patch` into the Web UI. |
| 1a | 开发一个工具 | `docs/user/develop/basic/tool.zh.md` | tool-authoring, schema, execute | Introduces the model-facing tool definition workflow after you can mount a plugin. |
| 1b | 插件配置 | `docs/user/develop/basic/config.zh.md` | config, plugin-options, validation | Shows how to move from hardcoded plugin behavior to real config-driven behavior. |
| 2 | 插件与生命周期 | `docs/user/develop/framework/index.zh.md` | lifecycle, fiber, reload, cleanup | Connects tutorial lifecycle concepts to DSH plugin reloading and automatic cleanup. |
| 2a | 服务与依赖 | `docs/user/develop/framework/service.zh.md` | service, inject, ctx-key | Moves from "a plugin exists" to "a plugin provides a capability on `ctx`". |
| 2b | 事件系统 | `docs/user/develop/framework/events.zh.md` | events, waterfall, communication | Moves from service wiring to plugin-to-plugin communication patterns. |
| 3 | 能力的三种角色设计 | `docs/user/develop/practice/index.zh.md` | seam-design, provider, consumer | Shows the first full DSH-native seam design pattern: definition, provider, consumer. |
| 3a | LLM 适配器 | `docs/user/develop/practice/llm-adapter.zh.md` | llm-adapter, advanced, provider | An advanced specialization once the seam pattern is clear. |

## Secondary Reference and Lookup Docs

| Title | Path | Tags | Summary |
|---|---|---|---|
| API Gateway | `docs/api-gateway.zh.md` | remote-api, host-client, typert | Host/client remote call assembly; best read when working on remotes or typed RPC. |
| 插件配置目录 | `docs/config-catalog.zh.md` | generated, config-reference | Generated configuration reference. Use as lookup, not as sequential learning material. |
| 模块依赖关系图 | `docs/module-graph.zh.md` | generated, package-graph | Graph view of package-level dependencies. Useful when mapping docs to implementation packages. |
| 会话持久化事件目录 | `docs/persistence-catalog.zh.md` | generated, session-events | Lookup table for persisted session events and their payloads. |
| 工具 Schema 目录 | `docs/tool-catalog.zh.md` | generated, tool-reference | Lookup catalog of tool schemas and package mappings. |
| 防御性模式 | `docs/defensive-patterns.zh.md` | design-rules, lifecycle, teardown | Defensive implementation rules for lifecycle, concurrency, subprocess, and teardown work. |
| 术语表 | `docs/glossary.zh.md` | terminology, naming, concepts | Normalized project terminology such as seam, scope, round, and goal. |
| Vendored 包改名 | `docs/rescope.zh.md` | vendor, package-rename | Reference for vendored package rescoping. Useful only when touching `vendor/`. |
| Web UI 样式参考 | `docs/web-styling.zh.md` | ui, styling, frontend | Styling reference for the web application. Relevant only for front-end work. |

## Category Notes Worth Deferring

| Category | Why you can defer it |
|---|---|
| `docs/cookbook/` | These are contributor playbooks for a concrete task. Useful after you know which task you are doing. |
| `docs/cordis-api/` | Better as API lookup once you already know which Cordis concept you need. |
| `docs/postmortem/` | Excellent for learning failure patterns, but low ROI before the main architecture and seam model are clear. |
| `docs/i18n/` | Needed for bilingual docs maintenance, not for understanding the runtime. |
| `docs/user/guide/` | Useful for operating DSH as a product; less useful than `user/develop/` for internals study. |

## Recommended Reading Order Summary

1. Completed: `docs/cordis-tutorial/index.zh.md`
2. Next: `docs/user/develop/basic/index.zh.md` → `tool.zh.md` → `config.zh.md`
3. Then: `docs/user/develop/framework/index.zh.md` → `service.zh.md` → `events.zh.md`
4. Then: `docs/architecture.zh.md` → `docs/agent-lifecycle.zh.md` → `docs/tool-execution-pipeline.zh.md`
5. Then: `docs/subsystems/core.zh.md` → `session.zh.md` → `tools.zh.md` → one concrete seam page such as `shell.zh.md`
6. Advanced: `docs/user/develop/practice/index.zh.md` → `docs/capability-seams.zh.md` → target subsystem pages
