# Evaluation Guide for Visual Story Planner MCP

## Overview

Evaluations test whether LLMs can effectively use this MCP server to analyze stories and generate valid outputs.

---

## Evaluation Purpose

This MCP server provides story analysis capabilities. The evaluation verifies that:
- LLMs can successfully call tools to analyze stories
- Export formats are valid and usable
- Validation returns appropriate issues
- Character and conflict extraction works correctly

---

## Test Scenarios

### Core Functionality Tests

#### 1. Story Analysis
**Question:** Analyze the following story and return the StoryGraph JSON:

```
Title: The Lost Kingdom
Character: Princess Aria, role: protagonist
Aria is brave and determined to save her kingdom.
Character: Dark Lord, role: antagonist
The Dark Lord seeks to rule through fear.
Event: Princess discovers the ancient map
Event: Journey through the forbidden forest
Event: Meeting the wise wizard
Event: Finding the hidden key
Event: Confronting the Dark Lord
Event: Restoring peace to the kingdom
```

**Expected Answer:** Valid StoryGraph with:
- 2 characters (Aria as protagonist, Dark Lord as antagonist)
- 6 events distributed across 3 acts
- At least 1 conflict

#### 2. Validation Check
**Question:** Validate a story with missing climax and return the issues.

**Expected Answer:** Array of issues including:
- `MISSING_CLIMAX` error
- `MISSING_ACT3` error (if no events in Act 3)

#### 3. Export Mermaid
**Question:** Export the analyzed story to Mermaid diagram format.

**Expected Answer:** Valid Mermaid code with:
- `graph TD` header
- Subgraphs for Act_1, Act_2, Act_3
- Proper styling for climax/resolution

#### 4. Export Canvas
**Question:** Export story to canvas JSON format.

**Expected Answer:** JSON with:
- `nodes` array (events, characters, conflicts)
- `edges` array (relationships)
- `viewport` object

#### 5. Export Dashboard
**Question:** Export story to HTML dashboard.

**Expected Answer:** HTML with:
- DOCTYPE
- Chart.js integration
- Stats display
- Act distribution chart

#### 6. Character Extraction
**Question:** Extract all characters with their roles and traits.

**Expected Answer:** Array of character objects with:
- id, name, role, traits
- For protagonist: full arc information

#### 7. Conflict Detection
**Question:** Identify all conflicts and their escalation stages.

**Expected Answer:** Array of conflicts with:
- type (internal/external)
- related characters
- escalation stages

#### 8. Relationship Building
**Question:** Build relationship graph between characters.

**Expected Answer:** Relationship array with:
- from, to, type, strength
- Evolution tracking across acts

#### 9. Empty Story Handling
**Question:** What happens when analyzing an empty story?

**Expected Answer:** Valid StoryGraph with:
- Title: "Untitled Story"
- Empty arrays for all elements
- Validation returns proper errors

#### 10. Edge Case - Special Characters
**Question:** Analyze a story with quotes and special chars in title.

**Expected Answer:** Properly escaped output in all exports

---

## XML Output Format

```xml
<evaluation>
  <qa_pair>
    <question>Test question here</question>
    <answer>Expected answer or pattern</answer>
  </qa_pair>
  <!-- More qa_pairs... -->
</evaluation>
```

---

## Running Evaluations

### Manual Test
```bash
npm run build
npm test
```

### Coverage Check
```bash
npm test -- --coverage
```

---

## Success Criteria

- All 10 evaluation questions answered correctly
- Build succeeds without errors
- All unit tests pass
- Coverage above 80% for core modules