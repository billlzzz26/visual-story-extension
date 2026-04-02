/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool exports - 3 core tools.
 */

// Core tools (3 tools)
export const BL1NK_VISUAL_TOOLS = [
  // Analysis
  { name: 'search_entries', description: 'Extract entities (characters, scenes, locations) from story text' },
  
  // Validation
  { name: 'validate_story', description: 'Validate story structure (3-act, climax, midpoint)' },
  
  // Export (all formats at once)
  { name: 'generate_artifacts', description: 'Generate ALL artifacts automatically (mermaid, canvas, markdown, html, csv)' },
  
  // Sync
  { name: 'sync_github', description: 'Push generated files to GitHub repository' }
];

// Tool executor
export { executeStoryTool, formatErrorResult } from './execute.js';

// Individual tool exports
export { searchEntriesTool } from './search-entries.js';
export { generateArtifactsTool } from './generate-artifacts.js';
