---
name: conflict-detection
description: >
  Identify, map, and optimize all conflicts within a Visual Story Planner StoryGraph.
  Always activate this skill when the user mentions: "conflict", "tension", "escalation",
  "antagonist dynamics", "analyze conflicts", "my story lacks tension", "how do conflicts
  connect", "conflict optimization", "subplot conflicts", or "is my conflict believable".
  Also use when the user asks why the story feels flat or stakes feel low — conflict
  analysis is almost always the answer. Produces a conflict map with type classification,
  escalation health score, interconnection diagram (as text), and specific improvement
  suggestions ranked by impact.
---

# Conflict Detection & Optimization

Analyzes all conflicts in a StoryGraph across five dimensions and outputs a prioritized
improvement plan.

---

## Conflict Taxonomy

Classify each conflict found:

| Type | Definition | Example |
|------|-----------|---------|
| `internal` | Character vs. self (belief, fear, desire) | Aria doubts her power |
| `external` | Character vs. antagonist or force | Luke vs. Empire |
| `emotional` | Character vs. emotional state | grief, guilt, shame |
| `philosophical` | Character vs. ideology | justice vs. mercy |
| `relational` | Character vs. another character (not main antagonist) | allies in tension |

Aim for: ≥ 1 internal + ≥ 1 external per protagonist. All-external stories lack depth.

---

## Analysis Dimensions

### 1. Conflict Identification
- Extract explicit conflicts from `graph.conflicts`
- Infer implicit conflicts from event labels and character relationships
- Note missing conflict types

### 2. Escalation Health
- Stages present: `escalations.length`
- Intensity curve: check each `intensity` value rises (3 → 6 → 9 ideal)
- Peak before climax? Escalation should peak at or just before the climax event

Escalation health score = clamp((stages_count × intensity_slope_avg) / 10, 0.0, 1.0)

### 3. Interconnection Map
Show how conflicts relate to each other:
```
[External: Aria vs Shadow King] ──feeds──> [Internal: Aria's self-doubt]
                                 └──affects──> [Relational: Aria & Kael tension]
```

### 4. Impact Assessment
Rate each conflict:
- **Importance** (1–10): How central to the main plot
- **Character involvement**: Which characters are affected
- **Story consequence**: What happens if unresolved
- **Resolution quality**: satisfying | abrupt | unresolved

### 5. Optimization Suggestions
For each gap found, provide a ranked suggestion:
- Priority: High / Medium / Low
- What to add/change
- Which act to introduce it in

---

## Output Format

```
## Conflict Analysis: [Title]

**Conflict Balance Score: [X]/10**
Detected: [N] explicit, [N] implicit

### Conflict Map
[type] [name]: [brief description]
  ↳ Escalation: [stages] stages, intensity [X → Y → Z]
  ↳ Resolution: [resolved/unresolved]
  ↳ Impact: [score]/10

### Interconnections
[text diagram]

### Gaps Detected
- Missing [type] conflict for [character]
- [Conflict X] never escalates past stage 1

### 🎯 Optimization Plan (by impact)
1. [HIGH] Add internal conflict for Aria in Act 2 to mirror external stakes
2. [MED] Escalate "Aria vs Shadow King" — jump intensity from 5 to 8 at midpoint
3. [LOW] Resolve "relational tension" in Act 3 resolution scene
```