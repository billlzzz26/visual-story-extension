import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: [
			"packages/bl1nk-core/src/**/*.test.ts",
			"packages/bl1nk-sync/src/**/*.test.ts",
			"tests/**/*.test.ts",
		],
		exclude: ["node_modules", "dist"],
	},
});
