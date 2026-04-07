import type { CraftApiClient } from "../client";
import type {
	DataSourceConfig,
	DataSourceResult,
	FieldSchema,
	InitConfig,
} from "../types";
import { fetchBlocks } from "./blocks";
import { fetchCollections } from "./collections";

export interface ResolvedResources {
	documentId?: string;
	folderId?: string;
	collectionId?: string;
	collectionIds?: Record<string, string>;
	spaceId?: string;
	blockUrlTemplate?: string;
}

export function buildCraftWebUrl(
	spaceId: string,
	documentId: string,
	blockId?: string,
): string {
	const base = `https://docs.craft.do/editor/d/${spaceId}/${documentId}`;
	return blockId ? `${base}/x/${blockId}` : base;
}

export function buildCraftBlockUrl(
	blockUrlTemplate: string | undefined,
	blockId: string | undefined,
): string | undefined {
	if (!blockUrlTemplate || !blockId) return undefined;
	return blockUrlTemplate
		.replaceAll("{blockId}", blockId)
		.replaceAll("{{blockId}}", blockId)
		.replaceAll(":blockId", blockId)
		.replaceAll("%BLOCK_ID%", blockId)
		.replaceAll("%s", blockId);
}

/**
 * Merge API-returned schema with the app config's design schema.
 */
export function mergeWithDesignSchema(
	apiSchema: FieldSchema[],
	designProperties?: Record<
		string,
		{ type: string; title: string; enum?: string[] }
	>,
): FieldSchema[] {
	if (!designProperties) return apiSchema;

	const designKeys = Object.keys(designProperties);
	const apiByKey = new Map(apiSchema.map((f) => [f.key, f]));

	const merged: FieldSchema[] = [];
	const seen = new Set<string>();

	for (const key of designKeys) {
		const dp = designProperties[key];
		seen.add(key);

		let fieldType: FieldSchema["type"] = "text";
		if (dp.type === "number") fieldType = "number";
		else if (dp.type === "date") fieldType = "date";
		else if (dp.type === "boolean") fieldType = "boolean";
		else if (dp.enum?.length) fieldType = "enum";

		merged.push({
			key,
			title: dp.title || apiByKey.get(key)?.title || key,
			type: fieldType,
			enum: dp.enum,
			description: apiByKey.get(key)?.description,
		});
	}

	for (const field of apiSchema) {
		if (!seen.has(field.key)) merged.push(field);
	}

	return merged;
}

export async function fetchDataSource(
	client: CraftApiClient,
	config: DataSourceConfig,
	resources?: ResolvedResources,
	initConfig?: InitConfig,
): Promise<DataSourceResult> {
	if (config.type === "collections") {
		return fetchCollections(client, resources, initConfig);
	}
	const spaceId = resources?.spaceId;
	const blockUrlTemplate = resources?.blockUrlTemplate;
 return fetchBlocks(client, config, resources?.documentId, blockUrlTemplate);
}
