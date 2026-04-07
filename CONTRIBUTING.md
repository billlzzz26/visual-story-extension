# Contributing to bl1nk-visual-mcp

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Adding Skills](#adding-skills)
- [Security](#security)

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

## Getting Started

### Prerequisites
- **Node.js** 22+ (see `.nvmrc` for exact version)
- **pnpm** (preferred) or npm
- **Git**

### Setup
```bash
# Clone the repository
git clone https://github.com/billlzzz26/visual-story-extension.git
cd visual-story-extension

# Install dependencies
pnpm install

# Build
pnpm run build

# Run tests
pnpm test
```

### Project Structure
```
visual-story-extension/
├── packages/
│   ├── bl1nk-core/        # MCP server (main package)
│   ├── bl1nk-book/        # Craft API bookshelf app
│   ├── bl1nk-desktop/     # Tauri desktop app
│   ├── bl1nk-ide/         # AI IDE app
│   └── bl1nk-sync/        # GitHub sync service
├── .agents/skills/        # AI skills (source of truth)
├── commands/              # CLI commands (TOML)
├── hooks/                 # Event hooks
├── docs/                  # Documentation
└── scripts/               # Build and sync scripts
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture.

## Development Workflow

### 1. Read TODO.md First
Before starting any work, **always read `TODO.md`**. It is the source of truth for all tasks and priorities.
- `[ ]` = todo
- `[~]` = in progress
- `[x]` = done

### 2. Create a Branch
```bash
git checkout -b feat/your-feature-name
```

### 3. Make Changes
- Follow the [code style](#code-style) guidelines
- Write tests for new functionality
- Update documentation if behavior changes

### 4. Verify
```bash
# Build
pnpm run build

# Run all tests
pnpm test

# Lint and format
pnpm run check
```

### 5. Commit
Write clear, descriptive commit messages:
```
feat: add CSV injection prevention to escapeCSV()
fix: resolve regex race condition in search-entries.ts
docs: update ARCHITECTURE.md with new exporter flow
```

### 6. Update TODO.md
Mark completed tasks and add new ones as needed.

### 7. Push and Create PR
```bash
git push origin your-branch
gh pr create
```

## Code Style

### TypeScript
- **Strict mode** enabled — no `any`, prefer `unknown`
- **ESM imports** — use `.js` extension: `import { x } from './module.js'`
- **Type-only imports**: `import type { StoryGraph } from './types.js'`

### Formatting
- Biome handles all formatting automatically
- Run `pnpm run check` before committing
- 2-space indentation, LF line endings

### Naming
- `camelCase` for variables, functions, methods
- `PascalCase` for types, interfaces, classes
- `UPPER_SNAKE_CASE` for constants
- `snake_case` for error codes

### Architecture Patterns
- **Functional** — pure functions for analysis and export
- **Schema-first** — Zod schemas define types, validated at tool boundaries
- **Granular tools** — 11 focused tools + 4 legacy (backward compat)

## Testing

### Running Tests
```bash
# All tests
pnpm test

# Single test file
pnpm run test -- tests/validators.test.ts

# Single test by name
pnpm run test -- -t "should validate story structure"

# Watch mode
pnpm run test:watch
```

### Writing Tests
- Use Vitest (`globals: true` — `describe`, `it`, `expect` available)
- Follow Arrange-Act-Assert pattern
- Test edge cases and error paths
- Coverage provider: v8

## Submitting Changes

### Pull Request Guidelines
1. **One logical change per PR** — don't mix unrelated changes
2. **Reference TODO.md items** — link to the task you're completing
3. **Describe the "why"** — explain the problem, not just the solution
4. **Include tests** — new features need test coverage
5. **Update docs** — if behavior changes, update relevant docs

### PR Template
```markdown
## What Changed
- Brief description of changes

## Why
- Link to TODO.md item or issue
- Problem being solved

## Testing
- [ ] Build passes
- [ ] Tests pass
- [ ] Biome check passes
```

## Adding Skills

Skills are centralized in `.agents/skills/`. To add a new skill:

1. Create directory: `.agents/skills/your-skill-name/`
2. Add `SKILL.md` with YAML frontmatter:
```markdown
---
name: your-skill-name
description: >
  When to activate this skill. Include trigger words and scenarios.
---

# Skill Name

Instructions for the AI agent...
```
3. Run sync script:
```powershell
.\scripts\sync-skills.ps1
```
4. Commit the changes

See existing skills in `.agents/skills/` for examples.

## Security

### Reporting Vulnerabilities
See [SECURITY.md](SECURITY.md) for how to report security issues.

### Never Commit
- API keys or tokens
- `.env` files (use `.env.example`)
- Personal credentials
- Secrets or passwords

### Before Merging
- Run `npm audit` to check for dependency vulnerabilities
- Ensure no secrets in git history
- Verify input validation on all tool endpoints

## Questions?

- **Architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Tools**: See [docs/TOOL_MAPPING.md](docs/TOOL_MAPPING.md)
- **Setup**: See [README.md](README.md)
