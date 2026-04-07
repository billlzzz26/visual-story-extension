"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStorageLocation } from "../runtime/StorageLocationContext";
import type { LayoutProps } from "../templates/LayoutRenderer";

type StatusVariant = "reading" | "completed" | "to-read" | "on-hold" | "default";

function statusVariant(status: string): StatusVariant {
        switch (status?.toLowerCase()) {
                case "reading":
                        return "reading";
                case "completed":
                        return "completed";
                case "to read":
                        return "to-read";
                case "on hold":
                        return "on-hold";
                default:
                        return "default";
        }
}

function StarRating({ rating }: { rating: number }) {
        return (
                <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                        key={star}
                                        className={cn(
                                                "h-3.5 w-3.5",
                                                star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200",
                                        )}
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                        ))}
                </div>
        );
}

function BookCoverPlaceholder({ title, genre }: { title: string; genre?: string }) {
        const colors: Record<string, string> = {
                Fiction: "from-violet-500 to-purple-700",
                "Non-Fiction": "from-slate-500 to-slate-700",
                Biography: "from-amber-500 to-orange-600",
                Science: "from-cyan-500 to-blue-600",
                Technology: "from-blue-500 to-indigo-700",
                Philosophy: "from-rose-500 to-pink-700",
                History: "from-stone-500 to-stone-700",
                Design: "from-emerald-500 to-teal-700",
        };
        const gradient = colors[genre ?? ""] ?? "from-slate-500 to-slate-700";
        const initials = title
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

        return (
                <div
                        className={cn(
                                "flex h-full w-full items-center justify-center bg-gradient-to-br",
                                gradient,
                        )}
                >
                        <span className="text-2xl font-black text-white/90 tracking-tight">
                                {initials}
                        </span>
                </div>
        );
}

const ALL_STATUSES = ["All", "Reading", "To Read", "Completed", "On Hold"] as const;
type FilterStatus = (typeof ALL_STATUSES)[number];

