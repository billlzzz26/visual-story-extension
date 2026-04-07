# bl1nk-visual-mcp Monorepo

## Overview

A pnpm monorepo containing:
- **`packages/craft-blog-cms`** — Next.js 15 Bookshelf app (main UI, served on port 5000)
- **`packages/bl1nk`** — Core MCP server (Node.js, Visual Story Planner tools)
- **`packages/github-sync`** — GitHub ↔ Notion sync integration
- **`packages/tauri-app`** — Desktop Tauri app (Vite + React)

## Running the App

The active workflow starts `packages/craft-blog-cms` on port 5000:
```bash
cd packages/craft-blog-cms && pnpm run dev
```

## Bookshelf App (`packages/craft-blog-cms`)

A reading tracker that syncs with **Craft** (the note-taking app) via OAuth.

### Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS v4
- shadcn/ui components (manually integrated: Badge, Button, Card)
- Craft REST API client (`src/lib/craft-api/`)

### Architecture
- **`src/app/page.tsx`** — Main page config (book collection schema, layout)
- **`src/lib/craft-api/`** — Craft integration layer (client, auth, hooks, layouts)
  - `client.ts` — Typed REST client
  - `mock-client.ts` — Local mock with 12 real book entries
  - `layouts/BookShelfLayout.tsx` — Book cards with cover, status badge, star rating
  - `layouts/PageBuilderLayout.tsx` — Document block renderer
  - `data-sources/collections.ts` — Craft Collections data fetcher
  - `templates/LayoutRenderer.tsx` — Routes `cards`/`gallery` → BookShelfLayout
- **`src/components/ui/`** — shadcn-style Badge, Button, Card components
- **`src/lib/utils.ts`** — `cn()` helper (clsx + tailwind-merge)

### Data Flow
1. `CraftApp` → checks auth status, picks mock or real client
2. `GenericTemplate` → resolves resources, fetches data
3. `LayoutRenderer` → routes to `BookShelfLayout` for "cards" layout
4. `BookShelfLayout` → renders book grid with filters and stats

### Craft Connection
- OAuth via `/api/auth/craft-api/` routes
- Mock mode: shows 12 demo books with real covers from OpenLibrary
- Connected mode: loads books from a "Books" Collection in the user's Craft space

### Environment Variables
- No env vars required for mock mode
- For real Craft connection: configured via OAuth (user-initiated)

## MCP Server (`packages/bl1nk`)

Visual Story Planner MCP tools. Deployed as Vercel function at `api/mcp.ts`.
- `EXA_API_KEY` — required for `exa_search_story` tool
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` — Upstash Redis for rate limiting

## Package Manager

Uses **pnpm** with workspace (`pnpm-workspace.yaml`).
```bash
pnpm install          # install all workspace deps
pnpm -r run build     # build all packages
```
