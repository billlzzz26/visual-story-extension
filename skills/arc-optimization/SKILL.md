---
name: arc-optimization
description: >
  Optimize story pacing, emotional arcs, tension curves, and narrative flow for
  Visual Story Planner StoryGraphs. Always activate when the user says: "pacing",
  "too fast", "too slow", "emotional arc", "tension build", "story feels flat",
  "optimize story", "improve flow", "climax doesn't land", "restructure events",
  "my story drags", or "how do I build tension". Also activate when a structural
  audit shows ACT_IMBALANCE warnings — arc optimization is the fix. Produces a
  pacing score, tension curve visualization (ASCII), emotional arc trajectory,
  and an ordered list of concrete restructuring moves with before/after event counts.
---

# Arc & Pacing Optimizer

Analyzes and optimizes story rhythm, emotional progression, and tension distribution.

---

## Optimization Areas

### 1. Event Density Analysis

Calculate events per act and flag imbalance:
```
Act 1: [N] events = [X]% (target: ~25%)
Act 2: [N] events = [X]% (target: ~50%)
Act 3: [N] events = [X]% (target: ~25%)
```

Suggest additions/removals to reach targets.

### 2. Tension Curve

Map each event's implied tension level (1–10) based on importance:
- `normal`/`rising` → baseline (3–5)
- `inciting` → spike (6)
- `midpoint` → peak (7)
- `climax` → maximum (9–10)
- `resolution` → release (2–4)

Draw ASCII tension curve:
```
10 │         *
 8 │       *   
 6 │   *         
 4 │ *       * *
 2 │               *
   └────────────────
   A1  A1  A2  A3 A3
```

Ideal shape: gradual rise → midpoint peak → brief dip → climax peak → resolution drop.

### 3. Emotional Arc Trajectory

Assess overall emotional journey:
- **Flat**: no variation in emotional tone → add contrast events
- **Spike-only**: all tension with no relief → add breathing room in Act 2
- **Front-heavy**: climax too early → move or strengthen Act 3 events
- **Satisfying**: gradual rise with peaks and valleys

### 4. Climax Positioning

Ideal climax position: 75–85% through the full event sequence.

```
Climax at event [N] of [Total] = [X]%
Status: [too early / ideal / too late]
```

### 5. Subplot Integration

Check if secondary conflicts have events distributed across all three acts.
Flag any subplot that only appears in one act.

---

## Restructuring Moves

For each issue, suggest a concrete move:

| Move Type | Description |
|-----------|-------------|
| **ADD** | Add event in [Act N] with importance [X] |
| **MOVE** | Move event "[Label]" from Act [N] to Act [M] |
| **PROMOTE** | Change importance of "[Label]" from `rising` to `midpoint` |
| **SPLIT** | Split "[Label]" into two events for better pacing |
| **MERGE** | Merge [A] and [B] — they're too close in impact |

---

## Output Format

```
## Arc Optimization: [Title]

**Pacing Score: [X]/100**

### Event Density
[table of act distribution]

### Tension Curve
[ASCII diagram]

### Emotional Arc: [flat/rising/satisfying/etc]
[brief assessment]

### Climax Position: [X]% — [status]

### 🎯 Restructuring Plan (ordered)
1. [MOVE] "Shadow King attacks" from Act 3 → Act 2, event 6 — raises midpoint tension
2. [ADD]  New "brief victory" event in Act 2 — creates tension contrast
3. [PROMOTE] "Learning the truth" importance: rising → midpoint
```