"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCraftAuth } from "./auth/CraftAuthProvider";
import { createMockClient } from "./mock-client";
import type { StorageLocation } from "./runtime/StorageLocationContext";
import { GenericTemplate } from "./templates/GenericTemplate";
import type { AppConfig } from "./types";

const STORAGE_PREF_KEY_PREFIX = "craft_api_storage_preference:";

interface CraftAppProps {
	appConfig: AppConfig;
}

export function CraftApp({ appConfig }: CraftAppProps) {
	const { status, client, error, connect, disconnect } = useCraftAuth();

	const mockClient = useMemo(() => createMockClient(appConfig), [appConfig]);
	const isConnected = status === "connected" && !!client;
	const isConnecting = status === "connecting";
	const storagePrefKey = `${STORAGE_PREF_KEY_PREFIX}${appConfig.slug || appConfig.layout}`;

	// Track the user's preferred storage location separately from auth state.
	// Persisted to localStorage so it survives page refreshes.
	const [preferred, setPreferred] = useState<StorageLocation>("browser");

	// Restore preference from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(storagePrefKey);
			if (stored === "craft") setPreferred("craft");
		} catch {
			// localStorage unavailable
		}
	}, [storagePrefKey]);

	const storageLocation: StorageLocation =
		preferred === "craft" && (isConnected || isConnecting)
			? "craft"
			: "browser";

	const handleSelectStorageLocation = useCallback(
		(location: StorageLocation) => {
			setPreferred(location);
			try {
				localStorage.setItem(storagePrefKey, location);
			} catch {}
			if (location === "craft" && !isConnected && !isConnecting) {
				connect();
			}
		},
		[isConnected, isConnecting, connect, storagePrefKey],
	);

	const handleDisconnect = useCallback(() => {
		disconnect();
		setPreferred("browser");
		try {
			localStorage.setItem(storagePrefKey, "browser");
		} catch {}
	}, [disconnect, storagePrefKey]);

	const activeClient =
		storageLocation === "craft" && client ? client : mockClient;

	return (
		<div className="w-full">
			{error && (
				<div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
					{error}
				</div>
			)}
			<GenericTemplate
				client={activeClient}
				config={appConfig}
				runtimeControls={{
					showStorageControls: true,
					storageLocation,
					isConnecting,
					isConnected,
					onSelectStorageLocation: handleSelectStorageLocation,
					onDisconnect: handleDisconnect,
				}}
			/>
		</div>
	);
}
