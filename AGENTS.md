# AGENTS.md — bl1nk-visual-mcp

## Commands

### Root Package (`bl1nk-visual-mcp`)

| Command | Description |
|---------|-------------|
| `npm run build` | Bundle with esbuild → `dist/server.js` |
| `npm run build:tsc` | Type-check only (no emit) |
| `npm run dev` | Watch-mode esbuild rebuild |
| `npm run start` | Run bundled server |
| `npm test` | Run all tests via vitest |
| `npm run test:watch` | Vitest watch mode |
| `npm run test -- -t "test name"` | Run a single test by name |
| `npm run test -- tests/exporters.test.ts` | Run a single test file |
| `npm run check` | Biome lint + format with auto-fix |
| `npm run format` | Biome format (write) |
| `npm run lint` | Markdown lint |
| `npm run lint:fix` | Markdown lint with auto-fix |

### Desktop App (`bl1nk-desktop/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + Vite production build |
| `npm run tauri:dev` | Tauri dev with hot reload |
| `npm run tauri:build` | Tauri production build |
| `npm test` | Run tests via vitest |
| `npm run typecheck` | `tsc --noEmit` |

### IDE App (`bl1nk-ide/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Vite production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests via vitest |
| `npm run typecheck` | `tsc --noEmit` |

## Project Structure

```
packages/bl1nk-core/    # Core MCP Server & Story Analysis
  src/
    index.ts            # MCP server entry, tool registration, Zod schemas
    tools/              # Tool definitions & executors
    exporters/          # Output formatters (mermaid, canvas, dashboard, markdown)
    analyzer.ts         # Story text → StoryGraph builder
    validators.ts       # Structural validation logic
    types.ts            # TypeScript interfaces (StoryGraph, Character, etc.)
    edge-cases.test.ts  # Test edge cases
  tests/                # Integration tests
packages/bl1nk-sync/    # GitHub webhook → Notion sync
packages/bl1nk-desktop/ # Desktop app (React + Tauri)
packages/bl1nk-ide/     # Web IDE (Vite + React)
packages/bl1nk-book/    # Book publishing platform (development)
packages/craft-blog-cms/# ⚠️ Orphaned (Next.js blog/CMS)
```

## Tool System

### Granular Tools (11 tools — source of truth)

Defined in `GRANULAR_TOOLS` array, schemas in `Schemas` object, executors in `executeGranularTool`.

| Tool | Schema | Executor | Description |
|------|--------|----------|-------------|
| `analyze_story` | `Schemas.analyze_story` | `executeGranularTool` | Parse story text → StoryGraph |
| `export_mermaid` | `Schemas.export_mermaid` | `executeGranularTool` | Mermaid diagram |
| `export_canvas` | `Schemas.export_canvas` | `executeGranularTool` | Canvas JSON |
| `export_dashboard` | `Schemas.export_dashboard` | `executeGranularTool` | HTML dashboard |
| `export_markdown` | `Schemas.export_markdown` | `executeGranularTool` | Markdown document |
| `validate_story_structure` | `Schemas.validate_story_structure` | `executeGranularTool` | 3-act validation |
| `extract_characters` | `Schemas.extract_characters` | `executeGranularTool` | Character extraction |
| `extract_conflicts` | `Schemas.extract_conflicts` | `executeGranularTool` | Conflict extraction |
| `build_relationship_graph` | `Schemas.build_relationship_graph` | `executeGranularTool` | Relationship graph |
| `export_mcp_ui_dashboard` | `Schemas.export_mcp_ui_dashboard` | `executeGranularTool` | MCP-UI dashboard |
| `exa_search_story` | `Schemas.exa_search_story` | `executeGranularTool` | External search |

### Legacy Tools (4 tools — backward compat)

Defined in `BL1NK_VISUAL_TOOLS` array, executors in `executeStoryTool`.

| Tool | Executor | Description |
|------|----------|-------------|
| `search_entries` | `executeStoryTool` | Entity extraction with templates |
| `validate_story` | `executeStoryTool` | Quick validation from text |
| `generate_artifacts` | `executeStoryTool` | All formats at once |
| `sync_github` | `executeStoryTool` | Push to GitHub (not implemented) |

