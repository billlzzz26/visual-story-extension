---
title: TODO - bl1nk-visual-mcp
description: Source of truth for all implementation tasks
status: in_progress
last_updated: 2026-04-03
owner: dev-team
---

# TODO.md — bl1nk-visual-mcp

> **Source of truth** สำหรับงานทั้งหมด
> Status: `[ ]` todo · `[~]` in progress · `[x]` done
> Format: `type:feat/fix/arc/refactor/docs/test/style` · `label:core/high-priority/critical-blocker/component/config/integration`

---

## ✅ Architecture & Dataflow Fixes (2026-04-03)

*Completed: Fixed tool registration system, unified tool definitions, aligned documentation*

### Critical Blockers Fixed

- [x] `type:arc` `label:critical-blocker` Unify tool definitions — 11 granular + 4 legacy + 1 standalone
  - Created `GRANULAR_TOOLS` array (11 tools) as source of truth
  - Kept `BL1NK_VISUAL_TOOLS` (4 legacy tools) for backward compatibility
  - File: `packages/bl1nk/tools/index.ts`
- [x] `type:fix` `label:critical-blocker` Fix tool registration logic (`packages/bl1nk/src/index.ts`)
  - Loop now iterates over `GRANULAR_TOOLS` + `Schemas` correctly
  - Uses `executeGranularTool` for granular tools, `executeStoryTool` for legacy
  - Registers `searchEntriesTool` separately with its own schema
  - Server starts with 16 tools total
- [x] `type:fix` `label:critical-blocker` Create granular tool executor (`packages/bl1nk/tools/execute.ts`)
  - `executeGranularTool` handles all 11 granular tools
  - `executeStoryTool` handles 4 legacy tools
  - Fixed `formatSearchResults` call (added missing `originalQuery` argument)
- [x] `type:test` `label:critical-blocker` Create tool registration validation tests
  - File: `packages/bl1nk/tools/index.test.ts`
  - Tests: tool count, unique names, schema matching, executor availability

### Documentation Created/Updated

- [x] `type:docs` `label:core` Create `docs/TOOL_MAPPING.md` — Complete mapping of all 16 tools
- [x] `type:docs` `label:core` Create `docs/ARCHITECTURE.md` — System architecture + dataflow diagrams
- [x] `type:docs` `label:core` Create `docs/TAURI-APP.md` — Tauri app role
- [x] `type:docs` `label:core` Create `docs/GITHUB-SYNC.md` — GitHub sync role
- [x] `type:docs` `label:core` Create `docs/CRAFT-BLOG-CMS.md` — Orphaned package decision
- [x] `type:docs` `label:core` Update `docs/PROJECT_SUMMARY.md` — Phase 1 + Phase 2 summary
- [x] `type:docs` `label:core` Update `AGENTS.md` (root) — Tool system documentation
- [x] `type:docs` `label:core` Update `CLAUDE.md` — 16 tools, architecture, tool registration flow
- [x] `type:docs` `label:core` Update `GEMINI.md` — All 16 tools with full specifications
- [x] `type:docs` `label:core` Update `QWEN.md` — Complete project context
- [x] `type:docs` `label:core` Update `README.md` — Package structure, tool listings, documentation links
- [x] `type:docs` `label:core` Update `.github/agents/architecture-audit.agent.md` — Current architecture
- [x] `type:fix` `label:config` Update `gemini-extension.json` — All 15 tools listed
- [x] `type:fix` `label:config` Update `qwen-extension.json` — All 15 tools listed, correct MCP path
- [x] `type:docs` `label:config` Move all docs to `docs/` directory
- [x] `type:docs` `label:config` Move all docs to `docs/` directory

### Package Integration

- [x] `type:fix` `label:high-priority` Add `@bl1nk/visual-mcp` dependency to `packages/tauri-app/package.json`
- [x] `type:fix` `label:high-priority` Add `@bl1nk/visual-mcp` dependency to `packages/github-sync/package.json`
- [x] `type:fix` `label:config` Align all package versions to `3.0.0`
- [x] `type:fix` `label:config` Fix `tsconfig.json` rootDir to include all source files

### CI/CD Workflows Fixed

- [x] `type:fix` `label:config` Fix `.github/workflows/test.yml` — pnpm setup, build paths, plugin validation, exporter script
- [x] `type:fix` `label:config` Fix `.github/workflows/lint.yml` — pnpm setup, biome check on bl1nk package, markdown lint
- [x] `type:fix` `label:config` Fix `.github/workflows/format.yml` — pnpm setup, biome format on bl1nk package
- [x] `type:fix` `label:config` Fix `.github/workflows/release.yml` — pnpm setup, build paths, tool registration verification
- [x] `type:feat` `label:config` Create `.github/workflows/tool-validation.yml` — validates tool names match across code/configs/docs + version consistency

