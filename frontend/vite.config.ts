import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // O plugin do router vem antes do react(): gera o src/routeTree.gen.ts a partir de src/rotas/
  plugins: [tanstackRouter({ target: "react", routesDirectory: "./src/rotas" }), react()],
});
