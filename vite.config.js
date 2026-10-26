import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base relative : fonctionne sur GitHub Pages (sous-dossier /portfolio/) comme sur un domaine perso
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  // retire les console.log de débogage (model-viewer 4.3.1 en laisse dans sa version publiée)
  esbuild: { pure: ["console.log"] },
  // three.js (~730 Ko) forme un fichier à part, chargé seulement par l'intro et la galerie 3D
  build: { chunkSizeWarningLimit: 800 },
});
