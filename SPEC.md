---
title: SPEC - bl1nk-visual-mcp UI Layer
description: Specification for the UI layer of bl1nk-visual-mcp monorepo
status: active
last_updated: 2026-05-02
owner: dev-team
---

# SPEC.md — bl1nk-visual-mcp UI Layer

## 1. Purpose

UI layer สำหรับ `bl1nk-visual-mcp` monorepo — รวมถึง:

- **bl1nk-desktop**: Desktop application (Tauri + React) สำหรับ story analysis และ visualization
- **bl1nk-ide**: Web IDE (Next.js + React) สำหรับ story writing และ interactive dashboards
- **MCP UI Components**: Shared UI components สำหรับ MCP client integrations

รับ **StoryGraph JSON** ที่ได้จาก MCP tools แล้วแสดงผลเป็น interactive dashboards และ editing interfaces

---

## 2. Architecture

```
bl1nk-visual-mcp Monorepo
├── bl1nk-core/ (Node.js MCP Server)
│   └── tools: analyze_story, export_mermaid, validate_story_structure, ...
│        │
│        │  StoryGraph JSON / Mermaid string / HTML / Canvas JSON
│        ▼
├── bl1nk-desktop/ (Tauri Desktop App)
│   ├── React Frontend (TypeScript + Tailwind)
│   ├── Tauri Backend (Rust)
│   ├── StoryGraph Viewer & Editor
│   └── MCP Client Integration
│
├── bl1nk-ide/ (Next.js Web IDE)
│   ├── App Router (React 19 + TypeScript)
│   ├── Interactive Dashboards
│   ├── Story Writing Interface
│   ├── MCP Tools Integration
│   └── Real-time Analysis
│
└── Shared UI Components
    ├── StoryGraph Visualizers
    ├── MCP Tool Interfaces
    └── Design System (Tailwind + shadcn/ui)
```

---

## 3. Tech Stack

### bl1nk-core (MCP Server)
| Layer | Tech | Version |
|-------|------|---------|
| Runtime | Node.js | >=22 |
| Language | TypeScript | 5.6.x |
| Framework | MCP SDK | 1.27.x |
| Build Tool | esbuild | 0.28.x |
| Testing | Vitest | 4.1.x |
| Linting | Biome | 1.9.x |
| Package manager | pnpm | 9.x |

### bl1nk-desktop (Desktop App)
| Layer | Tech | Version |
|-------|------|---------|
| Frontend | React | 18.3.x |
| Language | TypeScript | 5.6.x |
| Desktop | Tauri | 2.0.x |
| Styling | Tailwind CSS | 3.4.x |
| UI Primitives | radix-ui | 1.4.x |
| Icons | lucide-react | 0.400.x |
| Testing | Playwright + Vitest | 1.48.x + 2.1.x |
| Build | Vite | 8.0.x |

### bl1nk-ide (Web IDE)
| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js App Router | 15.0.x |
| Frontend | React | 19.2.x |
| Language | TypeScript | 5.5.x |
| Styling | Tailwind CSS | 4.0.x |
| UI Primitives | shadcn/ui | workspace |
| Charts | Chart.js | 4.x |
| Testing | Vitest | 4.1.x |
| Build | Vite | 6.4.x |

### Shared Infrastructure
- **Monorepo**: pnpm workspaces
- **Linting**: Biome (root level)
- **Formatting**: Biome (root level)
- **Type Checking**: TypeScript (per package)
- **Testing**: Vitest (per package)

---

## 4. Data Contract

### 4.1 Input — StoryGraph (จาก MCP tools)

```ts
interface StoryGraph {
  meta: { title: string; version: string; genre?: string; createdAt: string; updatedAt: string }
  characters: Character[]
  conflicts: Conflict[]
  events: EventNode[]
  relationships: Relationship[]
  tags: string[]
}
```

`packages/bl1nk-core/src/types.ts` เป็น source of truth

### 4.2 Input — Validation Result (จาก `validate_story_structure`)

```ts
interface ValidationResult {
  isValid: boolean
  issues: Array<{ severity: "error"|"warning"|"info"; code: string; message: string; suggestion?: string }>
  analysis: {
    actBalance: { act1: number; act2: number; act3: number; balance: number }
    characterCount: number; conflictCount: number; eventCount: number
    hasMidpoint: boolean; hasClimax: boolean; pacing: string
  }
  recommendations: string[]
}
```

### 4.3 Input — Mermaid String (จาก `export_mermaid`)

Plain string — ส่งตรงให้ `MermaidViewer` component

### 4.4 DataProvider Shape (internal)

