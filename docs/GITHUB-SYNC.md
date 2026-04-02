# AGENTS.md — github-sync

> GitHub webhook → Notion sync service
> Last updated: 2026-04-03

---

## Role

Listens to GitHub webhook events and syncs exported story files to Notion database.

---

## Trigger

- GitHub `push` event on specified repository/branch
- Files matching patterns: `*.md`, `*.csv`, `*.json`

---

## Input

- **GitHub Webhook Payload**: Push event with file changes
- **Expected File Formats**:
  - `story.md` — Markdown document (from `export_markdown` or `generate_artifacts`)
  - `characters.csv` — Character data
  - `events.csv` — Event data
  - `conflicts.csv` — Conflict data
  - `canvas.json` — Canvas data (optional)

---

## Output

- **Notion Database Rows**: Created/updated pages in target Notion database
- **Sync Log**: Record of processed files and results

---

## Dependencies

### Required
- `@octokit/webhooks` — GitHub webhook handling
- `@notionhq/client` — Notion API client
- `gray-matter` — Frontmatter parsing
- `csv-parse` — CSV parsing

### Optional
- `@bl1nk/visual-mcp` — If consuming exports directly (not currently implemented)

---

## Data Flow

```
1. GitHub push event
   ↓
2. Webhook received by github-sync
   ↓
3. Parse webhook payload
   ↓
4. Download changed files from GitHub
   ↓
5. Parse file content:
   - Markdown: gray-matter (frontmatter + body)
   - CSV: csv-parse (rows)
   - JSON: JSON.parse
   ↓
6. Transform to Notion format
   ↓
7. Create/update Notion pages
   ↓
8. Return sync result
```

---

## Integration with @bl1nk/visual-mcp

Currently, github-sync operates independently by consuming files from GitHub.
Future integration could:
- Import types from `@bl1nk/visual-mcp` for type-safe parsing
- Use validation functions to verify StoryGraph integrity
- Direct MCP server calls instead of file-based sync

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Bundle with esbuild |
| `npm run start` | Run bundled server |
| `npm run dev` | Watch-mode esbuild rebuild |

---

## Architecture Notes

- Stateless service (no local storage)
- Webhook endpoint should be exposed via HTTP server
- Authentication via GitHub webhook secret and Notion API key
- Error handling: retry failed Notion API calls with exponential backoff
