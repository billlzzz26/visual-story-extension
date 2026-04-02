/**
 * Exa AI web search integration for story research.
 *
 * Provides real-time web search for story writing references,
 * narrative techniques, character archetypes, and tropes.
 *
 * Requires EXA_API_KEY environment variable.
 */

import { ExaError, retryWithBackoff } from "./utils/error-handler.js";

const EXA_API_URL = "https://api.exa.ai/search";
const EXA_TIMEOUT_MS = 15_000;

export interface ExaSearchResult {
	title: string;
	url: string;
	publishedDate?: string;
	highlights?: string[];
	score?: number;
}

export interface ExaSearchResponse {
	results: ExaSearchResult[];
	query: string;
	category?: string;
	searchType: string;
}

export type StorySearchCategory =
	| "writing_techniques"
	| "character_archetypes"
	| "story_tropes"
	| "narrative_structure"
	| "genre_conventions"
	| "conflict_types"
	| "general";

const CATEGORY_QUERY_SUFFIX: Record<StorySearchCategory, string> = {
	writing_techniques: "writing technique craft narrative",
	character_archetypes: "character archetype storytelling",
	story_tropes: "story trope narrative device",
	narrative_structure: "narrative structure story framework",
	genre_conventions: "genre conventions storytelling",
	conflict_types: "conflict type story dramatic",
	general: "story writing",
};

/**
 * Search the web for story writing references using Exa AI.
 *
 * @param query - Search query
 * @param category - Story search category for better results
 * @param numResults - Number of results to return (1-10)
 * @returns Structured search results with highlights
 */
export async function searchStoryReferences(
	query: string,
	category: StorySearchCategory = "general",
	numResults = 5,
): Promise<ExaSearchResponse> {
	const apiKey = process.env.EXA_API_KEY;
	if (!apiKey) {
		throw new Error(
			"EXA_API_KEY environment variable is not set. " +
				"Get your key at https://dashboard.exa.ai/api-keys and add it to your .env file.",
		);
	}

	const suffix = CATEGORY_QUERY_SUFFIX[category];
	const enrichedQuery = query.toLowerCase().includes(suffix.toLowerCase())
		? query
		: `${query} ${suffix}`;

	const body = {
		query: enrichedQuery,
		type: "auto",
		num_results: Math.min(Math.max(numResults, 1), 10),
		contents: {
			highlights: {
				max_characters: 800,
				num_sentences: 3,
				highlights_per_url: 2,
			},
		},
	};

	// Use retry with backoff for transient errors
	return retryWithBackoff(async () => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), EXA_TIMEOUT_MS);

		let response: Response;
		try {
			response = await fetch(EXA_API_URL, {
				method: "POST",
				headers: {
					"x-api-key": apiKey,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
				signal: controller.signal,
			});
		} catch (error: unknown) {
			if (error instanceof DOMException && error.name === "AbortError") {
				throw new Error(
					`Exa API request timed out after ${EXA_TIMEOUT_MS / 1000}s`,
				);
			}
			throw new Error(
				`Failed to reach Exa API: ${error instanceof Error ? error.message : String(error)}`,
			);
		} finally {
			clearTimeout(timeout);
		}

		if (!response.ok) {
			const errorText = await response.text().catch(() => "unknown error");
			throw new ExaError(
				`Exa API request failed: ${errorText}`,
				response.status,
				new Date().toISOString(),
			);
		}

		let data: any;
		try {
			data = await response.json();
		} catch (error: unknown) {
			throw new ExaError(
				`Exa API returned malformed JSON: ${error instanceof Error ? error.message : String(error)}`,
				response.status,
				new Date().toISOString(),
			);
		}

		const results: ExaSearchResult[] = (data.results ?? []).map((r: any) => ({
			title: r.title ?? "(no title)",
			url: r.url ?? "",
			publishedDate: r.published_date,
			highlights: r.highlights ?? [],
			score: r.score,
		}));

		return {
			results,
			query: enrichedQuery,
			category,
			searchType: "auto",
		};
	}, 2); // maxRetries = 2
}

/**
 * Format Exa search results as readable text for MCP tool output.
 */
export function formatSearchResults(
	response: ExaSearchResponse,
	originalQuery: string,
): string {
	const lines: string[] = [
		`## Exa Search: "${originalQuery}"`,
		`Category: ${response.category ?? "general"} | Results: ${response.results.length}`,
		"",
	];

	if (response.results.length === 0) {
		lines.push("No results found. Try a broader query or different category.");
		return lines.join("\n");
	}

	for (let i = 0; i < response.results.length; i++) {
		const r = response.results[i];
		lines.push(`### ${i + 1}. ${r.title}`);
		lines.push(`URL: ${r.url}`);
		if (r.publishedDate) {
			lines.push(`Published: ${r.publishedDate}`);
		}
		if (r.highlights && r.highlights.length > 0) {
			lines.push("");
			for (const h of r.highlights) {
				lines.push(`> ${h.trim()}`);
			}
		}
		lines.push("");
	}

	return lines.join("\n");
}
