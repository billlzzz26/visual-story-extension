---
name: structural-audit
description: Comprehensive structural analysis and optimization
triggers:
  - "audit story"
  - "check structure"
  - "analyze story structure"
---

# Structural Story Auditor

## Overview
Performs deep structural analysis of story elements including three-act structure,
character arcs, conflict escalation, and pacing distribution.

## Analysis Phases

### Phase 1: Three-Act Structure Validation
- **Act 1 Analysis**
  - Setup completeness (world, characters, stakes)
  - Inciting incident clarity and impact
  - Character introduction effectiveness
  - Desired event count: 3-5 events

- **Act 2 Analysis**
  - Rising action progression
  - Midpoint event presence and impact
  - Complication escalation
  - Desired event count: 5-8 events

- **Act 3 Analysis**
  - Climax positioning and intensity
  - Resolution clarity
  - Denouement satisfaction
  - Desired event count: 3-5 events

### Phase 2: Character Arc Validation
- Check all main characters have defined arcs
- Verify transformation logic
- Validate relationship consistency
- Assess character growth progression

### Phase 3: Conflict Escalation Analysis
- Detect missing conflicts
- Analyze escalation patterns
- Check resolution adequacy
- Verify conflict interconnection

### Phase 4: Pacing Distribution
- Calculate event density per act
- Analyze emotional arc progression
- Check climax positioning
- Assess tension distribution

## Output Format

```json
{
  "audit_date": "2024-02-19",
  "story_title": "Story Title",
  "overall_health": 0.85,
  "findings": {
    "structure": {
      "status": "good",
      "issues": [],
      "suggestions": []
    },
    "characters": {
      "status": "needs_work",
      "issues": ["Secondary character lacks motivation"],
      "suggestions": ["Define clear motivation for character X"]
    },
    "conflicts": {
      "status": "good",
      "issues": [],
      "suggestions": []
    },
    "pacing": {
      "status": "good",
      "issues": [],
      "suggestions": []
    }
  },
  "recommendations": []
}
```
