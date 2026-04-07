# bl1nk-visual-mcp Monorepo

## Overview

A pnpm monorepo containing four packages:
- **`packages/ai-ide`** — Obsidian-style markdown editor + task tracker (active, port 5000)
- **`packages/bookshelf`** — Next.js 15 Bookshelf / Reading Tracker (Craft-connected, port 3000)
- **`packages/bl1nk`** — Core MCP server (Visual Story Planner tools)
- **`packages/tauri-app`** — Desktop Tauri app (Vite + React)
- **`packages/github-sync`** — GitHub ↔ Notion sync integration

## Active Workflow

**"Start application"** → `packages/ai-ide` on port 5000 (webview)
**"Bookshelf"** → `packages/bookshelf` on port 3000 (console, start manually)

---

## AI IDE (`packages/ai-ide`)

A lightweight, local-first Obsidian-style editor. Tauri-ready for desktop.

### Stack
- Vite 5 + React 18 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- `marked` for markdown rendering (lightweight, no heavy deps)
- `@tauri-apps/api` for Tauri desktop compatibility
- `lucide-react` for icons

### Design System
- **Theme:** Dark teal metallic (`#050d0d` base, `#00bcd4` accent)
- **Effect:** iOS-style `backdrop-blur` + semi-transparent glass surfaces
- **Typography:** Monospace editor (`JetBrains Mono`), `Inter` UI font
- **Colors:** `--teal: #00bcd4`, `--teal-bright: #00e5ff`, `--text-primary: #cce8e8`

### Architecture
```
src/
├── App.tsx              # Root app, state management
├── index.css            # Dark teal theme + prose styles
├── store/notes.ts       # Note/Task types, localStorage, demo data
├── lib/utils.ts         # cn() helper
└── components/
    ├── Sidebar.tsx       # Icon nav + file tree + search
    ├── Editor.tsx        # Markdown textarea + split/edit/preview modes
    ├── MarkdownPreview.tsx # marked.js rendered HTML with prose-teal styles
    ├── TaskTracker.tsx   # Progress bar, filter tabs, priority tasks
    └── CanvasView.tsx    # HTML5 canvas drawing (pen, line, rect, circle)
```

### Features
- **Split-pane editor:** Raw markdown left, rendered preview right
- **Three modes:** Edit / Split / Preview per-note
- **Task tracking:** Extracts `- [ ]`/`- [x]` from all notes + standalone tasks with priority
- **Canvas:** Drawing board with pen, line, rect, circle tools + color picker
- **File sidebar:** Collapsible vault tree, search across all notes
- **Persistence:** localStorage for notes + tasks; restores on reload
- **4 demo notes:** Welcome, Tasks, Ideas, Daily Log

### Running
```bash
cd packages/ai-ide && pnpm run dev   # port 5000
```

### Tauri (Desktop)
```bash
cd packages/ai-ide && pnpm run tauri:dev   # opens native window
```

---

## Bookshelf (`packages/bookshelf`)

A reading tracker connected to the Craft note-taking app via OAuth.

### Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS v4
- shadcn/ui components (Badge, Button, Card — manually integrated)
- Craft REST API client

### Key Files
- `src/app/page.tsx` — Book collection config
- `src/lib/craft-api/layouts/BookShelfLayout.tsx` — Book card grid UI
- `src/lib/craft-api/mock-client.ts` — 12 demo books with OpenLibrary covers
- `src/lib/craft-api/data-sources/collections.ts` — Craft Collections fetcher

### Running
```bash
cd packages/bookshelf && pnpm run dev   # port 3000
```

---

## Package Manager
pnpm workspace — `pnpm-workspace.yaml` covers `packages/*`
```bash
pnpm install           # install all workspace deps
pnpm -r run build      # build all packages
```
