import { describe, expect, it } from "vitest";
import type { ExaSearchResponse } from "./exa-search.js";
import { formatSearchResults } from "./exa-search.js";

describe("formatSearchResults", () => {
	const baseResponse: ExaSearchResponse = {
		results: [],
		query: "enriched query",
		category: "writing_techniques",
		searchType: "auto",
	};

	it("returns empty message when no results", () => {
		const output = formatSearchResults(baseResponse, "query");
		expect(output).toContain("No results found");
		expect(output).toContain("Category: writing_techniques | Results: 0");
	});

	it("formats a single result with title and url", () => {
		const response: ExaSearchResponse = {
			...baseResponse,
			results: [
				{
					title: "Story Structure Guide",
					url: "https://example.com/story-structure",
					highlights: ["Three acts are essential", "Pacing matters"],
				},
			],
		};
		const output = formatSearchResults(response, "story structure");
		expect(output).toContain('## Exa Search: "story structure"');
		expect(output).toContain("### 1. Story Structure Guide");
		expect(output).toContain("URL: https://example.com/story-structure");
		expect(output).toContain("> Three acts are essential");
		expect(output).toContain("> Pacing matters");
	});

	it("includes published date when present", () => {
		const response: ExaSearchResponse = {
			...baseResponse,
			results: [
				{
					title: "Writing Tips",
					url: "https://example.com/tips",
					publishedDate: "2026-01-15",
				},
			],
		};
		const output = formatSearchResults(response, "tips");
		expect(output).toContain("Published: 2026-01-15");
	});

	it("handles results with no highlights", () => {
		const response: ExaSearchResponse = {
			...baseResponse,
			results: [
				{
					title: "No Highlights",
					url: "https://example.com/no-hl",
				},
			],
		};
		const output = formatSearchResults(response, "test");
		expect(output).toContain("### 1. No Highlights");
		expect(output).not.toContain(">");
	});

	it("formats multiple results with correct numbering", () => {
		const response: ExaSearchResponse = {
			...baseResponse,
			results: [
				{ title: "First", url: "https://a.com" },
				{ title: "Second", url: "https://b.com" },
				{ title: "Third", url: "https://c.com" },
			],
		};
		const output = formatSearchResults(response, "test");
		expect(output).toContain("### 1. First");
		expect(output).toContain("### 2. Second");
		expect(output).toContain("### 3. Third");
	});
});
