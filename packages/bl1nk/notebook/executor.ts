/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Notebook Execution Runtime for bl1nk-visual-mcp
 * 
 * Integrates bl1nk tools with notebook document management.
 */

import type { StoryGraph } from '../types.js';

// ============================================================================
// Types
// ============================================================================

export type DocumentType = 'markdown' | 'html' | 'json' | 'csv' | 'mermaid';

export interface NotebookDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  sourceType: 'ai' | 'file' | 'web';
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  description?: string;
}

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

export interface BuiltinServerRuntimeOutput {
  content: string;
  state?: CreateDocumentState | UpdateDocumentState | GetDocumentState | DeleteDocumentState;
  success: boolean;
  error?: unknown;
}

// ============================================================================
// Document Service Interface
// ============================================================================

interface DocumentServiceResult {
  content: string | null;
  createdAt: Date;
  description: string | null;
  fileType: string;
  id: string;
  source: string;
  sourceType: 'api' | 'file' | 'web';
  title: string | null;
  totalCharCount: number;
  updatedAt: Date;
}

interface NotebookService {
  associateDocumentWithTask?: (documentId: string, taskId: string) => Promise<void>;
  associateDocumentWithTopic: (documentId: string, topicId: string) => Promise<void>;
  createDocument: (params: {
    content: string;
    fileType: string;
    source: string;
    sourceType: 'api' | 'file' | 'web';
    title: string;
    totalCharCount: number;
    totalLineCount: number;
  }) => Promise<DocumentServiceResult>;
  deleteDocument: (id: string) => Promise<void>;
  getDocument: (id: string) => Promise<DocumentServiceResult | undefined>;
  getDocumentsByTopicId: (topicId: string, filter?: { type?: string }) => Promise<DocumentServiceResult[]>;
  updateDocument: (id: string, params: { content?: string; title?: string }) => Promise<DocumentServiceResult>;
}

// ============================================================================
// Helpers
// ============================================================================

const toNotebookDocument = (doc: DocumentServiceResult): NotebookDocument => {
  return {
    content: doc.content || '',
    createdAt: doc.createdAt.toISOString(),
    description: doc.description || '',
    id: doc.id,
    sourceType: doc.sourceType === 'api' ? 'ai' : doc.sourceType,
    title: doc.title || 'Untitled',
    type: (doc.fileType as DocumentType) || 'markdown',
    updatedAt: doc.updatedAt.toISOString(),
    wordCount: doc.totalCharCount,
  };
};

const countWords = (content: string): number => {
  return content.trim().split(/\s+/).filter(Boolean).length;
};

const countLines = (content: string): number => {
  return content.split('\n').length;
};

// ============================================================================
// Notebook Execution Runtime
// ============================================================================

export class NotebookExecutionRuntime {
  private notebookService: NotebookService;

  constructor(notebookService: NotebookService) {
    this.notebookService = notebookService;
  }

  /**
   * Create artifacts from StoryGraph and save to notebook
   */
  async generateArtifacts(
    graph: StoryGraph,
    options?: { taskId?: string | null; topicId?: string | null },
  ): Promise<BuiltinServerRuntimeOutput[]> {
    const results: BuiltinServerRuntimeOutput[] = [];

    try {
      if (!options?.topicId) {
        return [{
          content: 'Error: No topic context. Artifacts must be created within a topic.',
          success: false,
        }];
      }

      // Generate all artifact types
      const artifacts = await this.generateAllArtifacts(graph);

      // Create document for each artifact
      for (const artifact of artifacts) {
        const result = await this.createDocument(
          {
            title: artifact.title,
            content: artifact.content,
            type: artifact.type,
            description: artifact.description,
          },
          { topicId: options.topicId, taskId: options.taskId }
        );
        results.push(result);
      }

      return results;
    } catch (e) {
      return [{
        content: `Error generating artifacts: ${(e as Error).message}`,
        error: e,
        success: false,
      }];
    }
  }

  /**
   * Generate all artifact types from StoryGraph
   */
  private async generateAllArtifacts(graph: StoryGraph): Promise<Artifact[]> {
    const { toMermaid } = await import('../exporters/mermaid.js');
    const { toCanvasJSON } = await import('../exporters/canvas.js');
    const { toMarkdown } = await import('../exporters/markdown.js');
    const { toDashboard } = await import('../exporters/dashboard.js');
    const { generateCSV } = await import('../utils/csv-generator.js');

    const title = graph.meta.title || 'Untitled Story';

    return [
      {
        title: `${title} - Structure Diagram`,
        type: 'mermaid',
        content: toMermaid(graph, { style: 'default', includeMetadata: true }),
        description: 'Mermaid diagram showing story structure across acts'
      },
      {
        title: `${title} - Canvas`,
        type: 'json',
        content: JSON.stringify(toCanvasJSON(graph, { includeMetadata: true }), null, 2),
        description: 'Canvas JSON for Obsidian canvas visualization'
      },
      {
        title: `${title} - Story Document`,
        type: 'markdown',
        content: toMarkdown(graph, { includeMetadata: true, includeAnalysis: true }),
        description: 'Complete markdown document with story details'
      },
      {
        title: `${title} - Dashboard`,
        type: 'html',
        content: toDashboard(graph, { includeStats: true, includeRecommendations: true }),
        description: 'Interactive HTML dashboard with statistics'
      },
      {
        title: `${title} - Database`,
        type: 'csv',
        content: generateCSV(graph),
        description: 'CSV files for Notion/Airtable import'
      }
    ];
  }

