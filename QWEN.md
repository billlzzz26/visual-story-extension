# Visual Story Planner v3 (VSP3) - Project Context

## Project Overview

**Visual Story Planner v3** is a production-ready **Gemini CLI extension** for structured story analysis, planning, and optimization. It uses the **Model Context Protocol (MCP)** framework to provide a canvas-first approach with Mermaid export capabilities.

### Core Purpose
Converts natural-language story text into structured **StoryGraph JSON** and provides multiple export formats for visualization and analysis.

### Key Features
- ✅ Structured Story Analysis - Parse narrative text into StoryGraph JSON
- ✅ Three-Act Structure Validation - Ensure proper story structure (25%-50%-25%)
- ✅ Character Arc Tracking - Analyze character development and consistency
- ✅ Conflict Management - Detect, map, and optimize story conflicts
- ✅ Multiple Export Formats - Mermaid, Canvas JSON, HTML Dashboard, Markdown, JSON
- ✅ Comprehensive Validation - 50+ validation rules with actionable suggestions
- ✅ Skill System - Specialized analysis skills for deep insights
- ✅ 9 MCP Tools - Powerful tools for story manipulation and analysis

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Language** | TypeScript 5.3+ |
| **Package Manager** | pnpm |
| **Framework** | Model Context Protocol (MCP) SDK |
| **Validation** | Zod |
| **Output Formats** | Mermaid, Canvas JSON, Markdown, HTML |

---

## Project Structure

```
visual-story-extension/
├── src/
│   ├── types.d.ts              # TypeScript type declarations
│   ├── schema.ts               # Core data types (Character, Conflict, EventNode, StoryGraph)
│   ├── analyzer.ts             # Story text parsing and graph building
│   ├── validators.ts           # Validation engine (50+ rules)
│   ├── server.ts               # MCP server with tool registrations
│   └── exporters/
│       ├── mermaid.ts          # Mermaid diagram export
│       └── json.ts             # Canvas JSON export
│
├── commands/
│   └── story/
│       ├── analyze.toml        # `gemini story analyze` command
│       └── export.toml         # `gemini story export` command
│
├── skills/
│   └── structural-audit/
│       └── SKILL.md            # Structural audit skill definition
│
├── dist/                       # Compiled JavaScript output
├── GEMINI.md                   # System context for Gemini AI
├── gemini-extension.json       # Extension configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # User documentation
```

---

## Building and Running

### Prerequisites
- Node.js 18+
- pnpm (or npm)
- Gemini CLI installed

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
```

### Link to Gemini CLI

```bash
gemini extensions link .
```

### Usage Examples

```bash
# Analyze a story
gemini story analyze "Once upon a time..."

# Export as Mermaid diagram
gemini story export --format mermaid

# Validate story structure
gemini story validate --strict true

# Perform structural audit
gemini story audit --depth deep
```

---

## Core Data Model (StoryGraph)

### Schema Types (`src/schema.ts`)

```typescript
StoryGraph {
  meta: { title, genre?, summary? }
  characters: Character[]
  conflicts: Conflict[]
  events: EventNode[]
  relationships: Relationship[]
}

Character {
  id: string
  name: string
  role?: string
  traits: string[]
  arc: string[]
}

Conflict {
  id: string
  type: "internal" | "external" | "emotional"
  description: string
  relatedCharacters: string[]
}

EventNode {
  id: string
  label: string
  act: 1 | 2 | 3
  importance?: "inciting" | "midpoint" | "climax" | "resolution"
  notes?: string
}

Relationship {
  from: string
  to: string
  type?: string
}
```

---

## MCP Tools

The server registers 4 core tools in `src/server.ts`:

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `analyze_story` | Parse story text into StoryGraph | `text: string` | StoryGraph JSON + validation |
| `export_mermaid` | Generate Mermaid diagram | `graph: StoryGraph` | Mermaid code |
| `export_canvas` | Generate Canvas JSON | `graph: StoryGraph` | Canvas-compatible JSON |
| `validate_story_structure` | Validate structure | `graph: StoryGraph` | Issues array |

---

## Development Conventions

### Code Style
- **Module System:** ES Modules (`"type": "module"` in package.json)
- **Imports:** Use `.js` extension for relative imports (TypeScript emits ES modules)
- **Naming:** camelCase for variables/functions, PascalCase for types/classes
- **Types:** Strict TypeScript enabled (`"strict": true`)

### Architecture Patterns
- **Functional:** Pure functions for analysis and export (`analyzer.ts`, `exporters/*.ts`)
- **Schema-First:** Types defined in `schema.ts`, validated with Zod
- **Validation-First:** Always validate before exporting

### File Organization
- Source files in `src/` root (flat structure)
- Exporters in `src/exporters/` subdirectory
- Commands defined in `commands/story/*.toml`
- Skills in `skills/{skill-name}/SKILL.md`

---

## Testing Practices

Currently no formal test suite. Recommended approach:
1. Manual testing via Gemini CLI commands
2. Validate output JSON structure
3. Check Mermaid rendering in compatible viewers

---

## Key Implementation Details

### Analyzer (`src/analyzer.ts`)
- Uses regex-based heuristics for character/conflict detection
- Groups sentences into events by act keywords
- Creates sequential relationships between events
- Lightweight design (production would use LLM)

### Validator (`src/validators.ts`)
- Checks for empty graph/events
- Validates act distribution (requires all 3 acts)
- Detects duplicate event IDs
- Returns array of issue strings

### Exporters
- **Mermaid:** Groups events by act in subgraphs, sanitizes IDs
- **Canvas JSON:** Generates nodes with positions, edges for relationships

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VSP_DEFAULT_MODE` | Default export mode | `canvas` |

Options: `canvas`, `mermaid`, `dashboard`

---

## Extension Configuration (`gemini-extension.json`)

```json
{
  "name": "visual-story-planner",
  "version": "3.0.0",
  "contextFileName": "GEMINI.md",
  "mcpServers": {
    "storyPlannerServer": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}server.js"]
    }
  }
}
```

---

## System Context (`GEMINI.md`)

Defines AI behavior:
- Always convert story text to structured StoryGraph JSON
- Prefer Canvas JSON mode for client
- Use Mermaid for exports and quick visualization
- Validate structure before exporting
- Report issues with suggestions

---

## Skills System

Skills are specialized analysis modules triggered by user prompts.

### Structural Audit Skill (`skills/structural-audit/SKILL.md`)
- **Triggers:** "audit story", "check structure"
- **Analyzes:** Act balance, midpoint detection, climax strength, character arcs, conflict clarity
- **Output:** JSON with summary, issues, recommendations, details

---

## Common Workflows

### Quick Analysis (5 min)
1. `gemini story analyze "Your story"`
2. Review StoryGraph output
3. Check validation results

### Export & Visualize (10 min)
1. Analyze story
2. Export as Mermaid for diagram tools
3. Export as Canvas JSON for web apps

### Deep Audit (15 min)
1. Analyze with `--depth deep`
2. Run audit
3. Review findings and apply recommendations

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Story must have a title" | Add title to story metadata |
| "Missing Act 2 events" | Add more events to Act 2 |
| Export fails | Run validate first, fix errors |
| Tools not working | Rebuild: `pnpm run build` |
| Extension not found | Link again: `gemini extensions link .` |

---

## Related Documentation

- **User Guide:** `README.md` - Complete user documentation
- **System Context:** `GEMINI.md` - AI behavior configuration
- **Type Definitions:** `src/schema.ts` - Core data model
- **Server Implementation:** `src/server.ts` - MCP tool registrations
