# bl1nk-visual-mcp Monorepo

ระบบวิเคราะห์และจัดระเบียบเรื่องราว (Story Analysis & Organization System)

> **Version:** 3.0.0 | **Status:** Production Ready

---

## 📦 Packages

### 1. **@bl1nk/visual-mcp** (`packages/bl1nk/`)

MCP Server หลักสำหรับวิเคราะห์ story text และสร้าง StoryGraph JSON

**Tools (16 total):**

#### Granular Tools (11 tools — recommended)

| Category | Tool | Description |
|----------|------|-------------|
| Analysis | `analyze_story` | Parse story text → StoryGraph JSON |
| Export | `export_mermaid` | Mermaid diagram markdown |
| Export | `export_canvas` | Canvas JSON (Obsidian/React Flow) |
| Export | `export_dashboard` | HTML dashboard (Chart.js + Tailwind) |
| Export | `export_markdown` | Structured Markdown document |
| Export | `export_mcp_ui_dashboard` | MCP-UI compatible HTML dashboard |
| Validation | `validate_story_structure` | 3-act structure validation |
| Extract | `extract_characters` | Character data from StoryGraph |
| Extract | `extract_conflicts` | Conflict data from StoryGraph |
| Extract | `build_relationship_graph` | Relationship graph |
| Search | `exa_search_story` | External story research (Exa AI) |

#### Legacy Tools (4 tools — backward compat)

| Tool | Description |
|------|-------------|
| `search_entries` | Extract entities from story text (with templates) |
| `validate_story` | Quick validation from text input |
| `generate_artifacts` | Generate ALL formats at once |
| `sync_github` | Push files to GitHub (not implemented) |

**Usage:**
```bash
cd packages/bl1nk
npm install
npm run build
npm start
```

### 2. **@bl1nk/github-sync** (`packages/github-sync/`)

GitHub App สำหรับ sync markdown/CSV files ไป Notion อัตโนมัติ

**Features:**
- Webhook handler สำหรับ GitHub push events
- Markdown frontmatter parser
- CSV sync ไป Notion databases
- Relation builder

**Usage:**
```bash
cd packages/github-sync
npm install
npm run build
npm start
```

### 3. **tauri-app** (`packages/tauri-app/`)

Desktop Application (React + Vite + Tauri) สำหรับดูและจัดการ story entities

**Features:**
- StoryGraph visualization
- Character relationship graph
- Timeline view
- Markdown preview

**Usage:**
```bash
cd packages/tauri-app
npm install
npm run tauri:dev
```

### 4. **craft-blog-cms** (`packages/craft-blog-cms/`) — ⚠️ Orphaned

Next.js blog/CMS — ไม่มี integration กับ core architecture
**Recommendation:** Archive หรือแยกไป repo อื่น

---

## 🚀 Development

### Install Dependencies
```bash
pnpm install
```

### Build All
```bash
pnpm run build
```

### Test All
```bash
pnpm run test
```

### Develop Individual Package
```bash
cd packages/bl1nk
pnpm run dev  # watch mode

cd packages/tauri-app
pnpm run tauri:dev  # Tauri dev mode
```

---

## 📁 Project Structure

```
visual-story-extension/
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System architecture + dataflow
│   ├── TOOL_MAPPING.md           # Complete tool mapping (16 tools)
│   ├── PROJECT_SUMMARY.md        # Project history (Phase 1 + 2)
│   ├── TAURI-APP.md              # Tauri app role
│   ├── GITHUB-SYNC.md            # GitHub sync role
│   └── CRAFT-BLOG-CMS.md         # Orphaned package decision
│
├── packages/
│   ├── bl1nk/                    # Core MCP Server
│   │   ├── src/
│   │   │   └── index.ts          # MCP server entry, tool registration
│   │   ├── tools/
│   │   │   ├── index.ts          # Tool definitions (GRANULAR_TOOLS + BL1NK_VISUAL_TOOLS)
│   │   │   ├── execute.ts        # Tool executors
│   │   │   ├── search-entries.ts # Standalone search tool
│   │   │   └── generate-artifacts.ts
│   │   ├── exporters/            # Output formatters
│   │   │   ├── mermaid.ts
│   │   │   ├── canvas.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── markdown.ts
│   │   │   └── mcp-ui-dashboard.ts
│   │   ├── analyzer.ts           # Story text → StoryGraph
│   │   ├── validators.ts         # Structural validation
│   │   ├── exa-search.ts         # External search
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── package.json
│   │
│   ├── github-sync/              # GitHub → Notion sync
│   │   ├── src/
│   │   │   ├── markdown-parser.ts
│   │   │   ├── csv-sync.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── tauri-app/                # Desktop UI
│   │   ├── src/
│   │   └── package.json
│   │
│   └── craft-blog-cms/           # ⚠️ Orphaned
│       └── package.json
│
├── docs/                         # Documentation (see 📚 Documentation section)
├── commands/                     # Qwen CLI commands
├── skills/                       # Qwen CLI skills
├── TODO.md                       # Project roadmap
├── AGENTS.md                     # Root agent instructions
├── GEMINI.md                     # Gemini AI context
├── CLAUDE.md                     # Claude Code context
├── QWEN.md                       # Qwen AI context
├── package.json                  # Root package (v3.0.0)
└── pnpm-workspace.yaml
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture, dataflow diagrams, integration points |
| [`docs/TOOL_MAPPING.md`](docs/TOOL_MAPPING.md) | Complete mapping of all 16 tools (schema, executor, API) |
| [`docs/PROJECT_SUMMARY.md`](docs/PROJECT_SUMMARY.md) | Project history — Phase 1 (Conductor) + Phase 2 (Architecture) |
| [`docs/TAURI-APP.md`](docs/TAURI-APP.md) | Tauri app role and dependencies |
| [`docs/GITHUB-SYNC.md`](docs/GITHUB-SYNC.md) | GitHub sync role and data flow |
| [`docs/CRAFT-BLOG-CMS.md`](docs/CRAFT-BLOG-CMS.md) | Orphaned package decision |
| [`TODO.md`](TODO.md) | Project roadmap and task tracking |
| [`AGENTS.md`](AGENTS.md) | Root agent instructions, code style, commands |
| [`GEMINI.md`](GEMINI.md) | Gemini AI system context |
| [`CLAUDE.md`](CLAUDE.md) | Claude Code project context |
| [`QWEN.md`](QWEN.md) | Qwen AI project context |
| [`packages/tauri-app/AGENTS.md`](packages/tauri-app/AGENTS.md) | Tauri app role and dependencies |
| [`packages/github-sync/AGENTS.md`](packages/github-sync/AGENTS.md) | GitHub sync role and data flow |
| [`packages/craft-blog-cms/AGENTS.md`](packages/craft-blog-cms/AGENTS.md) | Orphaned package decision |

---

## 🔧 Configuration

### MCP Client Config

```json
{
  "mcpServers": {
    "bl1nk": {
      "command": "node",
      "args": ["${workspaceFolder}/packages/bl1nk/dist/index.js"],
      "env": {
        "EXA_API_KEY": "${env:EXA_API_KEY}"
      }
    }
  }
}
```

### Environment Variables

**packages/bl1nk/.env:**
```bash
# EXA_API_KEY=your_exa_api_key
```

**packages/github-sync/.env:**
```bash
# GITHUB_WEBHOOK_SECRET=your_webhook_secret
# NOTION_API_KEY=your_notion_api_key
# NOTION_DATABASE_ID=your_notion_database_id
```

---

## 📝 License

Apache-2.0
