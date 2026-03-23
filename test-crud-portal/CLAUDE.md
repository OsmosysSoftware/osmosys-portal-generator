# CLAUDE.md - Test Crud Portal

## CRITICAL INSTRUCTIONS - MUST FOLLOW

### 1. ALWAYS Use MCP Servers for Latest Documentation

- **Use PrimeNG MCP** (`@primeng/mcp`) for PrimeNG v21 component docs — props, events, templates, methods, theming, and pass through styling
- **Use Angular CLI MCP** (`@angular/cli mcp`) for Angular CLI commands and best practices
- **Use Context7** to fetch the latest documentation for Angular, Tailwind CSS, and other libraries
- **Never rely on outdated knowledge** — always fetch current docs before implementing

### 2. ALWAYS Update CLAUDE.md

- **After every architectural decision** — document the pattern
- **After adding new features** — update project structure
- **After discovering new patterns** — add to best practices
- **Keep as single source of truth** for this repository

---

## Project Overview

Test Crud Portal is an Angular 21 application. Angular portal.

## Development Commands

```bash
npm start              # Dev server at localhost:4200
npm run build:prod     # Production build
npm test               # Unit tests (Karma/Jasmine)
npm run lint           # ESLint (--max-warnings=0)
npm run lint:fix       # Auto-fix
npm run lint-fix-format # Combined: format + lint + format
npm run generate:api   # Regenerate TypeScript types from backend OpenAPI spec
```

`npm run generate:api` runs `openapi-typescript` against `http://localhost:3000/api/docs-json` and outputs to `src/app/core/types/api.types.ts`.

---

## Architecture

### Tech Stack

- **Angular 21** — zoneless change detection (NO Zone.js), signals, standalone components
- **PrimeNG v21** — UI component library (Aura theme)
- **PrimeIcons** — icon library from PrimeNG
- **Tailwind CSS v4** — utility-first CSS with tailwindcss-primeui plugin
- **TypeScript** — strict mode, no explicit any
- **ESLint + Prettier** — code quality and formatting

### Folder Structure

```text
src/app/
├── core/                          # Singleton services, guards, interceptors
│   ├── constants/
│   │   └── roles.ts               # UserRoles enum and labels
│   ├── guards/
│   │   ├── auth.guard.ts          # Functional auth guard
│   │   └── role.guard.ts          # orgAdminGuard, superAdminGuard
│   ├── interceptors/
│   │   ├── auth.interceptor.ts    # JWT injection + 401 refresh
│   │   └── error.interceptor.ts   # Global error toast
│   ├── models/
│   │   ├── api.model.ts           # API type aliases from OpenAPI-generated types (snake_case)
│   │   └── auth.model.ts          # User, LoginDto, JwtPayload, AuthResponse
│   ├── services/
│   │   └── auth.service.ts        # Signal-based auth, token management, role checks
│   └── types/
│       └── api.types.ts           # Auto-generated OpenAPI types (DO NOT EDIT)
├── features/                      # Feature modules (lazy-loaded)
│   └── dashboard/
│       └── pages/dashboard.ts     # Sample dashboard page
├── shared/
│   ├── components/                # Reusable components
│   ├── directives/
│   ├── pipes/
│   └── utils/
├── layout/                        # App shell (Sakai-based)
│   ├── component/
│   │   ├── app.layout.ts          # Main layout wrapper
│   │   ├── app.topbar.ts          # Header with theme toggle, profile
│   │   ├── app.sidebar.ts         # Side navigation
│   │   ├── app.menu.ts            # Menu items
│   │   ├── app.menuitem.ts        # Menu item renderer
│   │   ├── app.footer.ts          # Footer
│   │   └── app.configurator.ts    # Theme configurator
│   └── service/layout.service.ts
├── pages/                         # Non-feature pages
│   ├── auth/
│   │   ├── login/login.ts
│   │   ├── access.ts
│   │   ├── error.ts
│   │   └── auth.routes.ts
│   └── notfound/notfound.ts
├── app.config.ts                  # Application config (providers, interceptors)
├── app.routes.ts                  # Route definitions with guards
└── app.ts                         # Root component
```

### File Naming Convention

- **Components**: `kebab-case.ts` (e.g., `users-list.ts`, `status-badge.ts`)
- **Layout components**: `app.name.ts` (e.g., `app.topbar.ts`, `app.layout.ts`)
- **Services**: `kebab-case.service.ts` (e.g., `auth.service.ts`)
- **Guards**: `kebab-case.guard.ts` (e.g., `role.guard.ts`)
- **Interceptors**: `kebab-case.interceptor.ts` (e.g., `error.interceptor.ts`)
- **Pipes**: `kebab-case.pipe.ts` (e.g., `delivery-status.pipe.ts`)
- **Models**: `kebab-case.model.ts` (e.g., `api.model.ts`)