```ts
interface DashboardData {
  meta: StoryGraph["meta"]
  stats: { characterCount: number; eventCount: number; conflictCount: number; pacing: string }
  actBalance: { act1: number; act2: number; act3: number; balance: number }
  health: { hasMidpoint: boolean; hasClimax: boolean; balanceScore: number }
  characters: Character[]
  events: EventNode[]
  conflicts: Conflict[]
  validation: { isValid: boolean; issues: ValidationResult["issues"]; recommendations: string[] }
  mermaid: string
  tools: Array<{ name: string; description: string; inputCount: number }>
}
```

---

## 5. Component Catalog

components ทั้งหมดนิยามผ่าน `defineCatalog()` — AI/Renderer ใช้ได้เฉพาะ list นี้

### 5.1 Display Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `StatCard` | `label`, `value`, `color?`, `valuePath?` | Metric card (characters / events / conflicts / pacing) |
| `ActDistributionChart` | `act1`, `act2`, `act3` หรือ `dataPath` | Recharts bar chart |
| `StoryTimeline` | `events[]` หรือ `dataPath` | Events เรียง act + importance badge |
| `CharacterCard` | `name`, `role`, `traits[]`, `arcStart?`, `arcEnd?` | Character profile |
| `ConflictCard` | `description`, `type`, `actIntroduced`, `escalationCount?` | Conflict info |
| `MermaidViewer` | `diagram` หรือ `dataPath`, `title?` | Render mermaid string |
| `HealthCheck` | `hasMidpoint`, `hasClimax`, `balanceScore` | Structure health badges |
| `ValidationPanel` | `issues[]`, `recommendations[]` | Error/Warning list |
| `ToolCard` | `name`, `description`, `inputCount?` | MCP tool info |

### 5.2 Layout Components (reuse จาก dashboard)

| Component | Purpose |
|-----------|---------|
| `Section` | Labeled container พร้อม heading |
| `Grid` | Responsive grid layout |
| `Badge` | Inline label (role / importance / severity) |

### 5.3 Actions

| Action ID | เรียก MCP tool | Params |
|-----------|---------------|--------|
| `run_analyze` | `analyze_story` | `{ text: string }` |
| `run_validate` | `validate_story_structure` | `{ graph: StoryGraph }` |
| `run_export_mermaid` | `export_mermaid` | `{ graph: StoryGraph }` |
| `run_export_canvas` | `export_canvas` | `{ graph: StoryGraph }` |
| `run_export_dashboard` | `export_dashboard` | `{ graph: StoryGraph }` |

---

## 6. Page Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: title  •  genre badge  •  version  •  tags  │
├──────────┬──────────┬──────────┬────────────────────┤
│ StatCard │ StatCard │ StatCard │      StatCard       │
│ chars    │ events   │conflicts │ pacing              │
├──────────┴──────────┴──────────┼────────────────────┤
│                                │  HealthCheck        │
│  ActDistributionChart          │  (midpoint/climax)  │
│  (col-span-2)                  ├────────────────────┤
│                                │  ValidationPanel    │
├────────────────────────────────┘                    │
│  StoryTimeline (full width)                         │
├─────────────────────────┬───────────────────────────┤
│  Characters (grid)       │  Conflicts (grid)         │
│  CharacterCard ×n        │  ConflictCard ×n          │
├─────────────────────────┴───────────────────────────┤
│  MermaidViewer (full width, collapsible)             │
├─────────────────────────────────────────────────────┤
│  Tools (grid 3-col)                                  │
│  ToolCard ×9                                         │
└─────────────────────────────────────────────────────┘
```

---

## 7. File Structure

### bl1nk-core (MCP Server)
```
packages/bl1nk-core/
├── src/
│   ├── index.ts                      ← MCP server entry point
│   ├── tools/                        ← MCP tool implementations
│   │   ├── index.ts                  ← Tool registry
│   │   ├── execute.ts                ← Tool executors
│   │   └── search-entries.ts         ← Search tool
│   ├── exporters/                    ← Export formatters
│   │   ├── canvas.ts                 ← Canvas JSON export
│   │   ├── dashboard.ts              ← HTML dashboard export
│   │   ├── markdown.ts               ← Markdown export
│   │   └── mermaid.ts                ← Mermaid diagram export
│   ├── analyzer.ts                   ← Story text → StoryGraph
│   ├── validators.ts                 ← Story validation logic
│   ├── types.ts                      ← TypeScript interfaces
│   └── edge-cases.test.ts            ← Test utilities
├── tests/                            ← Integration tests
├── package.json
└── tsconfig.json
```

### bl1nk-desktop (Tauri Desktop App)
```
packages/bl1nk-desktop/
├── src/
│   ├── main.tsx                      ← App entry point
│   ├── App.tsx                       ← Main app component
│   ├── components/                   ← UI components
│   │   ├── ui/                       ← shadcn/ui primitives
│   │   └── story/                    ← Story-specific components
│   ├── lib/                          ← Utilities
│   └── test/                         ← Test utilities
├── src-tauri/                        ← Tauri Rust backend
│   ├── src/main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── tests/                            ← E2E tests (Playwright)
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── playwright.config.ts
```

### bl1nk-ide (Next.js Web IDE)
```
packages/bl1nk-ide/
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    ← Root layout
│   ├── page.tsx                      ← Home page
│   ├── dashboard/                    ← Dashboard pages
│   └── editor/                       ← Story editor
├── components/                       ← React components
│   ├── ui/                           ← UI primitives
│   └── story/                        ← Story visualization
├── lib/                              ← Utilities & helpers
├── types/                            ← Type definitions
├── public/                           ← Static assets
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### Root Configuration
```
├── vitest.config.ts                  ← Shared test config
├── biome.json                        ← Linting & formatting
├── .markdownlint.json               ← Markdown linting
├── tsconfig.json                     ← Root TypeScript config
└── package.json                      ← Workspace dependencies
```

