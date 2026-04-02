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

### Tauri App (`tauri-app/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + Vite production build |
| `npm run tauri:dev` | Tauri dev with hot reload |
| `npm run tauri:build` | Tauri production build |
| `npm test` | Run tests via vitest |
| `npm run typecheck` | `tsc --noEmit` |

## Project Structure

```
src/
  server.ts          # MCP server entry, tool registration, Zod schemas
  types.ts           # TypeScript interfaces (StoryGraph, Character, etc.)
  analyzer.ts        # Story text → StoryGraph builder
  validators.ts      # Structural validation logic
  exa-search.ts      # External search integration
  exporters/         # Output formatters (mermaid, canvas, dashboard, markdown, mcp-ui)
tests/               # Integration-level tests
tauri-app/           # Desktop app (React + Vite + Tauri)
```

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
| `GEMINI.md` | Gemini | Markdown | Original Gemini system context |
| `.gemini/config.toml` | Gemini CLI | TOML | Gemini CLI project config |
| `QWEN.md` | Qwen | Markdown | Original Qwen system context |
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
