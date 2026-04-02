/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 *
 * Notebook Manifest
 */

export interface NotebookManifest {
	name: string;
	version: string;
	description: string;
	tools: NotebookToolManifest[];
}

export interface NotebookToolManifest {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
}

export const NOTEBOOK_MANIFEST: NotebookManifest = {
	name: "bl1nk-notebook",
	version: "1.0.0",
	description: "Interactive document management for bl1nk-visual-mcp artifacts",
	tools: [
		{
			name: "notebook_create_document",
			description: "Create a new document in the notebook",
			inputSchema: {
				type: "object",
				properties: {
					title: { type: "string", description: "Document title" },
					content: { type: "string", description: "Document content" },
					type: {
						type: "string",
						enum: ["markdown", "html", "json", "csv", "mermaid"],
						description: "Document type",
					},
					description: { type: "string", description: "Optional description" },
				},
				required: ["title", "content"],
			},
		},
		{
			name: "notebook_update_document",
			description: "Update an existing document",
			inputSchema: {
				type: "object",
				properties: {
					id: { type: "string", description: "Document ID" },
					title: { type: "string", description: "New title" },
					content: { type: "string", description: "New content" },
					append: {
						type: "boolean",
						description: "Append to existing content",
					},
				},
				required: ["id"],
			},
		},
		{
			name: "notebook_get_document",
			description: "Get a document by ID",
			inputSchema: {
				type: "object",
				properties: {
					id: { type: "string", description: "Document ID" },
				},
				required: ["id"],
			},
		},
		{
			name: "notebook_delete_document",
			description: "Delete a document",
			inputSchema: {
				type: "object",
				properties: {
					id: { type: "string", description: "Document ID" },
				},
				required: ["id"],
			},
		},
		{
			name: "notebook_generate_artifacts",
			description: "Generate all artifacts from StoryGraph automatically",
			inputSchema: {
				type: "object",
				properties: {
					graph: { type: "object", description: "StoryGraph JSON object" },
				},
				required: ["graph"],
			},
		},
	],
};
