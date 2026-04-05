# Visual Story Planner v3 (VSP3) - Project Context

**Primary Reference:** See [AGENTS.md](AGENTS.md) for core project information, commands, structure, and coding guidelines.

## Project Overview

**bl1nk-visual-mcp** is a production-ready **MCP server** for structured story analysis, planning, and optimization. It converts natural-language story text into structured **StoryGraph JSON** and provides 16 tools for visualization and analysis.

### Core Purpose
Converts natural-language story text into structured **StoryGraph JSON** and provides multiple export formats for visualization and analysis.

### Key Features
- ✅ Structured Story Analysis — Parse narrative text into StoryGraph JSON
- ✅ Three-Act Structure Validation — Ensure proper story structure (25%-50%-25%)
- ✅ Character Arc Tracking — Analyze character development and consistency
- ✅ Conflict Management — Detect, map, and optimize story conflicts
- ✅ Multiple Export Formats — Mermaid, Canvas JSON, HTML Dashboard, Markdown, MCP-UI
- ✅ Comprehensive Validation — 50+ validation rules with actionable suggestions
- ✅ External Search — Exa AI integration for story research
- ✅ 16 MCP Tools — 11 granular + 4 legacy + 1 standalone

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Language** | TypeScript 5.3+ |
| **Package Manager** | pnpm |
| **Framework** | Model Context Protocol (MCP) SDK |
| **Validation** | Zod |
| **Output Formats** | Mermaid, Canvas JSON, Markdown, HTML, MCP-UI |

---

## Project Structure

```
visual-story-extension/
├── packages/bl1nk/
│   ├── src/index.ts          # MCP server entry, tool registration, Zod schemas
│   ├── tools/
│   │   ├── index.ts          # Tool definitions (GRANULAR_TOOLS + BL1NK_VISUAL_TOOLS)
│   │   ├── execute.ts        # Tool executors (executeGranularTool + executeStoryTool)
│   │   ├── search-entries.ts # Standalone search tool
│   │   └── generate-artifacts.ts
│   ├── exporters/
│   │   ├── mermaid.ts        # Mermaid diagram export
│   │   ├── canvas.ts         # Canvas JSON export
│   │   ├── dashboard.ts      # HTML dashboard export
│   │   ├── markdown.ts       # Markdown document export
│   │   └── mcp-ui-dashboard.ts # MCP-UI dashboard export
│   ├── analyzer.ts           # Story text parsing and graph building
│   ├── validators.ts         # Validation engine (50+ rules)
│   ├── exa-search.ts         # External search integration (Exa AI)
│   └── types.ts              # Core type definitions
│
├── packages/tauri-app/       # Desktop app (React + Vite + Tauri)
├── packages/github-sync/     # GitHub webhook → Notion sync
├── packages/craft-blog-cms/  # ⚠️ Orphaned (Next.js blog/CMS)
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md           # System architecture + dataflow
│   ├── TOOL_MAPPING.md           # Complete tool mapping (16 tools)
│   └── PROJECT_SUMMARY.md        # Project history
├── GEMINI.md                 # Gemini AI system context
├── CLAUDE.md                 # Claude Code project context
├── AGENTS.md                 # Root agent instructions
└── README.md                 # User documentation
```

---

## Building and Running

### Prerequisites
- Node.js 18+
- pnpm (or npm)

### Commands

```bash
# Install dependencies
pnpm install

# Build TypeScript to dist/
pnpm run build

# Run the MCP server
pnpm run start

# Development watch mode
pnpm run dev

# Run tests
pnpm run test
```

### Usage Examples

```bash
# Start MCP server
cd packages/bl1nk
npm run build
npm start

# Tauri desktop app
cd packages/tauri-app
npm run tauri:dev
```

---

## Core Data Model (StoryGraph)

### Schema Types (`packages/bl1nk/types.ts`)

```typescript
StoryGraph {
  meta: { title, createdAt, updatedAt, version, genre? }
  characters: Character[]
  conflicts: Conflict[]
  events: EventNode[]
  relationships: Relationship[]
  tags: string[]
}

Character {
  id: string
  name: string
  role: string
  traits: string[]
  arc: { start, midpoint, end, transformation, emotionalJourney }
  relationships: string[]
  motivations: string[]
  fears: string[]
  secretsOrLies: string[]
  actAppearances: number[]
}

Conflict {
  id: string
  type: string
  description: string
  relatedCharacters: string[]
  rootCause: string
  escalations: { stage, description, intensity, affectedCharacters }[]
  resolution: string
  actIntroduced: number
}

EventNode {
  id: string
  label: string
  description: string
  act: number
  importance: string
  sequenceInAct: number
  location?: string
  characters: string[]
  conflicts: string[]
  emotionalTone: string
  consequence: string
}

Relationship {
  from: string
  to: string
  type: string
  strength: number
  description?: string
}
```

---

## MCP Tools

The server registers 16 tools in `packages/bl1nk/src/index.ts`:

