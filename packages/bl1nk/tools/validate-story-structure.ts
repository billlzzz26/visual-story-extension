/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool: validate_story_structure
 * Validate story structure against 3-act rules.
 */

import type { StoryGraph } from "../types.js";
import { validateGraph as validate } from "../validators.js";

export interface ValidateStoryStructureArgs {
	graph: StoryGraph;
	strict?: boolean;
	includeRecommendations?: boolean;
}

export function validateStoryStructure(args: ValidateStoryStructureArgs) {
	return validate(args.graph, args.strict);
}
