# Story Analyzer Rules

## StoryGraph Schema

When working with StoryGraph, use this structure:

```typescript
interface StoryGraph {
  meta: {
    title: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    genre?: string;
  };
  characters: Character[];
  events: Event[];
  conflicts: Conflict[];
  relationships: Relationship[];
  tags: string[];
}

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'mentor' | 'minor';
  traits: string[];
  arc: {
    start: string;
    midpoint: string;
    end: string;
    transformation: string;
    emotionalJourney: string[];
  };
  relationships: Relationship[];
  motivations: string[];
  fears: string[];
  secretsOrLies: string[];
  actAppearances: number[];
}

interface Event {
  id: string;
  label: string;
  description: string;
  act: 1 | 2 | 3;
  importance: 'inciting' | 'rising' | 'midpoint' | 'climax' | 'resolution';
  sequenceInAct: number;
  characters: string[];
  conflicts: string[];
  emotionalTone: string;
  consequence: string;
}

interface Conflict {
  id: string;
  type: 'internal' | 'external' | 'emotional' | 'philosophical' | 'relational';
  description: string;
  relatedCharacters: string[];
  rootCause: string;
  escalations: Escalation[];
  resolution: string;
  actIntroduced: number;
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  type: 'family' | 'friend' | 'enemy' | 'mentor' | 'romantic' | 'professional';
  strength: number;
  evolution: { act: number; description: string }[];
}
```

## Export Formats

### Mermaid

- Use subgraphs for Act_1, Act_2, Act_3
- Apply styling for different importance levels
- Include metadata comment at top

### Canvas JSON

- Nodes array with position data
- Edges array for relationships
- Viewport object for initial view

### Dashboard HTML

- Include Chart.js for act distribution
- Display validation issues
- Show character and conflict lists

### Markdown

- Wrap in artifact format
- Include all sections: metadata, analysis, characters, conflicts, events

## Validation Rules

- Title must be non-empty
- At least one protagonist required
- All three acts must have events
- Climax required in Act 3 (error if missing)
- Midpoint recommended in Act 2 (warning if missing)
- Act balance: Act1 ~25%, Act2 ~50%, Act3 ~25%
