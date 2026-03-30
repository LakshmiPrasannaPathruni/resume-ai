import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/", // ✅ ensures correct asset & fetch paths for FastAPI integration

  server: {
    host: "::",
    port: 8080,
    proxy: {
      // ✅ Automatically redirect API calls during development to backend (FastAPI)
      "/job-skills": "http://127.0.0.1:8000",
      "/suggest-role": "http://127.0.0.1:8000",
      "/upload": "http://127.0.0.1:8000",
    },
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
