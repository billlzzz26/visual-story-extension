"use client";

import { useEffect, useState } from "react";
import type { CraftApiClient } from "../client";
import { generateMockItems } from "../mock-client";
import type {
	CollectionInitConfig,
	CraftFolder,
	DisplayItem,
	InitConfig,
} from "../types";
import { readSnapshot } from "./useLocalItems";

function isAuthError(err: unknown): boolean {
	if (
		err &&
		typeof err === "object" &&
		"name" in err &&
		(err as { name: string }).name === "CraftApiError"
	) {
		const e = err as { status: number; message: string };
		return e.status === 401 || e.message === "invalid_token";
	}
	return false;
}

function catchNonAuth<T>(fallback: T) {
	return (err: unknown): T => {
		if (isAuthError(err)) throw err;
		return fallback;
	};
}

export interface ResolvedResources {
	documentId?: string;
	folderId?: string;
	collectionId?: string;
	collectionIds?: Record<string, string>;
}

export interface InitializeOptions {
	slug?: string;
	localPersistenceKey?: string;
}

function findFolderByName(
	folders: CraftFolder[],
	name: string,
): CraftFolder | undefined {
	for (const folder of folders) {
		if (folder.name?.toLowerCase() === name.toLowerCase()) return folder;
		if (folder.folders) {
			const found = findFolderByName(folder.folders, name);
			if (found) return found;
		}
	}
	return undefined;
}

function collectBlockIds(block: {
	id: string;
	children?: Array<{ id: string; children?: unknown[] }>;
}): Set<string> {
	const ids = new Set<string>();
	function walk(node: { id?: string; children?: unknown[] } | undefined) {
		if (!node) return;
		if (node.id) ids.add(node.id);
		if (Array.isArray(node.children)) {
			for (const child of node.children as Array<{
				id?: string;
				children?: unknown[];
			}>)
				walk(child);
		}
	}
	walk(block);
	return ids;
}

async function resolveSeedItems(
	collectionConfig: CollectionInitConfig,
	options?: InitializeOptions,
	collectionKey?: string,
): Promise<Array<{ title: string; properties: Record<string, unknown> }>> {
	if (options?.localPersistenceKey) {
		try {
			const snapshot = await readSnapshot(options.localPersistenceKey);
			if (snapshot?.items?.length) {
				let items: DisplayItem[] = snapshot.items;
				if (collectionKey)
					items = items.filter(
						(item) => item.fields._collectionKey === collectionKey,
					);
				if (items.length > 0) {
					return items.map((item) => {
						const props = { ...item.fields };
						props._collectionKey = undefined;
						for (const [key, value] of Object.entries(props)) {
							if (
								typeof value === "string" &&
								value.startsWith("data:") &&
								value.length > 1000
							) {
								delete props[key];
							}
						}
						return { title: item.title, properties: props };
					});
				}
			}
		} catch {
			// Fall through to generated mock items
		}
	}

	const mockSlug = collectionKey
		? `${options?.slug || ""}-${collectionKey}`
		: options?.slug;
	const mockItems = generateMockItems(
		collectionConfig.schema,
		collectionConfig.name,
		mockSlug,
		undefined,
		undefined,
		collectionConfig.mockTitles,
		collectionConfig.mockImages,
	);

	return mockItems.map((item) => ({
		title: item.title,
		properties: item.properties,
	}));
}

async function seedCollectionIfEmpty(
	client: CraftApiClient,
	collectionId: string,
	collectionConfig: CollectionInitConfig,
	options?: InitializeOptions,
	collectionKey?: string,
): Promise<void> {
	const itemsRes = await client
		.getCollectionItems(collectionId)
		.catch(catchNonAuth(null));
	if (itemsRes && itemsRes.items.length === 0) {
		const seedItems = await resolveSeedItems(
			collectionConfig,
			options,
			collectionKey,
		);
		await client
			.createCollectionItems(collectionId, seedItems)
			.catch(catchNonAuth(null));
	}
}

export function useInitialize(
	client: CraftApiClient,
	init?: InitConfig,
	options?: InitializeOptions,
): { ready: boolean; resources: ResolvedResources } {
	const [ready, setReady] = useState(!init);
	const [resources, setResources] = useState<ResolvedResources>({});

	useEffect(() => {
		if (!init) {
			setReady(true);
			return;
		}

		setReady(false);
		let canceled = false;

		async function bootstrap() {
			const resolved: ResolvedResources = {};

			try {
				const foldersRes = await client
					.getFolders()
					.catch(catchNonAuth({ items: [] as CraftFolder[] }));
				const folder = findFolderByName(foldersRes.items, init.folder);
				if (folder) resolved.folderId = folder.id;

				const docsRes = await client
					.getDocuments(
						resolved.folderId ? { folderId: resolved.folderId } : {},
					)
					.catch(
						catchNonAuth({
							items: [] as Array<{
								id: string;
								title: string;
								isDeleted: boolean;
							}>,
						}),
					);

				const existing = docsRes.items.find(
					(d) =>
						!d.isDeleted &&
						d.title?.toLowerCase() === init.document.toLowerCase(),
				);
				if (existing) {
					resolved.documentId = existing.id;
				} else {
					const created = await client
						.createDocument(init.document, resolved.folderId)
						.catch((err): null => {
							if (isAuthError(err)) throw err;
							return null;
						});
					if (created) resolved.documentId = created.id;
				}
			} catch (err) {
				console.error("[useInitialize] Bootstrap failed:", err);
			}

			if (!canceled) {
				setResources(resolved);
				setReady(true);
			}
		}

		bootstrap();
		return () => {
			canceled = true;
		};
	}, [client]); // eslint-disable-line react-hooks/exhaustive-deps

	return { ready, resources };
}
