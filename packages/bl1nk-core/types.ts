/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Unified Type Definitions for bl1nk-visual-mcp
 *
 * This module consolidates ALL types across the system:
 * - Core Story Types (StoryGraph, Character, Event, Conflict, Relationship)
 * - Parser Types (ExtractedEntity, ExtractionResults)
 * - Validation Types (ValidationResult, ValidationIssue)
 * - Exporter Types (Canvas, Mermaid, Markdown, Dashboard)
 * - Tool Types (Granular Tool Args, Legacy Tool Args)
 * - Search Types (RawEntry, Mention, StoredEntry)
 * - Notebook Types (Document, API types)
 * - Plugin Types (Plugin configuration)
 */

// ============================================================================
// Core Story Types
// ============================================================================

/** Character role in the story */
export type CharacterRole =
	| "protagonist"
	| "antagonist"
	| "mentor"
	| "supporting"
	| "minor";

/** Event importance level */
export type EventImportance =
	| "inciting"
	| "midpoint"
	| "climax"
	| "resolution"
	| "rising";

/** Conflict type classification */
export type ConflictType = "internal" | "external";

/** Story act number */
export type ActNumber = 1 | 2 | 3;

/** Pacing classification */
export type PacingType = "slow" | "balanced" | "fast";

/** Relationship type between characters */
export type RelationshipType =
	| "interacts-with"
	| "ally-of"
	| "enemy-of"
	| "mentor-of"
	| "family-of"
	| "romantic-with";

/** Theme names detected in stories */
export type ThemeName = "love" | "power" | "survival" | "destiny";

/** Emotional tone for events */
export type EmotionalTone =
	| "neutral"
	| "joyful"
	| "sad"
	| "tense"
	| "fearful"
	| "hopeful"
	| "dramatic";

/** Character emotional journey point */
export interface EmotionalJourney {
	stage: string;
	emotion: string;
	description: string;
}

/** Character arc across the story */
export interface CharacterArc {
	start: string;
	midpoint: string;
	end: string;
	transformation: string;
	emotionalJourney: string[];
}

/** Story metadata */
export interface StoryMeta {
	title: string;
	createdAt: string;
	updatedAt: string;
	version: string;
	genre?: string;
}

/** Character in a story */
export interface Character {
	id: string;
	name: string;
	role: CharacterRole;
	traits: string[];
	arc: CharacterArc;
	relationships: string[];
	motivations: string[];
	fears: string[];
	secretsOrLies: string[];
	actAppearances: ActNumber[];
	tags?: string[];
}

/** Conflict escalation stage */
export interface ConflictEscalation {
	stage: number;
	description: string;
	intensity: number;
	affectedCharacters: string[];
}

/** Conflict in a story */
export interface Conflict {
	id: string;
	type: ConflictType;
	description: string;
	relatedCharacters: string[];
	rootCause: string;
	escalations: ConflictEscalation[];
	resolution: string;
	actIntroduced: ActNumber;
}

/** Event node in the story graph */
export interface EventNode {
	id: string;
	label: string;
	description: string;
	act: ActNumber;
	importance: EventImportance;
	sequenceInAct: number;
	location?: string;
	characters: string[];
	conflicts: string[];
	emotionalTone: EmotionalTone;
	consequence: string;
}

/** Relationship between characters */
export interface Relationship {
	from: string;
	to: string;
	type: RelationshipType;
	strength: number;
	description?: string;
}

/** Complete story graph structure */
export interface StoryGraph {
	meta: StoryMeta;
	characters: Character[];
	conflicts: Conflict[];
	events: EventNode[];
	relationships: Relationship[];
	tags: ThemeName[];
}

// ============================================================================
// Parser Types (from core/parser.ts)
// ============================================================================

/** Type of extracted entity */
export type ExtractedEntityType =
	| "character"
	| "event"
	| "conflict"
	| "scene"
	| "location";

/** Raw extracted entity from story text */
export interface ExtractedEntity {
	type: ExtractedEntityType;
	name: string;
	role?: string;
	description?: string;
	raw?: string;
	index: number;
}

/** Results from extracting all story entities */
export interface ExtractionResults {
	title: string;
	characters: ExtractedEntity[];
	events: ExtractedEntity[];
	conflicts: ExtractedEntity[];
	scenes: ExtractedEntity[];
	locations: ExtractedEntity[];
	themes: ThemeName[];
}

