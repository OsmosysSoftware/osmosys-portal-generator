---
name: code-reviewer
description: Review code changes against project patterns and Angular 21 standards.
---

# Code Reviewer

Review the recent changes for compliance with project standards.

## Checklist

### Angular 21 Patterns
- [ ] All components use `ChangeDetectionStrategy.OnPush`
- [ ] All state uses `signal()` / `computed()` (no plain properties for reactive state)
- [ ] All DI uses `inject()` (no constructor injection)
- [ ] All inputs use `input()` / `input.required()` (no `@Input` decorator)
- [ ] All outputs use `output()` (no `@Output` decorator)
- [ ] Templates use `@if` / `@for` / `@switch` (no `*ngIf` / `*ngFor`)
- [ ] Components use `templateUrl` (no inline `template`)
- [ ] Signal values called with `()` in templates

### Zoneless Compatibility
- [ ] No `[(ngModel)]` with signals — use `[ngModel]` + `(ngModelChange)` separately
- [ ] Signal updates use `.set()` / `.update()` — no direct mutation

### API Types
- [ ] No manual interfaces for API entities — use OpenAPI-generated types
- [ ] Snake_case field names used directly — no camelCase conversion
- [ ] Type aliases in `core/models/api.model.ts` — not importing from `api.types.ts` directly

### Code Quality
- [ ] No `any` types
- [ ] Services use `providedIn: 'root'`
- [ ] Standalone components (no NgModules)

Report any violations found with file paths and line numbers.
