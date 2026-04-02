// Simple types for bl1nk-visual-mcp

export interface StoryGraph {
	meta: {
		title: string;
		createdAt: string;
		updatedAt: string;
		version: string;
		genre?: string;
	};
	characters: Character[];
	conflicts: Conflict[];
	events: EventNode[];
	relationships: Relationship[];
	tags: string[];
}

export interface Character {
	id: string;
	name: string;
	role: string;
	traits: string[];
	arc: {
		start: string;
		midpoint: string;
		end: string;
		transformation: string;
		emotionalJourney: string[];
	};
	relationships: string[];
	motivations: string[];
	fears: string[];
	secretsOrLies: string[];
	actAppearances: number[];
}

export interface Conflict {
	id: string;
	type: string;
	description: string;
	relatedCharacters: string[];
	rootCause: string;
	escalations: Array<{
		stage: number;
		description: string;
		intensity: number;
		affectedCharacters: string[];
	}>;
	resolution: string;
	actIntroduced: number;
}

export interface EventNode {
	id: string;
	label: string;
	description: string;
	act: number;
	importance: string;
	sequenceInAct: number;
	location?: string;
	characters: string[];
	conflicts: string[];
	emotionalTone: string;
	consequence: string;
}

export interface Relationship {
	from: string;
	to: string;
	type: string;
	strength: number;
	description?: string;
}

export interface ValidationResult {
	isValid: boolean;
	issues: Array<{
		severity: string;
		code: string;
		message: string;
		suggestion?: string;
	}>;
	analysis: {
		actBalance: { act1: number; act2: number; act3: number; balance: number };
		characterCount: number;
		conflictCount: number;
		eventCount: number;
		hasMidpoint: boolean;
		hasClimax: boolean;
		pacing: string;
	};
	recommendations: string[];
}
