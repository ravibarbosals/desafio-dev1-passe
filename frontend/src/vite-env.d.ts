interface ImportMetaEnv {
  // Origem da API, sem /api/v1 (ex.: http://localhost:3000)
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
