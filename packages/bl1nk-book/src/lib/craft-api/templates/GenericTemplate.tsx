"use client";

import { useEffect, useMemo, useState } from "react";
import type { CraftApiClient } from "../client";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { useDataSource } from "../hooks/useDataSource";
import { useInitialize } from "../hooks/useInitialize";
import {
        type StorageLocation,
        StorageLocationProvider,
} from "../runtime/StorageLocationContext";
import { IndexedDBStorageAdapter } from "../storage";
import type { ConnectionInfo } from "../types";
import type { AppConfig } from "../types";
import { wrapActionsWithToast } from "../utils/action-wrapper";
import { LayoutRenderer } from "./LayoutRenderer";

interface GenericTemplateProps {
        client: CraftApiClient;
        config: AppConfig;
        runtimeControls?: {
                showStorageControls?: boolean;
                storageLocation: StorageLocation;
                isConnecting: boolean;
                isConnected: boolean;
                onSelectStorageLocation: (location: StorageLocation) => void;
                onDisconnect: () => void;
        };
}

export function GenericTemplate({
        client,
        config,
        runtimeControls,
}: GenericTemplateProps) {
        const localPersistenceKey = config.slug
                ? `${config.slug}:${config.layout}`
                : undefined;
        const { resources, ready } = useInitialize(client, config.init, {
                slug: config.slug,
                localPersistenceKey,
                dataSourceType: config.dataSource.type,
                taskScopes: config.dataSource.scopes,
                layout: config.layout,
        });
        const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(
                null,
        );

        const isConnected = runtimeControls?.isConnected ?? false;
        const isCraftStorageActive =
                (runtimeControls?.storageLocation ?? "browser") === "craft" && isConnected;

        useEffect(() => {
                let canceled = false;

                if (!isCraftStorageActive) {
                        setConnectionInfo(null);
                        return () => {
                                canceled = true;
                        };
                }

                client
                        .getConnectionInfo()
                        .then((info) => {
                                if (!canceled) setConnectionInfo(info);
                        })
                        .catch(() => {
                                if (!canceled) setConnectionInfo(null);
                        });

                return () => {
                        canceled = true;
                };
        }, [client, isCraftStorageActive]);

        const enrichedResources = resources
                ? {
                                ...resources,
                                spaceId: isCraftStorageActive ? connectionInfo?.spaceId : undefined,
                                blockUrlTemplate: isCraftStorageActive
                                        ? connectionInfo?.urlTemplates?.blockUrl
                                        : undefined,
                        }
                : undefined;
        const {
                items,
                schema,
                actions,
                collectionSchemas,
                collectionActions,
                loading,
                error,
        } = useDataSource(client, config.dataSource, enrichedResources, config.init);
        const safeActions = useMemo(() => wrapActionsWithToast(actions), [actions]);

        const localPersistenceEnabled =
                (runtimeControls?.showStorageControls ?? false) &&
                (runtimeControls?.storageLocation ?? "browser") === "browser";

        const adapter = useMemo(() => {
                if (!localPersistenceEnabled || !localPersistenceKey) return null;
                return new IndexedDBStorageAdapter(localPersistenceKey);
        }, [localPersistenceEnabled, localPersistenceKey]);

        const storageContextValue = useMemo(
                () => ({
                        showStorageControls: runtimeControls?.showStorageControls ?? false,
                        storageLocation: runtimeControls?.storageLocation ?? "browser",
                        isConnecting: runtimeControls?.isConnecting ?? false,
                        isConnected: runtimeControls?.isConnected ?? false,
                        onSelectStorageLocation:
                                runtimeControls?.onSelectStorageLocation ?? (() => {}),
                        onDisconnect: runtimeControls?.onDisconnect ?? (() => {}),
                        localPersistenceEnabled,
                        localPersistenceKey,
                        adapter,
                }),
                [
                        runtimeControls?.isConnected,
                        runtimeControls?.isConnecting,
                        runtimeControls?.onDisconnect,
                        runtimeControls?.onSelectStorageLocation,
                        runtimeControls?.showStorageControls,
                        runtimeControls?.storageLocation,
                        localPersistenceEnabled,
                        localPersistenceKey,
                        adapter,
                ],
        );

        if (!ready || loading) return <LoadingState />;

        // Only fail if the data source's required resource is missing AND we are
        // connected to a real Craft workspace (not mock/browser mode).
        const initFailed =
                isCraftStorageActive &&
                (((config.dataSource.type === "collections" ||
                        config.dataSource.type === "upload") &&
                        config.init?.collection &&
                        !resources.collectionId) ||
                        (config.dataSource.type === "blocks" &&
                                config.init?.document &&
                                !resources.documentId) ||
                        (config.dataSource.type === "multi-collection" &&
                                config.init?.collections?.length &&
                                (!resources.collectionIds ||
                                        Object.keys(resources.collectionIds).length === 0)));

        if (error || initFailed) {
                return (
                        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                Could not load data from your workspace. Make sure you have granted full
                                space access when connecting.
                        </div>
                );
        }

        // Some layouts/data sources provide their own meaningful empty states and create flows — let them render.
        const hasOwnEmptyState =
                config.dataSource.type === "search" ||
                config.dataSource.type === "upload" ||
                config.layout === "form" ||
                config.layout === "journal" ||
                config.layout === "page-builder" ||
                config.layout === "cards" ||
                config.layout === "gallery";
        if (!items.length && !hasOwnEmptyState)
                return <EmptyState message="No items found in your workspace yet." />;

        // Pass multi-collection metadata through options so multi-view layout can access them
        const enrichedOptions = collectionSchemas
                ? {
                                ...config.config,
                                _collectionSchemas: collectionSchemas,
                                _collectionActions: collectionActions,
                        }
                : config.config;

        return (
                <StorageLocationProvider value={storageContextValue}>
                        <LayoutRenderer
                                layout={config.layout}
                                items={items}
                                schema={schema}
                                actions={safeActions}
                                options={enrichedOptions}
                                client={client}
                        />
                </StorageLocationProvider>
        );
}
