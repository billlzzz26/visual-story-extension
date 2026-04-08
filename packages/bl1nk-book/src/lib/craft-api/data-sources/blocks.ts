import { type CraftApiClient, CraftApiError } from "../client";
import type {
	CraftBlock,
	DataSourceConfig,
	DataSourceResult,
	FieldSchema,
} from "../types";
import { buildCraftBlockUrl } from "./index";

const BLOCK_SCHEMA: FieldSchema[] = [
	{ key: "type", title: "Type", type: "text" },
	{ key: "textStyle", title: "Style", type: "text" },
	{ key: "listStyle", title: "List", type: "text" },
];

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRootBlockWithRetry(
	client: CraftApiClient,
	params: { id?: string; maxDepth?: number },
): Promise<CraftBlock | null> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			return await client.getBlocks(params);
		} catch (err) {
			lastError = err;
			const isRetryable =
				err instanceof TypeError ||
				(err instanceof CraftApiError &&
					(err.status === 0 ||
						err.status === 404 ||
						err.status === 429));
			if (!isRetryable || attempt === 3) break;
			console.warn(
				`[fetchBlocks] Root block lookup failed on attempt ${attempt}/3; retrying…`,
				err,
			);
			await sleep(250 * attempt);
		}
	}

	if (lastError instanceof CraftApiError && lastError.status === 404) {
     throw lastError;
	}

	if (lastError instanceof CraftApiError && lastError.status === 429) {
		console.warn(
			"[fetchBlocks] Block lookup hit rate limit; returning an empty block list for now.",
			lastError,
		);
		return null;
	}

	if (lastError instanceof TypeError) {
		console.warn(
			"[fetchBlocks] Block lookup failed to fetch; returning an empty block list for now.",
			lastError,
		);
		return null;
	}

	if (
		lastError instanceof CraftApiError &&
		lastError.status === 0
	) {
		console.warn(
			"[fetchBlocks] Block lookup network error; returning an empty block list for now.",
			lastError,
		);
		return null;
	}

	throw lastError;
}

export async function fetchBlocks(
	client: CraftApiClient,
	config: DataSourceConfig,
	documentId?: string,
	blockUrlTemplate?: string,
): Promise<DataSourceResult> {
	const rootBlock = await fetchRootBlockWithRetry(client, {
		id: documentId,
		maxDepth: config.maxDepth ?? 3,
	});

	const children = rootBlock?.children || [];

	return {
		items: children.map((block) => ({
			id: block.id,
			title: block.markdown || "",
			fields: {
				type: block.type,
				textStyle: block.textStyle,
				listStyle: block.listStyle,
				indentationLevel: block.indentationLevel,
				taskInfo: block.taskInfo,
				children: block.children,
			},
			sourceType: "block" as const,
			raw: block,
			craftLink: buildCraftBlockUrl(blockUrlTemplate, block.id),
		})),
		schema: BLOCK_SCHEMA,
		actions: {
			update: async (updates) => {
				await client.updateBlocks(
					updates.map((u) => ({
						id: u.id,
						markdown:
							(u.markdown as string | undefined) ??
							(u.title as string | undefined),
						color: u.color as string | undefined,
					})),
				);
			},
			create: async (item) => {
    const targetPageId = documentId ?? rootBlock?.id;
                    if (!targetPageId) return undefined;
                    const result = await client.insertBlocks(
                        [{ type: "text", markdown: (item.title as string) || "" }],
                        {
                            position: "end",
                            pageId: targetPageId,
					},
				);
				const block = result.items?.[0];
				const { title, ...rest } = item;
				return {
					id: block?.id || `temp-${Date.now()}`,
					title: (title as string) || "",
					fields: {
						type: block?.type || "text",
						textStyle: block?.textStyle,
						listStyle: block?.listStyle,
						...rest,
					},
					sourceType: "block" as const,
					raw: block || {},
				};
			},
			delete: async (ids) => {
				await client.deleteBlocks(ids);
			},
		},
	};
}