### Standalone Tool (1 tool)

| Tool | Source | Description |
|------|--------|-------------|
| `search_entries` | `searchEntriesTool` | Full entity extraction with Handlebars templates |

See [`docs/TOOL_MAPPING.md`](docs/TOOL_MAPPING.md) for complete mapping.

## Code Style

### Imports
- Use `.js` extension for relative imports (ESM bundler convention): `import { x } from './module.js'`
- Use `type` keyword for type-only imports: `import type { StoryGraph } from './types.js'`
- Group imports: external libraries first, then relative imports, sorted alphabetically

### Formatting
- 2-space indentation, LF line endings, UTF-8
- Max line length: 80 characters
- Trailing newline on all files
- Biome handles formatting — run `npm run check` before committing

### TypeScript
- `strict: true` — no `any` unless absolutely necessary, prefer `unknown`
- Target ES2022, module ESNext, moduleResolution bundler
- `noEmit: true` — esbuild handles bundling, tsc is for type-checking only
- Use `interface` for public types, inline types for local/narrow usage
- All function parameters and return types must be annotated

### Naming Conventions
- `camelCase` for variables, functions, methods
- `PascalCase` for interfaces, types, classes
- `UPPER_SNAKE_CASE` for constants
- `snake_case` for error codes (e.g., `MISSING_TITLE`, `NO_PROTAGONIST`)
- Test files: `*.test.ts` colocated with source or in `tests/`

### Error Handling
- Use `unknown` for caught errors, narrow with `instanceof Error`
- MCP tools return `{ content: [...], isError: true }` on failure
- Never swallow exceptions — always surface meaningful messages
- Use Zod schemas for input validation at tool boundaries

### Testing (Vitest)
- `globals: true` — `describe`, `it`, `expect` available without import
- Environment: `node`
- Test file pattern: `src/**/*.test.ts`, `tests/**/*.test.ts`
- Follow Arrange-Act-Assert pattern
- Coverage provider: v8, reporters: text/json/html

### Zod Schemas
- Define deep schemas at module top, compose from smaller schemas
- Use `.describe()` on input fields for MCP tool documentation
- Default values via `.default()` — never rely on caller for optional fields

## Copilot Instructions (from `.github/copilot-instructions.md`)

### Core Principles
1. **Think before coding** — state assumptions, present alternatives, ask when unclear
2. **Simplicity first** — minimum code that solves the problem, no speculative features
3. **Surgical changes** — touch only what's needed, match existing style, don't refactor unrelated code
4. **Goal-driven (TDD)** — define success criteria, write tests before/alongside implementation

### Clean Code Checklist
- [ ] Functions do one thing
- [ ] Names are descriptive and intention-revealing
- [ ] No magic numbers or strings (use constants)
- [ ] Error handling is explicit (no empty catch blocks)
- [ ] No commented-out code
- [ ] Tests cover the change

## AI Agent Config Files

| File | Tool | Format | Purpose |
|------|------|--------|---------|
| `GEMINI.md` | Gemini | Markdown | Gemini system context |
| `.gemini/config.toml` | Gemini CLI | TOML | Gemini CLI project config |
| `QWEN.md` | Qwen | Markdown | Qwen system context |
| `.qwen/config.toml` | Qwen CLI | TOML | Qwen CLI project config |
| `CLAUDE.md` | Claude Code | Markdown | Claude project context |
| `.opencode/config.md` | OpenCode | Markdown | OpenCode project context |
| `.kilocode/commands/analyze.md` | KiloCode | Markdown | KiloCode command definitions |

### GitHub Workflows

| File | Purpose |
|------|---------|
| `.github/workflows/test.yml` | Tests, build-check, plugin, validate-exporters |
| `.github/workflows/lint.yml` | Biome lint + TypeScript type-check |
| `.github/workflows/format.yml` | Biome format + markdown lint |
| `.github/workflows/release.yml` | GitHub Release on tag push
