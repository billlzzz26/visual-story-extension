"use client";

import { createContext, useContext } from "react";
import type { StorageAdapter } from "../storage";

export type StorageLocation = "browser" | "craft";

export interface StorageLocationContextValue {
	showStorageControls: boolean;
	storageLocation: StorageLocation;
	isConnecting: boolean;
	isConnected: boolean;
	onSelectStorageLocation: (location: StorageLocation) => void;
	onDisconnect: () => void;
	localPersistenceEnabled: boolean;
	localPersistenceKey?: string;
	/** Storage adapter for the active persistence backend. */
	adapter: StorageAdapter | null;
}

const noop = () => {};

const DEFAULT_STORAGE_CONTEXT: StorageLocationContextValue = {
	showStorageControls: false,
	storageLocation: "browser",
	isConnecting: false,
	isConnected: false,
	onSelectStorageLocation: noop,
	onDisconnect: noop,
	localPersistenceEnabled: false,
	localPersistenceKey: undefined,
	adapter: null,
};

const StorageLocationContext = createContext<StorageLocationContextValue>(
	DEFAULT_STORAGE_CONTEXT,
);

export function StorageLocationProvider({
	value,
	children,
}: {
	value: StorageLocationContextValue;
	children: React.ReactNode;
}) {
	return (
		<StorageLocationContext.Provider value={value}>
			{children}
		</StorageLocationContext.Provider>
	);
}

export function useStorageLocation() {
	return useContext(StorageLocationContext);
}
