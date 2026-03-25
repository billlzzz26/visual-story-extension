---
title: Visual Story Planner v3 (VSP3)
description: Production-ready Gemini CLI extension for structured story analysis, planning, and optimization
status: active
last_updated: 2026-03-26
owner: dev-team
---

# Visual Story Planner v3 (VSP3)

## Overview

Visual Story Planner v3 is a **production-ready Gemini CLI extension** for structured story analysis, planning, and optimization. It uses a **canvas-first approach** with Mermaid export capabilities, built on the **Model Context Protocol (MCP)** framework.

### Key Features

- **Structured Story Analysis** - Convert narrative text into structured StoryGraph JSON
- **Three-Act Structure Validation** - Ensure proper story structure
- **Character Arc Tracking** - Analyze character development and consistency
- **Conflict Management** - Detect, map, and optimize story conflicts
- **Pacing Analysis** - Optimize tension distribution and narrative flow
- **Multiple Export Formats** - Mermaid, Canvas JSON, HTML Dashboard, Markdown, JSON
- **Comprehensive Validation** - 50+ validation rules with actionable suggestions
- **Skill System** - 4 specialized analysis skills for deep insights
- **9 MCP Tools** - Powerful tools for story manipulation and analysis
- **Tauri Desktop App** - Native desktop application with React + Tailwind

---

## Installation

### Prerequisites

- Node.js 18+
- Gemini CLI installed
- TypeScript knowledge (optional)

### Quick Setup

```bash
# 1. Create extension
gemini extensions new story-planner mcp-server
cd story-planner

# 2. Install dependencies
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node

# 3. Create directory structure
mkdir -p src/exporters commands/story skills/{structural-audit,character-analysis,conflict-detection,arc-optimization}

# 4. Copy all files from artifacts
# (See Complete File Structure section below)

# 5. Build
npm run build

# 6. Link to Gemini
gemini extensions link .

# 7. Test
gemini story analyze "Once upon a time..."
```

### Tauri Desktop App

```bash
# Navigate to Tauri app directory
cd tauri-app

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run tauri:build
```

---

## Quick Start

### Example 1: Analyze a Story

```bash
gemini story analyze "
Once upon a time, a young girl named Alice fell down a rabbit hole.
She met the Cheshire Cat, a mysterious character who guided her.
Alice faced the Queen of Hearts, her main antagonist.
Through trials and challenges, Alice discovered her own courage.
Finally, she woke up, forever changed by her adventure.
" --depth detailed
```

**Output:** StoryGraph JSON with character arcs, conflicts, events, and recommendations

### Example 2: Validate Story Structure

```bash
gemini story validate --strict true --include-recommendations true
```

**Output:** Validation report with issues and improvement suggestions

### Example 3: Export as Diagram

```bash
gemini story export --format mermaid --include-metadata true
```

**Output:** Mermaid diagram code for visualization

### Example 4: Perform Audit

```bash
gemini story audit --depth deep --focus-areas all
```

**Output:** Comprehensive audit with findings and recommendations

---

## Complete File Structure

```
story-planner/
├── src/
│   ├── types.ts                    # Type definitions (300+ lines)
│   ├── schema.ts                   # Zod schemas
│   ├── analyzer.ts                 # Graph building (600+ lines)
│   ├── validators.ts               # Validation engine (500+ lines)
│   ├── server.ts                   # MCP server (400+ lines)
│   └── exporters/
│       ├── mermaid.ts              # Mermaid export
│       ├── canvas.ts               # Canvas JSON export
│       ├── dashboard.ts            # HTML dashboard
│       ├── markdown.ts             # Markdown export
│       └── json.ts                 # JSON export
│
├── commands/
│   └── story/
│       ├── analyze.toml            # Analyze command
│       ├── export.toml             # Export command
│       ├── validate.toml           # Validate command
│       ├── audit.toml              # Audit command
│       └── refine.toml             # Refine command
│
├── skills/
│   ├── structural-audit/
│   │   └── SKILL.md                # Structural audit skill
│   ├── character-analysis/
│   │   └── SKILL.md                # Character analysis skill
│   ├── conflict-detection/
│   │   └── SKILL.md                # Conflict detection skill
│   └── arc-optimization/
│       └── SKILL.md                # Arc optimization skill
│
├── tauri-app/                      # Tauri desktop application
│   ├── src/
│   │   ├── App.tsx                # Main React app
│   │   ├── components/            # UI components
│   │   ├── lib/                   # Mock data & utilities
│   │   └── types/                 # TypeScript types
│   ├── package.json               # Dependencies
│   └── playwright.config.ts       # E2E tests
│
├── dist/                           # Compiled output (generated)
├── GEMINI.md                       # System context (400+ lines)
├── gemini-extension.json           # Extension configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
└── README.md                       # This file
```