### CI/CD Workflows Fixed

- [x] `type:fix` `label:config` Fix `.github/workflows/test.yml` — pnpm setup, build paths, plugin validation, exporter script
- [x] `type:fix` `label:config` Fix `.github/workflows/lint.yml` — pnpm setup, biome check on bl1nk package, markdown lint
- [x] `type:fix` `label:config` Fix `.github/workflows/format.yml` — pnpm setup, biome format on bl1nk package
- [x] `type:fix` `label:config` Fix `.github/workflows/release.yml` — pnpm setup, build paths, tool registration verification
- [x] `type:feat` `label:config` Create `.github/workflows/tool-validation.yml` — validates tool names match across code/configs/docs + version consistency

---

## 📋 Next Step (2026-04-06)

*Completed: Type system improvements and comprehensive edge case testing*

### Type System Improvements ✅

- [x] `type:refactor` `label:core` Expand `types.ts` to cover all system parts (11 granular tools + legacy tools + parser + search + notebook + plugin)
  - Added 50+ type definitions covering entire codebase
  - Removed `"normal"` and `""` from `EventImportance` and `EmotionalTone` for strict typing
  - **Status:** Done - Comprehensive type coverage across all modules

- [x] `type:fix` `label:core` Reduce `Record<string, unknown>` usage in `execute.ts`
  - Replaced `Record<string, unknown>` with typed `StoryGraph` and specific result types
  - Added return type `Promise<ToolResult>` for better type safety
  - **Status:** Done - Type-safe tool execution

- [x] `type:test` `label:core` Add comprehensive edge cases and improve tests (`index.test.ts`)
  - Added 8 new edge case tests: act boundaries, special chars, duplicates, whitespace, climax detection, parser tests, case-insensitive roles, character-event matching
  - All 68 tests passing
  - **Status:** Done - Robust test coverage for edge cases

### High Priority

- [x] `type:fix` `label:high-priority` Fix RegExp creation in nested loop (`analyzer.ts:149`)
  - Creates new RegExp for every character-event pair (O(n×m) compilations)
  - For 10 chars × 20 events = 200 RegExp objects unnecessarily
  - **Fix:** Pre-compile regex patterns once before the loop
  - **Status:** Done - Moved regex compilation outside nested loop in `analyzer.ts:136-144`

- [ ] `type:fix` `label:high-priority` Add CSV escaping to prevent data corruption (`generate-artifacts.ts:60-77`)
  - No CSV escaping for values containing quotes, commas, or newlines
  - Character name like `John "The Brave"` would break CSV parsing
  - Risk of CSV injection attacks
  - **Fix:** Implement `escapeCSV()` function

- [ ] `type:fix` `label:high-priority` Lazy load templates to avoid blocking event loop (`search-entries.ts:24-27`)
  - Synchronous file I/O at module load time blocks event loop
  - Server startup will be slow
  - **Fix:** Lazy load templates on first use

### Core

- [ ] `type:fix` `label:core` Move dynamic imports to static imports (`execute.ts:37-38`)
  - Dynamic imports inside tool execution add async overhead
  - Adds microtask delay to every validation call
  - **Fix:** Move imports to top of file

- [ ] `type:fix` `label:core` Fix spread operator in deduplication loop (`search-entries.ts:149`)
  - Spread operator creates new array on every merge (O(n²) allocations)
  - Unnecessary memory churn for characters with many mentions
  - **Fix:** Use `Array.push()` in loop instead

### Config

- [ ] `type:fix` `label:config` Reconsider test exclusion in tsconfig.json
  - Tests are now excluded from TypeScript compilation
  - Test files won't be type-checked during build
  - **Fix:** Keep tests in `include` but move `env.d.ts` to separate type root

### Low Priority

- [ ] `type:enhancement` `label:low-priority` Implement template compilation caching (`search-entries.ts:29-31`)
  - Handlebars template compilation is expensive
  - Wasted CPU cycles on every server restart
  - **Fix:** Cache compiled templates in Map

---

## ✅ Project Structure Refactoring (2026-04-01)

*Completed: Reorganized project structure for clarity*