  /**
   * Create a new document in the notebook
   */
  async createDocument(
    args: CreateDocumentArgs,
    options?: { taskId?: string | null; topicId?: string | null },
  ): Promise<BuiltinServerRuntimeOutput> {
    try {
      const { title, content, type = 'markdown', description } = args;

      if (!content) {
        return {
          content: 'Error: Missing content. The document content is required.',
          success: false,
        };
      }

      if (!options?.topicId) {
        return {
          content: 'Error: No topic context. Documents must be created within a topic.',
          success: false,
        };
      }

      // Create document
      const doc = await this.notebookService.createDocument({
        content,
        fileType: type,
        source: `bl1nk:${options.topicId}`,
        sourceType: 'api',
        title,
        totalCharCount: countWords(content),
        totalLineCount: countLines(content),
      });

      // Associate with topic
      await this.notebookService.associateDocumentWithTopic(doc.id, options.topicId);

      // Associate with task if in task execution context
      if (options.taskId && this.notebookService.associateDocumentWithTask) {
        await this.notebookService.associateDocumentWithTask(doc.id, options.taskId);
      }

      const notebookDoc = toNotebookDocument(doc);
      const state: CreateDocumentState = { document: notebookDoc };

      return {
        content: `📄 Created document: "${title}"\n\nType: ${type}\n${description ? `Description: ${description}\n` : ''}\nYou can view and edit this document in the Portal sidebar.`,
        state,
        success: true,
      };
    } catch (e) {
      return {
        content: `Error creating document: ${(e as Error).message}`,
        error: e,
        success: false,
      };
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(args: UpdateDocumentArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const { id, title, content, append } = args;

      // Get existing document
      const existingDoc = await this.notebookService.getDocument(id);
      if (!existingDoc) {
        return {
          content: `Error: Document not found: ${id}`,
          success: false,
        };
      }

      // Prepare update data
      const updateData: { content?: string; title?: string } = {};

      if (title !== undefined) {
        updateData.title = title;
      }

      if (content !== undefined) {
        if (append && existingDoc.content) {
          updateData.content = existingDoc.content + '\n\n' + content;
        } else {
          updateData.content = content;
        }
      }

      const updatedDoc = await this.notebookService.updateDocument(id, updateData);
      const notebookDoc = toNotebookDocument(updatedDoc);
      const state: UpdateDocumentState = { document: notebookDoc };

      const actionDesc = append ? 'Appended to' : 'Updated';

      return {
        content: `📝 ${actionDesc} document: "${notebookDoc.title}"`,
        state,
        success: true,
      };
    } catch (e) {
      return {
        content: `Error updating document: ${(e as Error).message}`,
        error: e,
        success: false,
      };
    }
  }

  /**
   * Get a document by ID
   */
  async getDocument(args: GetDocumentArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const { id } = args;

      const doc = await this.notebookService.getDocument(id);
      if (!doc) {
        return {
          content: `Error: Document not found: ${id}`,
          success: false,
        };
      }

      const notebookDoc = toNotebookDocument(doc);
      const state: GetDocumentState = { document: notebookDoc };

      return {
        content: `📄 Document: "${notebookDoc.title}"\n\n${notebookDoc.content}`,
        state,
        success: true,
      };
    } catch (e) {
      return {
        content: `Error retrieving document: ${(e as Error).message}`,
        error: e,
        success: false,
      };
    }
  }

  /**
   * Delete a document from the notebook
   */
  async deleteDocument(args: DeleteDocumentArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const { id } = args;

      // Verify document exists
      const doc = await this.notebookService.getDocument(id);
      if (!doc) {
        return {
          content: `Error: Document not found: ${id}`,
          success: false,
        };
      }

      await this.notebookService.deleteDocument(id);
      const state: DeleteDocumentState = { deletedId: id };

      return {
        content: `🗑️ Deleted document: "${doc.title}"`,
        state,
        success: true,
      };
    } catch (e) {
      return {
        content: `Error deleting document: ${(e as Error).message}`,
        error: e,
        success: false,
      };
    }
  }
}

// ============================================================================
// Artifact Type
// ============================================================================

interface Artifact {
  title: string;
  type: DocumentType;
  content: string;
  description: string;
}