// ============================================================================
// Validation Types
// ============================================================================

/** Severity level for validation issues */
export type ValidationSeverity = "error" | "warning" | "info";

/** Validation issue error codes */
export type ValidationCode =
	| "MISSING_TITLE"
	| "NO_CHARACTERS"
	| "NO_PROTAGONIST"
	| "MISSING_ACT1"
	| "MISSING_ACT2"
	| "MISSING_ACT3"
	| "MISSING_CLIMAX"
	| "NO_MIDPOINT"
	| "NO_CONFLICTS"
	| "ACT1_IMBALANCE"
	| "ACT2_IMBALANCE"
	| "ACT3_IMBALANCE"
	| "NO_MOTIVATION"
	| "NO_ARC";

/** Individual validation issue */
export interface ValidationIssue {
	severity: ValidationSeverity;
	code: ValidationCode;
	message: string;
	suggestion?: string;
}

/** Act distribution balance */
export interface ActBalance {
	act1: number;
	act2: number;
	act3: number;
	balance: number;
}

/** Structural analysis of the story */
export interface StoryAnalysis {
	actBalance: ActBalance;
	characterCount: number;
	conflictCount: number;
	eventCount: number;
	hasMidpoint: boolean;
	hasClimax: boolean;
	pacing: PacingType;
}

/** Complete validation result */
export interface ValidationResult {
	isValid: boolean;
	issues: ValidationIssue[];
	analysis: StoryAnalysis;
	recommendations: string[];
}

// ============================================================================
// Canvas/Exporter Types
// ============================================================================

/** Style properties for canvas nodes/edges */
export interface CanvasStyle {
	backgroundColor?: string;
	borderColor?: string;
	borderWidth?: number;
	borderRadius?: string;
	padding?: string;
	shape?: string;
	stroke?: string;
	strokeWidth?: number;
}

/** Node data stored in canvas */
export interface CanvasNodeData {
	label: string;
	description?: string;
	act?: ActNumber;
	importance?: EventImportance;
	emotionalTone?: EmotionalTone;
	role?: CharacterRole;
	traits?: string[];
	arc?: CharacterArc;
	type?: ConflictType;
	intensity?: number;
	[key: string]: unknown;
}

/** Canvas node */
export interface CanvasNode {
	id: string;
	type: string;
	data: CanvasNodeData;
	position: { x: number; y: number };
	style?: CanvasStyle;
}

/** Canvas edge */
export interface CanvasEdge {
	id: string;
	source: string;
	target: string;
	label?: string;
	type?: string;
	animated?: boolean;
	style?: CanvasStyle;
}

/** Canvas viewport configuration */
export interface CanvasViewport {
	x: number;
	y: number;
	zoom: number;
}

/** Canvas export metadata */
export interface CanvasMetadata {
	title: string;
	version: string;
	exportedAt: string;
	stats: {
		events: number;
		characters: number;
		conflicts: number;
	};
}

/** Complete canvas export output */
export interface CanvasExport {
	nodes: CanvasNode[];
	edges: CanvasEdge[];
	viewport: CanvasViewport;
	metadata?: CanvasMetadata;
}

/** Canvas export options */
export interface CanvasExportOptions {
	includeMetadata?: boolean;
	autoLayout?: boolean;
}

// ============================================================================
// Exporter Options Types
// ============================================================================

/** Mermaid diagram style */
export type MermaidStyle = "default" | "dark" | "minimal";

/** Mermaid export options */
export interface MermaidExportOptions {
	style?: MermaidStyle;
	includeMetadata?: boolean;
}

/** Markdown export options */
export interface MarkdownExportOptions {
	includeMetadata?: boolean;
	includeAnalysis?: boolean;
}

/** Dashboard export options */
export interface DashboardExportOptions {
	includeStats?: boolean;
	includeRecommendations?: boolean;
}

/** MCP-UI dashboard export options */
export interface McpUiDashboardExportOptions {
	includeStats?: boolean;
	includeRecommendations?: boolean;
}

/** Union of all exporter options */
export type ExporterOptions =
	| MermaidExportOptions
	| MarkdownExportOptions
	| DashboardExportOptions
	| McpUiDashboardExportOptions
	| CanvasExportOptions;

// ============================================================================
// Tool Arguments Types
// ============================================================================

/** Arguments for analyze_story tool */
export interface AnalyzeStoryArgs {
	text: string;
	includeMetadata?: boolean;
}

