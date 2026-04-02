# AGENTS.md — craft-blog-cms

> Next.js blog/CMS — ORPHANED PACKAGE
> Last updated: 2026-04-03

---

## Status: ⚠️ ORPHANED — Decision Required

This package is currently orphaned with no visible integration to the core architecture.

---

## Decision: ARCHIVE

**Recommendation**: Archive this package (move to separate repository or branch).

### Rationale

1. No dependencies on `@bl1nk/visual-mcp`
2. No visible integration with MCP output
3. Separate concern (blog/CMS vs story visualization)
4. Adds build complexity to monorepo

### Next Steps

- [ ] Move to separate repository or `archive/` branch
- [ ] Remove from monorepo
- [ ] Update root README with archive notice
- [ ] Remove from pnpm recursive builds

---

## Current State (If Keeping)

### Role

Next.js-based blog/CMS for publishing story content.

### Input

- Story content (markdown, JSON)
- User-generated content via CMS interface

### Output

- Published blog posts
- SEO-optimized pages

### Dependencies

- `next`, `react`, `react-dom`
- `lucide-react`, `sonner`, `js-cookie`
- `tailwindcss`

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Next.js production build |
| `npm run start` | Next.js start |

---

## Integration with @bl1nk/visual-mcp (If Keeping)

If this package is kept, it should:

- Add `@bl1nk/visual-mcp` as dependency
- Consume StoryGraph JSON for story visualization embeds
- Use export functions to generate story content for blog posts
