# bl1nk Notebook

Interactive document management for bl1nk-visual-mcp artifacts.

## Overview

The Notebook runtime automatically generates and manages documents from story analysis:

- **Mermaid diagrams** - Story structure visualization
- **Canvas JSON** - Obsidian canvas compatibility
- **Markdown documents** - Complete story documentation
- **HTML dashboards** - Interactive statistics
- **CSV files** - Database import (Notion, Airtable)

## Usage

```typescript
import { NotebookExecutionRuntime } from './executor.js';

// Initialize with your notebook service
const runtime = new NotebookExecutionRuntime(notebookService);

// Generate all artifacts from StoryGraph
const results = await runtime.generateArtifacts(storyGraph, {
  topicId: 'my-story-topic',
  taskId: 'analysis-task-123' // optional
});

// Individual document operations
await runtime.createDocument({
  title: 'Character Analysis',
  content: '# Characters\n\n...',
  type: 'markdown'
}, { topicId: 'topic-123' });

await runtime.getDocument({ id: 'doc-123' });
await runtime.updateDocument({ id: 'doc-123', content: 'New content' });
await runtime.deleteDocument({ id: 'doc-123' });
```

## Document Types

| Type     | Use Case               |
| -------- | ---------------------- |
| markdown | Reading, documentation |
| html     | Interactive dashboards |
| json     | Canvas, data exchange  |
| csv      | Database import        |
| mermaid  | Diagrams, flowcharts   |

## Integration

Documents are automatically:

- Associated with topics
- Linked to tasks (if in task context)
- Tracked with word counts
- Versioned with timestamps
