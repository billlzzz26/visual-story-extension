---
name: theme-extraction
description: >
  Extract and analyze themes, motifs, and symbolic patterns from story graphs.
  Always activate when the user mentions: "themes", "motifs", "symbolism", 
  "symbolic meaning", "deeper meaning", "underlying message", "theme analysis",
  "recurring elements", "patterns in story", "symbolic objects", or asks about
  "what does this story mean", "what is the message", or "what themes are present".
  Also activate when user exports or validates story and wants to understand 
  the thematic depth. This skill identifies explicit and implicit themes, tracks
  motif recurrence, and provides thematic arc analysis — not just a list of tags.
version: 1.0.0
---

# Theme Extraction & Analysis

Extracts themes, motifs, and symbolic patterns from the story graph and provides
thematic depth analysis.

---

## Theme Extraction Process

### 1. Explicit Theme Detection

Scan these fields for theme indicators:
- `graph.tags`: Already extracted themes (e.g., "love", "destiny", "power")
- Event labels: Look for thematic keywords
- Character traits: Identify trait patterns
- Conflict descriptions: Extract thematic conflict types

**Common Themes:**
| Theme | Keywords |
|-------|----------|
| Love | love, heart, sacrifice, connection, loss |
| Destiny | fate, prophecy, chosen, purpose, legacy |
| Power | power, control, strength, corruption, balance |
| Identity | self, discovery, truth, mask, belonging |
| Redemption | change, growth, forgiveness, second chance |
| Survival | fight, escape, endurance, fear, hope |
| Justice | right, wrong, truth, law, revenge |
| Growth | learn, change, journey, transformation |

Score each theme: Strong (3+ matches) | Moderate (2) | Weak (1) | None (0)

### 2. Implicit Theme Inference

Analyze these for hidden themes:

**Character Arcs:**
- What transformation does the protagonist undergo?
- What does the antagonist represent?
- What do secondary characters symbolize?

**Event Sequence:**
- What pattern emerges from event progression?
- Is there a cyclical structure?
- What climax/resolution suggests thematically?

**Conflict Types:**
- Internal conflicts → Identity, Redemption, Growth themes
- External conflicts → Power, Justice, Survival themes
- Relational conflicts → Love, Identity themes

### 3. Motif Tracking

Identify recurring elements:
- Physical objects that appear multiple times
- Recurring locations or settings
- Repeated phrases or actions
- Character behavior patterns

For each motif:
- List all occurrences (event ID + context)
- Track how meaning evolves
- Note symbolic significance

### 4. Symbolic Analysis

Identify symbolic elements:
- Characters who represent abstract concepts
- Objects with deeper meaning
- Settings that symbolize states
- Colors, numbers, or elements with cultural weight

---

## Output Format

```text
## Theme Analysis: [Story Title]

### 🎯 Core Themes (detected in story)

| Theme | Strength | Evidence |
|-------|----------|----------|
| [Theme 1] | Strong | event_3, event_7, character arc |
| [Theme 2] | Moderate | tags, conflict description |

### 🔍 Implicit Themes (inferred)

- **[Theme]**: Derived from [character arc/conflict type/event pattern]
  
### 🎪 Motifs & Patterns

**Recurring Elements:**
- [Motif]: Appears in events [list] — evolves from [meaning A] to [meaning B]
- [Motif]: Appears in events [list] — remains consistent as [meaning]

### ⚜️ Symbolic Elements

- **[Symbol]**: Represents [abstract concept] in [context]
- **[Character]**: Embodies [theme] through [behavior]

### 📖 Thematic Arc

[How themes evolve across the story - beginning → middle → end]

### 💡 Thematic Strength Assessment

- **Cohesion**: [Strong/Moderate/Weak] — themes reinforce each other
- **Depth**: [High/Medium/Low] — explicit vs implicit balance
- **Originality**: [Fresh/Common/Trope] — fresh vs predictable themes

### 🎯 Recommendations

1. Strengthen [Theme] by adding more explicit moments in Act 2
2. Develop [Motif] as a through-line connecting all acts
3. Consider making [Symbol] more prominent for visual storytelling
```

---

## Activation Triggers

This skill activates automatically when:
1. User asks about themes, motifs, or symbolism
2. Story graph has `tags` field with theme-related content
3. User requests "deep analysis" or "thematic review"
4. Export output is present and user asks "what does this mean"

---

## Integration Points

- **After `analyze_story`**: Can enhance with theme detection
- **Before `export`**: Can add thematic notes to exports
- **With `character-analysis`**: Character arcs inform theme inference
- **With `structural-audit`**: Themes contribute to overall health score