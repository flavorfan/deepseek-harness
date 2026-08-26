---
name: py-code-teach
description: 'Teach and explain an attached or selected non-Python code file to a Python programmer. Use when the user asks to understand TypeScript, JavaScript, Java, C#, Go, Rust, frontend, backend, script, or config-driven code step by step from the program entry. Always identify the source language first, understand the whole implementation logic, divide it into functional stages, show code snippets, explain necessary language syntax by comparing with Python, and proceed interactively one stage at a time after user confirmation.'
argument-hint: 'Attached file or file path, audience level, and optional focus area'
user-invocable: true
disable-model-invocation: false
---

# Python Programmer Code Teaching

Explain a code file written in a non-Python language to a Python engineer through a staged, interactive walkthrough.

## When to Use

Use this skill when the user wants to learn or understand a code file and says things like:

- “我是 Python 工程师，但不懂 TypeScript/JavaScript/Java/C#/Go/Rust，帮我讲解这个文件。”
- “从程序入口开始 step by step 讲解。”
- “先整体讲，再分阶段，每阶段讲完等我确认。”
- “结合代码和必要语法讲解。”
- “把这个非 Python 文件讲给 Python 程序员听。”

Do not use this skill for code review, debugging, refactoring, or implementation unless the user explicitly asks for those. The default output is teaching, not code changes.

## Inputs

Expected inputs:

- One attached code file, selected file, or explicit file path.
- The source language may not be Python. Identify it as `<Language>` before teaching.
- Optional companion docs or implementation notes.
- Optional learning focus, such as async flow, type system, framework lifecycle, auth, state management, or build/runtime behavior.

If multiple files are attached, identify the primary file and use companion files only to explain behavior or intent.

## Procedure

### 1. Identify Language and Scope

1. Inspect the file extension, syntax, imports, runtime APIs, and build/runtime hints.
2. State the detected `<Language>` and runtime context, for example:
   - TypeScript running under Node.js with `tsx`.
   - JavaScript running in browser and Node.js contexts.
   - Java with Spring Boot.
   - Go CLI program.
3. If language or runtime is ambiguous, say what evidence points to each possibility and ask one concise clarifying question only if the ambiguity blocks the teaching flow.

### 2. Understand the Whole Implementation First

Before teaching stage by stage, build a mental model of the whole file:

1. Find the program entry point:
   - TypeScript/JavaScript: top-level call, `main()`, `run()`, CLI handler, framework bootstrap.
   - Java: `main`, Spring `@SpringBootApplication`, controller/service entry.
   - Go: `func main()`.
   - C#: `Program.cs`, `Main`, ASP.NET startup.
   - Rust: `fn main()`.
2. Trace the main call chain from entry to completion.
3. Identify major data structures and result objects.
4. Identify external boundaries:
   - Environment variables.
   - Files/artifacts.
   - Network/API calls.
   - Browser/runtime APIs.
   - Database/cache/message queue interactions.
5. Identify success path, failure path, and cleanup path.

Do this internally first. The user-facing explanation should start with a concise overall map, not a raw dump of every function.

### 3. Create a Stage Plan

Divide the file into functional stages. Each stage should implement one coherent responsibility.

Good stage boundaries include:

- Entry point and configuration loading.
- Type declarations and runtime setup.
- Dependency loading or object construction.
- Main I/O operation.
- Parsing and validation.
- Business decision logic.
- Output/reporting.
- Error handling and cleanup.

Prefer 4-8 stages. If the file is small, use fewer stages. If the file is large, keep stages conceptual and defer details until that stage.

### 4. Teach Overall First

Start the teaching with:

1. Detected `<Language>` and runtime.
2. What the file is trying to accomplish.
3. The main call chain from entry to end.
4. A Python-style pseudocode sketch of the whole process.
5. The planned stages.

Then teach only Stage 1. Do not continue into Stage 2 until the user confirms they understand.

### 5. Teach Each Stage Interactively

For each stage, use this structure:

````markdown
**阶段 N：<阶段名>**

