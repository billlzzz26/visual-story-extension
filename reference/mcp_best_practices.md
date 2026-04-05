# MCP Best Practices for Visual Story Planner

## Server Configuration

### Connection Type
- **stdio**: Local process communication via stdin/stdout
- **HTTP/SSE**: Remote server communication

### Server Metadata
```json
{
  "name": "visual-story-planner",
  "version": "3.0.0",
  "description": "Story analysis and visualization MCP server"
}
```

---

## Tool Naming Conventions

### Pattern: `resource_action`
- `analyze_story` - Parse story text to StoryGraph
- `validate_story_structure` - Check story validity
- `export_mermaid` - Generate Mermaid diagram
- `export_canvas` - Generate canvas JSON
- `export_dashboard` - Generate HTML dashboard
- `extract_characters` - Get character details
- `extract_conflicts` - Get conflict details
- `build_relationship_graph` - Map character relationships

### Tool Annotations
| Annotation | Use |
|------------|-----|
| `readOnlyHint` | true for read operations (analyze, extract) |
| `destructiveHint` | true for operations that modify data |
| `idempotentHint` | true for safe repeated calls |
| `openWorldHint` | true for external system interactions |

---

## Response Format Guidelines

### JSON Response
- Always valid, parseable JSON
- Include metadata when requested
- Truncate large arrays appropriately (max 1000 items)

### Markdown Response
- Use artifact format wrapping
- Include proper code blocks
- Escape special characters

### Error Response
```json
{
  "error": true,
  "message": "Clear error description",
  "suggestion": "What to do next"
}
```

---

## Pagination Guidelines

### For Large Results
- Default page size: 20 items
- Maximum page size: 100 items
- Include pagination metadata

### Truncation Strategy
- Events: Limit to 100 per response, add "truncated" flag
- Characters: Return all (usually <50)
- Relationships: Limit to 100, add continuation token

---

## Character Limits

| Response Type | Limit |
|---------------|-------|
| StoryGraph JSON | 50,000 tokens |
| Mermaid diagram | 10,000 chars |
| HTML Dashboard | 100,000 chars |
| Error message | 500 chars |

---

## Security Guidelines

### Input Validation
- Validate all required parameters
- Sanitize special characters in user input
- Limit string lengths (title: 200 chars, descriptions: 5000 chars)

### Error Handling
- Never expose internal error details to user
- Log errors internally for debugging
- Return actionable error messages

---

## Performance Considerations

### Caching
- Cache StoryGraph after `analyze_story`
- Invalidate cache on new analysis

### Async Operations
- Use async/await for all I/O
- Implement timeouts (default: 30s)
- Handle rate limiting gracefully

---

## Testing Checklist

- [ ] All tools have unit tests
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Coverage above 80%
- [ ] Integration tests for MCP protocol