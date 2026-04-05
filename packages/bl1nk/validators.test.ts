import { describe, expect, it } from "vitest";
import type { StoryGraph } from "./types.js";
import { validateGraph } from "./validators.js";

describe("validateGraph", () => {
	// Helper function to create a minimal valid graph
	const createBaseGraph = (): StoryGraph => ({
		meta: {
			title: "Test Story",
			createdAt: "2025-01-01",
			updatedAt: "2025-01-01",
			version: "1.0",
		},
		characters: [
			{
				id: "char1",
				name: "Hero",
				role: "protagonist",
				traits: ["brave"],
				arc: {
					start: "naive",
					midpoint: "tested",
					end: "wise",
					transformation: "growth",
					emotionalJourney: [],
				},
				relationships: [],
				motivations: ["save the world"],
				fears: [],
				secretsOrLies: [],
				actAppearances: [1, 2, 3],
			},
		],
		conflicts: [
			{
				id: "c1",
				type: "external",
				description: "test",
				relatedCharacters: [],
				rootCause: "",
				escalations: [],
				resolution: "",
				actIntroduced: 1,
			},
		],
		events: [
			{
				id: "e1",
				label: "Event 1",
				description: "",
				act: 1,
				importance: "normal",
				sequenceInAct: 1,
				characters: [],
				conflicts: [],
				emotionalTone: "",
				consequence: "",
			},
			{
				id: "e2",
				label: "Event 2",
				description: "",
				act: 2,
				importance: "midpoint",
				sequenceInAct: 1,
				characters: [],
				conflicts: [],
				emotionalTone: "",
				consequence: "",
			},
			{
				id: "e3",
				label: "Event 3",
				description: "",
				act: 3,
				importance: "climax",
				sequenceInAct: 1,
				characters: [],
				conflicts: [],
				emotionalTone: "",
				consequence: "",
			},
		],
		relationships: [],
		tags: [],
	});

	describe("Basic Structure Validation", () => {
		it("should validate a complete story with all acts", () => {
			const graph = createBaseGraph();
			const result = validateGraph(graph);

			expect(result.isValid).toBe(true);
			expect(result.issues.filter((i) => i.severity === "error").length).toBe(
				0,
			);
			expect(result.analysis.hasClimax).toBe(true);
			expect(result.analysis.hasMidpoint).toBe(true);
		});

		it("should error when title is missing", () => {
			const graph = createBaseGraph();
			graph.meta.title = "";
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "MISSING_TITLE")).toBe(true);
		});

		it("should error when title is only whitespace", () => {
			const graph = createBaseGraph();
			graph.meta.title = "   ";
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "MISSING_TITLE")).toBe(true);
		});

		it("should error when there are no characters", () => {
			const graph = createBaseGraph();
			graph.characters = [];
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "NO_CHARACTERS")).toBe(true);
		});

		it("should error when there is no protagonist", () => {
			const graph = createBaseGraph();
			graph.characters[0].role = "supporting";
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "NO_PROTAGONIST")).toBe(true);
		});
	});

	describe("Act Detection (Optimized Single-Pass)", () => {
		it("should correctly count events in Act 1", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.actBalance.act1).toBe(2);
			expect(result.analysis.actBalance.act2).toBe(1);
			expect(result.analysis.actBalance.act3).toBe(1);
		});

		it("should error when Act 1 is missing", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "MISSING_ACT1")).toBe(true);
		});

		it("should error when Act 2 is missing", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "MISSING_ACT2")).toBe(true);
		});

		it("should error when Act 3 is missing", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "MISSING_ACT3")).toBe(true);
			expect(result.issues.some((i) => i.code === "MISSING_CLIMAX")).toBe(true);
		});

		it("should error for all missing acts when events array is empty", () => {
			const graph = createBaseGraph();
			graph.events = [];
			const result = validateGraph(graph);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "MISSING_ACT1")).toBe(true);
			expect(result.issues.some((i) => i.code === "MISSING_ACT2")).toBe(true);
			expect(result.issues.some((i) => i.code === "MISSING_ACT3")).toBe(true);
		});
	});

	describe("Climax & Midpoint Detection (Optimized Single-Pass)", () => {
		it("should detect climax in single pass", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.hasClimax).toBe(true);
			expect(result.issues.some((i) => i.code === "MISSING_CLIMAX")).toBe(
				false,
			);
		});

		it("should error when climax is missing", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.hasClimax).toBe(false);
			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "MISSING_CLIMAX")).toBe(true);
			expect(
				result.issues.find((i) => i.code === "MISSING_CLIMAX")?.suggestion,
			).toBe('Add an event with importance "climax" in Act 3');
		});

		it("should detect midpoint in single pass", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.hasMidpoint).toBe(true);
			expect(result.issues.some((i) => i.code === "NO_MIDPOINT")).toBe(false);
		});

		it("should warn when midpoint is missing", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.hasMidpoint).toBe(false);
			expect(
				result.issues.some(
					(i) => i.code === "NO_MIDPOINT" && i.severity === "warning",
				),
			).toBe(true);
		});

		it("should handle multiple climax events correctly", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.hasClimax).toBe(true);
			expect(result.issues.some((i) => i.code === "MISSING_CLIMAX")).toBe(
				false,
			);
		});

		it("should handle multiple midpoint events correctly", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.hasMidpoint).toBe(true);
			expect(result.issues.some((i) => i.code === "NO_MIDPOINT")).toBe(false);
		});

		it("should detect both climax and midpoint in same iteration", () => {
			const graph = createBaseGraph();
			const result = validateGraph(graph);

			expect(result.analysis.hasClimax).toBe(true);
			expect(result.analysis.hasMidpoint).toBe(true);
		});
	});

	describe("Act Distribution & Balance", () => {
		it("should warn about Act 1 imbalance when too few events", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e5",
					label: "E5",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 4,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e6",
					label: "E6",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 5,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e7",
					label: "E7",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e8",
					label: "E8",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			// Act 1: 1/8 = 12.5% (below 15%)
			expect(result.issues.some((i) => i.code === "ACT1_IMBALANCE")).toBe(true);
		});

		it("should warn about Act 2 imbalance when too few events", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e5",
					label: "E5",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e6",
					label: "E6",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e7",
					label: "E7",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			// Act 2: 1/7 = 14.3% (below 40%)
			expect(result.issues.some((i) => i.code === "ACT2_IMBALANCE")).toBe(true);
		});

		it("should warn about Act 3 imbalance when too many events", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e5",
					label: "E5",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e6",
					label: "E6",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e7",
					label: "E7",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e8",
					label: "E8",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e9",
					label: "E9",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 4,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			// Act 3: 4/9 = 44.4% (above 35%)
			expect(result.issues.some((i) => i.code === "ACT3_IMBALANCE")).toBe(true);
		});

		it("should not warn about distribution with less than 4 events", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.issues.some((i) => i.code === "ACT1_IMBALANCE")).toBe(
				false,
			);
			expect(result.issues.some((i) => i.code === "ACT2_IMBALANCE")).toBe(
				false,
			);
			expect(result.issues.some((i) => i.code === "ACT3_IMBALANCE")).toBe(
				false,
			);
		});

		it("should calculate act balance correctly", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e5",
					label: "E5",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.actBalance.act1).toBe(1);
			expect(result.analysis.actBalance.act2).toBe(3);
			expect(result.analysis.actBalance.act3).toBe(1);
			// balance = min(1,3,1) / max(1,3,1) = 1/3 ≈ 0.333
			expect(result.analysis.actBalance.balance).toBeCloseTo(0.333, 2);
		});

		it("should handle zero events for balance calculation", () => {
			const graph = createBaseGraph();
			graph.events = [];
			const result = validateGraph(graph);

			expect(result.analysis.actBalance.balance).toBe(0);
		});
	});

	describe("Conflict Validation", () => {
		it("should warn when there are no conflicts", () => {
			const graph = createBaseGraph();
			graph.conflicts = [];
			const result = validateGraph(graph);

			expect(
				result.issues.some(
					(i) => i.code === "NO_CONFLICTS" && i.severity === "warning",
				),
			).toBe(true);
		});

		it("should not warn when conflicts exist", () => {
			const graph = createBaseGraph();
			const result = validateGraph(graph);

			expect(result.issues.some((i) => i.code === "NO_CONFLICTS")).toBe(false);
		});
	});

	describe("Strict Mode Validation", () => {
		it("should error when character has no motivations in strict mode", () => {
			const graph = createBaseGraph();
			graph.characters[0].motivations = [];
			const result = validateGraph(graph, true);

			expect(result.isValid).toBe(false);
			expect(result.issues.some((i) => i.code === "NO_MOTIVATION")).toBe(true);
		});

		it("should not error when character has motivations in strict mode", () => {
			const graph = createBaseGraph();
			const result = validateGraph(graph, true);

			expect(result.issues.some((i) => i.code === "NO_MOTIVATION")).toBe(false);
		});

		it("should warn when character has no transformation in strict mode", () => {
			const graph = createBaseGraph();
			graph.characters[0].arc.transformation = "";
			const result = validateGraph(graph, true);

			expect(
				result.issues.some(
					(i) => i.code === "NO_ARC" && i.severity === "warning",
				),
			).toBe(true);
		});

		it("should not validate motivations/arc in non-strict mode", () => {
			const graph = createBaseGraph();
			graph.characters[0].motivations = [];
			graph.characters[0].arc.transformation = "";
			const result = validateGraph(graph, false);

			expect(result.issues.some((i) => i.code === "NO_MOTIVATION")).toBe(false);
			expect(result.issues.some((i) => i.code === "NO_ARC")).toBe(false);
		});
	});

	describe("Analysis & Recommendations", () => {
		it("should calculate event count correctly", () => {
			const graph = createBaseGraph();
			const result = validateGraph(graph);

			expect(result.analysis.eventCount).toBe(3);
		});

		it("should calculate character count correctly", () => {
			const graph = createBaseGraph();
			const result = validateGraph(graph);

			expect(result.analysis.characterCount).toBe(1);
		});

		it("should calculate conflict count correctly", () => {
			const graph = createBaseGraph();
			const result = validateGraph(graph);

			expect(result.analysis.conflictCount).toBe(1);
		});

		it("should determine pacing as slow for few events", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.pacing).toBe("slow");
		});

		it("should determine pacing as fast for many events", () => {
			const graph = createBaseGraph();
			graph.events = Array.from({ length: 20 }, (_, i) => ({
				id: `e${i}`,
				label: `E${i}`,
				description: "",
				act: i < 7 ? 1 : i < 14 ? 2 : 3,
				importance: i === 19 ? "climax" : i === 10 ? "midpoint" : "normal",
				sequenceInAct: i,
				characters: [],
				conflicts: [],
				emotionalTone: "",
				consequence: "",
			}));
			const result = validateGraph(graph);

			expect(result.analysis.pacing).toBe("fast");
		});

		it("should determine pacing as balanced for moderate events", () => {
			const graph = createBaseGraph();
			graph.events = Array.from({ length: 10 }, (_, i) => ({
				id: `e${i}`,
				label: `E${i}`,
				description: "",
				act: i < 3 ? 1 : i < 7 ? 2 : 3,
				importance: i === 9 ? "climax" : i === 5 ? "midpoint" : "normal",
				sequenceInAct: i,
				characters: [],
				conflicts: [],
				emotionalTone: "",
				consequence: "",
			}));
			const result = validateGraph(graph);

			expect(result.analysis.pacing).toBe("balanced");
		});

		it("should recommend defining climax when missing", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.recommendations).toContain(
				"Define a clear Climax in Act 3 to resolve the main conflict",
			);
		});

		it("should recommend expanding Act 2 when too small", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e5",
					label: "E5",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e6",
					label: "E6",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e7",
					label: "E7",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			// Act 2: 1/7 = 14.3% (below 40%)
			expect(result.recommendations).toContain(
				"Expand Act 2 to develop the rising action and character relationships",
			);
		});

		it("should recommend adding conflicts when too few", () => {
			const graph = createBaseGraph();
			graph.conflicts = [];
			const result = validateGraph(graph);

			expect(result.recommendations).toContain(
				"Consider adding subplots or internal conflicts to increase depth",
			);
		});
	});

	describe("Edge Cases & Boundary Conditions", () => {
		it("should handle story with single event", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.eventCount).toBe(1);
			expect(result.analysis.actBalance.act1).toBe(0);
			expect(result.analysis.actBalance.act2).toBe(1);
			expect(result.analysis.actBalance.act3).toBe(0);
		});

		it("should handle events with same importance value", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.hasClimax).toBe(true);
			expect(result.isValid).toBe(true);
		});

		it("should handle large number of events efficiently", () => {
			const graph = createBaseGraph();
			graph.events = Array.from({ length: 1000 }, (_, i) => ({
				id: `e${i}`,
				label: `E${i}`,
				description: "",
				act: i < 333 ? 1 : i < 666 ? 2 : 3,
				importance: i === 999 ? "climax" : i === 500 ? "midpoint" : "normal",
				sequenceInAct: i,
				characters: [],
				conflicts: [],
				emotionalTone: "",
				consequence: "",
			}));
			const result = validateGraph(graph);

			expect(result.analysis.eventCount).toBe(1000);
			expect(result.analysis.actBalance.act1).toBe(333);
			expect(result.analysis.actBalance.act2).toBe(333);
			expect(result.analysis.actBalance.act3).toBe(334);
			expect(result.analysis.hasClimax).toBe(true);
			expect(result.analysis.hasMidpoint).toBe(true);
		});

		it("should correctly track hasMidpoint and hasClimax when both are false initially", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			expect(result.analysis.hasClimax).toBe(false);
			expect(result.analysis.hasMidpoint).toBe(false);
		});

		it("should handle mixed case importance values", () => {
			const graph = createBaseGraph();
			// Note: This tests current behavior - the code is case-sensitive
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "Normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "Midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "Climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			const result = validateGraph(graph);

			// Case-sensitive comparison means these won't match
			expect(result.analysis.hasClimax).toBe(false);
			expect(result.analysis.hasMidpoint).toBe(false);
		});
	});

	describe("Performance Regression Tests", () => {
		it("should only iterate through events once for act counting", () => {
			// This should fail if validateGraph iterates over events more than once
			const graph = createBaseGraph();
			const rawEvents = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e5",
					label: "E5",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e6",
					label: "E6",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e7",
					label: "E7",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];
			let iteratorCalls = 0;
			graph.events = new Proxy(rawEvents, {
				get(target, prop, receiver) {
					if (prop === Symbol.iterator) iteratorCalls += 1;
					return Reflect.get(target, prop, receiver);
				},
			});

			const result = validateGraph(graph);

			// Verify all counts are correct (which proves single-pass worked)
			expect(result.analysis.actBalance.act1).toBe(2);
			expect(result.analysis.actBalance.act2).toBe(3);
			expect(result.analysis.actBalance.act3).toBe(2);
			expect(result.analysis.hasClimax).toBe(true);
			expect(result.analysis.hasMidpoint).toBe(true);
			expect(result.analysis.eventCount).toBe(7);
			expect(iteratorCalls).toBe(1);
		});

		it("should handle events with climax and midpoint in any order", () => {
			// Test order independence of single-pass optimization
			const graph1 = createBaseGraph();
			graph1.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];

			const graph2 = createBaseGraph();
			graph2.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];

			const result1 = validateGraph(graph1);
			const result2 = validateGraph(graph2);

			// Both should detect climax and midpoint regardless of order
			expect(result1.analysis.hasClimax).toBe(true);
			expect(result1.analysis.hasMidpoint).toBe(true);
			expect(result2.analysis.hasClimax).toBe(true);
			expect(result2.analysis.hasMidpoint).toBe(true);
		});

		it("should handle events with invalid act numbers gracefully", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 0,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e5",
					label: "E5",
					description: "",
					act: 4,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];

			const result = validateGraph(graph);

			// Should only count valid acts (1, 2, 3)
			expect(result.analysis.actBalance.act1).toBe(1);
			expect(result.analysis.actBalance.act2).toBe(1);
			expect(result.analysis.actBalance.act3).toBe(1);
			// Event count should include all events
			expect(result.analysis.eventCount).toBe(5);
			expect(result.analysis.hasClimax).toBe(true);
			expect(result.analysis.hasMidpoint).toBe(true);
		});

		it("should correctly detect importance in first event of loop", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "climax",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];

			const result = validateGraph(graph);

			expect(result.analysis.hasClimax).toBe(true);
			expect(result.issues.some((i) => i.code === "MISSING_CLIMAX")).toBe(
				false,
			);
		});

		it("should correctly detect importance in last event of loop", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 3,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];

			const result = validateGraph(graph);

			expect(result.analysis.hasMidpoint).toBe(true);
			expect(result.issues.some((i) => i.code === "NO_MIDPOINT")).toBe(false);
		});

		it("should maintain correct counts with events across all acts in mixed order", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 3,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e4",
					label: "E4",
					description: "",
					act: 1,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e5",
					label: "E5",
					description: "",
					act: 3,
					importance: "climax",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e6",
					label: "E6",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];

			const result = validateGraph(graph);

			expect(result.analysis.actBalance.act1).toBe(2);
			expect(result.analysis.actBalance.act2).toBe(2);
			expect(result.analysis.actBalance.act3).toBe(2);
			expect(result.analysis.hasClimax).toBe(true);
			expect(result.analysis.hasMidpoint).toBe(true);
		});

		it("should handle balance calculation when all events in one act", () => {
			const graph = createBaseGraph();
			graph.events = [
				{
					id: "e1",
					label: "E1",
					description: "",
					act: 2,
					importance: "normal",
					sequenceInAct: 1,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e2",
					label: "E2",
					description: "",
					act: 2,
					importance: "midpoint",
					sequenceInAct: 2,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
				{
					id: "e3",
					label: "E3",
					description: "",
					act: 2,
					importance: "climax",
					sequenceInAct: 3,
					characters: [],
					conflicts: [],
					emotionalTone: "",
					consequence: "",
				},
			];

			const result = validateGraph(graph);

			expect(result.analysis.actBalance.act1).toBe(0);
			expect(result.analysis.actBalance.act2).toBe(3);
			expect(result.analysis.actBalance.act3).toBe(0);
			// balance = min(0,3,0) / max(0,3,0) = 0/3 = 0
			expect(result.analysis.actBalance.balance).toBe(0);
		});
	});
});
