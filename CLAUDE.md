# CLAUDE.md — bl1nk-visual-mcp

## Project Overview

MCP server + Kilo Code plugin for structured story analysis and visualization.
Converts natural-language story text → StoryGraph JSON with 9 MCP tools + multiple exporters.

## Quick Commands

```bash
npm run build          # esbuild → dist/server.js + dist/plugin.js
npm run build:tsc      # Type-check only (no emit)
npm run dev            # Watch-mode rebuild
npm run start          # Run bundled server
npm test               # Run all vitest tests
npm run test -- -t "test name"  # Single test
npm run check          # Biome lint + format (auto-fix)
npm run validate       # Run exporter validation (47 assertions)
```

## Architecture

```
src/
  server.ts           # MCP server, tool registration, Zod schemas
  plugin.ts           # Kilo Code plugin (client.app.log structured logging)
  types.ts            # TypeScript interfaces (StoryGraph, Character, etc.)
  analyzer.ts         # Story text → StoryGraph builder
  validators.ts       # Structural validation logic
  exa-search.ts       # External search integration (Exa AI)
  exporters/          # Output formatters
    mermaid.ts        # Mermaid diagram export
    canvas.ts         # Canvas JSON export
    dashboard.ts      # HTML dashboard export
    markdown.ts       # Markdown document export
    json.ts           # Raw JSON export
    mcp-ui-dashboard.ts # MCP UI dashboard export
tests/                # Integration tests
scripts/
  validate-exporters.mjs  # Exporter validation (47 assertions)
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

9 tools registered via `server.tool()` — pass `.shape` from Zod schemas, not full `z.object()`:

| Tool | Purpose |
|------|---------|
| `analyze_story` | Parse story text → StoryGraph |
| `validate_story_structure` | Validate structure (50+ rules) |
| `extract_characters` | Extract character info |
| `extract_conflicts` | Extract conflict info |
| `build_relationship_graph` | Build relationship graph |
| `export_mermaid` | Generate Mermaid diagram |
| `export_canvas` | Generate Canvas JSON |
| `export_dashboard` | Generate HTML dashboard |
| `export_markdown` | Generate Markdown document |

## Kilo Code Plugin

- Entry: `src/plugin.ts` → built to `dist/plugin.js`
- Uses `client.app.log()` from `@kilocode/sdk` for structured logging
- 8 tools exported via `tool()` helper from `@kilocode/plugin`
- Plugin config: `.claude-plugin/plugin.json`

## Key Patterns

- `server.tool(name, description, zodSchema.shape, handler)` — NOT full `z.object()`
- `client.app.log({ body: { service, level, message, extra } })` — structured logging
- Catch errors as `unknown`, narrow with `instanceof Error`
- All exporter functions return `string`
