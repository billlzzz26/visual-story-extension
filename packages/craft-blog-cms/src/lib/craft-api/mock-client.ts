"use client";

import type { CraftApiClient } from "./client";
import type {
	AppConfig,
	CollectionItem,
	CraftBlock,
	CraftDocument,
	CraftFolder,
	CraftTask,
} from "./types";

const GENERIC_TASKS = [
	"Review incoming items",
	"Update workspace data",
	"Prepare next milestone",
	"Follow up with collaborators",
	"Check recent changes",
	"Plan next action",
] as const;
const GENERIC_DOCUMENTS = [
	"Article Workspace",
	"Notes",
	"Reference",
	"Archive",
] as const;
const GENERIC_SEARCH = [
	"Recent workspace note",
	"Important record",
	"Pinned reference",
	"Example content",
] as const;

function seededRandom(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 16807 + 0) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

function hashStr(s: string): number {
	return s.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 1);
}

const DENSE_LAYOUTS = new Set([
	"swimlane",
	"matrix",
	"heatmap",
	"calendar",
	"timeline",
	"gantt",
	"schedule",
]);

export function generateMockItems(
	schema: {
		properties: Record<
			string,
			{ type: string; title: string; enum?: string[] }
		>;
	},
	collectionName?: string,
	slug?: string,
	itemCount?: number,
	layout?: string,
	mockTitles?: string[],
	mockImages?: string[],
): CollectionItem[] {
	const count = itemCount || (layout && DENSE_LAYOUTS.has(layout) ? 16 : 8);
	const nameKey = collectionName?.toLowerCase().replace(/\s+/g, "") || "item";
	const titleSamples = mockTitles?.length
		? mockTitles
		: Array.from(
				{ length: count },
				(_, i) => `${collectionName || "Item"} ${i + 1}`,
			);
	const rand = seededRandom(hashStr(`${nameKey}:${slug || ""}`));

	return Array.from({ length: count }, (_, i) => {
		const properties: Record<string, unknown> = {};

		for (const [key, prop] of Object.entries(schema.properties)) {
			if (prop.enum?.length) {
				properties[key] = prop.enum[i % prop.enum.length];
			} else if (prop.type === "number") {
				if (/amount|value|price|budget|cost/i.test(key))
					properties[key] = Math.floor(rand() * 5000) + 100;
				else if (/rating/i.test(key)) properties[key] = (i % 5) + 1;
				else if (/progress|score|count|total|qty|quantity/i.test(key))
					properties[key] = Math.floor(rand() * 100) + 1;
				else properties[key] = Math.floor(rand() * 50) + 1;
			} else if (prop.type === "date") {
				const d = new Date("2026-03-01");
				d.setDate(d.getDate() + ((i * 3) % 28));
				properties[key] = d.toISOString().split("T")[0];
			} else if (prop.type === "boolean") {
				properties[key] = i % 3 !== 2;
			} else if (/image|photo|thumbnail|picture|cover|avatar/i.test(key)) {
				if (mockImages?.length)
					properties[key] = mockImages[i % mockImages.length];
				else
					properties[key] =
						`https://picsum.photos/seed/${nameKey}-${key}-${i}/400/300`;
			} else if (/email/i.test(key)) {
				properties[key] = `person${i + 1}@example.com`;
			} else if (/url|website|link/i.test(key)) {
				properties[key] = `https://example.com/${nameKey}/${i + 1}`;
			} else {
				properties[key] = `${prop.title || key} ${i + 1}`;
			}
		}

		return {
			id: `mock-item-${i + 1}`,
			title: titleSamples[i % titleSamples.length],
			properties,
		};
	});
}

function createMockBlocks(documentName: string): CraftBlock[] {
	return [
		{
			id: "b1",
			type: "text",
			textStyle: "h2",
			markdown: documentName || "Overview",
		},
		{
			id: "b2",
			type: "text",
			textStyle: "p",
			markdown:
				"This demo bundle ships with lightweight mock data so you can explore the app immediately.",
		},
		{ id: "b3", type: "text", textStyle: "h3", markdown: "Getting started" },
		{
			id: "b4",
			type: "text",
			textStyle: "p",
			listStyle: "bullet",
			markdown:
				"Connect your workspace to replace mock data with live Craft data.",
		},
	];
}

