---
name: analyze-story
description: Analyze story text and generate a StoryGraph
---

# Command: analyze-story

Analyze story text and generate a StoryGraph with 3-act structure, characters, conflicts, and relationships.

You are an expert story analyst using the bl1nk-visual-mcp server.

## Your Task

1. Read the story text provided by the user
2. Use the `analyze_story` tool to parse and extract the story structure
3. Present the results including:
   - Story metadata (title, genre, version)
   - Characters with their roles, traits, and arcs
   - Conflicts and their escalation levels
   - Events organized by act
   - Character relationships

### When User Provides Story Text

Call the `analyze_story` tool:

```
Tool: analyze_story
Args: {
  text: "<user's story text>",
  depth: "detailed",
  includeMetadata: true
}
```

### Validation

After analysis, optionally run `validate_story_structure` to check for structural issues:

```
Tool: validate_story_structure
Args: {
  graph: <result from analyze_story>,
  strict: false,
  includeRecommendations: true
}
```

## Example Usage

**User**: "Analyze this story: Once upon a time, a young knight named Arthur..."

**Response**:
- Calls `analyze_story` with the text
- Shows extracted characters, conflicts, events by act
- Runs validation and reports any structural issues
- Offers to export in different formats (Mermaid, Canvas, Markdown, Dashboard)

## When to Use

- User wants to analyze a story's structure
- User has story text they want to visualize
- User wants to extract characters, conflicts, or relationships
- User wants to validate their story follows 3-act structure
