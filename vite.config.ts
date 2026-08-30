import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png", "icons/icon-512-maskable.png"],
      manifest: {
        name: "Tideline",
        short_name: "Tideline",
        description: "A private harbour almanac for the figures that show how a life is going.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#12222A",
        theme_color: "#12222A",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
      },
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 43147,
  },
  preview: {
    host: "127.0.0.1",
    port: 43147,
  },
});
