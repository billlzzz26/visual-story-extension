"use client";

import type { ElementType } from "react";
import { useState } from "react";
import type { CraftBlock } from "../types";

const HEADING_TAGS: Record<string, ElementType> = {
	h1: "h1",
	h2: "h2",
	h3: "h3",
	h4: "h4",
	h5: "h5",
	h6: "h6",
	page: "h1",
	caption: "p",
	p: "p",
};

function BlockNode({
	block,
	depth = 0,
	onUpdate,
	onDelete,
}: {
	block: CraftBlock;
	depth?: number;
	onUpdate?: (id: string, markdown: string) => void;
	onDelete?: (id: string) => void;
}) {
	const [editing, setEditing] = useState(false);
	const [editValue, setEditValue] = useState(block.markdown || "");

	if (block.type === "horizontalRule" || block.type === "line") {
		return <hr className="my-3 border-gray-200" />;
	}

	const Tag = HEADING_TAGS[block.textStyle || "p"] || "p";
	const indent = depth > 0 ? { paddingLeft: `${depth * 1.25}rem` } : undefined;

	const isTodo = block.listStyle === "task";
	const isDone = block.taskInfo?.done;

	const handleSave = () => {
		setEditing(false);
		if (editValue !== (block.markdown || "") && onUpdate) {
			onUpdate(block.id, editValue);
		}
	};

	const renderContent = () => {
		if (editing) {
			return (
				<textarea
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onBlur={handleSave}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							// Blur triggers a single onBlur → handleSave (avoids duplicate onUpdate)
							e.currentTarget.blur();
						}
						if (e.key === "Escape") setEditing(false);
					}}
					rows={Math.max(1, editValue.split("\n").length)}
					className="w-full resize-none rounded border border-blue-300 px-1 py-0.5 text-sm text-gray-900 focus:ring-1 focus:ring-blue-400 focus:outline-none"
				/>
			);
		}

		const textContent = block.markdown || "";
		const editable = !!onUpdate;

		if (isTodo) {
			return (
				<label className="flex items-start gap-2 py-0.5">
					<input
						type="checkbox"
						checked={isDone}
						readOnly
						className="mt-1 h-4 w-4 rounded border-gray-300"
					/>
					<Tag
						className={`text-sm ${isDone ? "text-gray-400 line-through" : "text-gray-900"} ${editable ? "cursor-text rounded px-0.5 hover:bg-gray-50" : ""}`}
						onClick={
							editable
								? () => {
										setEditValue(textContent);
										setEditing(true);
									}
								: undefined
						}
					>
						{textContent}
					</Tag>
				</label>
			);
		}

		if (block.listStyle === "bullet") {
			return (
				<div className="flex items-start gap-2 py-0.5">
					<span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
					<Tag
						className={`text-sm text-gray-900 ${editable ? "cursor-text rounded px-0.5 hover:bg-gray-50" : ""}`}
						onClick={
							editable
								? () => {
										setEditValue(textContent);
										setEditing(true);
									}
								: undefined
						}
					>
						{textContent}
					</Tag>
				</div>
			);
		}

		if (block.listStyle === "numbered") {
			return (
				<div className="flex items-start gap-2 py-0.5">
					<Tag
						className={`text-sm text-gray-900 ${editable ? "cursor-text rounded px-0.5 hover:bg-gray-50" : ""}`}
						onClick={
							editable
								? () => {
										setEditValue(textContent);
										setEditing(true);
									}
								: undefined
						}
					>
						{textContent}
					</Tag>
				</div>
			);
		}

		return (
			<Tag
				className={`py-0.5 text-sm text-gray-900 ${editable ? "cursor-text rounded px-0.5 hover:bg-gray-50" : ""}`}
				onClick={
					editable
						? () => {
								setEditValue(textContent);
								setEditing(true);
							}
						: undefined
				}
			>
				{textContent}
			</Tag>
		);
	};

	return (
		<div style={indent} className="group/block relative">
			{onDelete && !editing && (
				<button
					onClick={() => onDelete(block.id)}
					className="absolute top-1 -left-5 hidden h-4 w-4 items-center justify-center rounded text-gray-400 group-hover/block:inline-flex hover:bg-red-50 hover:text-red-500"
					title="Delete block"
				>
					<svg
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			)}
			{renderContent()}
			{block.children?.map((child) => (
				<BlockNode
					key={child.id}
					block={child}
					depth={depth + 1}
     onUpdate={undefined}
     onDelete={undefined}
				/>
			))}
		</div>
	);
}

export function BlockRenderer({
	blocks,
	onUpdate,
	onDelete,
}: {
	blocks: CraftBlock[];
	onUpdate?: (id: string, markdown: string) => void;
	onDelete?: (id: string) => void;
}) {
	if (!blocks.length) {
		return <p className="py-4 text-center text-sm text-gray-400">No content</p>;
	}

	return (
		<div className="space-y-0.5">
			{blocks.map((block) => (
				<BlockNode
					key={block.id}
					block={block}
					onUpdate={onUpdate}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
