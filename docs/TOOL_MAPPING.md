# TOOL_MAPPING.md — bl1nk-visual-mcp

> Complete mapping of all 15 tools (11 granular + 4 legacy + 1 standalone)
> Last updated: 2026-04-03

---

## Granular Tools (11 tools — Source of Truth)

These tools are defined in `Schemas` and executed via `executeGranularTool`.

### 1. analyze_story

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.analyze_story` |
| **Executor** | `executeGranularTool('analyze_story', args)` |
| **Public API** | `analyze_story` |
| **Description** | Parse story text into StoryGraph JSON |
| **Input** | `text: string`, `depth?: 'basic' | 'detailed' | 'deep'`,`includeMetadata?: boolean` |
| **Output** | StoryGraph JSON object |
| **Implementation** | Calls `buildInitialGraph(text)` |

### 2. export_mermaid

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.export_mermaid` |
| **Executor** | `executeGranularTool('export_mermaid', args)` |
| **Public API** | `export_mermaid` |
| **Description** | Export StoryGraph as Mermaid diagram markdown |
| **Input** | `graph: StoryGraph`, `includeMetadata?: boolean`, `style?: 'default' | 'dark' | 'minimal'` |
| **Output** | Mermaid diagram string |
| **Implementation** | Calls `toMermaid(graph, options)` |

### 3. export_canvas

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.export_canvas` |
| **Executor** | `executeGranularTool('export_canvas', args)` |
| **Public API** | `export_canvas` |
| **Description** | Export StoryGraph as Canvas JSON (Obsidian/React Flow) |
| **Input** | `graph: StoryGraph`, `includeMetadata?: boolean`, `autoLayout?: boolean` |
| **Output** | Canvas JSON object |
| **Implementation** | Calls `toCanvasJSON(graph, options)` |

### 4. export_dashboard

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.export_dashboard` |
| **Executor** | `executeGranularTool('export_dashboard', args)` |
| **Public API** | `export_dashboard` |
| **Description** | Export StoryGraph as HTML dashboard (Chart.js + Tailwind) |
| **Input** | `graph: StoryGraph`, `includeStats?: boolean`, `includeRecommendations?: boolean` |
| **Output** | HTML string |
| **Implementation** | Calls `toDashboard(graph, options)` |

### 5. export_markdown

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.export_markdown` |
| **Executor** | `executeGranularTool('export_markdown', args)` |
| **Public API** | `export_markdown` |
| **Description** | Export StoryGraph as structured Markdown document |
| **Input** | `graph: StoryGraph`, `includeMetadata?: boolean`, `includeAnalysis?: boolean` |
| **Output** | Markdown string (wrapped in artifact format) |
| **Implementation** | Calls `toMarkdown(graph, options)` |

### 6. validate_story_structure

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.validate_story_structure` |
| **Executor** | `executeGranularTool('validate_story_structure', args)` |
| **Public API** | `validate_story_structure` |
| **Description** | Validate StoryGraph against 3-act structure rules |
| **Input** | `graph: StoryGraph`, `strict?: boolean`, `includeRecommendations?: boolean` |
| **Output** | ValidationResult JSON |
| **Implementation** | Calls `validateGraph(graph, strict)` |

### 7. extract_characters

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.extract_characters` |
| **Executor** | `executeGranularTool('extract_characters', args)` |
| **Public API** | `extract_characters` |
| **Description** | Extract character data from StoryGraph |
| **Input** | `graph: StoryGraph`, `detailed?: boolean` |
| **Output** | Array of character objects |
| **Implementation** | Extracts `graph.characters` |

### 8. extract_conflicts

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.extract_conflicts` |
| **Executor** | `executeGranularTool('extract_conflicts', args)` |
| **Public API** | `extract_conflicts` |
| **Description** | Extract conflict data from StoryGraph |
| **Input** | `graph: StoryGraph`, `includeEscalation?: boolean` |
| **Output** | Array of conflict objects |
| **Implementation** | Extracts `graph.conflicts` |

