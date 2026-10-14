import "@testing-library/jest-dom/vitest";
import { servidor } from "./servidor";

// Requisição sem handler falha o teste, em vez de ir para a rede
beforeAll(() => servidor.listen({ onUnhandledRequest: "error" }));
afterEach(() => servidor.resetHandlers());
afterAll(() => servidor.close());
