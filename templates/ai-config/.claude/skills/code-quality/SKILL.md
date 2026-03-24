---
name: code-quality
description: Run lint, format, build checks, and Osmosys UI compliance audit. Use when asked to check code quality or verify the build passes.
---

# Code Quality Check

## Step 1: Lint & Build

```bash
npm run lint          # ESLint with --max-warnings=0
ng build              # Angular production build
```

If lint fails, auto-fix:
```bash
npm run lint-fix-format   # Combined: format + lint:fix + format
```

## Step 2: Osmosys UI Compliance Audit

After lint and build pass, audit all `.html` template files under `src/app/features/` for Osmosys UI standard violations.

### Checks to perform

Use `Grep` and `Read` to scan templates and their companion `.ts` files. Report violations grouped by file.

#### Forms & Submission
- [ ] Every `<form>` has `(ngSubmit)="..."` — Enter-key submission
- [ ] Submit `p-button` has `type="submit"` — PrimeNG defaults to `type="button"`
- [ ] No `(onClick)="save()"` on submit buttons when `(ngSubmit)` handles it — double submission
- [ ] `ngModel` controls inside `<form>` have a `name` attribute
- [ ] No `FormsModule` + `[ngModel]` for multi-field forms — must use Reactive Forms
- [ ] No manual `isFormValid()` methods — use `form.invalid` instead

#### Form UX
- [ ] Save/Cancel buttons are in a `justify-end` container (bottom-right alignment)
- [ ] Submit buttons have `[loading]` binding — prevents double-click
- [ ] Submit buttons have `[disabled]` with both `form.invalid` and `form.pristine`
- [ ] Mandatory fields have `*` indicator next to label
- [ ] Text inputs have `maxlength` attribute (text: 50, email: 256, phone: 15, textarea: 1000)
- [ ] Form resets on dialog close / successful submit

#### Data Tables
- [ ] Actions column does NOT have `pSortableColumn` — sorting disabled on actions
- [ ] Empty state uses `#emptymessage` template with "No ... found" text
- [ ] No raw database IDs (like `item.id`, `item.application_id`) displayed as visible table columns
- [ ] Table has `[stateStorage]` and `[stateKey]` for session persistence
- [ ] Numeric/monetary columns are right-aligned (`text-right` class)

#### Template Safety
- [ ] No `$any()` usage in any template
- [ ] No `*ngIf` / `*ngFor` — must use `@if` / `@for`
- [ ] Severity/status badges use typed maps, not inline ternaries

### Output format

For each violation found, report:
```
VIOLATION: [category] description
  File: path/to/file.html:line
  Fix: what to change
```

If all checks pass: `✔ UI compliance audit passed — no violations found`

## Rules

- **Zero warnings policy**: `--max-warnings=0`
- **No `any` types**: `@typescript-eslint/no-explicit-any: error`
- Always fix issues before committing — never skip pre-commit hooks
