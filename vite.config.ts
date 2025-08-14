import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    proxy: {
      // Proxy API requests to your API URL
      "/vendor": {
        target: "https://ycd141j4sl.execute-api.us-east-1.amazonaws.com/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vendor/, ""),
      },
    },
  },
});
