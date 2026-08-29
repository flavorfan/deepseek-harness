# DeepSeek Harness `scripts/` 目录脚本全景总结与分析

本文档对 `scripts/` 目录下的所有自动化脚本、校验工具及生成器进行系统化分析与分类归纳。结合仓库现有文档（如 `docs/development.zh.md`、`docs/AGENTS.md`、`docs/testing.md`）及 `package.json` 中的命令定义，汇总脚本功能与典型调用方式。

---

## 一、工程背景与设计约定

在 DeepSeek Harness 架构中，`scripts/` 目录承担了项目构建、质量门禁 (Quality Gates)、文档与 API 图谱自动生成、双语配对 (i18n Pairing)、Agent Note 管理以及发布流水线等核心任务。

根据 `docs/development.zh.md` 与仓库规范：
1. **聚合门禁机制**：`scripts/run-gates.ts` 作为质量门禁调度器，管理具有依赖无环图 (DAG) 的并行检查。
2. **源码平面与产物平面分离**：大部分 `verify-*` 脚本支持对源码进行静态检查；而 `verify-built-*` 或 `publint-all.ts` 专门对 `lib/` 下的构建产物进行产物平面校验。
3. **生成的文档为单向数据流**：许多 `docs/` 下的架构图、API Catalog 和配置目录均由 `gen-*` 脚本自动生成，并通过对应的 `verify-*` 脚本在 CI 或 `pnpm run doc-sync` 中校验最新状态。

---

## 二、脚本分类与功能详解

### 1. 构建与项目类型管理 (Build & TypeScript Project Management)

负责管理整体代码库的编译、环境元数据绑定以及 TypeScript 解决方案 (Solution / Project References) 的架构校验。

| 脚本文件 | 核心职责与说明 | 典型调用示例 |
| :--- | :--- | :--- |
| `scripts/build.ts` | 完整根构建入口。依次执行 `build:lib`（Host & Client 双阶段编译与 tsdown 捆绑）和 `build:web`，并将公开环境变量记录导出到 `.client-build-record.json` 中。 | `pnpm run build`<br>`pnpm run build:official` |
| `scripts/clean.ts` | 清理脚本。递归清理根工作区及各子包的 `lib/`、`dist/`、`.tsbuildinfo` 等构建产物与临时残余。 | `pnpm run clean` |
| `scripts/client-build-environment.ts` | 客户端构建环境变量解析与记录绑定工具。解析 `DSH_CLIENT_*` 变量，生成构建记录。 | 由 `build.ts` 内部调用 |
| `scripts/ts-project.ts` | TypeScript 项目配置与 Project Reference 辅助解析模块。提供解析 `tsconfig.json` 引用的底层函数。 | 模块供其他验证脚本导入 |
| `scripts/project-reference-faces.ts` | 校验 Host 与 Client 两个 TS 编译器聚合面 (Aggregate Programs) 的分立不变性，防止类型合并污染。 | `tsx scripts/project-reference-faces.ts` |

---

### 2. 质量门禁与工程规范校验 (Quality Gates & Engineering Standards)

工作区不变性、代码质量、依赖约束和跨平台兼容性的质量门禁。

#### 2.1 门禁调度与 Lint 工具
* **`scripts/run-gates.ts`**：质量门禁总调度器。按 DAG 并发调度运行 `check-all`、`ci-primary`、`hygiene`、`doc-sync` 等聚合任务。
  * 调用示例：`pnpm run check:all` 或 `pnpm run hygiene`
* **`scripts/run-oxlint.ts`**：运行 Oxlint 静态代码检查。
  * 调用示例：`pnpm run lint:contracts-ready`
* **`scripts/publint-all.ts`**：对所有待发布的包进行 `publint` 入口点合法性检测。
  * 调用示例：`pnpm run publint`

#### 2.2 工作区与包不变性校验 (Workspace & Package Invariants)
* **`scripts/check-workspace-constraints.ts`**：`pnpm run constraints` 校验 workspace 跨包依赖约束及 tsconfig 引用规则。
* **`scripts/verify-package-invariants.ts`**：校验源码包的定义规范（如 `package.json` 结构、导出规则）。
* **`scripts/verify-built-package-invariants.mjs`**：对构建后的 `lib/` 产物文件不变性进行验证。
* **`scripts/verify-package-paths.ts`**：校验包内相对路径与导入声明的一致性。
* **`scripts/verify-dsh-package-licenses.ts`**：校验所有 `@deepseek-ai/dsh-*` 子包的开源许可证。
* **`scripts/verify-config-source-ownership.ts`**：校验插件配置源文件的归属规范。
* **`scripts/verify-node-next-types.ts`**：创建临时 NodeNext 消费项目测试产物 `.d.ts` 类型导入。
* **`scripts/verify-optional-dependency-imports.ts`**：验证可选依赖（Optional Dependencies）的安全动态导入。
* **`scripts/verify-runtime-closure.ts`**：验证运行时的包闭包完整性。
* **`scripts/verify-client-packages.ts`** & **`scripts/verify-client-domain-graph.ts`**：校验客户端包结构及领域依赖图。
* **`scripts/verify-cordis-config.ts`**：校验 `cordis.yml` 配置文件的语法与依赖项合法性。

