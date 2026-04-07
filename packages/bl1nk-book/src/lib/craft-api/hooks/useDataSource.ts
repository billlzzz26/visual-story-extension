"use client";

import { useEffect, useState } from "react";
import type { CraftApiClient } from "../client";
import { type ResolvedResources, fetchDataSource } from "../data-sources";
import type { DataSourceConfig, DataSourceResult, InitConfig } from "../types";

export function useDataSource(
	client: CraftApiClient,
	config: DataSourceConfig,
	resources?: ResolvedResources,
	initConfig?: InitConfig,
): DataSourceResult & { loading: boolean; error: string | null } {
	const [result, setResult] = useState<DataSourceResult>({
		items: [],
		schema: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let canceled = false;
		setLoading(true);
		setError(null);

		fetchDataSource(client, config, resources, initConfig)
			.then((data) => {
				if (!canceled) setResult(data);
			})
			.catch((err) => {
				console.error("[useDataSource] Fetch failed:", err);
				if (!canceled) {
					setResult({ items: [], schema: [] });
					setError(err?.message || "Failed to load data");
				}
			})
			.finally(() => {
				if (!canceled) setLoading(false);
			});

		return () => {
			canceled = true;
		};
	}, [
		client,
		resources?.collectionId,
		resources?.collectionIds,
		resources?.documentId,
		resources?.spaceId,
		resources?.blockUrlTemplate,
	]); // eslint-disable-line react-hooks/exhaustive-deps

	return { ...result, loading, error };
}
