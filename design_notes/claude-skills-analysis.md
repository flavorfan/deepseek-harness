# `.claude/skills` SKILL 分析报告

生成时间：2026-08-25
分析方式：使用 2 个 sub-agent（目录盘点 + 结构归纳）

## 1. 范围与产物

- 分析目录：`/Users/frank_fan/Source/repos/playground/deepseek-harness/.claude/skills`
- 发现 SKILL：11 个

## 2. SKILL 清单

1. `dsh-archive-agent-notes`
2. `dsh-code-review`
3. `dsh-doc-site-sync`
4. `dsh-doc-standards`
5. `dsh-find-simplifications`
6. `dsh-merging-stacked-prs`
7. `dsh-pre-push-checks`
8. `dsh-prose-standard`
9. `dsh-translate-docs`
10. `dsh-trim-cot-leakage`
11. `record-browser-gif`

## 3. 各 SKILL 结构化摘要

| SKILL | 核心用途 | 触发关键词（摘要） | 关键流程（摘要） | 约束/边界（摘要） |
|---|---|---|---|---|
| `dsh-archive-agent-notes` | 管理 Agent Notes 生命周期 | adding/auditing/pruning/archiving/restoring/reviewing notes | 契约检查 → supersession 审核 → 按未来价值分类 → 按 triplet 归档 → 验证汇报 | archived 后冻结；不得以篇幅作为归档标准 |
| `dsh-pre-push-checks` | 推送前最小证据检查策略 | before push / ready for review / gh stack sync | 判定改动范围 → 选最小相关检查 → 历史改写保护 → 推送后核验 | 禁止 raw `--force`；失败需修复或阻塞说明 |
| `dsh-find-simplifications` | 发现并沉淀可证明的简化机会 | find simplifications / coalesce notes / fold ideas | survey → 逐项证明/驳回 → 产出 proposed note 或 TODO | 禁止臆测；受保护面不轻率建议删除 |
| `dsh-code-review` | PR 语义审查框架 | reviewing a pull request | 先范围与规范对齐 → 阻断项检查 → 语义审查 → 分级反馈 | 自动化通过不等于语义正确 |
| `dsh-translate-docs` | 双语文档配对翻译流程 | 仅显式调用 | update/new/rename-delete 分流 → brief 驱动翻译 → pairing 校验 | `disable-model-invocation: true`；禁止小改动整篇重译 |
| `dsh-doc-standards` | 文档层级与体裁标准 | improve/audit docs / doc too long / budget failure | 先结构后文案 → corpus 审计 → 规则验证与报告 | 不以字数单独判错；迁移需原子修链 |
| `record-browser-gif` | 录制并发布 GUI 演示 GIF | make/record/generate GIF | 真实环境起服务 → 状态驱动录制 → 编码验证 → 可选发布 PR 媒体 | 禁止提交 GIF 到开发分支；assets 分支仅追加 |
| `dsh-merging-stacked-prs` | 官方 stacked PR 合并流程 | stacked PRs / dependent PRs | 校验 stack 拓扑 → 必要 sync/rebase → `gh stack merge` → 验证状态 | 禁止回退到手工 `gh pr merge` 模拟 |
| `dsh-doc-site-sync` | docs 到 VitePress 的投影同步 | docs.ts / docs:dev/docs:check/doc-sync | 按编辑/新增/迁移/删除处理 → 更新映射 → 预览校验 | 禁止编辑 `website/.generated|.cache|.dist` |
| `dsh-prose-standard` | prose 质量与删改标准 | writing/reviewing/trimming/auditing prose | 明确 scope → 选 mode → 完整命题检查 → 分类操作与验证 | 无 `scope` 必须停止；排除 vendor 与 archived notes |
| `dsh-trim-cot-leakage` | 清理推理泄漏式文案 | decision N / used to / reviewer/stack 叙事等 | HEAD 可解析性判定 → taxonomy 修复 → 回归验证 | 需显式 scope；不触碰 vendor/archived/记录型快照 |

## 4. 结构与治理观察（发现-证据-建议）

### 4.1 模板结构总体一致，但元数据与收尾段命名不统一

- 发现：多数采用 `frontmatter + 标题 + 分步流程`，但收尾段与字段有差异。
- 证据：`dsh-translate-docs` 额外字段（`disable-model-invocation`、`user-invocable`）；收尾段存在 `Validate and report` / `Checklist` / `Reporting findings` 等多种命名。
- 建议：统一骨架为 `Scope/Boundary -> Workflow -> Validation -> Output`，并约定收尾标题。

### 4.2 分类覆盖完整，文档相关技能最密集

- 发现：工程流程、发布协作、质量保障、文档治理、可观测证据均有覆盖。
- 证据：文档类（`dsh-doc-standards`、`dsh-prose-standard`、`dsh-trim-cot-leakage`、`dsh-translate-docs`）数量最多。
- 建议：增加一个 skills 索引页，包含“场景 -> 推荐技能 -> 次级技能”映射。

### 4.3 技能边界存在交叉，主要集中在文档链与发布前检查链

- 发现：同一任务可能命中多个技能。
- 证据：文档类技能互相引用；`dsh-pre-push-checks` 与 `dsh-merging-stacked-prs` 在 `gh stack sync` 后检查存在重叠。
- 建议：每个技能增加 “Not for” 区段，明确不适用场景。

### 4.4 命名与触发词可进一步结构化

- 发现：命名前缀不完全一致，触发词多分散在 description 自然语言中。
- 证据：多数为 `dsh-*`，但 `record-browser-gif` 未采用同前缀。
- 建议：统一命名约定，并考虑在 frontmatter 增加结构化 `triggers` 字段。

## 5. 建议的后续动作（可执行）

1. 新增一个 skills 总览文档（分类、触发词、调用优先级、Not-for）。
2. 为所有 SKILL 统一“输出段”模板（scope、变更、验证、风险、待决项）。
3. 在文档链技能中补齐边界声明，减少重复调用。
4. 评估是否统一命名到 `dsh-*`，或正式记录例外策略。
