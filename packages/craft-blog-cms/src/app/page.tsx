import { CraftApp } from "@/lib/craft-api/CraftApp";
import { CraftAuthProvider } from "@/lib/craft-api/auth/CraftAuthProvider";

const APP_CONFIG = {
	layout: "page-builder",
	dataSource: {
		type: "blocks",
		maxDepth: 3,
	},
	slug: "blog-cms",
	init: {
		folder: "App Templates",
		document: "Article Workspace",
	},
	config: {
		showMetadata: true,
		accentColor: "#427e8a",
	},
} as const;

export default function Home() {
	return (
		<main className="mx-auto max-w-5xl px-4 py-12">
			<h1 className="mb-8 text-2xl font-bold">Article Workspace</h1>
			<CraftAuthProvider slug="blog-cms">
				<CraftApp appConfig={APP_CONFIG} />
			</CraftAuthProvider>
		</main>
	);
}
