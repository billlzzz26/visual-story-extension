"use client";

import { createContext, useContext, useRef } from "react";
import { Toaster } from "sonner";
import {
	type Breakpoint,
	useContainerBreakpoint,
} from "../hooks/useContainerBreakpoint";
import {
	type StorageLocation,
	useStorageLocation,
} from "../runtime/StorageLocationContext";

const AppShellContext = createContext(false);

interface AppShellProps {
	children: (breakpoint: Breakpoint) => React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	const isNested = useContext(AppShellContext);
	const containerRef = useRef<HTMLDivElement>(null);
	const breakpoint = useContainerBreakpoint(containerRef);

	// When nested inside another AppShell, render as transparent passthrough
	if (isNested) {
		return (
			<div
				ref={containerRef}
				className="@container h-full w-full overflow-auto"
			>
				{children(breakpoint)}
			</div>
		);
	}
	const {
		showStorageControls,
		storageLocation,
		isConnecting,
		isConnected,
		onSelectStorageLocation,
		onDisconnect,
		localPersistenceEnabled,
	} = useStorageLocation();

	const handleStorageChange = (value: string) => {
		if (value !== "browser" && value !== "craft") return;
		onSelectStorageLocation(value as StorageLocation);
	};

	return (
		<div
			ref={containerRef}
			className="craft-app-preview @container h-[clamp(420px,72vh,880px)] min-h-[420px] w-full max-w-full overflow-hidden"
		>
			<div className="flex h-full flex-col">
				{showStorageControls && (
					<div className="border-b border-gray-100 bg-gray-50/90 px-3 py-2">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<label className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
								Storage Location
								<select
									value={storageLocation}
									onChange={(event) => handleStorageChange(event.target.value)}
									disabled={isConnecting}
									className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
								>
									<option value="browser">On your device</option>
									<option value="craft">In your Craft space</option>
								</select>
							</label>

							{isConnected && (
								<button
									onClick={onDisconnect}
									className="text-xs text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
								>
									Disconnect
								</button>
							)}
						</div>

						{localPersistenceEnabled && (
							<div className="mt-2 flex flex-wrap items-start justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800">
								<span>
									Data saved on this device may still be deleted by the browser
									or device (for example after cleanup, storage pressure, or
									browser resets/reloads). Connect Craft to store data more
									safely in your space.
								</span>
								<button
									onClick={() => onSelectStorageLocation("craft")}
									className="shrink-0 rounded border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100"
								>
									Store in Craft
								</button>
							</div>
						)}
					</div>
				)}

				<div className="min-h-0 min-w-0 flex-1 overflow-auto">
					<AppShellContext.Provider value={true}>
						{children(breakpoint)}
					</AppShellContext.Provider>
				</div>
			</div>
			<Toaster position="bottom-right" richColors closeButton />
		</div>
	);
}