---

## CRITICAL: Zoneless Architecture

**IMPORTANT**: This application uses Angular's zoneless mode with signals. Always ensure zoneless compatibility.

### Zoneless Requirements (MANDATORY)

1. **NO Zone.js**: This app does NOT use Zone.js for change detection
2. **Signals for State**: ALL component state MUST use signals, not plain properties
3. **Signal Updates**: Use `.set()`, `.update()` — NEVER direct assignment
4. **Two-Way Binding**:
   - NEVER use `[(ngModel)]="signal().property"`
   - ALWAYS use `[ngModel]="signal().property" (ngModelChange)="updateMethod($event)"`
   - Create update methods that call `signal.update()`
5. **Change Detection**: Use `ChangeDetectionStrategy.OnPush` (MANDATORY)
6. **Computed Values**: Use `computed()` for derived state
7. **Async Operations**: Wrap in signal updates to trigger change detection

### Zoneless Pattern Example

```typescript
// CORRECT - Signals with proper updates
readonly settings = signal<Settings>({ value: 0 });

updateValue(newValue: number): void {
  this.settings.update(s => ({ ...s, value: newValue }));
}

// In template:
// [ngModel]="settings().value" (ngModelChange)="updateValue($event)"

// WRONG - Direct property binding
// [(ngModel)]="settings().value"  // Will NOT work in zoneless!
```

---

## Critical Angular 21 Patterns

### Component Structure (REQUIRED)

```typescript
import { Component, signal, computed, input, output, ChangeDetectionStrategy, inject } from '@angular/core';

@Component({
  selector: 'app-example',
  imports: [CommonModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './example.html',
  styleUrl: './example.scss',
})
export class ExampleComponent {
  // ALWAYS use input() function (NOT @Input decorator)
  readonly title = input.required<string>();
  readonly count = input<number>(0);

  // ALWAYS use output() function (NOT @Output decorator)
  readonly valueChange = output<number>();

  // ALWAYS use signals for state
  readonly counter = signal(0);
  readonly items = signal<string[]>([]);

  // Use computed() for derived state
  readonly doubleCount = computed(() => this.counter() * 2);
  readonly hasItems = computed(() => this.items().length > 0);

  // Use inject() for DI (NO constructor injection)
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  increment(): void {
    this.counter.update(c => c + 1);
    this.valueChange.emit(this.counter());
  }
}
```

### Template Syntax (REQUIRED)

```html
<!-- Use @if (NOT *ngIf) -->
@if (isVisible) {
  <p>Content is visible</p>
} @else if (isLoading) {
  <p-progressSpinner />
} @else {
  <p>No content</p>
}

<!-- Use @for (NOT *ngFor) -->
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>No items found</p>
}

<!-- Use @switch (NOT *ngSwitch) -->
@switch (status) {
  @case ('pending') { <span>Pending</span> }
  @case ('approved') { <span>Approved</span> }
  @default { <span>Unknown</span> }
}

<!-- Signal values require () -->
<p>Count: {{ counter() }}</p>
<p>Double: {{ doubleCount() }}</p>
```

### Template Type Safety — No `$any()` (REQUIRED)

NEVER use `$any()` to bypass template type checking. Fix the underlying type instead.

```typescript
// WRONG — $any hides the real type mismatch
// template: [severity]="$any(getStatus(item))"

// CORRECT — typed map with explicit return type
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
<!-- Template stays clean — no $any needed -->
<p-tag [severity]="getSeverity(item.status)" [value]="item.status" />
```

### Service Pattern (REQUIRED)

```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/resource`;

  list(page = 1, limit = 20): Observable<PaginatedResponse<Item>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<PaginatedResponse<Item>>(this.apiUrl, { params });
  }
}
```

---

## CRITICAL: API Type System

### API Type Pattern (MANDATORY)

1. **Generated Types**: Use types from `src/app/core/types/api.types.ts` (auto-generated via `npm run generate:api`)
2. **Type Aliases**: Create clean aliases in `core/models/api.model.ts`
3. **NO Conversion**: API responses use snake_case fields — use them directly in TypeScript and templates
4. **Single Source of Truth**: OpenAPI spec defines ALL types — never create manual interfaces for API entities
5. **NEVER manually edit** `src/app/core/types/api.types.ts` — it's auto-generated

```typescript
// CORRECT - Type alias from generated types
export type Application = components['schemas']['ApplicationResponseDto'];

