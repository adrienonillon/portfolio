import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relative : fonctionne sur GitHub Pages (sous-dossier /portfolio/) comme sur un domaine perso
export default defineConfig({
  base: "./",
  plugins: [react()],
  // retire les console.log de débogage (model-viewer 4.3.1 en laisse dans sa version publiée)
  esbuild: { pure: ["console.log"] },
});
