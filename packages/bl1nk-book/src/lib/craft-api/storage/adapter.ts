import type { DisplayItem } from "../types";

/**
 * Abstraction over persistence backends (IndexedDB, Craft API, etc.).
 * useLocalItems uses this interface to load/persist items without
 * knowing which backend is active.
 */
export interface StorageAdapter {
	/** Load persisted items. Returns null when nothing is persisted yet. */
	load(): Promise<DisplayItem[] | null>;
	/** Persist the current item list. */
	persist(items: DisplayItem[]): Promise<void>;
}

// ── IndexedDB implementation ────────────────────────────────────────

const DB_NAME = "craft-app-data";
const STORE_NAME = "demo-items";
const DB_VERSION = 1;

interface PersistedSnapshot {
	key: string;
	version: number;
	updatedAt: string;
	items: DisplayItem[];
}

function openDb(): Promise<IDBDatabase> {
	if (typeof window === "undefined" || !window.indexedDB) {
		return Promise.reject(new Error("IndexedDB unavailable"));
	}

	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "key" });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () =>
			reject(request.error || new Error("Failed to open IndexedDB"));
	});
}

/**
 * Read a snapshot directly from IndexedDB by key.
 * Exported for use by useInitialize (seeding on first Craft connection).
 */
export async function readSnapshot(
	key: string,
): Promise<PersistedSnapshot | null> {
	const db = await openDb();

	return await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const request = store.get(key);

		request.onsuccess = () => {
			const value = request.result as PersistedSnapshot | undefined;
			resolve(value ?? null);
		};
		request.onerror = () =>
			reject(request.error || new Error("Failed to read persisted data"));
		tx.oncomplete = () => db.close();
	});
}

async function writeSnapshot(key: string, items: DisplayItem[]): Promise<void> {
	const db = await openDb();

	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);

		store.put({
			key,
			version: 1,
			updatedAt: new Date().toISOString(),
			items,
		} satisfies PersistedSnapshot);

		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => {
			db.close();
			reject(tx.error || new Error("Failed to persist data"));
		};
	});
}

function parseLegacyCookiePayload(raw: string): DisplayItem[] | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (Array.isArray(parsed)) return parsed as DisplayItem[];
		if (
			parsed &&
			typeof parsed === "object" &&
			Array.isArray((parsed as { items?: unknown }).items)
		) {
			return (parsed as { items: DisplayItem[] }).items;
		}
		return null;
	} catch {
		return null;
	}
}

async function migrateLegacyCookieToIndexedDb(key: string): Promise<void> {
	const Cookies = (await import("js-cookie")).default;
	const [slug] = key.split(":");
	const candidateKeys = [
		slug ? `api_example_demo_${slug}` : "",
		`api_example_demo_${key.replace(":", "_")}`,
	].filter(Boolean);

	for (const cookieKey of candidateKeys) {
		const raw = Cookies.get(cookieKey);
		if (!raw) continue;

		const migratedItems = parseLegacyCookiePayload(raw);
		Cookies.remove(cookieKey, { path: "/" });

		if (migratedItems) {
			await writeSnapshot(key, migratedItems);
			return;
		}
	}
}

export class IndexedDBStorageAdapter implements StorageAdapter {
	private migrated = false;

	constructor(private readonly key: string) {}

	async load(): Promise<DisplayItem[] | null> {
		if (!this.migrated) {
			await migrateLegacyCookieToIndexedDb(this.key);
			this.migrated = true;
		}
		const snapshot = await readSnapshot(this.key);
		return snapshot?.items ?? null;
	}

	async persist(items: DisplayItem[]): Promise<void> {
		await writeSnapshot(this.key, items);
	}
}

/**
 * No-op adapter for Craft mode. Persistence is handled by DataSourceActions
 * (API calls), so the adapter doesn't need to store anything locally.
 */
export class NoopStorageAdapter implements StorageAdapter {
	async load(): Promise<DisplayItem[] | null> {
		return null;
	}

	async persist(): Promise<void> {
		// Intentional no-op — Craft API handles persistence via DataSourceActions
	}
}