function createMockTasks(layout?: string): CraftTask[] {
	return GENERIC_TASKS.map((title, index) => ({
		id: `task-${index + 1}`,
		markdown: title,
		taskInfo: {
			state: index % 4 === 3 ? "done" : "todo",
			...(layout === "calendar" || layout === "timeline"
				? { scheduleDate: `2026-03-${String(index * 3 + 2).padStart(2, "0")}` }
				: {}),
		},
		location: { type: "document", title: "Workspace" },
		...(index % 4 === 3 ? { completedAt: "2026-03-10T10:00:00Z" } : {}),
	}));
}

export function createMockClient(appConfig?: AppConfig): CraftApiClient {
	const collectionSchema = appConfig?.init?.collection?.schema;
	const collectionName = appConfig?.init?.collection?.name;
	const slug = appConfig?.slug;
	const layout = appConfig?.layout;
	const mockTitles = appConfig?.init?.collection?.mockTitles;
	const mockImages = appConfig?.init?.collection?.mockImages;
	const mockCollectionItems = collectionSchema
		? generateMockItems(
				collectionSchema,
				collectionName,
				slug,
				undefined,
				layout,
				mockTitles,
				mockImages,
			)
		: [];

	const multiCollections = appConfig?.init?.collections || [];
	const multiCollectionMap: Record<
		string,
		{
			name: string;
			items: CollectionItem[];
			schema: Record<string, { type: string; title: string; enum?: string[] }>;
		}
	> = {};
	const allCollectionEntries: Array<{ id: string; name: string }> = [];

	for (const colDef of multiCollections) {
		const key = colDef.key || colDef.name.toLowerCase().replace(/\s+/g, "-");
		const colId = `mock-mc-${key}`;
		multiCollectionMap[colId] = {
			name: colDef.name,
			items: generateMockItems(
				colDef.schema,
				colDef.name,
				`${slug || ""}-${key}`,
				undefined,
				layout,
				colDef.mockTitles,
				colDef.mockImages,
			),
			schema: colDef.schema.properties,
		};
		allCollectionEntries.push({ id: colId, name: colDef.name });
	}

	if (collectionName)
		allCollectionEntries.push({ id: "mock-collection", name: collectionName });

	const folders: CraftFolder[] = [
		{
			id: "folder-main",
			name: appConfig?.init?.folder || "Workspace",
			documentCount: GENERIC_DOCUMENTS.length,
		},
	];
	const documents: CraftDocument[] = GENERIC_DOCUMENTS.map((title, index) => ({
		id: `doc-${index + 1}`,
		title,
		isDeleted: false,
		lastModifiedAt: new Date(Date.UTC(2026, 2, index + 1)).toISOString(),
	}));
	const tasks = createMockTasks(layout);
	const blocks = createMockBlocks(appConfig?.init?.document || "Overview");

	const mock = {
		getTasks: async () => ({ items: tasks }),
		updateTasks: async () => ({ items: tasks }),
		deleteTasks: async () => ({ items: [] }),
		getFolders: async () => ({ items: folders }),
		getDocuments: async () => ({ items: documents }),
		createDocument: async (title: string) => ({
			id: "mock-doc-new",
			title,
			isDeleted: false,
			lastModifiedAt: new Date().toISOString(),
		}),
		deleteDocuments: async () => ({ items: [] }),
		getBlocks: async () => ({
			id: "root",
			type: "text" as const,
			children: blocks,
		}),
		insertBlocks: async (newBlocks: Array<Partial<CraftBlock>>) => ({
			items: newBlocks.map((block, index) => ({
				id: `mock-block-${index + 1}`,
				type: "text" as const,
				...block,
			})),
		}),
		updateBlocks: async () => ({ items: [] }),
		deleteBlocks: async () => ({ items: [] }),
		uploadFile: async (file: File) => ({
			id: `upload-${file.name}`,
			type: "file" as const,
			markdown: file.name,
		}),
		getConnectionInfo: async () => ({
			spaceId: "mock-space",
			timezone: "Europe/Berlin",
			currentTime: new Date().toISOString(),
			urlTemplates: { blockUrl: "", dateUrl: "" },
		}),
		getCollections: async () => ({ items: allCollectionEntries }),
		getCollectionSchema: async (id: string) => {
			if (multiCollectionMap[id])
				return {
					type: "object" as const,
					properties: multiCollectionMap[id].schema,
				};
			return collectionSchema
				? { type: "object" as const, properties: collectionSchema.properties }
				: { type: "object" as const, properties: {} };
		},
		getCollectionItems: async (id: string) => {
			if (multiCollectionMap[id])
				return { items: multiCollectionMap[id].items };
			return { items: mockCollectionItems };
		},
		createCollectionItems: async (
			_id: string,
			items: Array<{ title: string; properties?: Record<string, unknown> }>,
		) => ({
			items: items.map((item, index) => ({
				id: `new-${index + 1}`,
				title: item.title,
				properties: item.properties || {},
			})) as CollectionItem[],
		}),
		updateCollectionItems: async () => ({ items: mockCollectionItems }),
		deleteCollectionItems: async () => ({ items: [] }),
		createCollection: async (name: string) => ({
			collectionBlockId: `mock-mc-${name.toLowerCase().replace(/\s+/g, "-")}`,
			name,
			schema: {
				type: "object" as const,
				properties: {} as Record<
					string,
					{ type: string; title?: string; enum?: string[] }
				>,
			},
		}),
		updateCollectionSchema: async () => ({
			type: "object" as const,
			properties: collectionSchema?.properties || {},
		}),
		search: async (query: string) => {
			const q = query.toLowerCase();
			const recipeItems = [
				{
					blockId: "search-1",
					markdown: "Pasta Carbonara — eggs, pecorino, guanciale, black pepper",
					pageBlockPath: [
						{ id: "doc-1", content: "Recipe Box" },
						{ id: "sec-1", content: "Pasta" },
					],
				},
				{
					blockId: "search-2",
					markdown:
						"Thai Green Curry — coconut milk, basil, green beans, chicken",
					pageBlockPath: [
						{ id: "doc-2", content: "Weeknight Dinners" },
						{ id: "sec-2", content: "Curries" },
					],
				},
				{
					blockId: "search-3",
					markdown: "Banana Bread — bananas, cinnamon, walnuts, brown sugar",
					pageBlockPath: [
						{ id: "doc-3", content: "Baking" },
						{ id: "sec-3", content: "Loaves" },
					],
				},
				{
					blockId: "search-4",
					markdown: "Overnight Oats — oats, chia seeds, yogurt, berries",
					pageBlockPath: [
						{ id: "doc-4", content: "Breakfast" },
						{ id: "sec-4", content: "Prep Ahead" },
					],
				},
				{
					blockId: "search-5",
					markdown: "Tomato Soup — canned tomatoes, garlic, onion, cream",
					pageBlockPath: [
						{ id: "doc-5", content: "Comfort Food" },
						{ id: "sec-5", content: "Soups" },
					],
				},
				{
					blockId: "search-6",
					markdown: "Avocado Toast — sourdough, avocado, chili flakes, lemon",
					pageBlockPath: [
						{ id: "doc-6", content: "Quick Lunches" },
						{ id: "sec-6", content: "Toasts" },
					],
				},
			];

			const defaultItems = GENERIC_SEARCH.map((markdown, index) => ({
				blockId: `search-${index + 1}`,
				markdown,
				pageBlockPath: [
					{
						id: `doc-${index + 1}`,
						content: GENERIC_DOCUMENTS[index % GENERIC_DOCUMENTS.length],
					},
				],
			}));

			return {
				items:
					/recipe|ingredient|meal|food|cook|dish|pantry/.test(q) ||
					/recipe/.test(slug || "")
						? recipeItems
						: defaultItems,
			};
		},
		searchDocuments: async () => ({ items: [] as never[] }),
	};

	return mock as unknown as CraftApiClient;
}