- [x] `type:refactor` `label:core` Create `src/index.ts` — Main entry point
  - Consolidated MCP server logic from `server.ts`
  - Added comprehensive re-exports for external use
  - Clear entry point for stdio MCP server
- [x] `type:refactor` `label:core` Convert `src/server.ts` to re-export
  - Now re-exports everything from `index.ts`
  - Maintains backward compatibility
- [x] `type:refactor` `label:config` Update `package.json` scripts
  - `build:main` → builds `src/index.ts` to `dist/index.js`
  - `start` → runs `dist/index.js`
  - `dev` → watches `src/index.ts`
- [x] `type:refactor` `label:config` Update `package.json` exports
  - `"main": "dist/index.js"`
  - `"exports": { ".": "./dist/index.js", "./plugin": "./dist/plugin.js" }`
- [x] `type:refactor` `label:core` Update `src/mcp-handler.ts` imports
  - Import from `./index.js` instead of `./server.js`
- [x] `type:docs` `label:docs` Update `README.md` structure
  - Updated project structure diagram
  - Updated quick start instructions
- [x] `type:docs` `label:docs` Update `VERCEL_DEPLOYMENT.md`
  - Updated project structure section

---

## ✅ Error Handling Enhancement (2026-04-01)

*Completed: Robust error handling for Exa MCP integration*

- [x] `type:feat` `label:core` Create `src/utils/error-handler.ts` — Error utilities
  - `ExaError` class with status code and timestamp
  - `handleRateLimitError()` — Detect 429 + free MCP users
  - `retryWithBackoff()` — Exponential backoff for 5xx errors
  - `formatToolError()` — Structured MCP error responses
- [x] `type:feat` `label:core` Update `src/exa-search.ts` — Use retry logic
  - Wrap API calls in `retryWithBackoff()`
  - Throw `ExaError` for HTTP failures
  - Handle JSON parse errors explicitly
- [x] `type:fix` `label:core` Update `src/server.ts` — Use error formatter
  - Replace generic error handler with `formatToolError()`
  - Consistent error response format across tools
- [x] `type:fix` `label:core` Update `src/plugin.ts` — Add error handling
  - Wrap `exa_search_story` in try-catch
  - Use `formatToolError()` for consistent output
- [x] `type:test` `label:core` Create `src/utils/error-handler.test.ts` — Test suite
  - Tests for `ExaError` creation
  - Tests for `handleRateLimitError()` logic
  - Tests for `retryWithBackoff()` behavior
  - Tests for `formatToolError()` output

---

## 🚀 Vercel Deployment Setup (2026-04-01)

*New: Deploy MCP server to Vercel with rate limiting*

- [x] `type:feat` `label:config` Create `api/mcp.ts` — Vercel Function entry point
  - Integrated Exa MCP handler with rate limiting
  - OAuth JWT verification support
  - IP-based QPS and daily limiting via Upstash Redis
- [x] `type:feat` `label:config` Create `src/mcp-handler.ts` — MCP server wrapper
  - Per-request configuration (API key, enabled tools)
  - Bridges mcp-handler library with existing server.ts
- [x] `type:feat` `label:config` Create `src/utils/auth.ts` — OAuth utilities
  - JWT token verification with JWKS
  - Token validation for OAuth flows
- [x] `type:feat` `label:config` Create `vercel.json` — Vercel configuration
  - URL rewrites for `/mcp` → `/api/mcp`
  - CORS headers for cross-origin requests
  - Max duration: 60s
- [x] `type:feat` `label:config` Update `package.json` — Add Vercel dependencies
  - `@upstash/ratelimit`, `@upstash/redis` — Rate limiting
  - `jose` — JWT verification
  - `mcp-handler` — MCP server framework
  - `vercel` — Deployment CLI
- [x] `type:feat` `label:config` Update `.env.example` — Vercel environment variables
  - Upstash Redis credentials
  - OAuth configuration
  - Rate limit settings
- [x] `type:docs` `label:config` Create `VERCEL_DEPLOYMENT.md` — Deployment guide
  - Quick deploy instructions
  - Environment variable reference
  - Usage examples for Claude Code, Cursor

---

## 🔴 Critical Fixes from Code Review (2026-04-01)

*Priority: Must fix before next release*

- [ ] `type:fix` `label:high-priority` Remove orphaned `@google/genai` dependency from `package.json:31`
  - Not imported anywhere in codebase
  - Increases install size and potential security surface
- [ ] `type:fix` `label:high-priority` Fix `prestart` script to build both server and plugin
  - Current: `"prestart": "npm run build:server"` → Should be: `"npm run build"`
  - Plugin export at `./dist/plugin.js` will be missing otherwise