/** Arguments for export_mermaid tool */
export interface ExportMermaidArgs {
	graph: StoryGraph;
	style?: MermaidStyle;
	includeMetadata?: boolean;
}

/** Arguments for export_canvas tool */
export interface ExportCanvasArgs {
	graph: StoryGraph;
	includeMetadata?: boolean;
	autoLayout?: boolean;
}

/** Arguments for export_dashboard tool */
export interface ExportDashboardArgs {
	graph: StoryGraph;
	includeStats?: boolean;
	includeRecommendations?: boolean;
}

/** Arguments for export_markdown tool */
export interface ExportMarkdownArgs {
	graph: StoryGraph;
	includeMetadata?: boolean;
	includeAnalysis?: boolean;
}

/** Arguments for validate_story_structure tool */
export interface ValidateStoryStructureArgs {
	graph: StoryGraph;
	strict?: boolean;
	includeRecommendations?: boolean;
}

/** Arguments for extract_characters tool */
export interface ExtractCharactersArgs {
	graph: StoryGraph;
	detailed?: boolean;
}

/** Arguments for extract_conflicts tool */
export interface ExtractConflictsArgs {
	graph: StoryGraph;
	includeEscalation?: boolean;
}

/** Arguments for build_relationship_graph tool */
export interface BuildRelationshipGraphArgs {
	graph: StoryGraph;
	includeStats?: boolean;
}

/** Arguments for export_mcp_ui_dashboard tool */
export interface ExportMcpUiDashboardArgs {
	graph: StoryGraph;
	includeStats?: boolean;
	includeRecommendations?: boolean;
}

/** Search category for exa_search_story */
export type ExaSearchCategory =
	| "writing_techniques"
	| "character_archetypes"
	| "story_tropes"
	| "narrative_structure"
	| "genre_conventions"
	| "conflict_types"
	| "general";

/** Arguments for exa_search_story tool */
export interface ExaSearchArgs {
	query: string;
	category?: ExaSearchCategory;
	numResults?: number;
}

/** Extract options for search_entries */
export interface SearchEntriesExtractOptions {
	characters?: boolean;
	scenes?: boolean;
	locations?: boolean;
	creatures?: boolean;
	objects?: boolean;
}

/** Arguments for search_entries tool (legacy) */
export interface SearchEntriesArgs {
	text: string;
	chapterNumber?: number;
	extractOptions?: SearchEntriesExtractOptions;
}

/** Arguments for validate_story tool (legacy) */
export interface ValidateStoryArgs {
	text: string;
	strict?: boolean;
}

/** Arguments for generate_artifacts tool (legacy) */
export interface GenerateArtifactsArgs {
	graph: StoryGraph;
}

/** Arguments for sync_github tool (legacy - not implemented) */
export interface SyncGithubArgs {
	repository?: string;
	branch?: string;
}

/** Union type for all granular tool arguments */
export type GranularToolArgs =
	| AnalyzeStoryArgs
	| ExportMermaidArgs
	| ExportCanvasArgs
	| ExportDashboardArgs
	| ExportMarkdownArgs
	| ValidateStoryStructureArgs
	| ExtractCharactersArgs
	| ExtractConflictsArgs
	| BuildRelationshipGraphArgs
	| ExportMcpUiDashboardArgs
	| ExaSearchArgs;

/** Union type for all legacy tool arguments */
export type LegacyToolArgs =
	| SearchEntriesArgs
	| ValidateStoryArgs
	| GenerateArtifactsArgs
	| SyncGithubArgs;

/** Union type for all tool arguments */
export type ToolArgs = GranularToolArgs | LegacyToolArgs;

// ============================================================================
// Search/Entity Extraction Types (from tools/search-entries.ts)
// ============================================================================

/** Mention of an entity in text */
export interface Mention {
	chapter: string;
	nameUsed: string;
	context: string;
	speaker?: string;
	surroundingText?: string;
}

/** Raw extracted entry before storage */
export interface RawEntry {
	type: ExtractedEntityType;
	name: string;
	mentions: Mention[];
	context?: Record<string, unknown>;
}

/** Metadata for stored entry */
export interface EntityMetadata {
	type: string;
	id: string;
	canonicalName: string;
	aliases: string[];
	mentions: Mention[];
	relationships: string[];
	tags: string[];
	status?: string;
}

/** Processed stored entry */
export interface StoredEntry {
	entityType: string;
	metadata: EntityMetadata;
	content: string;
}