### 9. build_relationship_graph

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.build_relationship_graph` |
| **Executor** | `executeGranularTool('build_relationship_graph', args)` |
| **Public API** | `build_relationship_graph` |
| **Description** | Build relationship graph from StoryGraph |
| **Input** | `graph: StoryGraph`, `includeStats?: boolean` |
| **Output** | Relationship data with optional stats |
| **Implementation** | Extracts `graph.relationships` |

### 10. export_mcp_ui_dashboard

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.export_mcp_ui_dashboard` |
| **Executor** | `executeGranularTool('export_mcp_ui_dashboard', args)` |
| **Public API** | `export_mcp_ui_dashboard` |
| **Description** | Export StoryGraph as MCP-UI compatible HTML dashboard |
| **Input** | `graph: StoryGraph`, `includeStats?: boolean`, `includeRecommendations?: boolean` |
| **Output** | HTML string |
| **Implementation** | Calls `toMcpUiDashboard(graph, options)` |

### 11. exa_search_story

| Field | Value |
|-------|-------|
| **Schema** | `Schemas.exa_search_story` |
| **Executor** | `executeGranularTool('exa_search_story', args)` |
| **Public API** | `exa_search_story` |
| **Description** | Search external references for story research |
| **Input** | `query: string`, `category?: enum`, `numResults?: number` |
| **Output** | Formatted search results |
| **Implementation** | Calls `searchStoryReferences(query, category, numResults)` |

---

## Legacy Tools (4 tools — Backward Compatibility, Deprecated)

These tools are defined in `BL1NK_VISUAL_TOOLS` and executed via `executeStoryTool`.

### 1. search_entries

| Field | Value |
|-------|-------|
| **Schema** | `searchEntriesTool.inputSchema` (standalone) |
| **Executor** | `executeStoryTool('search_entries', args)` |
| **Public API** | `search_entries` |
| **Description** | Extract entities (characters, scenes, locations) from story text |
| **Input** | `text: string`, `chapterNumber?: number`, `extractOptions?: object` |
| **Output** | Markdown files summary |
| **Implementation** | Calls `searchEntriesTool.execute(args)` |

### 2. validate_story

| Field | Value |
|-------|-------|
| **Schema** | None (legacy, uses empty schema) |
| **Executor** | `executeStoryTool('validate_story', args)` |
| **Public API** | `validate_story` |
| **Description** | Validate story structure (3-act, climax, midpoint) |
| **Input** | `text: string`, `strict?: boolean` |
| **Output** | ValidationResult JSON |
| **Implementation** | Calls `buildInitialGraph(text)` then `validateGraph(graph, strict)` |

### 3. generate_artifacts

| Field | Value |
|-------|-------|
| **Schema** | `generateArtifactsTool.inputSchema` (standalone) |
| **Executor** | `executeStoryTool('generate_artifacts', args)` |
| **Public API** | `generate_artifacts` |
| **Description** | Generate ALL artifacts automatically (mermaid, canvas, markdown, html, csv) |
| **Input** | `graph: StoryGraph` |
| **Output** | All format files |
| **Implementation** | Calls `generateArtifactsTool.execute(args)` |

### 4. sync_github

| Field | Value |
|-------|-------|
| **Schema** | None (legacy, uses empty schema) |
| **Executor** | `executeStoryTool('sync_github', args)` |
| **Public API** | `sync_github` |
| **Description** | Push generated files to GitHub repository |
| **Input** | None |
| **Output** | Not implemented message |
| **Implementation** | Returns "not implemented" message |

---

## Standalone Tool (1 tool — Registered Separately)

### search_entries (standalone registration)

| Field | Value |
|-------|-------|
| **Schema** | `searchEntriesTool.inputSchema` |
| **Executor** | `searchEntriesTool.execute(args)` |
| **Public API** | `search_entries` |
| **Description** | Search and extract ALL entities from story text |
| **Note** | Registered separately due to having its own tool definition with template rendering |

---

## Tool Registration Summary

| Tool Type | Count | Registration Method |
|-----------|-------|-------------------|
| Granular | 11 | Loop over `GRANULAR_TOOLS` + `Schemas` |
| Legacy | 4 | Loop over `BL1NK_VISUAL_TOOLS` (empty schemas) |
| Standalone | 1 | Direct registration (`searchEntriesTool`) |
| **Total** | **16** | |

---

## Files Reference

| File | Purpose |
|------|---------|
| `packages/bl1nk/src/index.ts` | MCP server setup, tool registration |
| `packages/bl1nk/tools/index.ts` | Tool definitions (GRANULAR_TOOLS, BL1NK_VISUAL_TOOLS) |
| `packages/bl1nk/tools/execute.ts` | Tool executors (executeGranularTool, executeStoryTool) |
| `packages/bl1nk/tools/search-entries.ts` | Standalone search_entries tool |
| `packages/bl1nk/tools/generate-artifacts.ts` | Standalone generate_artifacts tool |