export function BookShelfLayout({ items, actions }: LayoutProps) {
        const [filter, setFilter] = useState<FilterStatus>("All");
        const {
                showStorageControls,
                storageLocation,
                isConnected,
                isConnecting,
                onSelectStorageLocation,
                onDisconnect,
        } = useStorageLocation();

        const filtered = items.filter((item) => {
                if (filter === "All") return true;
                const s = String(item.fields.status ?? "");
                return s.toLowerCase() === filter.toLowerCase();
        });

        const counts: Record<string, number> = {
                All: items.length,
                Reading: items.filter((i) => String(i.fields.status ?? "").toLowerCase() === "reading").length,
                "To Read": items.filter((i) => String(i.fields.status ?? "").toLowerCase() === "to read").length,
                Completed: items.filter((i) => String(i.fields.status ?? "").toLowerCase() === "completed").length,
                "On Hold": items.filter((i) => String(i.fields.status ?? "").toLowerCase() === "on hold").length,
        };

        return (
                <div className="min-h-full w-full">
                        {/* Craft connection banner */}
                        {showStorageControls && (
                                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF4D00]/10">
                                                                <svg className="h-4 w-4 text-[#FF4D00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
                                                                </svg>
                                                        </div>
                                                        <div>
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                        {isConnected
                                                                                ? "Connected to Craft"
                                                                                : isConnecting
                                                                                        ? "Connecting to Craft…"
                                                                                        : "Connect Craft to sync your books"}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                        {isConnected
                                                                                ? "Your books are synced with your Craft space."
                                                                                : "Currently showing demo books. Connect to load your real collection."}
                                                                </p>
                                                        </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                        {isConnected ? (
                                                                <button
                                                                        type="button"
                                                                        onClick={onDisconnect}
                                                                        className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
                                                                >
                                                                        Disconnect
                                                                </button>
                                                        ) : (
                                                                <button
                                                                        type="button"
                                                                        onClick={() => onSelectStorageLocation("craft")}
                                                                        disabled={isConnecting}
                                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF4D00] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e04500] disabled:opacity-60 transition-colors"
                                                                >
                                                                        {isConnecting ? "Connecting…" : "Connect Craft"}
                                                                </button>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        )}

                        {/* Stats bar */}
                        <div className="mb-6 flex gap-4">
                                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center shadow-sm min-w-[80px]">
                                        <div className="text-xl font-bold text-slate-900">{items.length}</div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">Total</div>
                                </div>
                                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-center shadow-sm min-w-[80px]">
                                        <div className="text-xl font-bold text-blue-700">
                                                {items.filter((i) => String(i.fields.status ?? "").toLowerCase() === "reading").length}
                                        </div>
                                        <div className="text-[11px] text-blue-500 mt-0.5">Reading</div>
                                </div>
                                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-center shadow-sm min-w-[80px]">
                                        <div className="text-xl font-bold text-emerald-700">
                                                {items.filter((i) => String(i.fields.status ?? "").toLowerCase() === "completed").length}
                                        </div>
                                        <div className="text-[11px] text-emerald-500 mt-0.5">Done</div>
                                </div>
                                <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-center shadow-sm min-w-[80px]">
                                        <div className="text-xl font-bold text-amber-700">
                                                {items.filter((i) => String(i.fields.status ?? "").toLowerCase() === "to read").length}
                                        </div>
                                        <div className="text-[11px] text-amber-500 mt-0.5">To Read</div>
                                </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex flex-wrap gap-1.5 px-1 pb-5">
                                {ALL_STATUSES.map((s) => (
                                        <button
                                                key={s}
                                                type="button"
                                                onClick={() => setFilter(s)}
                                                className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                                                        filter === s
                                                                ? "bg-slate-900 text-white"
                                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                                )}
                                        >
                                                {s}
                                                <span
                                                        className={cn(
                                                                "rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold",
                                                                filter === s ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500",
                                                        )}
                                                >
                                                        {counts[s]}
                                                </span>
                                        </button>
                                ))}
                        </div>

                        {/* Book grid */}
                        {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="mb-3 text-5xl">📚</div>
                                        <p className="text-sm font-medium text-slate-600">No books here yet</p>
                                        <p className="mt-1 text-xs text-slate-400">
                                                {filter === "All" ? "Connect your Craft space to load your books" : `No books with status "${filter}"`}
                                        </p>
                                </div>
                        ) : (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                        {filtered.map((item) => {
                                                const cover = item.fields.cover as string | undefined;
                                                const author = item.fields.author as string | undefined;
                                                const status = item.fields.status as string | undefined;
                                                const rating = Number(item.fields.rating ?? 0);
                                                const genre = item.fields.genre as string | undefined;

                                                return (
                                                        <div key={item.id} className="group flex flex-col">
                                                                {/* Book cover */}
                                                                <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-1">
                                                                        {cover ? (
                                                                                <img
                                                                                        src={cover}
                                                                                        alt={item.title}
                                                                                        className="h-full w-full object-cover"
                                                                                />
                                                                        ) : (
                                                                                <BookCoverPlaceholder title={item.title} genre={genre} />
                                                                        )}
                                                                        {/* Status badge overlay */}
                                                                        {status && (
                                                                                <div className="absolute top-2 left-2">
                                                                                        <Badge variant={statusVariant(status)} className="text-[10px] px-1.5 py-0.5 shadow-sm">
                                                                                                {status}
                                                                                        </Badge>
                                                                                </div>
                                                                        )}
                                                                </div>

                                                                {/* Book info */}
                                                                <div className="flex flex-col gap-0.5 px-0.5">
                                                                        <p className="line-clamp-2 text-xs font-semibold text-slate-800 leading-tight">
                                                                                {item.title}
                                                                        </p>
                                                                        {author && (
                                                                                <p className="truncate text-[11px] text-slate-500">{author}</p>
                                                                        )}
                                                                        {rating > 0 && (
                                                                                <div className="mt-1">
                                                                                        <StarRating rating={rating} />
                                                                                </div>
                                                                        )}
                                                                </div>
                                                        </div>
                                                );
                                        })}

                                        {/* Add book placeholder */}
                                        {actions?.create && (
                                                <div className="flex flex-col">
                                                        <button
                                                                type="button"
                                                                onClick={() => actions.create?.({ title: "New Book" })}
                                                                className="aspect-[2/3] w-full rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-colors"
                                                        >
                                                                <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                <span className="text-[11px] font-medium">Add book</span>
                                                        </button>
                                                </div>
                                        )}
                                </div>
                        )}
                </div>
        );
}