#### 2.3 平台与命名规范校验 (Platform & File Constraints)
* **`scripts/check-expected-filenames.sh`**：检查 tracked 文件名中是否包含禁用词（如 `golden`），强制要求使用 `expected`。
* **`scripts/check-vendor-manifest.sh`**：校验 `vendor/` 目录下第三方依赖清单的完整性与 SHA 映射。
* **`scripts/check-macos-deployment-target.py`**：校验 Python SDK 及 C 原生扩展在 macOS 上的最低部署目标。
* **`scripts/wine-windows-gates.sh`**：在 Wine/Windows 环境下模拟执行跨平台门禁校验。
  * 调用示例：`pnpm run check:windows-wine`

---

### 3. 文档、目录与图表自动化 (Documentation, Catalogs & i18n Automation)

自动化生成架构图表、API 目录，以及校验多语言（英/中）文档的配对与预算。

#### 3.1 代码注释与类型校验
* **`scripts/doc-typecheck.ts`**：扫描 Markdown 文档中的 TypeScript 代码块并进行类型检查。
  * 调用示例：`pnpm run doc-typecheck`
* **`scripts/verify-export-jsdoc.ts`**：强制校验所有公共导出函数和接口的 JSDoc 注释完备性。

#### 3.2 文档规范与超限校验
* **`scripts/verify-doc-budgets.ts`**：对核心文档字数与物理行数上限（Budgets）进行严格校验。
  * 调用示例：`pnpm run verify-doc-budgets`
* **`scripts/verify-doc-refs.ts`** / **`scripts/verify-md-links.ts`** / **`scripts/verify-public-repository-links.ts`**：检查文档内部链接、相对路径及外部 GitHub 仓库链接有效性。
* **`scripts/verify-md-wrap.ts`**：校验 Markdown 文本段落换行规范。
* **`scripts/verify-doc-site-fragments.ts`** & **`scripts/project-doc-site.ts`**：校验 VitePress 站点导航与片段映射。

#### 3.3 目录与图谱自动生成器 (Catalog & Graph Generators)
* **`scripts/gen-cordis-catalog.ts`** / **`scripts/gen-cordis-api.ts`**：从 Cordis 源码自动生成 API 手册与子系统 Catalog 文档。
  * 调用示例：`pnpm run gen-cordis-catalog`
* **`scripts/gen-client-catalog.ts`** / **`scripts/gen-tool-catalog.ts`** / **`scripts/gen-config-catalog.ts`** / **`scripts/gen-persistence-catalog.ts`**：分别生成 Client、Tool、Config、Persistence 的目录文档。
* **`scripts/gen-scoped-events.ts`**：自动抽取生成作用域事件 (Scoped Events) 映射文档。
* **`scripts/gen-doc-graphs.ts`**：生成架构中的 Mermaid 关系图（如 `agent-lifecycle.md`、`capability-seams.md` 等）。
* **`scripts/gen-module-graph.ts`**：自动生成 `docs/module-graph.md` 模块图谱。
* **`scripts/gen-third-party-notices.ts`**：自动扫描依赖并更新 `THIRD_PARTY_NOTICES.md`。
* **`scripts/verify-mermaid.ts`**：校验文档中 Mermaid 图表语法的正确性。

#### 3.4 双语翻译与 Markdown 配对 (i18n & Translation Pairing)
* **`scripts/gen-translation-brief.ts`**：生成中英文文档差异翻译简报。
* **`scripts/verify-translation-pairing.ts`** / **`scripts/verify-translation-prompt.ts`**：校验英文主文档与 `.zh.md` 中文对侧文档的同步配对状态。
* **`scripts/merge-translation-pairing.ts`** & **`scripts/merge-translation-pairing-driver.sh`**：Git 双语合并驱动，自动处理配对文档在 Git merge 时的版本冲突。

---

### 4. Agent Note 规范管理 (Agent Notes Verification)

管理 `.agents/notes/` 目录下设计的 Agent Note 结构、分类与归档。

| 脚本文件 | 功能说明 | 典型调用示例 |
| :--- | :--- | :--- |
| `scripts/verify-agent-note-classification.ts` | 验证新 Agent Note 的分类标记（如 `implemented/`、`proposed/`）。 | `tsx scripts/verify-agent-note-classification.ts` |
| `scripts/verify-agent-note-format.ts` | 校验 Agent Note 的 Frontmatter 属性与 Markdown 格式。 | `tsx scripts/verify-agent-note-format.ts` |
| `scripts/verify-archived-agent-notes.ts` | 校验 `.agents/notes/archived/` 冻结归档三件套（英文、中文、Manifest）的完整性。 | `pnpm run verify-archived-agent-notes` |
| `scripts/agent-note-tree.ts` | 生成 Agent Note 的树状索引结构。 | 内部模块 |

