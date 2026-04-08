"use client";

import { useStorageLocation } from "../runtime/StorageLocationContext";
import type { DisplayItem } from "../types";

interface ViewInCraftButtonProps {
	items: DisplayItem[];
	size?: "sm" | "default";
	className?: string;
}

function isSafeCraftOpenUrl(href: string): boolean {
	try {
		const u = new URL(href);
		if (u.protocol !== "https:") return false;
		const host = u.hostname.toLowerCase();
		return host === "craft.do" || host.endsWith(".craft.do");
	} catch {
		return false;
	}
}

/**
 * Collection/document-level "Open in Craft" button.
 * Only visible when connected to a Craft space (not in demo mode).
 * Derives the link from the first item's craftLink (all collection items share the same parent document URL).
 */
export function ViewInCraftButton({
	items,
	size = "default",
	className = "",
}: ViewInCraftButtonProps) {
	const { isConnected } = useStorageLocation();
	const raw = items[0]?.craftLink;
	const href =
		typeof raw === "string" && isSafeCraftOpenUrl(raw) ? raw : undefined;
	if (!isConnected || !href) return null;

	if (size === "sm") {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={`inline-flex shrink-0 items-center gap-1 rounded p-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 ${className}`}
				title="Open in Craft"
				onClick={(e) => e.stopPropagation()}
			>
				<CraftIcon size={14} />
			</a>
		);
	}

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 ${className}`}
			title="Open in Craft"
			onClick={(e) => e.stopPropagation()}
		>
			<CraftIcon size={14} />
			<span>Open in Craft</span>
		</a>
	);
}

function CraftIcon({ size = 14 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<polyline points="15 3 21 3 21 9" />
			<line x1="10" y1="14" x2="21" y2="3" />
		</svg>
	);
}
