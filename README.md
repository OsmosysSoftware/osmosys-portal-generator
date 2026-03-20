# Osmosys Angular Portal Generator

Scaffold production-ready Angular portal projects with Osmosys coding standards, AI tooling, and best practices baked in.

## What You Get

A complete Angular 21 project built on [sakai-ng](https://github.com/primefaces/sakai-ng) with:

### Stack
- **Angular 21** — zoneless change detection, signals, standalone components
- **PrimeNG v21** — UI component library with Aura theme
- **Tailwind CSS v4** — utility-first styling with tailwindcss-primeui integration
- **TypeScript** — strict mode, no explicit `any`
- **ESLint 9** — flat config with Osmosys rules (zero warnings policy)
- **Prettier** — consistent formatting with husky pre-commit hooks

### Architecture (Baked In)
- **Zoneless** — `provideZonelessChangeDetection()`, no Zone.js
- **OnPush** — `ChangeDetectionStrategy.OnPush` on all components
- **Signals** — `signal()`, `computed()`, `input()`, `output()`
- **inject()** — no constructor injection
- **Modern control flow** — `@if`, `@for`, `@switch`
- **Separate templates** — `templateUrl` + `styleUrl`
- **Core/Features/Shared/Layout/Pages** folder structure

### Auth Layer (optional, `--auth`)
- JWT login with refresh tokens (signals-based)
- Auth interceptor with 401 retry
- Error interceptor with PrimeNG toast
- Functional route guards (bypassed by default for dev)
- Login, register, error, access denied pages
- Demo credentials on login page

### DevOps
- Dockerfile (multi-stage: node → nginx)
- docker-compose.yml with port mapping
- nginx.conf for SPA routing

### AI Tooling
- **CLAUDE.md** — comprehensive project instructions for Claude Code
- **.vscode/mcp.json** — MCP servers (Angular CLI, PrimeNG, Context7)
- **Claude Code skills:**
  - `/crud-page` — generate CRUD feature pages
  - `/code-quality` — lint, format, build checks
  - `/commit` — conventional commit helper
  - `/generate-api-types` — OpenAPI type regeneration
  - `/new-shared-component` — scaffold reusable shared components
  - `/i18n` — internationalization setup and translation workflow
- **Code reviewer subagent** — reviews code against Angular 21 patterns
- **OpenAPI type generation** — `npm run generate:api` to sync types from backend

## Usage

### Interactive Mode

```bash
npx @osmosys/portal-generator
```

Prompts for: project name, prefix, description, port, API URL, auth.

### CLI Flags

```bash
npx @osmosys/portal-generator \
  --name acme-portal \
  --prefix acme \
  --description "Acme admin portal" \
  --port 4201 \
  --api-url http://localhost:4000 \
  --no-auth
```

### All Options

| Flag | Default | Description |
|------|---------|-------------|
| `--name` | (required) | Project name (kebab-case) |
| `--display-name` | derived | Display name |
| `--prefix` | `app` | Angular component prefix |
| `--description` | `"Angular portal"` | Project description |
| `--port` | `4200` | Dev server port |
| `--api-url` | `http://localhost:3000` | Backend API URL |
| `--no-auth` | auth ON | Skip auth layer |
| `--output` | `./<name>` | Output directory |

## Generated Project Structure

```
<project-name>/
├── .claude/skills/          # Claude Code CRUD generator, code-quality, etc.
├── CLAUDE.md                # AI instructions
├── CLEANUP.md               # Post-generation cleanup guide
├── angular.json             # Angular CLI config
├── eslint.config.js         # ESLint 9 flat config
├── Dockerfile               # Multi-stage build
├── docker-compose.yml       # Container config
├── nginx.conf               # SPA routing
└── src/app/
    ├── core/                # Services, guards, interceptors, models
    ├── features/
    │   ├── dashboard/       # Starter dashboard page
    │   ├── profile/         # Profile page with change password
    │   └── users/           # Users CRUD with p-table (demo data)
    ├── layout/              # Sakai-ng layout (topbar, sidebar, menu, footer)
    ├── pages/auth/          # Login, register, error, access
    ├── pages/notfound/      # 404 page
    └── shared/              # Reusable components, directives, pipes
```

## After Generating

```bash
cd <project-name>
npm start                    # Dev server
npm run build:prod           # Production build
npm run lint                 # ESLint check
npm run generate:api         # Regenerate API types from backend
```

### Adding Features

Use the CRUD page skill in Claude Code:
```
/crud-page users
```

Or scaffold manually:
```bash
ng generate component features/users/pages/users-list --flat
ng generate service features/users/services/users
```

### Wiring Up Auth

1. Configure your backend auth endpoints in `environment.ts`
2. Set `BYPASS_AUTH = false` in `src/app/core/guards/auth.guard.ts`
3. Update `core/constants/roles.ts` to match your role system
4. Remove demo credentials from `pages/auth/login/login.html`

## Built With

This generator creates projects based on [sakai-ng](https://github.com/primefaces/sakai-ng), the free Angular admin template by PrimeNG. It uses Angular CLI under the hood and overlays sakai-ng's layout, components, and styles on top of the generated project.

- [sakai-ng](https://github.com/primefaces/sakai-ng) — PrimeNG admin template (layout, SCSS, components)
- [Angular CLI](https://angular.dev/cli) — base project scaffolding
- [PrimeNG](https://primeng.org) — UI components
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS
- [openapi-typescript](https://github.com/drwpow/openapi-typescript) — API type generation

## License

MIT — see [LICENSE](LICENSE) for details.

sakai-ng is licensed under the [MIT License](https://github.com/primefaces/sakai-ng/blob/main/LICENSE).
