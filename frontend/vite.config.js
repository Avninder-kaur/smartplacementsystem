import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
<<<<<<< HEAD
        strictPort: true,
=======
>>>>>>> e43cb6de4a7972b30d4ee8d2d91bda11c6044968
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
