# ARCHITECTURE.md — bl1nk-visual-mcp

> System architecture and dataflow diagrams
> Last updated: 2026-04-03

---

## Layer Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONSUMERS                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Tauri App  │  │ GitHub Sync  │  │   AI Agents (MCP)    │  │
│  │  (Desktop)   │  │  (Webhook)   │  │  (Claude, Qwen, etc) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MCP SERVER (bl1nk)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   TOOL REGISTRATION                       │   │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐   │   │
│  │  │ GRANULAR_TOOLS  │  │  BL1NK_VISUAL_TOOLS (legacy) │   │   │
│  │  │   (11 tools)    │  │       (4 tools)              │   │   │
│  │  └────────┬────────┘  └──────────────┬───────────────┘   │   │
│  │           │                          │                    │   │
│  │  ┌────────▼──────────────────────────▼───────────────┐   │   │
│  │  │              Schemas (Zod)                         │   │   │
│  │  │  analyze_story, export_mermaid, export_canvas,    │   │   │
│  │  │  export_dashboard, export_markdown,               │   │   │
│  │  │  validate_story_structure, extract_characters,    │   │   │
│  │  │  extract_conflicts, build_relationship_graph,     │   │   │
│  │  │  export_mcp_ui_dashboard, exa_search_story        │   │   │
│  │  └──────────────────────┬───────────────────────────┘   │   │
│  └─────────────────────────┼───────────────────────────────┘   │
│                            │                                   │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │                   EXECUTORS                              │   │
│  │  ┌────────────────────────┐  ┌──────────────────────┐   │   │
│  │  │  executeGranularTool   │  │  executeStoryTool    │   │   │
│  │  │  (11 granular tools)   │  │  (4 legacy tools)    │   │   │
│  │  └───────────┬────────────┘  └──────────┬───────────┘   │   │
│  └──────────────┼──────────────────────────┼───────────────┘   │
│                 │                          │                   │
└─────────────────┼──────────────────────────┼───────────────────┘
                  │                          │
                  ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CORE LOGIC                                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  analyzer.ts │  │ validators.ts│  │   exa-search.ts      │  │
│  │              │  │              │  │                      │  │
│  │ buildInitial │  │ validateGraph│  │ searchStoryRef-      │  │
│  │ Graph(text)  │  │ (graph)      │  │ erences(query)       │  │
│  │ → StoryGraph │  │ → Validation │  │ → SearchResults      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘  │
│         │                 │                                     │
└─────────┼─────────────────┼─────────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPORTERS                                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ mermaid.ts   │  │  canvas.ts   │  │   dashboard.ts       │  │
│  │              │  │              │  │                      │  │
│  │ toMermaid()  │  │ toCanvasJSON │  │ toDashboard()        │  │
│  │ → string     │  │ → object     │  │ → HTML string        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────────┐                     │
│  │ markdown.ts  │  │ mcp-ui-dashboard.ts  │                     │
│  │              │  │                      │                     │
│  │ toMarkdown() │  │ toMcpUiDashboard()   │                     │
│  │ → string     │  │ → HTML string        │                     │
│  └──────────────┘  └──────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Contract

### Input/Output Types per Layer

#### MCP Server Layer

| Tool | Input | Output |
|------|-------|--------|
| `analyze_story` | `{ text: string, depth?: string, includeMetadata?: boolean }` | `StoryGraph` JSON |
| `export_mermaid` | `{ graph: StoryGraph, includeMetadata?: boolean, style?: string }` | Mermaid string |
| `export_canvas` | `{ graph: StoryGraph, includeMetadata?: boolean, autoLayout?: boolean }` | Canvas JSON |
| `export_dashboard` | `{ graph: StoryGraph, includeStats?: boolean, includeRecommendations?: boolean }` | HTML string |
| `export_markdown` | `{ graph: StoryGraph, includeMetadata?: boolean, includeAnalysis?: boolean }` | Markdown string |
| `validate_story_structure` | `{ graph: StoryGraph, strict?: boolean, includeRecommendations?: boolean }` | `ValidationResult` JSON |
| `extract_characters` | `{ graph: StoryGraph, detailed?: boolean }` | Character array |
| `extract_conflicts` | `{ graph: StoryGraph, includeEscalation?: boolean }` | Conflict array |
| `build_relationship_graph` | `{ graph: StoryGraph, includeStats?: boolean }` | Relationship data |
| `export_mcp_ui_dashboard` | `{ graph: StoryGraph, includeStats?: boolean, includeRecommendations?: boolean }` | HTML string |
| `exa_search_story` | `{ query: string, category?: string, numResults?: number }` | Search results |
| `search_entries` | `{ text: string, chapterNumber?: number, extractOptions?: object }` | Markdown files |
| `validate_story` | `{ text: string, strict?: boolean }` | `ValidationResult` JSON |
| `generate_artifacts` | `{ graph: StoryGraph }` | All format files |
| `sync_github` | None | Not implemented |

#### Core Types

```typescript
interface StoryGraph {
  meta: {
    title: string;
    createdAt: string;
    updatedAt: string;
    version: string;
    genre?: string;
  };
  characters: Character[];
  conflicts: Conflict[];
  events: EventNode[];
  relationships: Relationship[];
  tags: string[];
}

interface ValidationResult {
  isValid: boolean;
  issues: Array<{ severity: string; code: string; message: string; suggestion?: string }>;
  analysis: {
    actBalance: { act1: number; act2: number; act3: number; balance: number };
    characterCount: number;
    conflictCount: number;
    eventCount: number;
    hasMidpoint: boolean;
    hasClimax: boolean;
    pacing: 'slow' | 'balanced' | 'fast';
  };
  recommendations: string[];
}
```

