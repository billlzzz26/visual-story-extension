---
name: structural-audit
description: >
  Deep structural analysis of story graphs for Visual Story Planner projects.
  Use this skill whenever the user says "audit", "check structure", "analyze story structure",
  "is my story balanced", "review my plot", "structural report", or asks for feedback on
  three-act balance, pacing health, character arc completeness, or conflict escalation.
  Also activate when the user runs `validate_story_structure` and wants an explanation
  of results, or when story export output is present and they want a critique.
  IMPORTANT: Any export action (export_mermaid, export_canvas, export_dashboard, etc.)
  must be preceded by `validate_story_structure`. If validation reports any issues,
  surface them with severity levels (error / warning) and require explicit user
  acknowledgment before continuing to export. Block exports when blocking (error-level)
  issues exist unless the user explicitly confirms they accept the risk.
  This skill provides a four-phase audit (Structure → Characters → Conflicts → Pacing)
  with a scored health report and prioritized action list — always activate it, even for
  seemingly simple structure questions.
---

## Pre-Export Validation Gate

**Before any export tool is called**, this skill must:

1. Run `validate_story_structure` on the current graph
2. Report all issues grouped by severity:
   - `error` (blocking): exports are refused until resolved or user explicitly accepts risk
   - `warning` (non-blocking): exports proceed only after user acknowledges each warning
3. Present a summary:

```text
⚠️ Validation required before export
Errors (blocking): [N]   Warnings: [N]

[error]   MISSING_CLIMAX — Story structure is incomplete: Missing a Climax
[warning] NO_MIDPOINT — Story should have a midpoint event

Resolve blocking errors before exporting, or type ACCEPT RISK to override.
```

If the user types `ACCEPT RISK`, proceed with the export and prepend a notice to the output that the exported content has unresolved validation errors.

---



## Phase 1 — Three-Act Structure

Check each act against the 25%-50%-25% target:

| Act | Target % | Warning Threshold | Events Desired |
|-----|----------|-------------------|----------------|
| Act 1 | 25% | < 15% or > 35% | 3–5 |
| Act 2 | 50% | < 40% or > 65% | 5–8 |
| Act 3 | 25% | < 15% or > 35% | 3–5 |

Check for presence and quality of:
- **Inciting incident** (Act 1 — importance: `inciting`)
- **Midpoint** (Act 2 — importance: `midpoint`)
- **Climax** (Act 3 — importance: `climax`) ← error if missing
- **Resolution** (Act 3 — importance: `resolution`)

Status: `good` | `needs_work` | `critical`

---

## Phase 2 — Character Arcs

For each character with role `protagonist` or `antagonist`:
- Arc defined? (`arc.start`, `arc.midpoint`, `arc.end` non-empty)
- Transformation meaningful? (`arc.transformation` non-empty)
- Motivations defined? (`motivations` array non-empty)
- Appears in events? (`actAppearances` covers acts they should be in)

Flag any character missing 2+ of these as `needs_work`.

---

## Phase 3 — Conflict Escalation

For each conflict:
- Has escalation stages? (`escalations.length >= 2`)
- Intensity rises? (each stage > previous by ≥ 1)
- Resolution defined? (`resolution` non-empty)
- Related characters are valid IDs?

---

## Phase 4 — Pacing

- Event density per act (events / total events)
- Climax position: ideally around 75–85% through the full event sequence
- Emotional tone diversity across events
- Pacing verdict: `slow` (< 5 events) | `balanced` (5–15) | `fast` (> 15)

---

## Output Format

Always output in this exact structure:

```text
## Story Audit: [Title]

**Overall Health: [score]/100**

### ✅ Act Structure — [status]
[findings + act counts + %]

### ✅ Characters — [status]
[per-character findings]

### ✅ Conflicts — [status]
[per-conflict findings]

### ✅ Pacing — [status]
[pacing verdict + climax position]

---
### 🎯 Priority Actions (fix in this order)
1. [Critical] ...
2. [Warning] ...
3. [Suggestion] ...
```

Health score formula:
- Structure: 40 pts (climax present: 20, midpoint: 10, act balance: 10)
- Characters: 25 pts (protagonist arc: 15, others: 10)
- Conflicts: 20 pts (escalation: 10, resolution: 10)
- Pacing: 15 pts (balance: 10, climax position: 5)