import { create } from "axios";

// PR-008: o navegador chama a API direto, na origem do VITE_API_URL
const origemApi = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = create({ baseURL: `${origemApi}/api/v1` });
