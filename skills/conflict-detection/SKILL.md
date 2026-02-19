---
name: conflict-detection
description: Identify, analyze, and optimize story conflicts
triggers:
  - "analyze conflicts"
  - "conflict detection"
  - "conflict optimization"
---

# Conflict Detection Skill

## Overview
Detects, categorizes, and analyzes all story conflicts, providing optimization
suggestions for maximum impact and narrative coherence.

## Conflict Analysis Framework

### 1. Conflict Identification
- **Internal Conflicts**: Character vs. self (beliefs, fears, desires)
- **External Conflicts**: Character vs. external force (antagonist, environment)
- **Emotional Conflicts**: Character vs. emotional state (love, guilt, shame)
- **Philosophical Conflicts**: Character vs. ideology (justice, morality)
- **Relational Conflicts**: Character vs. character (interpersonal tension)

### 2. Conflict Mapping
- Primary conflict (main story driver)
- Secondary conflicts (subplots)
- Tertiary conflicts (character moments)
- Conflict interconnections
- Conflict resolution paths

### 3. Escalation Analysis
- Initial conflict state
- Escalation stages
- Intensity progression
- Climax positioning
- Resolution strategy

### 4. Impact Assessment
- Conflict importance (1-10)
- Character involvement
- Story consequence
- Emotional weight
- Resolution satisfaction

### 5. Optimization Suggestions
- Escalation improvements
- Pacing adjustments
- Character involvement optimization
- Resolution enhancement
- Tension distribution

## Output Format

```json
{
  "conflict_analysis": {
    "total_conflicts": 3,
    "conflicts": [
      {
        "id": "conflict_001",
        "type": "external",
        "description": "Protagonist vs. Antagonist",
        "importance": 10,
        "escalation_stages": 4,
        "escalation_health": 0.88,
        "resolution_clarity": 0.92,
        "suggestions": []
      }
    ],
    "conflict_balance": 0.85,
    "primary_conflict_strength": 0.9,
    "recommendations": []
  }
}
```