---

## Tauri App Overview

The `tauri-app/` directory contains a Tauri 2.0 desktop application:

### Tech Stack

- **Frontend**: React 18 + Tailwind CSS 3
- **Desktop**: Tauri 2.0
- **Testing**: Vitest + Playwright
- **Language**: TypeScript 5.x

### Features

- **4 Views**: Editor, Graph, Timeline, Insights
- **Mock Data**: Hero's Journey (Star Wars) sample
- **Components**: StatCard, Charts, Timeline, Character/Conflict Cards, Validation Panel
- **Responsive Design**: Works on desktop and tablet

### Running Tests

```bash
# Unit tests
cd tauri-app
npm run test

# E2E tests with Playwright
npx playwright test

# Open Playwright report
npx playwright show-report
```

---

## Configuration

### Environment Variables

```bash
# Default export mode
VSP_DEFAULT_MODE=canvas              # Options: canvas, mermaid, dashboard

# Enable strict validation
VSP_STRICT_MODE=false                # Options: true, false

# Auto layout for canvas
VSP_AUTO_LAYOUT=true                 # Options: true, false
```

### Settings in gemini-extension.json

```json
{
  "settings": [
    {
      "name": "Default Export Mode",
      "envVar": "VSP_DEFAULT_MODE",
      "default": "canvas"
    }
  ]
}
```

---

## Commands Reference

### 1. `gemini story analyze`

Parse story text into structured StoryGraph

```bash
gemini story analyze <text> [--depth basic|detailed|deep] [--format json|markdown]
```

### 2. `gemini story export`

Export story graph in multiple formats

```bash
gemini story export [--format mermaid|canvas|dashboard|markdown|json]
```

### 3. `gemini story validate`

Validate story structure and integrity

```bash
gemini story validate [--strict true|false] [--include-recommendations true|false]
```

### 4. `gemini story audit`

Perform comprehensive structural audit

```bash
gemini story audit [--depth basic|detailed|deep] [--focus-areas all|characters|conflicts|pacing|structure]
```

### 5. `gemini story refine`

Get refinement suggestions

```bash
gemini story refine [--element characters|conflicts|pacing|dialogue|all] [--focus-character NAME]
```

---

## Tools Reference

VSP3 provides 9 powerful MCP tools:

| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| `analyze_story` | Parse story text | text, depth | StoryGraph + analysis |
| `export_mermaid` | Generate diagram | graph, style | Mermaid code |
| `export_canvas` | Interactive JSON | graph, layout | Canvas JSON |
| `export_dashboard` | HTML dashboard | graph, stats | HTML code |
| `export_markdown` | Document export | graph, sections | Markdown |
| `validate_story_structure` | Comprehensive validation | graph, strict | Issues + recommendations |
| `extract_characters` | Character analysis | graph, detailed | Character list |
| `extract_conflicts` | Conflict analysis | graph, escalation | Conflict list |
| `build_relationship_graph` | Relationship mapping | graph, stats | Relationship graph |

---

## Skills Reference

VSP3 includes 4 specialized analysis skills:

### 1. Structural Audit Skill

- **Triggers:** "audit story", "check structure"
- **Analyzes:** Three-act structure, character arcs, conflicts, pacing
- **Output:** Detailed audit report with findings

### 2. Character Analysis Skill

- **Triggers:** "analyze characters", "character development"
- **Analyzes:** Character arcs, motivations, relationships, consistency
- **Output:** Character analysis report with scores

### 3. Conflict Detection Skill

