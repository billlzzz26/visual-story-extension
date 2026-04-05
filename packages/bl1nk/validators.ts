import type { StoryGraph, ValidationResult } from "./types.js";

/**
 * Validate a story graph for structural and content rules, returning detected issues, analysis, and recommendations.
 *
 * Performs checks for required metadata, character roles, act presence and distribution, midpoint/climax presence, conflicts, and (when `strict` is true) character motivations and arcs.
 *
 * @param graph - The story graph to validate
 * @param strict - When true, enforce stricter character checks (motivations and transformation arcs)
 * @returns A ValidationResult containing:
 * - `isValid`: `true` if no issues with severity `"error"` were found, `false` otherwise.
 * - `issues`: an array of detected issues (severity, code, message, optional suggestion).
 * - `analysis`: summary metrics (act counts and balance ratio, character/conflict/event counts, midpoint/climax flags, pacing).
 * - `recommendations`: actionable suggestions derived from the analysis.
 */
export function validateGraph(
	graph: StoryGraph,
	strict = false,
): ValidationResult {
	const issues: Array<{
		severity: string;
		code: string;
		message: string;
		suggestion?: string;
	}> = [];
	const addIssue = (
		severity: string,
		code: string,
		message: string,
		suggestion?: string,
	) => {
		issues.push({ severity, code, message, suggestion });
	};

	// 1. Basic Structure checks
	if (!graph.meta.title || graph.meta.title.trim() === "") {
		addIssue("error", "MISSING_TITLE", "Story must have a title");
	}

	if (graph.characters.length === 0) {
		addIssue(
			"error",
			"NO_CHARACTERS",
			"Story must have at least one character",
		);
	}

	if (
		!graph.characters.some(
			(c) => (c.role || "").toLowerCase() === "protagonist",
		)
	) {
		addIssue("error", "NO_PROTAGONIST", "Story must have a protagonist");
	}

	// Optimized single pass over events to collect statistics
	let act1Count = 0;
	let act2Count = 0;
	let act3Count = 0;
	let hasClimax = false;
	let hasMidpoint = false;
	const eventCount = graph.events.length;

	for (const e of graph.events) {
		if (e.act === 1) act1Count++;
		else if (e.act === 2) act2Count++;
		else if (e.act === 3) act3Count++;

		if (e.importance === "climax") hasClimax = true;
		if (e.importance === "midpoint") hasMidpoint = true;
	}

	if (act1Count === 0)
		addIssue("error", "MISSING_ACT1", "Story must have Act 1 events");
	if (act2Count === 0)
		addIssue("error", "MISSING_ACT2", "Story must have Act 2 events");
	if (act3Count === 0)
		addIssue("error", "MISSING_ACT3", "Story must have Act 3 events");

	// 2. Climax & Midpoint Check (High Priority)
	if (!hasClimax) {
		addIssue(
			"error",
			"MISSING_CLIMAX",
			"Story structure is incomplete: Missing a Climax",
			'Add an event with importance "climax" in Act 3',
		);
	}

	if (!hasMidpoint) {
		addIssue(
			"warning",
			"NO_MIDPOINT",
			"Story should have a midpoint event",
			"Add a midpoint event in Act 2",
		);
	}

	if (graph.conflicts.length === 0) {
		addIssue(
			"warning",
			"NO_CONFLICTS",
			"Story should have at least one conflict to drive the plot",
		);
	}

	// 3. Act Distribution Check (25-50-25 Rule)

	if (eventCount >= 4) {
		const act1Pct = (act1Count / eventCount) * 100;
		const act2Pct = (act2Count / eventCount) * 100;
		const act3Pct = (act3Count / eventCount) * 100;

		// Ideal: 25-50-25. Allow some variance (e.g., 15-35% for Act 1/3, 40-60% for Act 2)
		if (act1Pct < 15 || act1Pct > 35) {
			addIssue(
				"warning",
				"ACT1_IMBALANCE",
				`Act 1 distribution is ${act1Pct.toFixed(1)}% (Ideal: ~25%)`,
				"Adjust event count in Act 1",
			);
		}
		if (act2Pct < 40 || act2Pct > 65) {
			addIssue(
				"warning",
				"ACT2_IMBALANCE",
				`Act 2 distribution is ${act2Pct.toFixed(1)}% (Ideal: ~50%)`,
				"Adjust event count in Act 2",
			);
		}
		if (act3Pct < 15 || act3Pct > 35) {
			addIssue(
				"warning",
				"ACT3_IMBALANCE",
				`Act 3 distribution is ${act3Pct.toFixed(1)}% (Ideal: ~25%)`,
				"Adjust event count in Act 3",
			);
		}
	}

	// 4. Character Motivation Check (Strict Mode)
	if (strict) {
		for (const c of graph.characters) {
			if (!c.motivations || c.motivations.length === 0) {
				addIssue(
					"error",
					"NO_MOTIVATION",
					`Character "${c.name}" has no defined motivations`,
				);
			}
			if (
				!c.arc ||
				typeof c.arc.transformation !== "string" ||
				c.arc.transformation.trim() === ""
			) {
				addIssue(
					"warning",
					"NO_ARC",
					`Character "${c.name}" has no defined transformation arc`,
				);
			}
		}
	}

	// 5. Analysis Summary
	const recommendations: string[] = [];
	if (!hasClimax)
		recommendations.push(
			"Define a clear Climax in Act 3 to resolve the main conflict",
		);
	if (eventCount > 0 && act2Count / eventCount < 0.4)
		recommendations.push(
			"Expand Act 2 to develop the rising action and character relationships",
		);
	if (graph.conflicts.length < 2)
		recommendations.push(
			"Consider adding subplots or internal conflicts to increase depth",
		);

	return {
		isValid: !issues.some((i) => i.severity === "error"),
		issues,
		analysis: {
			actBalance: {
				act1: act1Count,
				act2: act2Count,
				act3: act3Count,
				balance:
					eventCount > 0
						? Math.min(act1Count, act2Count, act3Count) /
							(Math.max(act1Count, act2Count, act3Count) || 1)
						: 0,
			},
			characterCount: graph.characters.length,
			conflictCount: graph.conflicts.length,
			eventCount: eventCount,
			hasMidpoint: hasMidpoint,
			hasClimax: hasClimax,
			pacing: eventCount < 5 ? "slow" : eventCount > 15 ? "fast" : "balanced",
		},
		recommendations,
	};
}
