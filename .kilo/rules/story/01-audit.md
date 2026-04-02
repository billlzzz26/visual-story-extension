# Story Auditor Rules

## Audit Phases

### Phase 1: Three-Act Structure (40 pts)
- Climax present: +20 pts
- Midpoint present: +10 pts
- Act balance: +10 pts

Target distribution:
| Act | Target % | Warning Threshold |
|-----|----------|-------------------|
| Act 1 | 25% | < 15% or > 35% |
| Act 2 | 50% | < 40% or > 65% |
| Act 3 | 25% | < 15% or > 35% |

### Phase 2: Character Arcs (25 pts)
- Protagonist arc complete: +15 pts
- Other characters: +10 pts

Required for complete arc:
- arc.start: non-empty
- arc.end: non-empty
- arc.transformation: meaningful (>10 chars)
- motivations: non-empty
- fears or secrets: at least one

### Phase 3: Conflict Escalation (20 pts)
- Escalation stages (≥2): +10 pts
- Resolution defined: +10 pts

### Phase 4: Pacing (15 pts)
- Balance: +10 pts
- Climax position (~75%): +5 pts

Pacing verdict:
- slow: < 5 events
- balanced: 5-15 events
- fast: > 15 events

## Health Score Formula

```
Health = Structure(40) + Characters(25) + Conflicts(20) + Pacing(15)
```

| Score | Status |
|-------|--------|
| 80-100 | Excellent |
| 60-79 | Good |
| 40-59 | Needs Work |
| 0-39 | Critical |

## Output Format

```markdown
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
