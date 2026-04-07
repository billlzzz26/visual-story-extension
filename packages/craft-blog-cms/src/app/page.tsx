import { CraftApp } from "@/lib/craft-api/CraftApp";
import { CraftAuthProvider } from "@/lib/craft-api/auth/CraftAuthProvider";

const BOOK_SHELF_CONFIG = {
	layout: "cards",
	dataSource: {
		type: "collections",
	},
	slug: "book-shelf",
	init: {
		folder: "Reading List",
		document: "My Books",
		collection: {
			name: "Books",
			schema: {
				properties: {
					author: { type: "string", title: "Author" },
					status: {
						type: "string",
						title: "Status",
						enum: ["To Read", "Reading", "Completed", "On Hold"],
					},
					genre: {
						type: "string",
						title: "Genre",
						enum: [
							"Fiction",
							"Non-Fiction",
							"Biography",
							"Science",
							"Technology",
							"Philosophy",
							"History",
							"Design",
						],
					},
					rating: { type: "number", title: "Rating" },
					cover: { type: "string", title: "Cover URL" },
					startDate: { type: "date", title: "Started" },
					finishedDate: { type: "date", title: "Finished" },
				},
			},
		},
	},
	config: {
		showMetadata: false,
	},
} as const;

export default function Home() {
	return (
		<div className="min-h-screen bg-[#FAFAF8]">
			{/* Header */}
			<header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
				<div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								strokeWidth={2.5}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25"
								/>
							</svg>
						</div>
						<div>
							<h1 className="text-sm font-bold text-slate-900 leading-none">
								Bookshelf
							</h1>
							<p className="text-[11px] text-slate-500 leading-none mt-0.5">
								Powered by Craft
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<a
							href="https://craft.do"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF4D00] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e04500] transition-colors"
						>
							<svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
							</svg>
							Open Craft
						</a>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="mx-auto max-w-6xl px-6 py-8">
				{/* Hero */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-slate-900 tracking-tight">
						My Reading List
					</h2>
					<p className="mt-1 text-sm text-slate-500">
						Track your books and sync reading progress with your Craft workspace.
					</p>
				</div>

				<CraftAuthProvider slug="book-shelf">
					<CraftApp appConfig={BOOK_SHELF_CONFIG} />
				</CraftAuthProvider>
			</main>
		</div>
	);
}
