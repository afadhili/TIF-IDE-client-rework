import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "monaco-editor": ["@monaco-editor/react", "monaco-editor"],

          yjs: ["yjs", "y-monaco"],

          "react-vendor": ["react", "react-dom", "react-router"],

          "ui-vendor": ["lucide-react"],
        },
      },
    },
  },
});
