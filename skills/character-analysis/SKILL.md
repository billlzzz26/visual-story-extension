---
name: character-analysis
description: >
  Deep character development, arc, and relationship analysis for Visual Story Planner.
  Always activate when the user mentions: "character development", "character arc",
  "analyze characters", "is my character believable", "character relationships",
  "character motivation", "character consistency", "character feels flat", "protagonist
  needs work", "how does [character] change", or "relationship dynamics". Also activate
  when validating a story graph and the user wants to understand character-related
  warnings. Produces per-character arc scores, motivation clarity ratings, relationship
  maps, and specific writing suggestions to deepen each character — not just a summary.
---

# Character Development Analyzer

Provides scored analysis of each character's arc, motivation, relationships, and
consistency across the story.

---

## Analysis Components

### 1. Arc Completeness Score (per character)

Check these fields and score:

**Core arc (60 pts):**
- `arc.start` non-empty: 12 pts
- `arc.midpoint` non-empty: 12 pts
- `arc.end` non-empty: 12 pts
- `arc.transformation` meaningful (> 10 chars, not a repeat of start/end): 12 pts
- `arc.emotionalJourney` has ≥ 3 entries: 12 pts

**Character depth (40 pts):**
- `motivations` non-empty (≥ 1 entry): 10 pts
- `fears` meaningful (≥ 1 entry, each > 10 chars, not duplicate of secrets): 10 pts
- `secretsOrLies` meaningful (≥ 1 entry, each > 10 chars): 10 pts
- `relationships` tracks evolution (≥ 3 entries showing change across acts): 10 pts

**Arc Score** = sum / 100

Interpretation:
- 80–100: Strong, well-defined arc
- 50–79: Needs development
- 0–49: Character is underdeveloped — flag as critical

A character cannot reach "Strong" status without both core arc and depth dimensions scoring ≥ 60% each.

### 2. Motivation Clarity

- `motivations` non-empty: base pass
- Primary motivation drives at least 2 events (check event labels for character name): bonus
- Motivation conflicts with another character's goal: depth bonus
- Motivations evolve across acts: arc bonus

Rate: **Clear** | **Vague** | **Missing**

### 3. Consistency Check

Walk through events where the character appears (`event.characters` includes their ID):
- Do actions align with their role and arc stage?
- Flag events where character behavior seems inconsistent with their `traits`
- Flag act jumps (character disappears from Act 2 entirely)

### 4. Relationship Map

For each relationship in `graph.relationships` involving this character:
```text
[Character A] ──[type]──> [Character B]  strength: [N]/10
```

Assess:
- Relationships that lack conflict: suggest adding tension
- Relationships that evolve: flag as strength
- Isolated characters (no relationships): flag as concern
- Relationships array has < 3 entries: flag — contributes 0 pts to depth score

### 5. Per-Character Writing Suggestions

Give 2–3 concrete suggestions per underdeveloped character:
- "Add a scene where [character] confronts [fear]"
- "Show [character]'s midpoint transformation in Act 2, event 3"
- "Give [character] a goal that conflicts with [other character]'s motivation"

---

## Output Format

```text
## Character Analysis: [Title]

### [Character Name] — [role]
**Arc Score: [X]/100** ([status])
**Motivation: [Clear/Vague/Missing]**

Arc (core: [X]/60, depth: [X]/40):
  Start → [value]
  Midpoint → [value]
  End → [value]
  Transformation: [value]
  Fears: [value or MISSING]
  Secrets: [value or MISSING]
  Relationships tracked: [N] entries ([≥3 ✅ / <3 ⚠️])

Consistency: [✅ consistent / ⚠️ gaps in Act N / ❌ major inconsistency]

Relationships:
  [Character A] ──[type]──> [this character]  (strength: N)

💡 Suggestions:
1. ...
2. ...

---
[Repeat for each character]

### Relationship Health Summary
[overall relationship web assessment]

### 🎯 Priority Actions
1. [CRITICAL] Define arc for protagonist — currently 0/100
2. [WARNING] Secondary character has no motivation
```