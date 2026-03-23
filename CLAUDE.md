# CLAUDE.md — Osmosys Portal Generator

## Project Overview

Node.js CLI tool that scaffolds production-ready Angular 21 portal projects with Osmosys coding standards, AI tooling, and best practices.

## Development Commands

```bash
node bin/generate.js              # Run generator (interactive)
node bin/generate.js --name x     # Run generator (non-interactive)
npm install                       # Install dependencies
```

## Architecture

- `bin/generate.js` — CLI entry point
- `lib/` — scaffold logic, prompts, template engine
- `templates/base/` — static files copied into generated projects
- `templates/conditional/` — feature-gated files (auth, etc.)
- `templates/ejs/` — EJS templates rendered with project variables
- `templates/ai-config/` — MCP server config and Claude Code skills for generated projects

## Template Coding Rules

### No `$any()` in Angular Templates

NEVER use `$any()` in any `.html` template file under `templates/`. The `$any()` cast disables type checking for the expression, hiding real bugs and making refactoring unsafe.

**Instead of `$any()`**, fix the root cause:

- Give methods/properties explicit return types so the template compiler knows the type
- Use typed severity/status maps (`Record<string, Severity>`) instead of loose indexing
- Use `$index` (not `index`) in `@for` loops — it is already typed as `number`

**Example — severity badge:**

```typescript
// In component .ts
type Severity = 'success' | 'info' | 'warn' | 'danger';

private readonly severityMap: Record<string, Severity> = {
  active: 'success',
  inactive: 'danger',
  pending: 'warn',
};

getSeverity(status: string): Severity {
  return this.severityMap[status] ?? 'info';
}
```

```html
<!-- In template .html — no $any needed -->
<p-tag [severity]="getSeverity(item.status)" [value]="item.status" />
```

### No Explicit `any` in TypeScript

NEVER use `any` type in TypeScript files. Use proper types, generics, or `unknown` with type guards.
