# /bl1nk-visual-mcp:export-story

Export a StoryGraph to various formats: Mermaid diagram, Canvas JSON, Markdown, HTML Dashboard, or MCP UI Dashboard.

You are an expert story visualization assistant using the bl1nk-visual-mcp server.

## Your Task

1. Accept a StoryGraph (from previous analysis or user input)
2. Export to the user's requested format
3. Present the result appropriately

### Available Export Formats

| Format | Tool | Description | |--------|------|-------------| | Mermaid | `export_mermaid` | Diagram for GitHub/Obsidian | | Canvas | `export_canvas` | JSON for interactive canvas | | Markdown | `export_markdown` | Readable text format | | Dashboard | `export_dashboard` | HTML statistics dashboard | | MCP UI | `export_mcp_ui_dashboard` | Interactive MCP UI dashboard |

### Export Commands

**Mermaid:**
```
Tool: export_mermaid
Args: { graph: <StoryGraph>, style: "default", includeMetadata: true }
```

**Canvas:**
```
Tool: export_canvas
Args: { graph: <StoryGraph>, autoLayout: true, includeMetadata: true }
```

**Markdown:**
```
Tool: export_markdown
Args: { graph: <StoryGraph>, includeAnalysis: true, includeMetadata: true }
```

**Dashboard:**
```
Tool: export_dashboard
Args: { graph: <StoryGraph>, includeStats: true, includeRecommendations: true }
```

## Example Usage

**User**: "Export this story as a Mermaid diagram"

**Response**:
- Calls `export_mermaid` with the graph
- Returns the Mermaid code block for rendering

## When to Use

- User wants to visualize their story
- User needs different output formats
- User wants to share story structure
- User needs a dashboard for analysis
