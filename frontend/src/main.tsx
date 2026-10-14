import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { criarClienteQuery } from "./lib/cliente-query";
import { criarRoteador } from "./lib/roteador";

const clienteQuery = criarClienteQuery();
const roteador = criarRoteador();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={clienteQuery}>
      <RouterProvider router={roteador} />
    </QueryClientProvider>
  </StrictMode>,
);
