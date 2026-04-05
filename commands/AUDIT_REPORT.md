# Commands Audit Report

**Date:** 2026-04-01
**Project:** bl1nk-visual-mcp

---

## 📊 Summary

| Category | Total | Appropriate | Needs Update | Should Delete |
|----------|-------|-------------|--------------|---------------|
| **Root Commands** | 2 | 0 | 2 | 0 |
| **Core Commands** | 6 | 0 | 0 | 6 |
| **Story Commands** | 5 | 3 | 2 | 0 |
| **Nanobanana** | 1 | 0 | 0 | 1 |
| **TOTAL** | **14** | **3** | **4** | **7** |

---

## ✅ Appropriate Commands (Keep)

### 1. `/story:analyze` ✅
**Status:** Appropriate for bl1nk
**Reason:** Directly maps to `search_entries` tool
**Action:** Convert to `.md` format, update tool reference

### 2. `/story:export` ✅
**Status:** Appropriate for bl1nk
**Reason:** Maps to `generate_artifacts` tool
**Action:** Convert to `.md`, update format options

### 3. `/story:validate` ✅
**Status:** Appropriate for bl1nk
**Reason:** Maps to `validate_story` tool
**Action:** Convert to `.md`, minor updates

---

## ⚠️ Needs Update (Modify)

### 1. `/story:audit` ⚠️
**Issue:** Too complex, references old workflow
**Current:** Deep structural audit with 4 phases
**Problem:** References StoryGraph validation that doesn't exist yet
**Action:** Simplify to use `validate_story` tool, remove complex phases

### 2. `/story:refine` ⚠️
**Issue:** Vague, no tool backing
**Current:** General refinement suggestions
**Problem:** No corresponding MCP tool
**Action:** Either create `refine_story` tool OR convert to skill instead of command

### 3. `analyze-story.md` (root) ⚠️
**Issue:** Duplicate of `/story:analyze`
**Current:** Redundant root-level command
**Problem:** Should be in `commands/story/` only
**Action:** Delete root version, keep `commands/story/analyze.toml`

### 4. `export-story.md` (root) ⚠️
**Issue:** Duplicate of `/story:export`
**Current:** Redundant root-level command
**Problem:** Should be in `commands/story/` only
**Action:** Delete root version, keep `commands/story/export.toml`

---

## ❌ Should Delete (Not bl1nk)

### Core Commands (6 files) - DELETE ALL
These are for **Conductor framework** (spec-driven development), NOT bl1nk:

1. `commands/core/implement.toml` ❌
2. `commands/core/newTrack.toml` ❌
3. `commands/core/revert.toml` ❌
4. `commands/core/review.toml` ❌
5. `commands/core/setup.toml` ❌
6. `commands/core/status.toml` ❌

**Reason:** These are for a different project (Conductor spec-driven development framework). They reference:
- Tracks Registry
- Implementation Plans
- Git commit tracking
- Conductor workflow

**None of these apply to bl1nk-visual-mcp.**

### Nanobanana (1 file) - DELETE

1. `commands/nanobanana/edit.toml` ❌

**Reason:** This is for image editing (`edit_image` tool), NOT story analysis. Completely unrelated to bl1nk.

---

## 📋 Recommended Structure

After cleanup:

```
commands/
├── story/
│   ├── analyze.md      ← Convert from analyze.toml
│   ├── export.md       ← Convert from export.toml
│   ├── validate.md     ← Convert from validate.toml
│   └── audit.md        ← Simplify from audit.toml
└── README.md           ← Document available commands
```

**Total:** 4 commands (all story-related)

---

## 🔄 Conversion Plan

### Step 1: Delete Unrelated Commands
```bash
# Delete Conductor commands
rmdir /s /q commands/core

# Delete nanobanana
rmdir /s /q commands/nanobanana

# Delete root duplicates
del commands\analyze-story.md
del commands\export-story.md
```

### Step 2: Convert to Markdown
Convert `.toml` files to `.md` format following Gemini Obsidian pattern:

**Example:**
```markdown
# /bl1nk:analyze

Analyze story text and extract entities.

## Usage
```
/bl1nk:analyze <story-text>
```

## Workflow
1. Call `search_entries` tool
2. Present extracted entities
3. Offer to validate structure

## Example
**User:** "Analyze this story: Once upon a time..."
**Agent:** Calls search_entries, shows results
```

### Step 3: Update References
- Update `audit.md` to use `validate_story` tool
- Remove complex 4-phase audit (not implemented)
- Add examples for each command

---

## 📊 Impact Analysis

| Action | Files Affected | Risk |
|--------|---------------|------|
| Delete Conductor commands | 6 | None (not bl1nk) |
| Delete nanobanana | 1 | None (not bl1nk) |
| Delete root duplicates | 2 | None (redundant) |
| Convert story commands | 4 | Low (update format only) |
| Simplify audit | 1 | Medium (remove features) |

**Total Risk:** LOW - Most commands are unrelated to bl1nk

---

## ✅ Next Steps

1. **Confirm deletion** of unrelated commands (core/, nanobanana/)
2. **Convert** story commands to `.md` format
3. **Simplify** audit command
4. **Add** README.md documenting commands
5. **Test** each command with bl1nk MCP server

---

**Recommendation:** Proceed with cleanup. 7/14 commands (50%) are unrelated to bl1nk and should be deleted immediately.
