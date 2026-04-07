"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStorageLocation } from "../runtime/StorageLocationContext";
import type { DataSourceActions, DisplayItem } from "../types";

// Re-export readSnapshot so useInitialize can still import from this module.
// The canonical implementation now lives in storage/adapter.ts.
export { readSnapshot } from "../storage";

export function useLocalItems(
	items: DisplayItem[],
	actions?: DataSourceActions,
) {
	const [localItems, setLocalItems] = useState<DisplayItem[] | null>(null);
	const { adapter } = useStorageLocation();

	// Track whether the adapter was previously *absent* so we can distinguish a
	// cold start (first mount or React strict-mode remount) from a runtime switch
	// (craft → browser).  `null` = never observed, `false` = adapter was absent,
	// `true` = adapter was present.  The old boolean `hasMountedRef` broke under
	// React strict mode: the double-mount set it to true on the first run, the
	// cleanup cancelled the async load, and the second run skipped the cold start.
	const prevAdapterRef = useRef<boolean | null>(null);

	useEffect(() => {
		let cancelled = false;

		if (!adapter) {
			// No adapter (e.g. Craft mode uses DataSourceActions for persistence):
			// discard local state so API items take over via `currentItems = localItems ?? items`
			setLocalItems(null);
			prevAdapterRef.current = false;
			return () => {
				cancelled = true;
			};
		}

		// Runtime switch: adapter was explicitly absent then re-appeared.
		// DON'T load stale data — keep localItems null so currentItems uses the
		// fresh `items` prop. The next user edit triggers the persist effect below.
		if (prevAdapterRef.current === false) {
			prevAdapterRef.current = true;
			return () => {
				cancelled = true;
			};
		}

		// Cold start with an active adapter (including strict-mode remount):
		// load persisted data.
		prevAdapterRef.current = true;
		setLocalItems(null);

		adapter
			.load()
			.then((loaded) => {
				if (cancelled) return;
				if (loaded && Array.isArray(loaded)) {
					setLocalItems(loaded);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setLocalItems(null);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [adapter]);

	useEffect(() => {
		if (!adapter || !localItems) return;
		adapter.persist(localItems).catch(() => {});
	}, [localItems, adapter]);

	const currentItems = localItems ?? items;

	const updateField = useCallback(
		(itemId: string, fieldKey: string, value: unknown) => {
			if (!actions?.update) return;
			const prev = currentItems;
			const nextItems = currentItems.map((item) =>
				item.id === itemId
					? { ...item, fields: { ...item.fields, [fieldKey]: value } }
					: item,
			);
			const updatedItem = nextItems.find((item) => item.id === itemId);
			setLocalItems(nextItems);
			if (!updatedItem) return;
			actions
				.update([
					{
						id: itemId,
						title: updatedItem.title,
						...updatedItem.fields,
					},
				])
				.catch((err) => {
					console.error(
						"[useLocalItems] updateField FAILED — rolling back:",
						err,
					);
					setLocalItems(prev);
				});
		},
		[currentItems, actions],
	);

	const updateTitle = useCallback(
		(itemId: string, title: string) => {
			if (!actions?.update) return;
			const prev = currentItems;
			const nextItems = currentItems.map((item) =>
				item.id === itemId ? { ...item, title } : item,
			);
			const updatedItem = nextItems.find((item) => item.id === itemId);
			setLocalItems(nextItems);
			if (!updatedItem) return;
			actions
				.update([
					{
						id: itemId,
						title,
						...updatedItem.fields,
					},
				])
				.catch((err) => {
					console.error(
						"[useLocalItems] updateTitle FAILED — rolling back:",
						err,
					);
					setLocalItems(prev);
				});
		},
		[currentItems, actions],
	);

	const deleteItem = useCallback(
		(itemId: string) => {
			if (!actions?.delete) return;
			const prev = currentItems;
			setLocalItems(currentItems.filter((item) => item.id !== itemId));
			actions.delete([itemId]).catch(() => setLocalItems(prev));
		},
		[currentItems, actions],
	);

	const createItem = useCallback(
		async (data: Record<string, unknown>) => {
			if (!actions?.create) return;
			const result = await actions.create(data);
			if (result) {
				setLocalItems((prev) => [...(prev ?? items), result]);
			}
		},
		[actions, items],
	);

	return {
		currentItems,
		setLocalItems,
		updateField,
		updateTitle,
		deleteItem,
		createItem,
	};
}