- [ ] `type:fix` `label:high-priority` Add JSON parse error handling in `src/exa-search.ts:97`
  - Wrap `response.json()` in try-catch
  - Prevents server crash on malformed API response
- [ ] `type:feat` `label:high-priority` Add startup validation for Exa API key
  - Currently validated at call time (`src/exa-search.ts:45-49`)
  - Should validate at server startup and conditionally register tool or warn

---

## 🟡 Suggested Improvements (2026-04-01)

*Priority: Recommended for code quality*

- [ ] `type:fix` `label:core` Add `depth` parameter to plugin's `analyze_story` tool
  - Plugin schema (`src/plugin.ts:80-93`) missing param that MCP server supports
  - Creates inconsistent behavior between interfaces
- [ ] `type:fix` `label:core` Fix hardcoded act distribution in `src/analyzer.ts:74-75`
  - Use percentage-based: 25% Act 1, 50% Act 2, 25% Act 3
  - Current logic contradicts validator's 25-50-25 rule
- [ ] `type:fix` `label:core` Improve Unicode character name matching `src/analyzer.ts:133-138`
  - `\b` word boundaries fail with non-ASCII (e.g., "José" vs "jose")
  - Use Unicode-aware regex with `u` flag
- [ ] `type:fix` `label:config` Standardize Node versions in CI workflows
  - Test job: Node 22/24, Plugin validation: Node 20
  - Should use consistent versions across all jobs
- [ ] `type:fix` `label:config` Move `fs-extra` to devDependencies
  - Not imported in source code, only used in tests

---

## ⭐ Nice to Have (2026-04-01)

*Priority: Optional enhancements*

- [ ] `type:feat` `label:core` Add client-side rate limiting to Exa search
  - Prevent API throttling on rapid successive calls
- [ ] `type:feat` `label:core` Add XSS validation test for Markdown exporter
  - Similar to dashboard test in `scripts/validate-exporters.mjs:113-118`
- [ ] `type:fix` `label:config` Fix or remove `build.mjs:18-24`
  - References non-existent `src/insight/` and `src/export-html/` directories
- [ ] `type:fix` `label:config` Add try-catch around `client.app.log()` in plugin
  - `src/plugin.ts:88-95` assumes KiloCode client always provides logging

---

## Phase 0 — Scaffold & Config

- [ ] `type:feat` `label:core` Copy `examples/dashboard` → `examples/vsp-ui`
- [ ] `type:feat` `label:core` เพิ่ม `examples/vsp-ui` ใน `pnpm-workspace.yaml`
- [ ] `type:feat` `label:config` แก้ `package.json` — name, port 3001, เอา DB deps ออก
- [ ] `type:feat` `label:config` แก้ `next.config.ts` — transpilePackages สำหรับ json-render workspace
- [ ] `type:feat` `label:config` ตั้ง `tailwind.config.ts` ให้ scan `components/**`
- [ ] `type:feat` `label:config` สร้าง `.env.example` (ไม่ต้องมี DATABASE_URL, เก็บแค่ port)
- [ ] `type:fix` `label:config` ลบไฟล์ที่ไม่ต้องการออก: `drizzle/`, `db/`, form component files

**[checkpoint: Phase 0]**

---

## Phase 1 — Types & Data

- [x] `type:feat` `label:core` สร้าง `types/story.ts` — mirror types จาก `bl1nk-visual-mcp/src/types.ts`
  - `StoryGraph`, `Character`, `Conflict`, `EventNode`, `Relationship`, `ValidationResult`
  - **Status**: Done - defined in `tauri-app/src/types/index.ts`
- [x] `type:feat` `label:core` สร้าง `lib/mock-data.ts` — Hero's Journey StoryGraph
  - ใช้ข้อมูลจาก `tests/test-render.mjs` ใน bl1nk-visual-mcp
  - รวม validation result (isValid: true, 0 errors)
  - รวม mermaid string (output จาก `toMermaid()`)
  - **Status**: Done - created at `tauri-app/src/lib/mock-data.ts`
- [ ] `type:feat` `label:core` สร้าง `lib/mcp-tools.ts` — รายการ 16 tools + descriptions (ดู TOOL_MAPPING.md)
- [ ] `type:feat` `label:core` สร้าง `lib/catalog.ts` — `defineCatalog()` ครบ 9 components + 5 actions

**[checkpoint: Phase 1]** - Partial (Tauri app implementation)

---

