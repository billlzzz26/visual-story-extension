# bl1nk-visual-mcp Monorepo

ระบบวิเคราะห์และจัดระเบียบเรื่องราว (Story Analysis & Organization System)

---

## 📦 Packages

### 1. **@bl1nk/visual-mcp** (`packages/bl1nk/`)

MCP Server หลักสำหรับวิเคราะห์ story text และสร้าง entities

**Tools (3 core tools):**

**Analysis:**
- `search_entries` — แยก characters, scenes, locations จาก text

**Validation:**
- `validate_story` — ตรวจสอบ 3-act structure

**Export (ALL formats at once):**
- `generate_artifacts` — สร้าง EVERYTHING อัตโนมัติ (mermaid, canvas, markdown, html, csv)

**Sync:**
- `sync_github` — push files ไป GitHub

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

### 3. **@bl1nk/tauri-app** (`packages/tauri-app/`)

Desktop Application (React + Tauri) สำหรับดูและจัดการ story entities

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
├── packages/
│   ├── bl1nk/                    # Core MCP Server
│   │   ├── src/
│   │   │   ├── tools/
│   │   │   ├── exporters/
│   │   │   ├── templates/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── known/
│   │   ├── templates/
│   │   └── package.json
│   │
│   └── github-sync/              # GitHub App (sync → Notion)
│       ├── src/
│       │   ├── markdown-parser.ts
│       │   ├── csv-sync.ts
│       │   └── index.ts
│       └── package.json
│
├── .qwen/
│   └── mcp.json
├── tests/
├── package.json                  # Root package (workspace)
├── pnpm-workspace.yaml
└── README.md
```

---

## 🔧 Configuration

### MCP Client Config (`.qwen/mcp.json`)
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
EXA_API_KEY=your_exa_api_key
```

**packages/github-sync/.env:**
```bash
GITHUB_WEBHOOK_SECRET=your_webhook_secret
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

---

## 📝 License

Apache-2.0