---

## Integration Points

### How Packages Consume Output

#### Tauri App (`packages/tauri-app/`)
- **Input**: StoryGraph JSON (from MCP server or file upload)
- **Processing**: Displays interactive UI with story visualization
- **Output**: User interactions, edits
- **Dependencies**: `@bl1nk/visual-mcp` (types, export functions)

#### GitHub Sync (`packages/github-sync/`)
- **Input**: Exported markdown/CSV files pushed to GitHub
- **Trigger**: GitHub webhook events
- **Processing**: Parse files, sync to Notion database
- **Output**: Notion database rows
- **Dependencies**: `@bl1nk/visual-mcp` (if consuming exports directly)

#### AI Agents (via MCP)
- **Input**: Tool calls from agents (Claude, Qwen, Gemini)
- **Processing**: Execute tools, return results
- **Output**: Tool responses (JSON, strings, HTML)
- **Dependencies**: MCP SDK, Zod schemas

---

## Dependency Graph

```
bl1nk-visual-mcp-monorepo (root)
├── @bl1nk/visual-mcp (packages/bl1nk) — v3.0.0
│   ├── Core: analyzer.ts, validators.ts, exa-search.ts
│   ├── Exporters: mermaid, canvas, dashboard, markdown, mcp-ui-dashboard
│   ├── Tools: 11 granular + 4 legacy + 1 standalone
│   └── Dependencies: @modelcontextprotocol/sdk, zod, handlebars, etc.
│
├── tauri-app (packages/tauri-app) — v0.1.0
│   ├── Desktop UI for story visualization
│   ├── React + Vite + Tauri
│   └── SHOULD DEPEND ON: @bl1nk/visual-mcp
│
├── @bl1nk/github-sync (packages/github-sync) — v1.0.0
│   ├── GitHub webhook → Notion sync
│   └── SHOULD DEPEND ON: @bl1nk/visual-mcp
│
└── craft-blog-cms (packages/craft-blog-cms) — v1.0.0
    ├── Next.js blog/CMS (orphaned, needs decision)
    └── NO CURRENT DEPENDENCIES ON @bl1nk/visual-mcp
```

---

## Tool Registration Flow

```
1. Server starts (src/index.ts)
   ↓
2. Create McpServer instance
   ↓
3. Register GRANULAR_TOOLS (11 tools)
   For each tool:
   a. Look up schema in Schemas
   b. Register with server.tool(name, description, schema.shape, executor)
   c. Executor: executeGranularTool(toolName, args)
   ↓
4. Register BL1NK_VISUAL_TOOLS (4 legacy tools)
   For each tool:
   a. Register with empty schema
   b. Executor: executeStoryTool(toolName, args)
   ↓
5. Register searchEntriesTool (standalone)
   a. Uses its own inputSchema
   b. Executor: searchEntriesTool.execute(args)
   ↓
6. Connect to StdioServerTransport
   ↓
7. Server ready — tools available to MCP clients
```

---

## Export Format Invocation Paths

### Path 1: Analyze → Export (Two-step)
```
User calls analyze_story(text)
  → buildInitialGraph(text)
  → StoryGraph JSON
User calls export_mermaid(graph)
  → toMermaid(graph, options)
  → Mermaid string
```

### Path 2: Generate All Artifacts (One-step, legacy)
```
User calls generate_artifacts(graph)
  → generateArtifactsTool.execute(args)
  → Calls all exporters:
    - toMermaid(graph)
    - toCanvasJSON(graph)
    - toMarkdown(graph)
    - toDashboard(graph)
    - generateCSV(graph)
  → All files returned
```

### Path 3: Validate Only
```
User calls validate_story_structure(graph)
  → validateGraph(graph, strict)
  → ValidationResult JSON
```

---

## Consumer Integration

### MCP Output → Tauri App UI
```
MCP Server (stdio)
  → StoryGraph JSON
  → Tauri app reads file or calls MCP
  → React components render:
    - StoryGraph visualization
    - Character cards
    - Event timeline
    - Conflict tracker
```

### MCP Output → GitHub Sync → Notion
```
MCP Server (export)
  → Markdown/CSV files
  → Push to GitHub repository
  → GitHub webhook triggers
  → github-sync parses files
  → Notion API creates/updates rows
```

---

## Package Roles

| Package | Role | Status |
|---------|------|--------|
| `@bl1nk/visual-mcp` | Core MCP server with story analysis and export tools | ✅ Active |
| `tauri-app` | Desktop UI for story visualization | ✅ Active |
| `@bl1nk/github-sync` | GitHub webhook → Notion sync | ✅ Active |
| `craft-blog-cms` | Next.js blog/CMS (orphaned) | ⚠️ Needs decision |

---

## Files Reference

| File | Purpose |
|------|---------|
| `packages/bl1nk/src/index.ts` | MCP server entry, tool registration |
| `packages/bl1nk/tools/index.ts` | Tool definitions |
| `packages/bl1nk/tools/execute.ts` | Tool executors |
| `packages/bl1nk/analyzer.ts` | Story text → StoryGraph builder |
| `packages/bl1nk/validators.ts` | Structural validation logic |
| `packages/bl1nk/exporters/*.ts` | Output formatters |
| `docs/TOOL_MAPPING.md` | Complete tool mapping |
| `docs/ARCHITECTURE.md` | This file |
