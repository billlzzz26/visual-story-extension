"use client";

import { type RefObject, useEffect, useState } from "react";

export type Breakpoint = "compact" | "medium" | "wide";

export function useContainerBreakpoint(
	ref: RefObject<HTMLElement | null>,
): Breakpoint {
	const [breakpoint, setBreakpoint] = useState<Breakpoint>("wide");

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				if (width < 640) setBreakpoint("compact");
				else if (width < 1024) setBreakpoint("medium");
				else setBreakpoint("wide");
			}
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, [ref]);

	return breakpoint;
}
