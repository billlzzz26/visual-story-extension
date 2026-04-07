import type { CraftApiClient } from "../client";
import type {
	DataSourceResult,
	FieldSchema,
	InitConfig,
} from "../types";
import type { ResolvedResources } from "./index";
import { mergeWithDesignSchema } from "./index";

function schemaToFields(
	properties: Record<string, { type: string; title?: string; enum?: string[] }>,
): FieldSchema[] {
	return Object.entries(properties).map(([key, prop]) => {
		let fieldType: FieldSchema["type"] = "text";
		if (prop.type === "number") fieldType = "number";
		else if (prop.type === "date") fieldType = "date";
		else if (prop.type === "boolean") fieldType = "boolean";
		else if (prop.enum?.length) fieldType = "enum";
		return {
			key,
			title: prop.title || key,
			type: fieldType,
			enum: prop.enum,
		};
	});
}

export async function fetchCollections(
	client: CraftApiClient,
	resources: ResolvedResources | undefined,
	initConfig: InitConfig | undefined,
): Promise<DataSourceResult> {
	const collectionId = resources?.collectionId || "";
	const designProperties = initConfig?.collection?.schema?.properties;

	let schema: FieldSchema[] = [];
	let schemaRaw: Record<string, { type: string; title?: string; enum?: string[] }> = {};

	try {
		const schemaRes = await client.getCollectionSchema(collectionId);
		schemaRaw = schemaRes.properties as Record<string, { type: string; title?: string; enum?: string[] }>;
		schema = schemaToFields(schemaRaw);
	} catch {
		if (designProperties) schema = schemaToFields(designProperties);
	}

	if (designProperties) {
		schema = mergeWithDesignSchema(schema, designProperties);
	}

	let items: Array<{ id: string; title: string; properties: Record<string, unknown> }> = [];
	try {
		const itemsRes = await client.getCollectionItems(collectionId);
		items = itemsRes.items;
	} catch {
		items = [];
	}

	return {
		items: items.map((item) => ({
			id: item.id,
			title: item.title,
			fields: item.properties ?? {},
			sourceType: "collection-item" as const,
			raw: item,
		})),
		schema,
		actions: {
			create: async (data) => {
				const result = await client.createCollectionItems(collectionId, [
					{
						title: (data.title as string) || "New Book",
						properties: data,
					},
				]);
				const created = result.items?.[0];
				if (!created) return undefined;
				return {
					id: created.id,
					title: created.title,
					fields: created.properties ?? {},
					sourceType: "collection-item" as const,
					raw: created,
				};
			},
			delete: async (ids) => {
				await client.deleteCollectionItems(collectionId, ids);
			},
			update: async (updates) => {
				await client.updateCollectionItems(
					collectionId,
					updates.map((u) => ({
						id: u.id,
						title: u.title as string | undefined,
						properties: u,
					})),
				);
			},
		},
	};
}
