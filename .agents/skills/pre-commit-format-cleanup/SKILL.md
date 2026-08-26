---
name: pre-commit-format-cleanup
description: Use when the user asks to commit, retry a blocked commit, clean formatting before commit, fix pre-commit hook failures, remove trailing whitespace, normalize Markdown line endings, or explain why a commit was rejected by whitespace checks. Prefer this skill whenever staged docs or notes fail whitespace hooks, especially when Markdown uses trailing double spaces for hard line breaks.
---

# Pre-Commit Format Cleanup

Use this skill to repair formatting issues that block a commit, with special attention to staged Markdown files and whitespace hooks.

## What this skill is for

Apply this workflow when:

- a commit fails in pre-commit hooks
- whitespace or formatting checks reject staged files
- Markdown notes or docs contain trailing spaces
- the user wants a fast cleanup before retrying `git commit`

This skill is not for broad lint or build failures. Use it only for narrow formatting cleanup that can be verified quickly.

## Core lesson from recent failures

The most common local failure here is staged Markdown that uses trailing spaces for visual line breaks. Repository whitespace hooks treat those spaces as errors.

Prefer one of these repairs:

1. remove trailing spaces and use a normal paragraph break
2. rewrite the sentence structure so a hard break is unnecessary
3. use an explicit HTML break only when the document genuinely needs one

Do not bypass the hook.

## Workflow

### 1. Inspect only the commit scope

Check whether work is already staged.

```sh
git --no-pager status --short
git --no-pager diff --cached --check
```

- If files are already staged, fix only the staged commit scope.
- If nothing is staged and the user asked to prepare a commit, inspect the current worktree before staging.

### 2. Read the failing lines

Use the reported file and line numbers to inspect the exact lines that failed.

- For Markdown, watch for trailing spaces at the ends of lines.
- For prose files, also watch for accidental blank-line padding, mixed indentation, or copied shell/code lines with stray spaces.

### 3. Make the narrowest safe repair

Preferred fixes:

- delete trailing spaces
- replace Markdown hard-break spacing with a blank line when the text still reads correctly
- keep code blocks, lists, and links intact

Avoid unrelated rewrites while fixing formatting.

### 4. Re-stage and re-run the whitespace check

```sh
git add <changed-files>
git --no-pager diff --cached --check
```

If the whitespace check still fails, repeat the inspect-and-fix loop until the staged diff is clean.

### 5. Retry the original commit path

After the staged diff passes, retry `git commit` normally so the real hook result is observed.

If another hook fails for a different reason, stop treating it as a formatting-only task and report the new blocker clearly.

## Markdown-specific guidance

- A line ending with two spaces is fragile in repositories that enforce whitespace cleanliness.
- In notes and docs, prefer plain paragraphs over layout-driven spacing tricks.
- If a visual break is semantically important, use a clearer construct instead of hidden trailing spaces.

## Report back to the user

Summarize:

1. which files were fixed
2. what formatting issue caused the hook failure
3. whether `git diff --cached --check` passed afterward
4. whether the commit retry succeeded

## Example trigger requests

- "commit 被 whitespace hook 挡住了，帮我修一下"
- "提交前把 markdown 格式问题清掉"
- "why did pre-commit reject this doc change?"
- "retry the commit after fixing trailing whitespace"
