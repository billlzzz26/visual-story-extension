# .agents/skills — Central Skill Repository

This directory is the **single source of truth** for all AI agent skills.

## Structure

```
.agents/skills/
├── defuddle/
├── json-canvas/
├── qwencode-craw/
├── story-analysis/
├── story-export/
├── character-analysis/
├── character-voice/
├── conflict-detection/
├── structural-audit/
├── arc-optimization/
├── theme-extraction/
├── mermaid/
├── obsidian-cli/
├── obsidian-markdown/
├── ckm-banner-design/
├── creat-specifications/
└── agents-reflection-skills/
```

## Sync

Run after adding/modifying skills:

```powershell
.\scripts\sync-skills.ps1
```

This copies all skills to:
- `.qwen/skills/` — Qwen Code
- `.claude/skills/` — Claude Code
- `skills/` — Gemini CLI (auto-discover)
- `.kilo/skills/` — Kilo Code
