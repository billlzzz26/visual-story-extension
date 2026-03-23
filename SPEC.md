# SPEC.md — Visual Story Planner MCP UI

## 1. Purpose

Display layer สำหรับ `bl1nk-visual-mcp` — รับ **StoryGraph JSON** ที่ได้จาก MCP tools
แล้วแสดงผลเป็น interactive dashboard ใน MCP clients (Claude Desktop, Cursor, VS Code)

ไม่มี backend logic ของตัวเอง — เป็น **pure display + action relay** เท่านั้น

---

## 2. Architecture

```
bl1nk-visual-mcp (Node.js MCP Server)
  └── tools: analyze_story, export_mermaid, validate_story_structure, ...
       │
       │  StoryGraph JSON / Mermaid string / HTML
       ▼
vsp-ui (Next.js App)                          ← repo นี้
  ├── DataProvider  ← รับ StoryGraph state
  ├── ActionProvider ← relay actions → MCP tools
  ├── Catalog       ← component vocab (guardrailed)
  └── Renderer      ← json-render tree → React components
       │
       ▼
  mcp-ui://dashboard/<title>                  ← served ใน MCP client iframe
```

---

## 3. Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js App Router | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Render engine | `@json-render/core` + `@json-render/react` | workspace:\* |
| Charts | Recharts | ^2.15 |
| Diagrams | Mermaid.js | ^11.x |
| UI Primitives | radix-ui | ^1.4 |
| Icons | lucide-react | ^0.56 |
| Validation | Zod | ^4.x |
| Package manager | pnpm (workspace) | 9.x |

Base template: `examples/dashboard` จาก `vercel-labs/json-render`

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

`src/types.ts` ใน `bl1nk-visual-mcp` เป็น source of truth

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

```
examples/vsp-ui/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      ← Main dashboard (Providers + DashboardContent)
│   └── api/
│       └── generate/
│           └── route.ts              ← Phase 2: AI generation endpoint
├── components/
│   ├── registry/
│   │   └── index.tsx                 ← defineRegistry() รวม all components
│   ├── story/
│   │   ├── StatCard.tsx
│   │   ├── ActDistributionChart.tsx
│   │   ├── StoryTimeline.tsx
│   │   ├── CharacterCard.tsx
│   │   ├── ConflictCard.tsx
│   │   ├── MermaidViewer.tsx
│   │   ├── HealthCheck.tsx
│   │   ├── ValidationPanel.tsx
│   │   └── ToolCard.tsx
│   └── ui/                           ← shadcn/radix primitives
│       ├── badge.tsx
│       ├── card.tsx
│       ├── button.tsx
│       └── collapsible.tsx
├── lib/
│   ├── catalog.ts                    ← defineCatalog() StoryGraph catalog
│   ├── mock-data.ts                  ← Hero's Journey demo data
│   └── mcp-tools.ts                  ← Tool list + metadata
├── types/
│   └── story.ts                      ← Mirror types จาก bl1nk-visual-mcp
├── .env.example
├── next.config.ts
├── package.json
└── tailwind.config.ts
```

---

## 8. Mock Data (Phase 1)

ใช้ Hero's Journey sample จาก `tests/test-render.mjs` ใน `bl1nk-visual-mcp`:
- 3 characters (Luke / Vader / Obi-Wan)
- 5 events (inciting / rising / midpoint / climax / resolution)
- 2 conflicts (external / internal)
- Validation: `isValid: true`, 0 errors
- Mermaid: output จาก `toMermaid()` ของโปรเจ็ค

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

## 11. Success Criteria (Phase 1)

- [ ] `pnpm --filter vsp-ui dev` รันได้บน port 3001
- [ ] แสดง mock StoryGraph ครบทุก section
- [ ] Mermaid diagram render ถูกต้อง
- [ ] Responsive layout (mobile → desktop)
- [ ] ไม่มี TypeScript error
- [ ] ไม่มี layout shift หรือ hydration error