## Phase 2 — UI Primitives

- [x] `type:feat` `label:component` สร้าง `components/ui/badge.tsx` — variant: default / outline
  - **Status**: Done - using Tailwind inline classes
- [x] `type:feat` `label:component` สร้าง `components/ui/card.tsx` — Card / CardHeader / CardContent
  - **Status**: Done - using Tailwind styled divs
- [ ] `type:feat` `label:component` สร้าง `components/ui/button.tsx` — variant: default / ghost / outline
- [ ] `type:feat` `label:component` สร้าง `components/ui/collapsible.tsx` — สำหรับ MermaidViewer section

**[checkpoint: Phase 2]**

---

## Phase 3 — Story Components

- [x] `type:feat` `label:component` `label:high-priority` สร้าง `components/story/StatCard.tsx`
  - Props: `label`, `value`, `color` (indigo/blue/rose/emerald)
  - **Status**: Done - `tauri-app/src/components/StatCard.tsx`
- [x] `type:feat` `label:component` `label:high-priority` สร้าง `components/story/ActDistributionChart.tsx`
  - Visual bar chart
  - สี: act1=indigo / act2=blue / act3=rose
  - **Status**: Done - `tauri-app/src/components/ActDistributionChart.tsx`
- [x] `type:feat` `label:component` `label:high-priority` สร้าง `components/story/StoryTimeline.tsx`
  - Group events ตาม act (1 / 2 / 3)
  - แต่ละ event: importance badge + label
  - Color map ตาม SPEC §9
  - **Status**: Done - `tauri-app/src/components/StoryTimeline.tsx`
- [x] `type:feat` `label:component` สร้าง `components/story/CharacterCard.tsx`
  - Role badge (protagonist/antagonist/mentor/supporting)
  - Arc display: `arcStart → arcEnd` ถ้ามี
  - Traits เป็น inline chips
  - **Status**: Done - `tauri-app/src/components/CharacterCard.tsx`
- [x] `type:feat` `label:component` สร้าง `components/story/ConflictCard.tsx`
  - Type badge (external/internal/emotional)
  - Act introduced indicator
  - Escalation dots (ถ้า escalationCount > 0)
  - **Status**: Done - `tauri-app/src/components/ConflictCard.tsx`
- [x] `type:feat` `label:component` สร้าง `components/story/HealthCheck.tsx`
  - Midpoint ✅/❌ row
  - Climax ✅/❌ row
  - Balance score progress bar
  - **Status**: Done - `tauri-app/src/components/HealthCheck.tsx`
- [x] `type:feat` `label:component` สร้าง `components/story/ValidationPanel.tsx`
  - แสดง issues จาก `validation.issues[]`
  - Color: error=red / warning=amber / info=slate
  - ถ้า isValid=true แสดง "No issues ✨"
  - รวม recommendations list
  - **Status**: Done - `tauri-app/src/components/ValidationPanel.tsx`
- [x] `type:feat` `label:component` สร้าง `components/story/MermaidViewer.tsx`
  - Display for mermaid diagram
  - Collapsible wrapper
  - **Status**: Done - `tauri-app/src/components/MermaidViewer.tsx`
- [ ] `type:feat` `label:component` สร้าง `components/story/ToolCard.tsx`
  - Tool name (monospace)
  - Description text
  - Input count badge

**[checkpoint: Phase 3]** - Partial

---

## Phase 4 — Registry & Catalog Wire-up

- [ ] `type:feat` `label:core` สร้าง `components/registry/index.tsx`
  - `defineRegistry()` map ทุก component จาก Phase 3
  - export `registry` สำหรับใช้ใน `<Renderer>`
- [ ] `type:feat` `label:core` ตรวจสอบ catalog ใน `lib/catalog.ts` ตรงกับ registry
- [ ] `type:fix` `label:core` ทดสอบ Zod schema ทุก component ไม่ throw

**[checkpoint: Phase 4]**

---

## Phase 5 — Main Page

- [x] `type:feat` `label:high-priority` สร้าง `app/layout.tsx`
  - Font: Inter
  - Background: `bg-slate-50`
  - Dark mode class (optional)
  - **Status**: Done - using existing `tauri-app/index.html` setup
- [x] `type:feat` `label:high-priority` สร้าง `app/page.tsx` — DashboardPage
  - Wrap ด้วย `DataProvider` (initialData = INITIAL_STORY_DATA)
  - Wrap ด้วย `ActionProvider` (actions map → MCP tool stubs)
  - Wrap ด้วย `VisibilityProvider`
  - **Status**: Done - implemented in `tauri-app/src/App.tsx` with 4 views