---

## 8. Mock Data

ใช้ Hero's Journey sample จาก `packages/bl1nk-core/tests/`:
- 3 characters (Aria / Shadow King / Mentor)
- 13 events กระจายใน 3 acts
- 2 conflicts (external / internal)
- Validation: structural analysis ด้วย 3-act framework
- Mermaid/Canvas/Dashboard: outputs จาก MCP tools

**Source**: `packages/bl1nk-core/src/analyzer.ts` และ test files

---

## 9. Importance / Role Color Map

| Value | Color (Tailwind) |
|-------|-----------------|
| `inciting` | purple / `bg-purple-100 text-purple-700` |
| `midpoint` | yellow / `bg-yellow-100 text-yellow-700` |
| `climax` | red / `bg-red-100 text-red-700` |
| `resolution` | green / `bg-green-100 text-green-700` |
| `rising` | gray / `bg-slate-100 text-slate-600` |
| `protagonist` | indigo / `bg-indigo-100 text-indigo-700` |
| `antagonist` | rose / `bg-rose-100 text-rose-700` |
| `mentor` | amber / `bg-amber-100 text-amber-700` |
| `supporting` | slate / `bg-slate-100 text-slate-600` |
| `external` conflict | orange / `bg-orange-100 text-orange-700` |
| `internal` conflict | violet / `bg-violet-100 text-violet-700` |
| `error` issue | red |
| `warning` issue | amber |

---

## 10. Out of Scope (Phase 1)

- ❌ AI generation (`useUIStream` + `/api/generate`)
- ❌ Drag-and-drop (มีใน dashboard example แต่ไม่ต้องการ)
- ❌ Database / persistence
- ❌ Live connection กับ MCP server
- ❌ Form inputs (DatePicker / Select / TextField)
- ❌ Auth

---

## 11. Success Criteria

### bl1nk-core (MCP Server)
- [x] `pnpm --filter bl1nk-core run dev` รัน MCP server ได้
- [x] 16 MCP tools ทำงานครบถ้วน
- [x] TypeScript compilation ผ่าน
- [x] Tests ผ่านทั้งหมด

### bl1nk-desktop (Desktop App)
- [ ] `pnpm --filter bl1nk-desktop run tauri:dev` รันได้
- [ ] แสดง StoryGraph visualization
- [ ] MCP client integration ทำงาน
- [ ] Desktop packaging สำเร็จ

### bl1nk-ide (Web IDE)
- [ ] `pnpm --filter bl1nk-ide run dev` รันได้บน port 5000
- [ ] Interactive dashboard แสดงผลถูกต้อง
- [ ] Story editor ทำงาน
- [ ] Responsive design (mobile → desktop)
- [ ] ไม่มี hydration errors

---

## Implementation Notes

### bl1nk-desktop (Tauri App)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Tauri 2.0 (Rust) for desktop integration
- **Features**: Story editor, graph visualization, timeline view
- **Testing**: Playwright for E2E, Vitest for unit tests
- **Build**: Vite for frontend bundling

### bl1nk-ide (Web IDE)
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **Features**: Web-based story writing and analysis
- **Deployment**: Ready for Vercel/Netlify

### Shared Components
- **UI Library**: shadcn/ui components
- **Charts**: Chart.js for data visualization
- **Icons**: Lucide React
- **Theming**: Tailwind CSS with custom design tokens