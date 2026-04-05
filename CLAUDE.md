# CLAUDE.md — bl1nk-visual-mcp

**Primary Reference:** See [AGENTS.md](AGENTS.md) for core project information, commands, structure, and coding guidelines.

## Project Overview

MCP server + Kilo Code plugin for structured story analysis and visualization.
Converts natural-language story text → StoryGraph JSON with 16 MCP tools (11 granular + 4 legacy + 1 standalone) + multiple exporters.

## Quick Commands

```bash
npm run build          # esbuild → dist/index.js
npm run build:tsc      # Type-check only (no emit)
npm run dev            # Watch-mode rebuild
npm run start          # Run bundled server
npm test               # Run all vitest tests
npm run test -- -t "test name"  # Single test
npm run check          # Biome lint + format (auto-fix)
```

## Architecture

```
packages/bl1nk/
  src/index.ts          # MCP server entry, tool registration, Zod schemas
  tools/
    index.ts            # Tool definitions (GRANULAR_TOOLS + BL1NK_VISUAL_TOOLS)
    execute.ts          # Tool executors (executeGranularTool + executeStoryTool)
    search-entries.ts   # Standalone search tool
    generate-artifacts.ts
  exporters/            # Output formatters
    mermaid.ts          # Mermaid diagram export
    canvas.ts           # Canvas JSON export
    dashboard.ts        # HTML dashboard export
    markdown.ts         # Markdown document export
    mcp-ui-dashboard.ts # MCP UI dashboard export
  analyzer.ts           # Story text → StoryGraph builder
  validators.ts         # Structural validation logic
  exa-search.ts         # External search integration (Exa AI)
  types.ts              # TypeScript interfaces (StoryGraph, Character, etc.)
packages/tauri-app/     # Desktop app (React + Vite + Tauri)
packages/github-sync/   # GitHub webhook → Notion sync
```

## Code Style

- **ESM imports**: Use `.js` extension: `import { x } from './module.js'`
- **Type-only imports**: `import type { StoryGraph } from './types.js'`
- **Formatting**: Biome handles everything — run `npm run check`
- **TypeScript**: `strict: true`, no `any`, prefer `unknown`
- **Naming**: camelCase variables, PascalCase types, UPPER_SNAKE constants
- **Error handling**: `unknown` + `instanceof Error`, never swallow exceptions
- **Zod schemas**: Use `.describe()` on input fields, `.default()` for optional

## Testing

- Framework: Vitest (`globals: true`, `node` environment)
- Run: `npm test` or `npm run test -- tests/exporters.test.ts`
- Pattern: Arrange-Act-Assert
- Coverage: v8 provider

## MCP Server API

16 tools registered via `server.tool()`:

### Granular Tools (11 — source of truth)

| Tool | Purpose |
|------|---------|
| `analyze_story` | Parse story text → StoryGraph |
| `export_mermaid` | Generate Mermaid diagram |
| `export_canvas` | Generate Canvas JSON |
| `export_dashboard` | Generate HTML dashboard |
| `export_markdown` | Generate Markdown document |
| `export_mcp_ui_dashboard` | Generate MCP-UI dashboard |
| `validate_story_structure` | Validate structure (50+ rules) |
| `extract_characters` | Extract character info |
| `extract_conflicts` | Extract conflict info |
| `build_relationship_graph` | Build relationship graph |
| `exa_search_story` | External story research |

### Legacy Tools (4 — backward compat)

| Tool | Purpose |
|------|---------|
| `search_entries` | Entity extraction with templates |
| `validate_story` | Quick validation from text |
| `generate_artifacts` | All formats at once |
| `sync_github` | Push to GitHub (not implemented) |

### Standalone Tool (1)

| Tool | Purpose |
|------|---------|
| `search_entries` (standalone) | Full entity extraction with Handlebars templates |

## Kilo Code Plugin

- Entry: `src/plugin.ts` → built to `dist/plugin.js`
- Uses `client.app.log()` from `@kilocode/sdk` for structured logging
- Plugin config: `.claude-plugin/plugin.json`

## Key Patterns

- `server.tool(name, description, zodSchema.shape, handler)` — NOT full `z.object()`
- `client.app.log({ body: { service, level, message, extra } })` — structured logging
- Catch errors as `unknown`, narrow with `instanceof Error`
- All exporter functions return `string`

## Tool Registration Flow

1. Server creates `McpServer` instance
2. Loops `GRANULAR_TOOLS` (11) → looks up schema in `Schemas` → registers with `executeGranularTool`
3. Loops `BL1NK_VISUAL_TOOLS` (4) → registers with empty schema → `executeStoryTool`
4. Registers `searchEntriesTool` (standalone) with its own `inputSchema`
5. Connects to `StdioServerTransport`

See [`docs/TOOL_MAPPING.md`](docs/TOOL_MAPPING.md) for complete tool mapping.
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for system architecture.
