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
	"My Reading List",
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

// Real book data for the book shelf mock
const MOCK_BOOKS: CollectionItem[] = [
	{
		id: "book-1",
		title: "Atomic Habits",
		properties: {
			author: "James Clear",
			status: "Completed",
			genre: "Non-Fiction",
			rating: 5,
			cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
			startDate: "2026-01-05",
			finishedDate: "2026-01-18",
		},
	},
	{
		id: "book-2",
		title: "The Design of Everyday Things",
		properties: {
			author: "Don Norman",
			status: "Completed",
			genre: "Design",
			rating: 4,
			cover: "https://covers.openlibrary.org/b/isbn/9780465050659-L.jpg",
			startDate: "2025-12-01",
			finishedDate: "2025-12-20",
		},
	},
	{
		id: "book-3",
		title: "Deep Work",
		properties: {
			author: "Cal Newport",
			status: "Reading",
			genre: "Non-Fiction",
			rating: 4,
			cover: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
			startDate: "2026-02-10",
			finishedDate: "",
		},
	},
	{
		id: "book-4",
		title: "Thinking, Fast and Slow",
		properties: {
			author: "Daniel Kahneman",
			status: "To Read",
			genre: "Science",
			rating: 0,
			cover: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
			startDate: "",
			finishedDate: "",
		},
	},
	{
		id: "book-5",
		title: "The Pragmatic Programmer",
		properties: {
			author: "David Thomas & Andrew Hunt",
			status: "Completed",
			genre: "Technology",
			rating: 5,
			cover: "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg",
			startDate: "2025-10-01",
			finishedDate: "2025-10-28",
		},
	},
	{
		id: "book-6",
		title: "Sapiens",
		properties: {
			author: "Yuval Noah Harari",
			status: "Completed",
			genre: "History",
			rating: 5,
			cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
			startDate: "2025-08-15",
			finishedDate: "2025-09-10",
		},
	},
	{
		id: "book-7",
		title: "The Lean Startup",
		properties: {
			author: "Eric Ries",
			status: "To Read",
			genre: "Technology",
			rating: 0,
			cover: "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg",
			startDate: "",
			finishedDate: "",
		},
	},
	{
		id: "book-8",
		title: "Dune",
		properties: {
			author: "Frank Herbert",
			status: "Reading",
			genre: "Fiction",
			rating: 5,
			cover: "https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg",
			startDate: "2026-03-01",
			finishedDate: "",
		},
	},
	{
		id: "book-9",
		title: "Man's Search for Meaning",
		properties: {
			author: "Viktor E. Frankl",
			status: "Completed",
			genre: "Philosophy",
			rating: 5,
			cover: "https://covers.openlibrary.org/b/isbn/9780807014271-L.jpg",
			startDate: "2025-11-05",
			finishedDate: "2025-11-12",
		},
	},
	{
		id: "book-10",
		title: "Clean Code",
		properties: {
			author: "Robert C. Martin",
			status: "On Hold",
			genre: "Technology",
			rating: 3,
			cover: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
			startDate: "2025-09-20",
			finishedDate: "",
		},
	},
	{
		id: "book-11",
		title: "The Innovator's Dilemma",
		properties: {
			author: "Clayton M. Christensen",
			status: "To Read",
			genre: "Non-Fiction",
			rating: 0,
			cover: "https://covers.openlibrary.org/b/isbn/9780062060242-L.jpg",
			startDate: "",
			finishedDate: "",
		},
	},
	{
		id: "book-12",
		title: "Meditations",
		properties: {
			author: "Marcus Aurelius",
			status: "Completed",
			genre: "Philosophy",
			rating: 5,
			cover: "https://covers.openlibrary.org/b/isbn/9780812968255-L.jpg",
			startDate: "2025-07-01",
			finishedDate: "2025-07-15",
		},
	},
];

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
			markdown: documentName || "My Reading List",
		},
		{
			id: "b2",
			type: "text",
			textStyle: "p",
			markdown:
				"Track your books, notes, and reading progress. Connect Craft to sync with your workspace.",
		},
		{ id: "b3", type: "text", textStyle: "h3", markdown: "Getting started" },
		{
			id: "b4",
			type: "text",
			textStyle: "p",
			listStyle: "bullet",
			markdown:
				"Connect your Craft workspace to replace mock data with your live book collection.",
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

	// For book-shelf slug, use real book data
	const isBookShelf = slug === "book-shelf" || collectionName?.toLowerCase().includes("book");
	const mockCollectionItems: CollectionItem[] = isBookShelf
		? MOCK_BOOKS
		: collectionSchema
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

	// For book-shelf, expose the collection entry
	if (isBookShelf && !collectionName)
		allCollectionEntries.push({ id: "mock-books", name: "Books" });

	const folders: CraftFolder[] = [
		{
			id: "folder-main",
			name: appConfig?.init?.folder || "Reading List",
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
	const blocks = createMockBlocks(appConfig?.init?.document || "My Reading List");

	let localBooks = [...mockCollectionItems];

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
			timezone: "Asia/Bangkok",
			currentTime: new Date().toISOString(),
			urlTemplates: { blockUrl: "", dateUrl: "" },
		}),
		getCollections: async () => ({ items: allCollectionEntries }),
		getCollectionSchema: async (_id: string) => {
			if (isBookShelf) {
				return {
					type: "object" as const,
					properties: {
						author: { type: "string", title: "Author" },
						status: { type: "string", title: "Status", enum: ["To Read", "Reading", "Completed", "On Hold"] },
						genre: { type: "string", title: "Genre", enum: ["Fiction", "Non-Fiction", "Biography", "Science", "Technology", "Philosophy", "History", "Design"] },
						rating: { type: "number", title: "Rating" },
						cover: { type: "string", title: "Cover URL" },
						startDate: { type: "date", title: "Started" },
						finishedDate: { type: "date", title: "Finished" },
					},
				};
			}
			return collectionSchema
				? { type: "object" as const, properties: collectionSchema.properties }
				: { type: "object" as const, properties: {} };
		},
		getCollectionItems: async (_id: string) => ({ items: localBooks }),
		createCollectionItems: async (
			_id: string,
			items: Array<{ title: string; properties?: Record<string, unknown> }>,
		) => {
			const newItems: CollectionItem[] = items.map((item, index) => ({
				id: `new-${Date.now()}-${index}`,
				title: item.title,
				properties: item.properties || {},
			}));
			localBooks = [...localBooks, ...newItems];
			return { items: newItems };
		},
		updateCollectionItems: async (
			_id: string,
			updates: Array<{ id: string; title?: string; properties?: Record<string, unknown> }>,
		) => {
			localBooks = localBooks.map((book) => {
				const update = updates.find((u) => u.id === book.id);
				if (!update) return book;
				return {
					...book,
					title: update.title ?? book.title,
					properties: { ...book.properties, ...(update.properties ?? {}) },
				};
			});
			return { items: localBooks };
		},
		deleteCollectionItems: async (
			_id: string,
			idsToDelete: string[],
		) => {
			const deleted = localBooks.filter((b) => idsToDelete.includes(b.id));
			localBooks = localBooks.filter((b) => !idsToDelete.includes(b.id));
			return { items: deleted.map((b) => ({ id: b.id })) };
		},
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
			const bookResults = localBooks
				.filter(
					(b) =>
						b.title.toLowerCase().includes(q) ||
						String(b.properties.author ?? "").toLowerCase().includes(q),
				)
				.slice(0, 5)
				.map((b, idx) => ({
					blockId: `book-search-${idx}`,
					markdown: `${b.title} — ${b.properties.author ?? ""}`,
					pageBlockPath: [{ id: b.id, content: "Books" }],
					beforeBlocks: [],
					afterBlocks: [],
				}));

			const defaultItems = GENERIC_SEARCH.map((markdown, index) => ({
				blockId: `search-${index + 1}`,
				markdown,
				pageBlockPath: [
					{
						id: `doc-${index + 1}`,
						content: GENERIC_DOCUMENTS[index % GENERIC_DOCUMENTS.length],
					},
				],
				beforeBlocks: [],
				afterBlocks: [],
			}));

			return { items: bookResults.length ? bookResults : defaultItems };
		},
		searchDocuments: async () => ({ items: [] as never[] }),
	};

	return mock as unknown as CraftApiClient;
}
