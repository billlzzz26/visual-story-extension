/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tool registration validation tests.
 * Ensures all tools have corresponding schemas, executors, and no duplicates.
 */

import { describe, expect, it } from "vitest";
import { Schemas } from "../index.js";
import { BL1NK_VISUAL_TOOLS, GRANULAR_TOOLS } from "./index.js";

describe("Tool Registration Validation", () => {
	describe("GRANULAR_TOOLS", () => {
		it("should have 11 tools", () => {
			expect(GRANULAR_TOOLS).toHaveLength(11);
		});

		it("should have unique tool names", () => {
			const names = GRANULAR_TOOLS.map((t) => t.name);
			const uniqueNames = new Set(names);
			expect(names).toHaveLength(uniqueNames.size);
		});

		it("should have corresponding schemas for all tools", () => {
			for (const tool of GRANULAR_TOOLS) {
				const schema = Schemas[tool.name as keyof typeof Schemas];
				expect(schema).toBeDefined();
				expect(schema.shape).toBeDefined();
			}
		});

		it("should have descriptions for all tools", () => {
			for (const tool of GRANULAR_TOOLS) {
				expect(tool.description).toBeDefined();
				expect(tool.description.length).toBeGreaterThan(0);
			}
		});
	});

	describe("BL1NK_VISUAL_TOOLS (legacy)", () => {
		it("should have 4 tools", () => {
			expect(BL1NK_VISUAL_TOOLS).toHaveLength(4);
		});

		it("should have unique tool names", () => {
			const names = BL1NK_VISUAL_TOOLS.map((t) => t.name);
			const uniqueNames = new Set(names);
			expect(names).toHaveLength(uniqueNames.size);
		});

		it("should have descriptions for all tools", () => {
			for (const tool of BL1NK_VISUAL_TOOLS) {
				expect(tool.description).toBeDefined();
				expect(tool.description.length).toBeGreaterThan(0);
			}
		});
	});

	describe("No duplicate registrations", () => {
		it("should not have overlapping names between GRANULAR_TOOLS and BL1NK_VISUAL_TOOLS", () => {
			const granularNames = new Set(GRANULAR_TOOLS.map((t) => t.name));
			const legacyNames = BL1NK_VISUAL_TOOLS.map((t) => t.name);

			for (const name of legacyNames) {
				expect(granularNames.has(name)).toBe(false);
			}
		});

		it("should not have search_entries in GRANULAR_TOOLS (it has its own tool definition)", () => {
			const granularNames = GRANULAR_TOOLS.map((t) => t.name);
			expect(granularNames).not.toContain("search_entries");
		});
	});

	describe("Schema validity", () => {
		it("should have valid Zod schemas for all granular tools", () => {
			for (const tool of GRANULAR_TOOLS) {
				const schema = Schemas[tool.name as keyof typeof Schemas];
				expect(() => schema.safeParse({})).not.toThrow();
			}
		});

		it("should have analyze_story with text field", () => {
			const schema = Schemas.analyze_story;
			const result = schema.safeParse({ text: "test story" });
			expect(result.success).toBe(true);
		});

		it("should have export_mermaid with graph field", () => {
			const schema = Schemas.export_mermaid;
			const mockGraph = {
				meta: { title: "Test", createdAt: "", updatedAt: "", version: "1.0.0" },
				characters: [],
				conflicts: [],
				events: [],
				relationships: [],
				tags: [],
			};
			const result = schema.safeParse({ graph: mockGraph });
			expect(result.success).toBe(true);
		});

		it("should have validate_story_structure with graph field", () => {
			const schema = Schemas.validate_story_structure;
			const mockGraph = {
				meta: { title: "Test", createdAt: "", updatedAt: "", version: "1.0.0" },
				characters: [],
				conflicts: [],
				events: [],
				relationships: [],
				tags: [],
			};
			const result = schema.safeParse({ graph: mockGraph });
			expect(result.success).toBe(true);
		});
	});

	describe("Executor availability", () => {
		it("should export executeGranularTool function", async () => {
			const { executeGranularTool } = await import("./execute.js");
			expect(executeGranularTool).toBeDefined();
			expect(typeof executeGranularTool).toBe("function");
		});

		it("should export executeStoryTool function", async () => {
			const { executeStoryTool } = await import("./execute.js");
			expect(executeStoryTool).toBeDefined();
			expect(typeof executeStoryTool).toBe("function");
		});
	});
});
