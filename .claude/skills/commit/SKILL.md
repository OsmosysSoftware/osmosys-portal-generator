---
name: commit
description: Create a git commit following conventional commit conventions.
argument-hint: "[optional commit message override]"
allowed-tools: Bash, Read, Grep
---

# Commit Changes

## Format

```text
<type>[optional scope]: <description>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**Rules:**
- Imperative present tense ("add" not "added")
- Lowercase after colon
- No period at end
- No `Co-Authored-By` or AI attribution lines — ever

## Steps

1. `git status` and `git diff --stat` to review changes
2. If `$ARGUMENTS` provided, use as message (validate format)
3. Otherwise, analyze diff and compose message
4. Stage specific files (not `git add -A`)
5. Commit via HEREDOC:
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>: <description>
   EOF
   )"
   ```
6. `git status` to verify
