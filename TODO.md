---
title: TODO - Visual Story Planner MCP UI
description: Source of truth for all implementation tasks
status: in_progress
last_updated: 2026-03-26
owner: dev-team
---

# TODO.md — Visual Story Planner MCP UI

> **Source of truth** สำหรับงานทั้งหมด
> Status: `[ ]` todo · `[~]` in progress · `[x]` done
> Format: `type:feat/fix/arc/style` · `label:core/high-priority/component/config`

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
- [ ] `type:feat` `label:core` สร้าง `lib/mcp-tools.ts` — รายการ 9 tools + descriptions
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