这一阶段的目标是：<一句话说明功能>

关键代码：

```<language>
<small focused snippet>
```

讲解：
<step-by-step explanation>

Python 类比：

```python
<short comparable pseudocode>
```

必要的 <Language> 语法点：
- `<syntax>`：<plain explanation>

这一阶段完成后，程序状态变成：
<what values/objects/resources now exist>

你确认一下：阶段 N 是否理解了？理解后我继续阶段 N+1。
````

Keep code snippets focused. Avoid pasting entire large functions unless the full function is necessary to understand control flow.

### 6. Explain Language Syntax Only When It Matters

Explain syntax in context, not as a generic language tutorial.

Useful comparisons for Python programmers:

- Type annotations: compare with Python type hints.
- `async` / `await`: compare with Python async functions.
- `Promise<T>`: compare with awaitable results.
- Optional fields like `field?: Type`: compare with `Optional[T]` or possibly-missing dict keys.
- `unknown`: compare with external JSON needing `isinstance` checks.
- `as Type`: explain as a type assertion, not runtime conversion.
- `?.`: explain as safe access when a value may be missing.
- `??`: explain as default only for `null` or `undefined`.
- Generics like `<T>`: compare with `TypeVar` only if useful.
- Union types: compare with `Literal` or `Union`.
- Pattern matching, interfaces, classes, decorators, closures, callbacks, or framework lifecycle only when they appear in the file.

### 7. Respect the Interactive Stop Rule

After each stage, stop and wait for the user.

Continue only when the user says things like:

- “继续”
- “理解了”
- “下一阶段”
- “go on”

If the user asks a question about the current stage, answer that question first, then ask whether to continue.

### 8. Finish with a Compact Review

After the final stage, offer a concise recap:

- Full entry-to-exit flow.
- Main data transformations.
- Important language concepts learned.
- Success path and failure path.
- Any useful mental model for maintaining or modifying the file.

If the user asks, create a Markdown teaching document from the walkthrough and save it to a requested docs location.

## Branching Logic

- If the code has no obvious entry point:
  - Explain the likely invocation model and ask for the caller or runtime command if needed.
- If the file is a library module rather than executable code:
  - Start from the exported public API or most important exported symbol.
- If the file is framework-driven:
  - Start from the framework lifecycle entry point, then map callbacks/hooks/routes/components to runtime behavior.
- If the code is too long for one pass:
  - Build a high-level map first, then teach the highest-value path before optional branches.
- If companion docs conflict with code:
  - Prefer code behavior, then mention the doc/code mismatch clearly.
- If the user asks to skip interaction:
  - Provide the full staged explanation in one response, but keep sections clearly separated.

## Completion Checks

Before answering, verify that the teaching plan satisfies these checks:

- The source language `<Language>` is identified.
- The program entry point or equivalent public entry is identified.
- The whole implementation logic is summarized before details.
- The explanation is divided into functional stages.
- Stage 1 is taught immediately after the overall map.
- Each stage includes focused code snippets and explanation.
- Necessary `<Language>` syntax is explained with Python comparisons.
- The response stops after each stage and asks for confirmation before continuing.
- No code edits are made unless the user explicitly asks for edits.

## Output Contract

For the first response in a walkthrough, produce:

1. Detected language and runtime.
2. Overall purpose of the file.
3. Main call chain.
4. Python-style pseudocode overview.
5. Stage list.
6. Stage 1 explanation only.
7. A confirmation question before continuing.

For continuation responses, produce only the next stage unless the user asks for recap or clarification.

## Suggested Prompt Examples

- `/py-code-teach scripts/verify-login-flow.ts 我是 Python 工程师，不懂 TypeScript，请从入口开始分阶段讲解`
- `/py-code-teach frontend/src/App.tsx explain this React file to a Python developer, one stage at a time`
- `/py-code-teach cmd/server/main.go 先整体讲，再按阶段交互式讲解 Go 代码`
- `/py-code-teach src/main/java/App.java 用 Python 类比讲 Java 程序入口和调用链`