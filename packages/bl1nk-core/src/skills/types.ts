/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Skill types and validation for the bl1nk SkillManager.
 * Inspired by Qwen's skill-manager.ts architecture.
 */

export type SkillLevel = "project" | "user" | "extension" | "bundled";

export interface SkillConfig {
	name: string;
	description: string;
	allowedTools?: string[];
	level: SkillLevel;
	filePath: string;
	body: string;
}

export interface SkillValidationResult {
	isValid: boolean;
	errors: string[];
}

export enum SkillErrorCode {
	PARSE_ERROR = "PARSE_ERROR",
	FILE_ERROR = "FILE_ERROR",
	VALIDATION_ERROR = "VALIDATION_ERROR",
}

export class SkillError extends Error {
	public code: SkillErrorCode;

	constructor(message: string, code: SkillErrorCode) {
		super(message);
		this.name = "SkillError";
		this.code = code;
	}
}

export interface ListSkillsOptions {
	level?: SkillLevel;
	force?: boolean;
}

/**
 * Validate a skill configuration frontmatter.
 */
export function validateSkillConfig(
	config: Partial<SkillConfig>,
): SkillValidationResult {
	const errors: string[] = [];

	if (!config.name || config.name.trim() === "") {
		errors.push('Missing required field: "name"');
	}

	if (!config.description || config.description.trim() === "") {
		errors.push('Missing required field: "description"');
	}

	if (config.allowedTools !== undefined && !Array.isArray(config.allowedTools)) {
		errors.push('"allowedTools" must be an array of strings');
	}

	if (!config.filePath) {
		errors.push('Missing required field: "filePath"');
	}

	if (!config.body || config.body.trim() === "") {
		errors.push('Skill body content is empty');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Parse SKILL.md content: split YAML frontmatter from markdown body.
 */
export function parseSkillContent(
	content: string,
	filePath: string,
	level: SkillLevel,
): SkillConfig {
	const normalizedContent = content.replace(/\r\n/g, "\n");

	const frontmatterRegex = /^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/;
	const match = normalizedContent.match(frontmatterRegex);

	if (!match) {
		throw new SkillError(
			`Invalid format: missing YAML frontmatter in ${filePath}`,
			SkillErrorCode.PARSE_ERROR,
		);
	}

	const [, frontmatterYaml, body] = match;
	const frontmatter = parseSimpleYaml(frontmatterYaml);

	const nameRaw = frontmatter["name"];
	const descriptionRaw = frontmatter["description"];
	const allowedToolsRaw = frontmatter["allowedTools"];

	if (nameRaw == null || nameRaw === "") {
		throw new SkillError(
			`Missing "name" in frontmatter: ${filePath}`,
			SkillErrorCode.PARSE_ERROR,
		);
	}

	if (descriptionRaw == null || descriptionRaw === "") {
		throw new SkillError(
			`Missing "description" in frontmatter: ${filePath}`,
			SkillErrorCode.PARSE_ERROR,
		);
	}

	const name = String(nameRaw);
	const description = String(descriptionRaw);

	let allowedTools: string[] | undefined;
	if (allowedToolsRaw !== undefined) {
		if (Array.isArray(allowedToolsRaw)) {
			allowedTools = allowedToolsRaw.map(String);
		} else {
			throw new SkillError(
				`"allowedTools" must be an array: ${filePath}`,
				SkillErrorCode.PARSE_ERROR,
			);
		}
	}

	const config: SkillConfig = {
		name,
		description,
		allowedTools,
		level,
		filePath,
		body: body.trim(),
	};

	const validation = validateSkillConfig(config);
	if (!validation.isValid) {
		throw new SkillError(
			`Validation failed: ${validation.errors.join(", ")}`,
			SkillErrorCode.VALIDATION_ERROR,
		);
	}

	return config;
}

/**
 * Minimal YAML parser for SKILL.md frontmatter.
 * Handles simple key-value, arrays, and multi-line strings.
 */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
	const result: Record<string, unknown> = Record<string, unknown>();
	const lines = yaml.split("\n");

	let currentKey: string | null = null;
	let currentArray: string[] | null = null;
	let multilineValue = "";
	let isMultiline = false;

	for (const line of lines) {
		// Skip empty lines and comments
		if (line.trim() === "" || line.trim().startsWith("#")) continue;

		// Check for array item (  - value)
		if (line.startsWith("  - ") || line.startsWith("    - ")) {
			if (currentKey && currentArray) {
				const value = line.trim().replace(/^- /, "").trim();
				// Remove quotes if present
				const unquoted = value.replace(/^["']|["']$/g, "");
				currentArray.push(unquoted);
			}
			continue;
		}

		// Check for key: value pair
		const colonIndex = line.indexOf(":");
		if (colonIndex > -1) {
			// Save previous multiline value
			if (isMultiline && currentKey) {
				result[currentKey] = multilineValue.trim();
				isMultiline = false;
				multilineValue = "";
			}

			// Save previous array
			if (currentKey && currentArray) {
				result[currentKey] = currentArray;
				currentArray = null;
			}

			const key = line.substring(0, colonIndex).trim();
			const rawValue = line.substring(colonIndex + 1).trim();

			if (rawValue === "" || rawValue === "|" || rawValue === ">") {
				// Multi-line value or array follows
				currentKey = key;
				if (rawValue === "" && lines[lines.indexOf(line) + 1]?.trim().startsWith("-")) {
					currentArray = [];
				} else {
					isMultiline = true;
				}
			} else {
				// Simple value - remove quotes
				const unquoted = rawValue.replace(/^["']|["']$/g, "");
				result[key] = unquoted;
				currentKey = null;
			}
		} else if (isMultiline && currentKey) {
			multilineValue += "\n" + line;
		}
	}

	// Save final multiline value or array
	if (isMultiline && currentKey) {
		result[currentKey] = multilineValue.trim();
	} else if (currentKey && currentArray) {
		result[currentKey] = currentArray;
	}

	return result;
}
