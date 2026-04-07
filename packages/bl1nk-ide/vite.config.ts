import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  clearScreen: false,
  server: {
    port: 5000,
    strictPort: false,
    host: host || "0.0.0.0",
    allowedHosts: true,
    hmr: host ? { protocol: "ws", host, port: 5001 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
