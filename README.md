# AutoReels

Mono repo for the AutoReels project.

## Stack
- Turbo + pnpm workspaces
- Apps: `apps/web` (Next.js), `apps/api` (Express)

## Getting Started
1. Install deps: `pnpm install`
2. Dev servers: `pnpm dev` (runs turbo pipelines)
3. Build: `pnpm build`
4. Lint: `pnpm lint`

## Notes
- `node_modules` and build outputs are ignored; reinstall locally after cloning.
- If you hit GitHub size limits, ensure large artifacts are not committed.
