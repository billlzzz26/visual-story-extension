# Story Validator Rules

## Validation Checklist

### Structure Integrity
- [ ] Story has a title (non-empty)
- [ ] All three acts have events (Act 1, 2, 3)
- [ ] Events are distributed across acts
- [ ] Climax event exists (importance: climax in Act 3)
- [ ] Midpoint event exists (importance: midpoint in Act 2)

### Character Consistency
- [ ] At least one protagonist exists
- [ ] All characters have names
- [ ] Character arcs are defined (start, end)
- [ ] Characters appear in events

### Conflict Management
- [ ] At least one conflict exists
- [ ] Conflicts have descriptions
- [ ] Related characters exist

### Event Quality
- [ ] Events have labels
- [ ] Event sequence is logical
- [ ] Character appearances tracked

## Issue Severity

### Error (Blocking)
- MISSING_TITLE: Story must have a title
- NO_CHARACTERS: At least one character required
- NO_PROTAGONIST: Protagonist is required
- MISSING_ACT1: Act 1 events required
- MISSING_ACT2: Act 2 events required
- MISSING_ACT3: Act 3 events required
- MISSING_CLIMAX: Climax in Act 3 required

### Warning
- NO_MIDPOINT: Midpoint in Act 2 recommended
- NO_CONFLICTS: At least one conflict recommended
- ACT1_IMBALANCE: Act 1 should be ~25% of events
- ACT2_IMBALANCE: Act 2 should be ~50% of events
- ACT3_IMBALANCE: Act 3 should be ~25% of events
- NO_ARC: Character arc recommended
- NO_MOTIVATION: Character motivation recommended

### Info
- Story pacing suggestions
- Character development tips
- Export format recommendations

## Output Format

```json
{
  "isValid": boolean,
  "issues": [
    {
      "code": "ERROR_CODE",
      "severity": "error|warning|info",
      "message": "Human readable message",
      "suggestion": "How to fix"
    }
  ],
  "analysis": {
    "eventCount": number,
    "characterCount": number,
    "conflictCount": number,
    "hasClimax": boolean,
    "hasMidpoint": boolean,
    "actBalance": {
      "act1": number,
      "act2": number,
      "act3": number,
      "balance": number
    },
    "pacing": "slow|balanced|fast"
  },
  "recommendations": string[]
}
```
