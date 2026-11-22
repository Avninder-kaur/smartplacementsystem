import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: true,
        port: 8081,
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