- **Triggers:** "analyze conflicts", "conflict optimization"
- **Analyzes:** Conflict types, escalation, impact, optimization
- **Output:** Conflict analysis report with suggestions

### 4. Arc Optimization Skill

- **Triggers:** "optimize story", "improve pacing"
- **Analyzes:** Pacing, emotional arc, tension, narrative flow
- **Output:** Arc optimization report with improvements

---

## Validation Rules

### Error Level (50+ rules)

- Missing required fields (title, characters, events)
- Invalid references (character IDs, conflict IDs)
- Missing acts (Act 1, 2, or 3)
- No protagonist
- Empty descriptions
- Inconsistent data

### Warning Level

- Missing climax or midpoint
- No conflicts
- Incomplete character arcs
- Unbalanced act distribution
- Characters not in events
- No conflict resolution

### Info Level

- Optimization suggestions
- Best practice recommendations
- Enhancement ideas

---

## Output Formats

### Mermaid Format
```
graph TD
  A["Event 1"] --> B["Event 2"]
  B --> C["Event 3"]
```

### Canvas Format
```json
{
  "nodes": [...],
  "edges": [...],
  "metadata": {...}
}
```

### Dashboard Format
```html
<html>
  <head>...</head>
  <body>
    <h1>Story Analysis</h1>
    <div>Statistics and charts</div>
  </body>
</html>
```

---

## Usage Workflows

### Workflow 1: Quick Analysis (5 minutes)
1. gemini story analyze "Your story"
2. Review StoryGraph output
3. Check validation results

### Workflow 2: Deep Audit (15 minutes)
1. gemini story analyze "Your story" --depth deep
2. gemini story audit --depth deep
3. Review all findings
4. Apply recommendations

### Workflow 3: Export & Visualize (10 minutes)
1. gemini story analyze "Your story"
2. gemini story export --format mermaid
3. gemini story export --format canvas
4. gemini story export --format dashboard

### Workflow 4: Desktop App (Interactive)
1. cd tauri-app && npm run dev
2. Navigate between Editor/Graph/Timeline/Insights views
3. View Hero's Journey sample data

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Story must have a title" | Add title to story metadata |
| "Missing Act 2 events" | Add more events to Act 2 |
| "No protagonist" | Ensure one character is marked as protagonist |
| "Invalid character reference" | Check all character IDs are valid |
| "Unbalanced acts" | Distribute events: 25%-50%-25% |
| Export fails | Run validate first, fix errors |
| Tools not working | Rebuild: `npm run build` |
| Extension not found | Link again: `gemini extensions link .` |

---

## Best Practices

1. **Always Validate First** - Run validation before export
2. **Use Appropriate Depth** - basic for quick checks, deep for audit
3. **Follow Three-Act Structure** - 25%-50%-25% distribution
4. **Develop Characters Fully** - Define arcs, motivations, fears
5. **Escalate Conflicts Properly** - Build to climax
6. **Maintain Pacing** - Balance event distribution
7. **Use Skills Strategically** - Different skills for different needs
8. **Export Appropriately** - Choose format based on use case

---

## Documentation

- **Setup Guide:** See Installation section
- **Command Reference:** See Commands section
- **Tools Reference:** See Tools section
- **Skills Reference:** See Skills section
- **Type Definitions:** See types.ts
- **System Context:** See GEMINI.md
- **Tauri App:** See tauri-app/ directory

---

## Contributing

To contribute improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

MIT License - Feel free to use and modify

---

## Learning Resources

- **Three-Act Structure:** https://en.wikipedia.org/wiki/Three-act_structure
- **Character Arcs:** https://en.wikipedia.org/wiki/Character_arc
- **Story Structure:** https://en.wikipedia.org/wiki/Narrative_structure
- **Mermaid Docs:** https://mermaid.js.org/
- **MCP Documentation:** https://modelcontextprotocol.io/

---

## Support

For issues, questions, or suggestions:

- Check troubleshooting section
- Review documentation
- Check GEMINI.md for system context
- Review example workflows

---

**Version:** 3.0.0
**Status:** Production Ready
**Last Updated:** 2026-03-26
**Maintained By:** Story Planner Team