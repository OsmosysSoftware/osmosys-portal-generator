---
name: code-quality
description: Run lint, format, and build checks. Use when asked to check code quality or verify the build passes.
allowed-tools: Bash, Read, Grep
---

# Code Quality Check

## Steps

```bash
npm run lint          # ESLint with --max-warnings=0
ng build              # Angular production build
```

If lint fails, auto-fix:
```bash
npm run lint-fix-format   # Combined: format + lint:fix + format
```

## Rules

- **Zero warnings policy**: `--max-warnings=0`
- **No `any` types**: `@typescript-eslint/no-explicit-any: error`
- Always fix issues before committing — never skip pre-commit hooks