// CORRECT - Use snake_case in templates
// {{ application().created_on | date }}

// WRONG - Manual interface with camelCase
// export interface Application { applicationId: number; ... }
```

---


## Auth & Role System

### Roles (customize in `core/constants/roles.ts`)

| Role  | Value | Access           |
| ----- | ----- | ---------------- |
| USER  | 0     | Standard access  |
| ADMIN | 1     | Full CRUD access |

### Route Guards

- `authGuard` — requires authentication (bypassed by default, set `BYPASS_AUTH = false` in `auth.guard.ts` to enable)
- `roleGuard(minimumRole)` — factory for role-based guards

### Interceptor Chain

Registered in `app.config.ts` in this order:
1. **authInterceptor** — injects Bearer token, handles 401 with token refresh
2. **errorInterceptor** — shows toast for API errors


---

## PrimeNG Integration

### PrimeNG v21 Key Patterns

- Import paths: `primeng/textarea` (NOT `primeng/inputtextarea`)
- Select component (previously Dropdown): `primeng/select`
- Theming: `@primeuix/themes`
- All components support **pass-through (pt) attributes** for deep DOM customization
- **Always use PrimeNG MCP** (`@primeng/mcp`) to look up component props, events, and templates before implementing

### Common Components

- **Form**: Textarea, InputText, InputNumber, Select, Checkbox, Password
- **Buttons**: Button, SpeedDial, SplitButton
- **Data**: Table, DataView, Tree, Timeline
- **Panels**: Card, Panel, Accordion, Tabs
- **Overlays**: Dialog, ConfirmDialog, Drawer, Toast
- **Menu**: Menubar, Menu, ContextMenu, Breadcrumb

---

## Code Quality Rules

### Angular 21 Modern Patterns — NEVER / ALWAYS

- NEVER use `@Input()` / `@Output()` decorators → use `input()` / `output()` functions
- NEVER use `*ngIf` / `*ngFor` / `*ngSwitch` → use `@if` / `@for` / `@switch`
- NEVER use constructor injection → use `inject()` function
- NEVER mutate signals directly → use `.set()` / `.update()`
- NEVER use `[(ngModel)]` with signals → use `[ngModel]` + `(ngModelChange)` separately
- ALWAYS use `ChangeDetectionStrategy.OnPush`
- ALWAYS use signals for component state
- ALWAYS use `readonly` for signals and computed values
- ALWAYS use standalone components (NO NgModules)
- ALWAYS use separate template files (`templateUrl`, NOT inline `template`)
- NEVER use `$any()` in templates to silence type errors → fix the type in the component instead
- ALWAYS give component methods explicit return types matching what PrimeNG/template expects
- ALWAYS use typed maps (`Record<string, Severity>`) for status-to-UI-property lookups

### API Type System Rules

- NEVER create manual interfaces for API entities (use OpenAPI-generated types)
- NEVER convert API field names (snake_case → camelCase)
- NEVER manually edit `src/app/core/types/api.types.ts`
- ALWAYS use snake_case field names from API directly in code and templates
- ALWAYS create type aliases in model files for clean naming
- ALWAYS regenerate types after backend API changes

---

## Docker

```bash
docker compose up -d --build    # Build and run
docker compose down             # Stop
docker compose logs -f portal   # View logs
```

Container runs on port 4200 (mapped to nginx port 80).

---

## Internationalization (i18n)

This project includes `@angular/localize` for built-in i18n support.

### Marking Text

In templates:
```html
<h1 i18n>Dashboard</h1>
<input i18n-placeholder placeholder="Search..." />
```

In TypeScript:
```typescript
const title = $localize`Settings`;
```

### Translation Workflow

1. Mark text with `i18n` attributes or `$localize`
2. Extract: `npm run i18n:extract` → generates `src/locale/messages.xlf`
3. Copy to `messages.{locale}.xlf` and translate
4. Configure locale in `angular.json`
5. Build: `ng build --localize`

Use the `/i18n` skill for detailed guidance.

---

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
- Format: `type: description` or `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- Imperative present tense, lowercase, no period
- **No** `Co-Authored-By` or AI attribution lines

---

**Remember**: This is Angular 21 with zoneless mode. Always use modern patterns (signals, standalone, new control flow). Never use deprecated patterns (decorators, NgModules, old control flow).

## Angular Best Practices (from Angular CLI)

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
