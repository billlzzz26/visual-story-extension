# Kilo Instructions — bl1nk-visual-mcp

## Build Commands

| Command | What it does |
|---------|-------------|
| `npm run build` | esbuild bundle server.js + plugin.js |
| `npm run build:tsc` | TypeScript type-check only |
| `npm run dev` | Watch-mode rebuild |

## Test Commands

| Command | What it does |
|---------|-------------|
| `npm test` | Run all vitest tests |
| `npm run test -- -t "name"` | Run single test by name |
| `npm run test -- tests/file.test.ts` | Run single test file |

## Quality Commands

| Command | What it does |
|---------|-------------|
| `npm run check` | Biome lint + format (auto-fix) |
| `npm run validate` | 47 exporter assertions |

## MCP Tools

```
analyze_story(text, depth, includeMetadata)
validate_story_structure(graph, strict, includeRecommendations)
extract_characters(graph, detailed)
extract_conflicts(graph, includeEscalation)
build_relationship_graph(graph, includeStats)
export_mermaid(graph, includeMetadata, style)
export_canvas(graph, includeMetadata, autoLayout)
export_dashboard(graph, includeStats, includeRecommendations)
export_markdown(graph, includeMetadata, includeAnalysis)
```

## Plugin Entry

`src/plugin.ts` → exports 8 tools via `tool()` from `@kilocode/plugin`
Uses `client.app.log({ body: { service, level, message, extra } })` for structured logging

## Code Conventions

- ESM imports with `.js` extension
- No `any` — use `unknown` + narrowing
- Biome for all formatting
- Zod schemas with `.describe()` and `.default()`
- server.tool() expects `.shape` not full `z.object()`