### Granular Tools (11 — Source of Truth)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `analyze_story` | Parse story text into StoryGraph | `text: string` | StoryGraph JSON |
| `export_mermaid` | Generate Mermaid diagram | `graph: StoryGraph` | Mermaid code |
| `export_canvas` | Generate Canvas JSON | `graph: StoryGraph` | Canvas JSON |
| `export_dashboard` | Generate HTML dashboard | `graph: StoryGraph` | HTML string |
| `export_markdown` | Generate Markdown document | `graph: StoryGraph` | Markdown string |
| `export_mcp_ui_dashboard` | Generate MCP-UI dashboard | `graph: StoryGraph` | HTML string |
| `validate_story_structure` | Validate structure | `graph: StoryGraph` | ValidationResult |
| `extract_characters` | Extract character data | `graph: StoryGraph` | Character array |
| `extract_conflicts` | Extract conflict data | `graph: StoryGraph` | Conflict array |
| `build_relationship_graph` | Build relationship graph | `graph: StoryGraph` | Relationship data |
| `exa_search_story` | External story research | `query: string` | Search results |

### Legacy Tools (4 — Backward Compat)

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `search_entries` | Entity extraction with templates | `text: string` | Markdown files |
| `validate_story` | Quick validation from text | `text: string` | ValidationResult |
| `generate_artifacts` | All formats at once | `graph: StoryGraph` | All files |
| `sync_github` | Push to GitHub | None | Not implemented |

---

## Development Conventions

### Code Style
- **Module System:** ES Modules (`"type": "module"` in package.json)
- **Imports:** Use `.js` extension for relative imports (TypeScript emits ES modules)
- **Type-only imports:** `import type { StoryGraph } from './types.js'`
- **Naming:** camelCase for variables/functions, PascalCase for types/classes
- **Types:** Strict TypeScript enabled (`"strict": true`)

### Architecture Patterns
- **Functional:** Pure functions for analysis and export
- **Schema-First:** Types defined in Zod schemas, validated at tool boundaries
- **Validation-First:** Always validate before exporting
- **Granular Tools:** 11 focused tools (recommended) + 4 legacy tools (backward compat)

### File Organization
- Source files in `packages/bl1nk/` root
- Tools in `packages/bl1nk/tools/`
- Exporters in `packages/bl1nk/exporters/`
- Types in `packages/bl1nk/types.ts`

---

## Testing Practices

- Framework: Vitest (`globals: true`, `node` environment)
- Run: `npm test` or `npm run test -- -t "test name"`
- Pattern: Arrange-Act-Assert
- Coverage: v8 provider

---

## Key Implementation Details

### Analyzer (`packages/bl1nk/analyzer.ts`)
- Uses regex-based heuristics for character/conflict/event detection
- Extracts title, characters, events, conflicts from plain text
- Builds relationships between characters
- Assigns events to acts based on order

### Validator (`packages/bl1nk/validators.ts`)
- Checks for required metadata (title, characters, protagonist)
- Validates act distribution (requires all 3 acts)
- Detects climax and midpoint events
- Checks act balance (25-50-25 rule)
- Strict mode: validates character motivations and arcs
- Returns ValidationResult with issues, analysis, and recommendations

### Exporters
- **Mermaid:** Groups events by act in subgraphs, different shapes for importance
- **Canvas JSON:** Generates nodes with positions, edges for relationships
- **Dashboard:** HTML with Chart.js, TailwindCSS, validation results
- **Markdown:** Structured document with metadata, analysis, events by act
- **MCP-UI Dashboard:** Similar to dashboard but MCP-UI compatible format

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXA_API_KEY` | Exa AI API key for external search | None |
| `NODE_ENV` | Environment (development/production/test) | `development` |

---

## Extension Configuration

```json
{
  "mcpServers": {
    "bl1nk": {
      "command": "node",
      "args": ["${workspaceFolder}/packages/bl1nk/dist/index.js"],
      "env": {
        "EXA_API_KEY": "${env:EXA_API_KEY}"
      }
    }
  }
}
```

---

## Common Workflows

### Quick Analysis (5 min)
1. Call `analyze_story` with story text
2. Review StoryGraph output
3. Check validation results

### Export & Visualize (10 min)
1. Analyze story → get StoryGraph
2. Export as Mermaid for diagram tools
3. Export as Canvas JSON for web apps
4. Export as Markdown for documentation

### Deep Audit (15 min)
1. Analyze with `depth: "deep"`
2. Run `validate_story_structure`
3. Extract characters and conflicts
4. Review findings and apply recommendations

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Story must have a title" | Add title to story metadata |
| "Missing Act 2 events" | Add more events to Act 2 |
| Export fails | Run validate first, fix errors |
| Tools not working | Rebuild: `npm run build` |
| Server won't start | Check Node.js 18+, run `npm install` |

---

## Related Documentation

- **User Guide:** [`README.md`](README.md) — Complete user documentation
- **System Context:** [`GEMINI.md`](GEMINI.md) — AI behavior configuration
- **Claude Context:** [`CLAUDE.md`](CLAUDE.md) — Claude Code project context
- **Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture + dataflow
- **Tool Mapping:** [`docs/TOOL_MAPPING.md`](docs/TOOL_MAPPING.md) — Complete tool mapping (16 tools)
- **Agent Instructions:** [`AGENTS.md`](AGENTS.md) — Root agent instructions
