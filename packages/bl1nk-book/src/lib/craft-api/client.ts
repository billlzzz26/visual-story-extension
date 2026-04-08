// Typed REST client for the Craft API
// Uses the global connect endpoint: /my/api/...

import type {
	CollectionItem,
	CollectionSchema,
	ConnectionInfo,
	CraftBlock,
	CraftDocument,
	CraftFolder,
	CraftTask,
	ListResponse,
	SearchResult,
	TaskScope,
} from "./types";

import { getConnectBaseUrl } from "./config";

const API_BASE = `${getConnectBaseUrl()}/my/api`;

export type CraftApiErrorHandler = (error: CraftApiError) => void;
export type CraftApiRefreshHandler = () => Promise<string | null>;

export class CraftApiClient {
	private accessToken: string;
	private onError?: CraftApiErrorHandler;
	private onRefresh?: CraftApiRefreshHandler;

	constructor(
		accessToken: string,
		onError?: CraftApiErrorHandler,
		onRefresh?: CraftApiRefreshHandler,
	) {
		this.accessToken = accessToken;
		this.onError = onError;
		this.onRefresh = onRefresh;
	}

	private async request<T>(
		path: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${API_BASE}${path}`;
		let response: Response;

		try {
			response = await fetch(url, {
				...options,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.accessToken}`,
					...options.headers,
				},
			});
		} catch (error) {
			// Handle network errors (connection issues, timeouts, etc.)
			const networkError = new CraftApiError(
				0, // Use 0 for network errors
				`Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
				path,
				{ networkError: true },
			);
			this.onError?.(networkError);
			throw networkError;
		}

		try {
			if (!response.ok) {
				const body = (await response.json().catch(() => ({}))) as Record<
					string,
					unknown
				>;
				const status = response.status;

				// On 401, attempt token refresh and retry once
				if (
					(status === 401 || (body.error as string) === "invalid_token") &&
					this.onRefresh
				) {
					const newToken = await this.onRefresh();
					if (newToken) {
						this.accessToken = newToken;
						let retryResponse: Response;
						try {
							retryResponse = await fetch(url, {
								...options,
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${this.accessToken}`,
									...options.headers,
								},
							});
						} catch (retryFetchError) {
							const networkError = new CraftApiError(
								0,
								`Network error during retry: ${retryFetchError instanceof Error ? retryFetchError.message : "Connection failed"}`,
								path,
								{ networkError: true },
							);
							this.onError?.(networkError);
							throw networkError;
						}

						if (retryResponse.ok) {
							const text = await retryResponse.text();
							if (!text) return undefined as T;
							return JSON.parse(text) as T;
						}

						const retryText = await retryResponse.text();
						let retryBody: Record<string, unknown> = {};
						try {
							const parsedRetryBody = JSON.parse(retryText) as unknown;
							if (
								parsedRetryBody &&
								typeof parsedRetryBody === "object" &&
								!Array.isArray(parsedRetryBody)
							) {
								retryBody = parsedRetryBody as Record<string, unknown>;
							}
						} catch {
							// Ignore parse errors, fall through to default error
						}
						const retryError = new CraftApiError(
							retryResponse.status,
							(retryBody.error as string) || retryResponse.statusText,
							path,
							retryBody,
						);
						this.onError?.(retryError);
						throw retryError;
					}
				}

				const error = new CraftApiError(
					status,
					(body.error as string) || response.statusText,
					path,
					body,
				);
				this.onError?.(error);
				throw error;
			}

			// Handle empty responses (e.g. 204 No Content from DELETE endpoints)
			const text = await response.text();
			if (!text) return undefined as T;
			return JSON.parse(text) as T;
		} catch (error) {
			if (error instanceof CraftApiError) {
				throw error; // Re-throw our custom errors
			}
			// Handle JSON parsing errors or other unexpected errors
			const parseError = new CraftApiError(
				response.status,
				`Response parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				path,
				{ parseError: true },
			);
			this.onError?.(parseError);
			throw parseError;
		}
	}

	// ── Connection ──────────────────────────────────────────────────

	async getConnectionInfo(): Promise<ConnectionInfo> {
		return this.request<ConnectionInfo>("/connection-info");
	}

	// ── Blocks ──────────────────────────────────────────────────────

	async getBlocks(
		params: {
			id?: string;
			date?: string;
			maxDepth?: number;
			fetchMetadata?: boolean;
		} = {},
	): Promise<CraftBlock> {
		const searchParams = new URLSearchParams();
		if (params.id) searchParams.set("id", params.id);
		if (params.date) searchParams.set("date", params.date);
		if (params.maxDepth !== undefined)
			searchParams.set("maxDepth", String(params.maxDepth));
		if (params.fetchMetadata) searchParams.set("fetchMetadata", "true");
		const query = searchParams.toString();
		return this.request<CraftBlock>(`/blocks${query ? `?${query}` : ""}`);
	}

	async insertBlocks(
		blocks: Partial<CraftBlock>[],
		position: {
			position: "start" | "end" | "before" | "after";
			pageId?: string;
			siblingId?: string;
		},
	): Promise<ListResponse<CraftBlock>> {
		return this.request<ListResponse<CraftBlock>>("/blocks", {
			method: "POST",
			body: JSON.stringify({ blocks, position }),
		});
	}

	async updateBlocks(
		blocks: Array<{ id: string; markdown?: string; color?: string }>,
	): Promise<ListResponse<CraftBlock>> {
		return this.request<ListResponse<CraftBlock>>("/blocks", {
			method: "PUT",
			body: JSON.stringify({ blocks }),
		});
	}

	async deleteBlocks(
		blockIds: string[],
	): Promise<ListResponse<{ id: string }>> {
		return this.request<ListResponse<{ id: string }>>("/blocks", {
			method: "DELETE",
			body: JSON.stringify({ blockIds }),
		});
	}

	// ── Documents ───────────────────────────────────────────────────

	async getDocuments(
		params: {
			location?: string;
			folderId?: string;
			fetchMetadata?: boolean;
		} = {},
	): Promise<ListResponse<CraftDocument>> {
		const searchParams = new URLSearchParams();
		if (params.location) searchParams.set("location", params.location);
		if (params.folderId) searchParams.set("folderId", params.folderId);
		if (params.fetchMetadata) searchParams.set("fetchMetadata", "true");
		const query = searchParams.toString();
		return this.request<ListResponse<CraftDocument>>(
			`/documents${query ? `?${query}` : ""}`,
		);
	}

	async createDocument(
		title: string,
		parentFolderId?: string,
	): Promise<CraftDocument> {
		const doc: Record<string, string> = { title };
		if (parentFolderId) doc.parentFolderId = parentFolderId;
		const res = await this.request<ListResponse<CraftDocument>>("/documents", {
			method: "POST",
			body: JSON.stringify({ documents: [doc] }),
		});
		return res.items[0];
	}

	async deleteDocuments(
		documentIds: string[],
	): Promise<ListResponse<{ id: string }>> {
		return this.request<ListResponse<{ id: string }>>("/documents", {
			method: "DELETE",
			body: JSON.stringify({ documentIds }),
		});
	}

	// ── Folders ─────────────────────────────────────────────────────

	async getFolders(): Promise<ListResponse<CraftFolder>> {
		return this.request<ListResponse<CraftFolder>>("/folders");
	}

	// ── Collections ─────────────────────────────────────────────────

	async getCollections(): Promise<ListResponse<{ id: string; name: string }>> {
		return this.request<ListResponse<{ id: string; name: string }>>(
			"/collections",
		);
	}

	async getCollectionSchema(id: string): Promise<CollectionSchema> {
		// The API returns a full JSON Schema; extract the collection field properties
		// from: properties.items.items.properties.properties.properties
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const raw: any = await this.request(`/collections/${id}/schema`);
		const fieldProps =
			raw?.properties?.items?.items?.properties?.properties?.properties;
		if (fieldProps && typeof fieldProps === "object") {
			return { type: "object", properties: fieldProps };
		}
		return { type: "object", properties: {} };
	}

	async getCollectionItems(id: string): Promise<ListResponse<CollectionItem>> {
		return this.request<ListResponse<CollectionItem>>(
			`/collections/${id}/items`,
		);
	}

	async createCollectionItems(
		collectionId: string,
		items: Array<{ title: string; properties?: Record<string, unknown> }>,
	): Promise<ListResponse<CollectionItem>> {
		return this.request<ListResponse<CollectionItem>>(
			`/collections/${collectionId}/items`,
			{
				method: "POST",
				body: JSON.stringify({ items }),
			},
		);
	}

	async updateCollectionItems(
		collectionId: string,
		items: Array<{
			id: string;
			title?: string;
			properties?: Record<string, unknown>;
		}>,
	): Promise<ListResponse<CollectionItem>> {
		return this.request<ListResponse<CollectionItem>>(
			`/collections/${collectionId}/items`,
			{
				method: "PUT",
				body: JSON.stringify({ itemsToUpdate: items }),
			},
		);
	}

	async createTasks(
		tasks: Array<{
			markdown: string;
			taskInfo?: {
				state?: "todo" | "done" | "canceled";
				scheduleDate?: string;
				deadlineDate?: string;
			};
			location: {
				type: "document" | "inbox" | "dailyNote";
				documentId?: string;
				date?: string;
			};
		}>,
	): Promise<ListResponse<CraftTask>> {
		return this.request<ListResponse<CraftTask>>("/tasks", {
			method: "POST",
			body: JSON.stringify({ tasks }),
		});
	}

	async createCollection(
		name: string,
		schema: {
			properties: Record<
				string,
				{ type: string; title: string; enum?: string[] }
			>;
		},
		position: { position: "start" | "end"; pageId?: string } = {
			position: "end",
		},
	): Promise<{
		collectionBlockId: string;
		name: string;
		schema: CollectionSchema;
	}> {
		// Convert from YAML config format { key: { type, title, enum } }
		// to API flat format { name, properties: [{ type, name, options }] }
		const apiProperties = Object.entries(schema.properties).map(([, prop]) => {
			const apiProp: Record<string, unknown> = {
				type: prop.enum
					? "singleSelect"
					: prop.type === "string"
						? "text"
						: prop.type,
				name: prop.title,
			};
			if (prop.enum) {
				apiProp.options = prop.enum.map((v) => ({ name: v }));
			}
			return apiProp;
		});

		return this.request("/collections", {
			method: "POST",
			body: JSON.stringify({
				name,
				schema: { name, properties: apiProperties },
				position,
			}),
		});
	}

	async deleteCollectionItems(
		collectionId: string,
		idsToDelete: string[],
	): Promise<ListResponse<{ id: string }>> {
		return this.request<ListResponse<{ id: string }>>(
			`/collections/${collectionId}/items`,
			{
				method: "DELETE",
				body: JSON.stringify({ idsToDelete }),
			},
		);
	}

	async updateCollectionSchema(
		collectionId: string,
		schema: CollectionSchema,
	): Promise<CollectionSchema> {
		return this.request<CollectionSchema>(
			`/collections/${collectionId}/schema`,
			{
				method: "PUT",
				body: JSON.stringify(schema),
			},
		);
	}

	// ── Tasks ───────────────────────────────────────────────────────

	async getTasks(
		scope: TaskScope,
		documentId?: string,
	): Promise<ListResponse<CraftTask>> {
		const searchParams = new URLSearchParams({ scope });
		if (documentId) searchParams.set("documentId", documentId);
		return this.request<ListResponse<CraftTask>>(`/tasks?${searchParams}`);
	}

	async updateTasks(
		tasks: Array<{
			id: string;
			markdown?: string;
			taskInfo?: {
				state?: "todo" | "done" | "canceled";
				scheduleDate?: string | null;
				deadlineDate?: string | null;
			};
		}>,
	): Promise<ListResponse<CraftTask>> {
		return this.request<ListResponse<CraftTask>>("/tasks", {
			method: "PUT",
			body: JSON.stringify({ tasksToUpdate: tasks }),
		});
	}

	async deleteTasks(
		idsToDelete: string[],
	): Promise<ListResponse<{ id: string }>> {
		return this.request<ListResponse<{ id: string }>>("/tasks", {
			method: "DELETE",
			body: JSON.stringify({ idsToDelete }),
		});
	}

	// ── Upload ──────────────────────────────────────────────────────

	async uploadFile(
		file: File,
		position: { position: "start" | "end"; pageId?: string } = {
			position: "end",
		},
	): Promise<CraftBlock> {
		// Fresh FormData per request — multipart bodies are consumed by fetch and cannot be reused.
		const buildUploadBody = (): FormData => {
			const fd = new FormData();
			fd.append("file", file);
			fd.append("position", JSON.stringify(position));
			return fd;
		};

		const url = `${API_BASE}/upload`;
		let response: Response;

		try {
			response = await fetch(url, {
				method: "POST",
				headers: { Authorization: `Bearer ${this.accessToken}` },
				body: buildUploadBody(),
			});
		} catch (error) {
			const networkError = new CraftApiError(
				0,
				`Network error during upload: ${error instanceof Error ? error.message : 'Connection failed'}`,
				"/upload",
				{ networkError: true },
			);
			this.onError?.(networkError);
			throw networkError;
		}

		try {
			if (!response.ok) {
				const body = (await response.json().catch(() => ({}))) as Record<
					string,
					unknown
				>;

				if (
					(response.status === 401 ||
						(body.error as string) === "invalid_token") &&
					this.onRefresh
				) {
					const newToken = await this.onRefresh();
					if (newToken) {
						this.accessToken = newToken;
						let retryResponse: Response;
						try {
							retryResponse = await fetch(url, {
								method: "POST",
								headers: { Authorization: `Bearer ${this.accessToken}` },
								body: formData,
							});
						} catch (retryFetchError) {
							const networkError = new CraftApiError(
								0,
								`Network error during upload retry: ${retryFetchError instanceof Error ? retryFetchError.message : "Connection failed"}`,
								"/upload",
								{ networkError: true },
							);
							this.onError?.(networkError);
							throw networkError;
						}
						if (retryResponse.ok) {
							const retryText = await retryResponse.text();
							if (!retryText) {
								const emptyErr = new CraftApiError(
									502,
									"Empty upload response",
									"/upload",
									{},
								);
								this.onError?.(emptyErr);
								throw emptyErr;
							}
							try {
								return JSON.parse(retryText) as CraftBlock;
							} catch (parseErr) {
								const parseError = new CraftApiError(
									retryResponse.status,
									`Upload response parsing error: ${parseErr instanceof Error ? parseErr.message : "Unknown error"}`,
									"/upload",
									{ parseError: true },
								);
								this.onError?.(parseError);
								throw parseError;
							}
						}
						const retryBody = (await retryResponse.json().catch(() => ({}))) as Record<
							string,
							unknown
						>;
						const retryError = new CraftApiError(
							retryResponse.status,
							(retryBody.error as string) || retryResponse.statusText,
							"/upload",
							retryBody,
						);
						this.onError?.(retryError);
						throw retryError;
					}
				}

				const error = new CraftApiError(
					response.status,
					(body.error as string) || response.statusText,
					"/upload",
					body,
				);
				this.onError?.(error);
				throw error;
			}

			const text = await response.text();
			if (!text) {
				const emptyErr = new CraftApiError(
					502,
					"Empty upload response",
					"/upload",
					{},
				);
				this.onError?.(emptyErr);
				throw emptyErr;
			}
			try {
				return JSON.parse(text) as CraftBlock;
			} catch (parseErr) {
				const parseError = new CraftApiError(
					response.status,
					`Upload response parsing error: ${parseErr instanceof Error ? parseErr.message : "Unknown error"}`,
					"/upload",
					{ parseError: true },
				);
				this.onError?.(parseError);
				throw parseError;
			}
		} catch (error) {
			if (error instanceof CraftApiError) {
				throw error;
			}
			const parseError = new CraftApiError(
				response.status,
				`Upload response parsing error: ${error instanceof Error ? error.message : "Unknown error"}`,
				"/upload",
				{ parseError: true },
			);
			this.onError?.(parseError);
			throw parseError;
		}
	}

	// ── Search ──────────────────────────────────────────────────────

	async search(pattern: string): Promise<ListResponse<SearchResult>> {
		return this.request<ListResponse<SearchResult>>(
			`/search?pattern=${encodeURIComponent(pattern)}`,
		);
	}

	async searchDocuments(pattern: string): Promise<ListResponse<SearchResult>> {
		return this.request<ListResponse<SearchResult>>(
			`/search/documents?pattern=${encodeURIComponent(pattern)}`,
		);
	}
}

export class CraftApiError extends Error {
	status: number;
	path: string;
	body: Record<string, unknown>;

	constructor(
		status: number,
		message: string,
		path: string,
		body?: Record<string, unknown>,
	) {
		super(message);
		this.name = "CraftApiError";
		this.status = status;
		this.path = path;
		this.body = body ?? {};
	}

	get humanMessage(): string {
		if (this.status === 400)
			return "Invalid request — check your input and try again.";
		if (this.status === 401) return "Session expired — please reconnect.";
		if (this.status === 403)
			return "You don't have permission for this action.";
		if (this.status === 404) return "The requested item was not found.";
		if (this.status === 409)
			return "Conflict — the item was modified elsewhere.";
		if (this.status === 422)
			return "Validation failed — some fields have invalid values.";
		if (this.status === 429) return "Too many requests — please wait a moment.";
		if (this.status >= 500)
			return "Something went wrong on Craft's end. Try again shortly.";
		return this.message || "An unexpected error occurred.";
	}
}
