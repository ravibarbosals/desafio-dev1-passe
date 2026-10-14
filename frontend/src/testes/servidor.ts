import { setupServer } from "msw/node";

// Servidor msw dos testes: cada teste registra os handlers de que precisa com servidor.use(...)
export const servidor = setupServer();
