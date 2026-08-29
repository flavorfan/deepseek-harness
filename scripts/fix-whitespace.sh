#!/usr/bin/env bash
set -euo pipefail

# Fix trailing whitespace and extra blank lines at EOF in staged or modified files
# and verify with git diff --cached --check.

root=$(git rev-parse --show-toplevel)
cd "$root"

mode="${1:-staged}"

files=()

if [ "$mode" = "--all" ] || [ "$mode" = "all" ]; then
  # Target all modified/staged tracked files
  while IFS= read -r -d '' file; do
    [ -f "$file" ] && files+=("$file")
  done < <(git diff --name-only -z --diff-filter=ACMR HEAD 2>/dev/null || git diff --name-only -z --diff-filter=ACMR)
else
  # Default: target staged files
  while IFS= read -r -d '' file; do
    [ -f "$file" ] && files+=("$file")
  done < <(git diff --cached --name-only -z --diff-filter=ACMR)
fi

if [ ${#files[@]} -eq 0 ]; then
  echo "fix-whitespace: No target files found to check."
  exit 0
fi

echo "fix-whitespace: Checking trailing whitespace and EOF blank lines in ${#files[@]} file(s)..."
fixed_count=0

for file in "${files[@]}"; do
  needs_fix=0
  if perl -ne '$found ||= /[ \t]+$/; END { exit($found ? 0 : 1) }' "$file" 2>/dev/null; then
    needs_fix=1
  fi
  if perl -0777 -e 'exit((<> =~ /\n{2,}\z/) ? 0 : 1)' "$file" 2>/dev/null; then
    needs_fix=1
  fi

  if [ "$needs_fix" -eq 1 ]; then
    perl -pi -e 's/[ \t]+$//' "$file"
    perl -0777 -pi -e 's/\n{2,}\z/\n/' "$file"
    git add "$file"
    echo "  Fixed and re-staged: $file"
    fixed_count=$((fixed_count + 1))
  fi
done

if [ $fixed_count -eq 0 ]; then
  echo "fix-whitespace: No trailing whitespace or EOF blank lines detected."
else
  echo "fix-whitespace: Cleaned formatting in $fixed_count file(s)."
fi

echo "fix-whitespace: Verifying staged diff with 'git diff --cached --check'..."
if git --no-pager diff --cached --check; then
  echo "✅ fix-whitespace: Staged diff check passed."
else
  echo "❌ fix-whitespace: Staged diff check failed. Please review remaining errors above." >&2
  exit 1
fi
