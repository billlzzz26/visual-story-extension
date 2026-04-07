// Craft API types
// Based on the Craft REST API response shapes

// ── Blocks ──────────────────────────────────────────────────────────

export type TextStyle =
	| "h1"
	| "h2"
	| "h3"
	| "h4"
	| "h5"
	| "h6"
	| "p"
	| "caption"
	| "page";
export type ListStyle = "none" | "bullet" | "numbered" | "toggle" | "task";
export type BlockType =
	| "text"
	| "line"
	| "image"
	| "table"
	| "drawing"
	| "file"
	| "code"
	| "url"
	| "video"
	| "horizontalRule";

export interface TaskInfo {
	done: boolean;
	canceled: boolean;
}

export interface BlockMetadata {
	lastModifiedAt?: string;
	createdAt?: string;
	lastModifiedBy?: string;
	createdBy?: string;
	clickableLink?: string;
}

export interface CraftBlock {
	id: string;
	type: BlockType;
	markdown?: string;
	textStyle?: TextStyle;
	listStyle?: ListStyle;
	indentationLevel?: number;
	color?: string;
	taskInfo?: TaskInfo;
	children?: CraftBlock[];
	metadata?: BlockMetadata;
}

// ── Documents ───────────────────────────────────────────────────────

export interface CraftDocument {
	id: string;
	title: string;
	isDeleted: boolean;
	lastModifiedAt?: string;
	createdAt?: string;
	clickableLink?: string;
}

// ── Folders ─────────────────────────────────────────────────────────

export interface CraftFolder {
	id: string;
	name: string;
	documentCount: number;
	folders?: CraftFolder[];
}

// ── Collections ─────────────────────────────────────────────────────

export interface CollectionItem {
	id: string;
	title: string;
	properties: Record<string, unknown>;
	content?: CraftBlock[];
	clickableLink?: string;
}

export interface CollectionSchema {
	type: "object";
	properties: Record<string, SchemaProperty>;
}

export interface SchemaProperty {
	type: string;
	title?: string;
	enum?: string[];
	description?: string;
}

// ── Tasks ───────────────────────────────────────────────────────────

export type TaskScope =
	| "inbox"
	| "active"
	| "upcoming"
	| "logbook"
	| "document";

export interface CraftTask {
	id: string;
	markdown: string;
	taskInfo: {
		state: "todo" | "done" | "canceled";
		scheduleDate?: string;
		deadlineDate?: string;
	};
	location: {
		type: string;
		title?: string;
		date?: string;
		documentId?: string;
	};
	completedAt?: string;
	canceledAt?: string;
}

// ── Search ──────────────────────────────────────────────────────────

export interface SearchResult {
	blockId: string;
	markdown: string;
	pageBlockPath: Array<{ id: string; content: string }>;
	beforeBlocks: Array<{ blockId: string; markdown: string }>;
	afterBlocks: Array<{ blockId: string; markdown: string }>;
}

// ── Connection ──────────────────────────────────────────────────────

export interface ConnectionInfo {
	spaceId: string;
	timezone: string;
	currentTime: string;
	urlTemplates: {
		blockUrl: string;
		dateUrl: string;
	};
}

// ── API Responses ───────────────────────────────────────────────────

export interface ListResponse<T> {
	items: T[];
}

// ── OAuth ───────────────────────────────────────────────────────────

export interface OAuthTokenResponse {
	access_token: string;
	token_type: "bearer";
	expires_in?: number;
	refresh_token?: string;
	scope?: string;
}

// ── Generic Template System ─────────────────────────────────────────

export type LayoutType =
	| "table"
	| "board"
	| "list"
	| "calendar"
	| "cards"
	| "dashboard"
	| "page-builder"
	| "document-viewer"
	| "form"
	| "timer"
	| "split"
	| "timeline"
	| "progress"
	| "gallery"
	| "feed"
	| "search"
	| "chart"
	| "counter"
	| "directory"
	| "routine"
	| "map"
	| "checklist"
	| "journal"
	| "multi-view"
	| "inventory"
	| "ledger"
	| "pipeline"
	| "schedule"
	| "accordion";

export type DataSourceType =
	| "tasks"
	| "collections"
	| "documents"
	| "blocks"
	| "search"
	| "upload"
	| "multi-collection";

export interface DataSourceConfig {
	type: DataSourceType;
	scopes?: string[];
	maxDepth?: number;
	defaultQuery?: string;
}

export interface CollectionInitConfig {
	name: string;
	key?: string;
	mockTitles?: string[];
	mockImages?: string[];
	schema: {
		properties: Record<
			string,
			{ type: string; title: string; enum?: string[] }
		>;
	};
}

export interface InitConfig {
	folder: string;
	document: string;
	collection?: CollectionInitConfig;
	collections?: CollectionInitConfig[];
}

export interface DisplayItem {
	id: string;
	title: string;
	fields: Record<string, unknown>;
	sourceType:
		| "task"
		| "document"
		| "collection-item"
		| "block"
		| "search-result"
		| "upload-item"
		| "folder";
	raw?: unknown;
	craftLink?: string;
}

export interface FieldSchema {
	key: string;
	title: string;
	type: "text" | "number" | "date" | "enum" | "boolean";
	enum?: string[];
	required?: boolean;
	description?: string;
}

export interface DataSourceResult {
	items: DisplayItem[];
	schema: FieldSchema[];
	actions?: DataSourceActions;
	/** Per-collection schemas for multi-collection data sources */
	collectionSchemas?: Record<string, FieldSchema[]>;
	/** Per-collection actions for multi-collection data sources */
	collectionActions?: Record<string, DataSourceActions>;
}

export interface DataSourceActions {
	update?: (
		items: Array<{ id: string; [key: string]: unknown }>,
	) => Promise<void>;
	create?: (item: Record<string, unknown>) => Promise<DisplayItem | undefined>;
	delete?: (ids: string[]) => Promise<void>;
	upload?: (file: File) => Promise<unknown>;
	updateEnumValues?: (
		fieldKey: string,
		values: string[],
	) => Promise<FieldSchema[]>;
}

// ── App Config (from YAML) ──────────────────────────────────────────

export interface AppConfig {
	slug?: string;
	layout: LayoutType;
	dataSource: DataSourceConfig;
	init?: InitConfig;
	config: Record<string, unknown>;
}

// ── Legacy template configs (used by KanbanTemplate, DocumentViewerTemplate) ─

export interface KanbanConfig {
	columns: string[];
	statusField: string;
	enableDragDrop: boolean;
}

export interface DocumentViewerConfig {
	showPreview: boolean;
	lazyLoad: boolean;
	maxDepth: number;
}
