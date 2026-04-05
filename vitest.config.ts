import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: [
			"src/**/*.test.ts",
			"tests/**/*.test.ts",
			"packages/bl1nk/**/*.test.ts",
		],
		exclude: ["node_modules", "dist"],
		reporters: "default",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.ts"],
			exclude: ["src/**/*.test.ts", "src/types.ts"],
		},
	},
});
