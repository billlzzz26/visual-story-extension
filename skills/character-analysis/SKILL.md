---
name: character-analysis
description: Deep character development and relationship analysis
triggers:
  - "analyze characters"
  - "character development"
  - "character relationships"
---

# Character Analysis Skill

## Overview
Provides comprehensive analysis of character development, arcs, relationships,
and consistency throughout the story.

## Analysis Components

### 1. Character Arc Analysis
- **Starting State**: Initial character condition and beliefs
- **Catalysts**: Events that trigger change
- **Transformation**: Character evolution process
- **Ending State**: Final character condition and beliefs
- **Growth Measurement**: Quantify character development

### 2. Motivation Analysis
- Primary motivations
- Secondary motivations
- Conflicting motivations
- Motivation consistency
- Motivation evolution

### 3. Relationship Mapping
- Character-to-character relationships
- Relationship evolution
- Conflict points
- Support systems
- Antagonistic relationships

### 4. Consistency Checking
- Behavioral consistency
- Dialogue authenticity
- Decision logic
- Emotional consistency
- Arc alignment

### 5. Development Progression
- Scene-by-scene growth
- Relationship with other characters
- Obstacle overcome
- Skills acquired
- Beliefs challenged

## Output Format

```json
{
  "character_analysis": {
    "character_id": "char_001",
    "name": "Character Name",
    "role": "protagonist",
    "arc_health": 0.9,
    "arc_analysis": {
      "start": "Believes X",
      "midpoint": "Questions X",
      "end": "Accepts Y",
      "transformation_clarity": 0.95
    },
    "motivations": {
      "primary": "Survive",
      "secondary": ["Protect family", "Seek revenge"],
      "consistency": 0.88
    },
    "relationships": [
      {
        "with": "Character B",
        "type": "antagonistic",
        "evolution": "Starts hostile, becomes understanding",
        "impact_on_arc": "high"
      }
    ],
    "consistency_score": 0.92,
    "suggestions": []
  }
}
```
