/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool execution dispatcher - 3 core tools.
 */

import { formatToolError } from '../utils/error-handler.js';
import { searchEntriesTool } from './search-entries.js';
import { generateArtifactsTool } from './generate-artifacts.js';

function formatErrorResult(toolName: string, error: unknown) {
  return formatToolError(error, toolName);
}

export async function executeStoryTool(toolName: string, args: any) {
  if (!args || typeof args !== 'object') {
    return {
      content: [{ type: 'text' as const, text: 'Error: Invalid arguments provided' }],
      isError: true
    };
  }

  try {
    switch (toolName) {
      case 'search_entries': {
        return await searchEntriesTool.execute(args);
      }

      case 'validate_story': {
        const { validateGraph } = await import('../validators.js');
        const { buildInitialGraph } = await import('../analyzer.js');
        
        const graph = buildInitialGraph(args.text);
        const result = validateGraph(graph, args.strict);
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }]
        };
      }

      case 'generate_artifacts': {
        return await generateArtifactsTool.execute(args);
      }

      case 'sync_github': {
        // TODO: Implement GitHub sync
        return {
          content: [{
            type: 'text' as const,
            text: 'GitHub sync not yet implemented. Use github-sync package instead.'
          }]
        };
      }

      default:
        return {
          content: [{ type: 'text' as const, text: `Error: Unknown tool ${toolName}` }],
          isError: true
        };
    }
  } catch (error: unknown) {
    return formatErrorResult(toolName, error);
  }
}

export { formatErrorResult };