/** Entity manager entity map */
export interface EntityMap {
	entities: Map<string, RawEntry>;
}

// ============================================================================
// Notebook Types (from notebook/types.ts)
// ============================================================================

/** Document content type */
export type DocumentType = "markdown" | "html" | "json" | "csv" | "mermaid";

/** Document source type */
export type DocumentSourceType = "ai" | "file" | "web";

/** Notebook document */
export interface NotebookDocument {
	id: string;
	title: string;
	content: string;
	type: DocumentType;
	sourceType: DocumentSourceType;
	createdAt: string;
	updatedAt: string;
	wordCount: number;
	description?: string;
}

/** Tool state for create_document */
export interface CreateDocumentState {
	document: NotebookDocument;
}

/** Tool state for update_document */
export interface UpdateDocumentState {
	document: NotebookDocument;
}

/** Tool state for get_document */
export interface GetDocumentState {
	document: NotebookDocument;
}

/** Tool state for delete_document */
export interface DeleteDocumentState {
	deletedId: string;
}

/** Tool state for generate_artifacts */
export interface GenerateArtifactsState {
	documents: NotebookDocument[];
}

/** Notebook API names */
export enum NotebookApiName {
	CREATE_DOCUMENT = "notebook_create_document",
	UPDATE_DOCUMENT = "notebook_update_document",
	GET_DOCUMENT = "notebook_get_document",
	DELETE_DOCUMENT = "notebook_delete_document",
	GENERATE_ARTIFACTS = "notebook_generate_artifacts",
}

/** Notebook identifier */
export const NotebookIdentifier = {
	name: "bl1nk-notebook",
	version: "1.0.0",
	description: "Interactive document management for bl1nk-visual-mcp",
} as const;

// ============================================================================
// Plugin Types (from plugin.ts)
// ============================================================================

/** Plugin tool argument schema shape (for Zod) */
export interface PluginToolArgs {
	[key: string]: unknown;
}

/** Analyze story plugin args */
export interface PluginAnalyzeStoryArgs {
	text: string;
	includeMetadata?: boolean;
}

/** Export mermaid plugin args */
export interface PluginExportMermaidArgs {
	text: string;
	style?: MermaidStyle;
	includeMetadata?: boolean;
}

/** Export markdown plugin args */
export interface PluginExportMarkdownArgs {
	text: string;
	includeMetadata?: boolean;
	includeAnalysis?: boolean;
}

/** Export canvas plugin args */
export interface PluginExportCanvasArgs {
	text: string;
	includeMetadata?: boolean;
}

/** Validate story plugin args */
export interface PluginValidateStoryArgs {
	text: string;
	strict?: boolean;
}

/** Extract characters plugin args */
export interface PluginExtractCharactersArgs {
	text: string;
	detailed?: boolean;
}

/** Extract conflicts plugin args */
export interface PluginExtractConflictsArgs {
	text: string;
	includeEscalation?: boolean;
}

// ============================================================================
// Tool Result Types
// ============================================================================

/** MCP tool result content item */
export interface ToolContentItem {
	type: "text" | "image" | "resource";
	text?: string;
	data?: string;
	mimeType?: string;
}

/** MCP tool result */
export interface ToolResult {
	content: ToolContentItem[];
	isError?: boolean;
}

/** Character extraction result */
export interface CharacterExtractionResult {
	count: number;
	characters: Character[] | Array<Pick<Character, "id" | "name" | "role">>;
}

/** Conflict extraction result */
export interface ConflictExtractionResult {
	count: number;
	conflicts:
		| Conflict[]
		| Array<
				Pick<Conflict, "id" | "type" | "description" | "relatedCharacters">
		  >;
}

/** Relationship graph result */
export interface RelationshipGraphResult {
	count: number;
	relationships: Relationship[];
	stats?: {
		totalRelationships: number;
		totalCharacters: number;
	};
}

// ============================================================================
// Additional Utility Types
// ============================================================================

/** Story graph input (allows partial data) */
export type StoryGraphInput = Partial<StoryGraph>;

/** Export format type */
export type ExportFormat =
	| "mermaid"
	| "canvas"
	| "dashboard"
	| "markdown"
	| "mcp-ui";

/** File generation result */
export interface GeneratedFiles {
	[filename: string]: string;
}

/** CSV row type */
export interface CsvRow {
	[column: string]: string;
}
