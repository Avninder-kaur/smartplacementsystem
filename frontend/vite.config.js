import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
        strictPort: true,
        hmr: {
            overlay: false,
        },
        proxy: {
            // During development, forward /api requests to the backend
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
            // Forward uploaded resume files
            "/uploads": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
        },
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