---

### 5. 测试、快照与覆盖率管理 (Testing, Snapshots & Coverage)

并行测试拆分、快照录制/回放以及覆盖率豁免处理。

#### 5.1 覆盖率与分区测试
* **`scripts/run-coverage-partitions.ts`**：并行执行 Vitest 测试并按分区合并覆盖率报告。
  * 调用示例：`pnpm run test:coverage:partitioned`
* **`scripts/coverage-partitions.ts`** / **`scripts/coverage-exempt.ts`**：定义覆盖率测试分区逻辑以及重型测试套件的豁免清单。
* **`scripts/coverage-uncovered-locations.cjs`**：解析并定位未覆盖的代码位置。

#### 5.2 快照与 Fixture 管理
* **`scripts/run-web-snapshots.ts`**：Web 自动化快照回放与 CI 校验。
  * 调用示例：`pnpm run test:web:ci`
* **`scripts/migrate-packed-session-fixtures.ts`**：迁移与升级存储的测试 Fixture 数据格式。
* **`scripts/session-fixture-layout.ts`**：校验 Session 测试 Fixture 的目录布局规范。

---

### 6. 发布、重定域与包管理 (Release, Vendoring & Package Management)

处理发布版本号 bump、打包打包验证、第三方代码重定域 (Vendoring) 及环境初始化。

#### 6.1 官方发布流水线 (Release Pipeline)
* **`scripts/release/bump.ts`**：自动计算并更新 `@deepseek-ai/*` 系列包的版本号。
  * 调用示例：`pnpm run release:dsh` 或 `pnpm run release:vendor`
* **`scripts/release/pack.ts`**：将各 workspace 打包为 `.tgz` 压缩包。
* **`scripts/release/verify.ts`** & **`scripts/release/verify-packed-install.ts`**：验证打包文件的完整性以及在干净环境下的安装可用性。
* **`scripts/release/publish.ts`**：执行正式 NPM 发布。
* **`scripts/publish-npm-baseline.ts`**：发布 NPM 基线包。

#### 6.2 供应商重定域与 Git Hooks
* **`scripts/rescope-vendor.ts`**：自动对 `vendor/` 目录下引用的第三方源码（如 Cordis）重新重定域（Rescope）包名。
  * 调用示例：`pnpm run rescope-vendor`
* **`scripts/install-lefthook.mjs`**：安装工作区本地的 Lefthook Git 钩子及自定义 Git 合并驱动。
  * 调用示例：`node scripts/install-lefthook.mjs` (postinstall 阶段自动触发)

#### 6.3 Python SDK 构建与发布
* **`scripts/build-python-release.py`**：构建 Python SDK 的 Wheel 与源码包。
* **`scripts/build-exe-for-python-sdk.ts`**：为 Python SDK 编译打包原生 Executable / PTY 扩展。
* **`scripts/smoke-python-runtime.py`**：Python 运行时环境冒烟测试。

---

### 7. 日常开发辅助与格式修复 (Developer Helpers & Automation)

提升日常开发效率的实用工具。

| 脚本文件 | 功能说明 | 典型调用示例 |
| :--- | :--- | :--- |
| `scripts/fix-whitespace.sh` | **自动清除行尾空格脚本**。支持清理暂存区（或全量文件 `--all`）中的行尾空白字符，并自动 re-stage 和运行 `git diff --cached --check` 验证。 | `bash scripts/fix-whitespace.sh`<br>`pnpm fix:whitespace` |
| `scripts/change-scope.ts` | 变更作用域计算与修改，辅助计算影响的包范围。 | `pnpm run change-scope` |
| `scripts/dev-web.ts` | 启动 Web 前端热更新与联调服务。 | `pnpm run dev:web` |
| `scripts/demo-cordis.mjs` / `scripts/demo-code-mode.mjs` | 可执行的 Demo 演示脚本。 | `pnpm run demo:cordis` |
| `scripts/pnpm-invocation.ts` | 统一包装并规范 pnpm 命令行调用的内部辅助模块。 | 内部模块 |

---

## 三、常用场景速查表 (Quick Reference)

| 开发场景 | 推荐使用的脚本命令 |
| :--- | :--- |
| **首次克隆仓库或更新依赖后** | `node scripts/install-lefthook.mjs && pnpm run typecheck` |
| **提交代码前格式清理** | `pnpm fix:whitespace` |
| **提交前本地快速全量检查** | `pnpm run check:all` 或 `pnpm run hygiene` |
| **重新生成所有文档目录与图表** | `pnpm run doc-sync` |
| **更新 Vendor 代码后重新命名** | `pnpm run rescope-vendor` |
| **发布前全套构建与包验证** | `pnpm run build:official && pnpm run release:verify` |

---
*文档更新日期：2026-08-29*
