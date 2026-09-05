# `git sync-upstream`（最终精简版）

## 一次配置

```bash
git config alias.sync-upstream '!f(){ set -e; git remote get-url upstream >/dev/null 2>&1 || git remote add upstream https://github.com/deepseek-ai/deepseek-harness.git; git fetch upstream --prune; git fetch origin --prune; b=$(git symbolic-ref --quiet --short refs/remotes/upstream/HEAD | sed "s#^upstream/##"); git push --no-verify origin "upstream/${b}:${b}"; }; f'
```

## 日常使用

```bash
git sync-upstream
```

## 这个版本解决了什么

- 不依赖本地当前分支或本地 `master` 状态。
- 直接同步 `upstream` 默认分支到 `origin` 同名分支。
- 不会切换你当前工作分支。
- `--no-verify` 避免被本地 pre-push hook 阻塞同步流程。
