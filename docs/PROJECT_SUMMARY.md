---
description: Project summary — Conductor conversion + Architecture fixes
updated: 2026-04-03T00:00:00Z
---

# Project Summary — bl1nk-visual-mcp

## Phase 1: Conductor → bl1nk Command Conversion (2026-04-01)

### Overall Goal
Convert the Conductor framework's `setup.toml` command to work with bl1nk-visual-mcp, adapting development workflow terminology to writer workflow terminology.

### Key Knowledge

#### Architecture & Structure
- **Production Structure**: MCP extensions install to `~/.qwen/extensions/bl1nk-visual-mcp/` with commands, skills, agents, templates at root level
- **Development Structure**: Monorepo with `packages/bl1nk/`, `packages/craft-blog-cms/`, `packages/github-sync/`, `packages/tauri-app/`
- **Commands Location**: Commands go at root level in extension (not nested in packages)

#### Terminology Mapping (Conductor → bl1nk)
| Conductor | bl1nk |
|-----------|-------|
| `conductor/` | `stories/` |
| `product.md` | `story-universe.md` |
| `product-guidelines.md` | `style-guidelines.md` |
| `tech-stack.md` | `world-building.md` |
| `code_styleguides/` | `character-guides/` |
| `tracks/` | `books/` |
| `spec.md` | `synopsis.md` |
| `plan.md` | `outline.md` |
| `/conductor:implement` | `/bl1nk:write` |

#### User Preferences
- **Modify, don't rewrite**: When adapting existing code, modify specific sections rather than rewriting entirely
- **Preserve working patterns**: Conductor's 5-section setup structure works well, keep it
- **Brownfield support**: Must handle both new projects (Greenfield) and existing story content (Brownfield)

### Completed
1. **[DONE]** Analyzed Conductor's `setup.toml` structure (5 sections, 531 lines)
2. **[DONE]** Converted all 5 sections from Conductor to bl1nk
3. **[DONE]** Updated all tool references, file paths, and commit messages
4. **[DONE]** Created skills: story-analysis, structural-audit, conflict-detection, character-analysis, arc-optimization, character-voice, story-export, theme-extraction
5. **[DONE]** Created commands: story/analyze, story/audit, story/export, story/validate, story/refine, core/setup, core/status, core/revert, core/newTrack, core/implement, core/review

### Open Questions (from Phase 1)
- Should `books/` contain `scenes/` subfolder or flat structure?
- Should scene IDs be `scene_001_` format or chapter-based?
- What's the optimal template set for character-guides?

---

## Phase 2: Architecture & Dataflow Fixes (2026-04-03)

### Problem
Tool registration system was broken — two conflicting tool systems (4-tool vs 11-tool) caused MCP API failures. Package integration paths were undefined. Documentation was outdated.

### Solution

#### Critical Blockers Fixed
1. **Unify tool definitions** — Created `GRANULAR_TOOLS` (11 tools) as source of truth, kept `BL1NK_VISUAL_TOOLS` (4 legacy) for backward compat
2. **Fix tool registration logic** — Rewrote `packages/bl1nk/src/index.ts` to loop over `GRANULAR_TOOLS` + `Schemas` correctly
3. **Create granular tool executor** — Built `executeGranularTool` in `packages/bl1nk/tools/execute.ts` for all 11 tools
4. **Add validation tests** — Created `packages/bl1nk/tools/index.test.ts`

#### Documentation Created
- `docs/ARCHITECTURE.md` — System architecture + dataflow diagrams
- `docs/TOOL_MAPPING.md` — Complete mapping of all 16 tools
- `docs/TAURI-APP.md` — Tauri app role and dependencies
- `docs/GITHUB-SYNC.md` — GitHub sync role and data flow
- `docs/CRAFT-BLOG-CMS.md` — Orphaned package decision (recommend archive)

#### Documentation Updated
- `README.md` — Package structure, tool listings, documentation links
- `AGENTS.md` — Tool system documentation (11 granular + 4 legacy)
- `CLAUDE.md` — 16 tools, architecture, tool registration flow
- `GEMINI.md` — All 16 tools with full specifications
- `QWEN.md` — Complete project context
- `.github/agents/architecture-audit.agent.md` — Current architecture
- `gemini-extension.json` — All 15 tools listed, correct MCP path
- `qwen-extension.json` — All 15 tools listed, correct MCP path

#### Package Integration
- Added `@bl1nk/visual-mcp: workspace:*` to `packages/tauri-app/package.json`
- Added `@bl1nk/visual-mcp: workspace:*` to `packages/github-sync/package.json`
- Aligned all package versions to `3.0.0`
- Fixed `tsconfig.json` rootDir to include all source files

#### CI/CD Workflows Fixed
- **test.yml** — Switched from npm to pnpm, fixed build output paths (`dist/index.js`), replaced plugin validation with tool registration verification, fixed exporter validation script
- **lint.yml** — Switched to pnpm, runs biome check on bl1nk package, added markdown lint
- **format.yml** — Switched to pnpm, runs biome format on bl1nk package
- **release.yml** — Switched to pnpm, fixed artifact paths, added tool registration verification step
- **tool-validation.yml** (new) — Validates tool names match across code/configs/docs, checks version consistency, verifies no duplicate tool names

### Key Decisions
1. **Tool system**: 11-tool granular (recommended) + 4-tool legacy (backward compat) = 16 total
2. **Craft Blog CMS**: Recommend archive (orphaned, no integration)
3. **Version numbers**: All packages at `3.0.0`
4. **Documentation location**: Moved to `docs/` directory

### Current State
- **MCP Server**: 16 tools registered (11 granular + 4 legacy + 1 standalone)
- **Packages**: 4 packages, all at v3.0.0, dependencies linked
- **Documentation**: Complete — architecture, tool mapping, package roles, agent configs

### Remaining Work (from Phase 1)
- [ ] Test `/bl1nk:setup` command with actual story project
- [ ] Create remaining bl1nk commands (`write.toml`, `newBook.toml`)
- [ ] Create story templates in `packages/bl1nk/templates/`
- [ ] Test Brownfield setup with existing story content

---

## Project Structure (Current)

```
visual-story-extension/
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md            # System architecture + dataflow
│   ├── TOOL_MAPPING.md            # Complete tool mapping (16 tools)
│   ├── PROJECT_SUMMARY.md         # This file
│   ├── TAURI-APP.md               # Tauri app role
│   ├── GITHUB-SYNC.md             # GitHub sync role
│   └── CRAFT-BLOG-CMS.md          # Orphaned package decision
│
├── packages/
│   ├── bl1nk/                     # Core MCP Server (v3.0.0)
│   │   ├── src/index.ts           # MCP server entry, tool registration
│   │   ├── tools/                 # Tool definitions + executors
│   │   ├── exporters/             # Output formatters
│   │   ├── analyzer.ts            # Story text → StoryGraph
│   │   ├── validators.ts          # Structural validation
│   │   └── exa-search.ts          # External search
│   ├── tauri-app/                 # Desktop UI (v3.0.0)
│   ├── github-sync/               # GitHub → Notion sync (v3.0.0)
│   └── craft-blog-cms/            # ⚠️ Orphaned (v3.0.0)
│
├── commands/                      # Qwen CLI commands
│   ├── core/                      # setup, status, revert, newTrack, implement, review
│   └── story/                     # analyze, audit, export, validate, refine
├── skills/                        # Qwen CLI skills
├── README.md
├── AGENTS.md
├── GEMINI.md
├── CLAUDE.md
├── QWEN.md
├── TODO.md
├── gemini-extension.json
└── qwen-extension.json
```
