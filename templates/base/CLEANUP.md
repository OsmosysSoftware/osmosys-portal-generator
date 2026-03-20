# Post-Generation Cleanup

This file contains instructions for AI assistants to help customize this freshly generated project.
Feed this file as a prompt to Claude Code or paste it into your AI assistant.

## Tasks

1. **Branding**: Replace the `pi pi-box` icon in the topbar (`src/app/layout/component/app.topbar.ts`) with the project's logo (SVG or image)
2. **Favicon**: Replace `public/favicon.ico` with the project's favicon
3. **Auth configuration**: Update the auth service (`src/app/core/services/auth.service.ts`) with actual API endpoints and auth flow
4. **Profile page**: Update the placeholder profile page (`src/app/features/profile/`) with real user data from the API
5. **Login page**: Remove demo credentials from the login page if present (`src/app/pages/auth/login/`)
6. **Environment**: Verify the API URL in `src/environments/environment.ts` and `environment.production.ts`
7. **Footer**: Update copyright text in the footer component
8. **CLAUDE.md**: Update with project-specific context, architecture decisions, and team conventions

After completing these tasks, delete this CLEANUP.md file.