- [x] `type:feat` `label:high-priority` สร้าง DashboardContent component ใน `app/page.tsx`
  - **Header**: title + genre badge + version chip + tags
  - **StatsRow**: 4× `StatCard` (characters / events / conflicts / pacing)
  - **MainGrid** (lg:grid-cols-3):
    - Left col-span-2: `ActDistributionChart` + `StoryTimeline`
    - Right col-span-1: `HealthCheck` + `ValidationPanel`
  - **CharactersSection**: grid `CharacterCard ×n`
  - **ConflictsSection**: grid `ConflictCard ×n`
  - **MermaidSection**: `MermaidViewer` (collapsible)
  - **ToolsSection**: grid-cols-3 `ToolCard ×9`
  - **Status**: Done - implemented as Editor/Graph/Timeline/Insights views

**[checkpoint: Phase 5]** - Done for Tauri app

---

## Phase 6 — Polish & QA

- [ ] `type:style` `label:component` Responsive check — mobile (1-col) / tablet (2-col) / desktop (3-col)
- [ ] `type:fix` `label:core` แก้ hydration mismatch (โดยเฉพาะ MermaidViewer)
- [ ] `type:fix` `label:core` ตรวจ TypeScript — `pnpm --filter vsp-ui tsc --noEmit`
- [ ] `type:style` `label:component` Empty state ทุก section (ถ้า array ว่าง)
- [ ] `type:style` `label:component` Loading skeleton สำหรับ MermaidViewer
- [ ] `type:fix` `label:config` ตรวจ `pnpm --filter vsp-ui build` ผ่านโดยไม่มี error

**[checkpoint: Phase 6 — Phase 1 Complete]**

---

## Phase 7 — MCP Integration (Phase 2, เริ่มทีหลัง)

- [ ] `type:feat` `label:core` สร้าง `app/api/generate/route.ts`
  - รับ StoryGraph JSON จาก MCP tool output
  - ส่งให้ `generateUIStream()` พร้อม catalog
- [ ] `type:feat` `label:core` เพิ่ม `useUIStream` ใน DashboardContent
- [ ] `type:feat` `label:core` เชื่อม ActionProvider actions กับ MCP tool calls จริง
- [ ] `type:feat` `label:core` อัปเดต `_meta.ui.resourceUri` ใน server.ts ของ bl1nk-visual-mcp

---

## Phase 8 — Live Data (Phase 3, เริ่มทีหลัง)

- [ ] `type:feat` `label:core` รับ StoryGraph JSON จาก MCP server โดยตรง (WebSocket / SSE)
- [ ] `type:feat` `label:core` Auto-refresh DataProvider เมื่อ tool output เปลี่ยน

---

## Notes

- Mock data อยู่ที่ `lib/mock-data.ts` — ใช้แทน live data ตลอด Phase 1
- Components ทุกตัวใน Phase 3 ต้องเป็น `"use client"` (ใช้ hooks)
- MermaidViewer ต้อง dynamic import เท่านั้น — ห้าม SSR
- Action stubs ใน Phase 1 ใช้ `console.log` + `alert()` แบบ dashboard example

---

## Tauri App Implementation Summary

Implementation completed for `tauri-app/` as per handover plan:

| Component | File | Status |
|-----------|------|--------|
| Types | `src/types/index.ts` | ✅ Done |
| Mock Data | `src/lib/mock-data.ts` | ✅ Done |
| Color Utils | `src/lib/colors.ts` | ✅ Done |
| StatCard | `src/components/StatCard.tsx` | ✅ Done |
| ActDistributionChart | `src/components/ActDistributionChart.tsx` | ✅ Done |
| StoryTimeline | `src/components/StoryTimeline.tsx` | ✅ Done |
| CharacterCard | `src/components/CharacterCard.tsx` | ✅ Done |
| ConflictCard | `src/components/ConflictCard.tsx` | ✅ Done |
| MermaidViewer | `src/components/MermaidViewer.tsx` | ✅ Done |
| HealthCheck | `src/components/HealthCheck.tsx` | ✅ Done |
| ValidationPanel | `src/components/ValidationPanel.tsx` | ✅ Done |
| App (Main) | `src/App.tsx` | ✅ Done |

Views implemented:
- **Editor**: Character cards + Conflict cards
- **Graph**: Header + MermaidViewer
- **Timeline**: StoryTimeline component
- **Insights**: Full dashboard with stats, charts, validation
