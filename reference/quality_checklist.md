# Quality Checklist for Visual Story Planner MCP Server

## Overview

This checklist ensures the MCP server implementation meets quality standards for AI agent usability.

---

## Phase 1: Research & Planning

### API Understanding
- [ ] All story operations identified (analyze, validate, export, refine, audit)
- [ ] Character extraction capabilities documented
- [ ] Conflict detection patterns defined
- [ ] Theme extraction logic planned
- [ ] Relationship building flow understood

### Tool Design
- [ ] Each tool has single responsibility
- [ ] Tool names follow natural task subdivision
- [ ] Input/output schemas documented
- [ ] Error scenarios identified and handled
- [ ] Response formats consistent (JSON/Markdown)

---

## Phase 2: Implementation

### TypeScript/Node.js Standards
- [ ] Using `@modelcontextprotocol/sdk` properly
- [ ] Zod schemas with `.strict()` for all inputs
- [ ] TypeScript strict mode enabled
- [ ] No `any` types - proper types everywhere
- [ ] Explicit Promise<T> return types
- [ ] Build process configured (`npm run build`)

### Code Organization
- [ ] Shared utilities in separate modules
- [ ] Response formatters (JSON, Markdown, Mermaid) modular
- [ ] Validators extracted and reusable
- [ ] Types properly defined in `types.ts`

### Tool Implementation
- [ ] `analyze_story` - Parse story text → StoryGraph
- [ ] `validate_story_structure` - Validate graph, return issues
- [ ] `export_mermaid` - Generate Mermaid diagram
- [ ] `export_canvas` - Generate canvas JSON
- [ ] `export_dashboard` - Generate HTML dashboard
- [ ] `extract_characters` - Character analysis
- [ ] `extract_conflicts` - Conflict analysis
- [ ] `build_relationship_graph` - Relationship mapping

### Input Validation
- [ ] All required fields validated
- [ ] Optional fields have sensible defaults
- [ ] Error messages guide toward correct usage
- [ ] Edge cases handled gracefully

---

## Phase 3: Review & Testing

### Functional Tests
- [ ] `npm run build` completes without errors
- [ ] All unit tests pass (`npm test`)
- [ ] Coverage above 80% for core modules

### Quality Checks
- [ ] DRY - No duplicated code between tools
- [ ] Consistent response formats across all tools
- [ ] All external calls have error handling
- [ ] Full type coverage
- [ ] Every tool has comprehensive descriptions

### Documentation
- [ ] SKILL.md files complete with descriptions
- [ ] Command descriptions explain all options
- [ ] Examples provided where helpful

---

## Phase 4: Evaluation

### Test Scenarios
- [ ] 10 evaluation questions created
- [ ] Each question tests different functionality
- [ ] Questions are independent (non-dependent)
- [ ] Read-only operations only
- [ ] Answers are verifiable

### Coverage Areas
- [ ] Story analysis (text → graph)
- [ ] Validation (structure checking)
- [ ] Export formats (Mermaid, Canvas, Dashboard, Markdown)
- [ ] Character extraction
- [ ] Conflict detection
- [ ] Relationship building
- [ ] Error handling scenarios

---

## MCP Best Practices Compliance

### Server Configuration
- [ ] Server has proper metadata (name, version, description)
- [ ] Connection type specified (stdio)
- [ ] Tools registered with proper annotations

### Tool Design
- [ ] `readOnlyHint` set appropriately
- [ ] `destructiveHint` set for modifying operations
- [ ] `idempotentHint` set for safe operations
- [ ] `openWorldHint` true for external interactions

### Response Handling
- [ ] Large responses truncated appropriately
- [ ] Error messages are actionable
- [ ] JSON responses valid and parseable

---

## Visual Story Planner Specific

### StoryGraph Schema
- [ ] Meta (title, version, createdAt, updatedAt)
- [ ] Characters array with required fields
- [ ] Events array with act, importance, sequence
- [ ] Conflicts array with type, escalation
- [ ] Relationships array with from, to, strength, type
- [ ] Tags array for themes

### Export Formats
- [ ] Mermaid: Subgraphs for acts, proper styling
- [ ] Canvas: Nodes and edges structure
- [ ] Dashboard: HTML with Chart.js integration
- [ ] Markdown: Proper artifact format wrapping

### Validation Rules
- [ ] Title validation
- [ ] Protagonist required check
- [ ] Act 1/2/3 presence check
- [ ] Climax detection
- [ ] Midpoint detection (warning)
- [ ] Act balance calculation

---

## Sign-off

Before marking as complete, verify:
- [ ] All items checked
- [ ] No `TODO` or `FIXME` in code
- [ ] No hardcoded secrets
- [ ] Version bumped appropriately
- [ ] README updated with changes