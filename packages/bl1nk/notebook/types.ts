/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Notebook Types
 */

import type { StoryGraph } from "../types.js";

// ============================================================================
// Document Types
// ============================================================================

export type DocumentType = "markdown" | "html" | "json" | "csv" | "mermaid";

export type DocumentSourceType = "ai" | "file" | "web";

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

// ============================================================================
// Tool Arguments
// ============================================================================

export interface CreateDocumentArgs {
	title: string;
	content: string;
	type?: DocumentType;
	description?: string;
}

export interface UpdateDocumentArgs {
	id: string;
	title?: string;
	content?: string;
	append?: boolean;
}

export interface GetDocumentArgs {
	id: string;
}

export interface DeleteDocumentArgs {
	id: string;
}

export interface GenerateArtifactsArgs {
	graph: StoryGraph; // StoryGraph object
}

// ============================================================================
// Tool States
// ============================================================================

export interface CreateDocumentState {
	document: NotebookDocument;
}

export interface UpdateDocumentState {
	document: NotebookDocument;
}

export interface GetDocumentState {
	document: NotebookDocument;
}

export interface DeleteDocumentState {
	deletedId: string;
}

export interface GenerateArtifactsState {
	documents: NotebookDocument[];
}

// ============================================================================
// API Names
// ============================================================================

export enum NotebookApiName {
	CREATE_DOCUMENT = "notebook_create_document",
	UPDATE_DOCUMENT = "notebook_update_document",
	GET_DOCUMENT = "notebook_get_document",
	DELETE_DOCUMENT = "notebook_delete_document",
	GENERATE_ARTIFACTS = "notebook_generate_artifacts",
}

// ============================================================================
// Identifier
// ============================================================================

export const NotebookIdentifier = {
	name: "bl1nk-notebook",
	version: "1.0.0",
	description: "Interactive document management for bl1nk-visual-mcp",
} as const;
