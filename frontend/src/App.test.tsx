import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";

// Teste de fumaça do ambiente de testes; sai com a página de exemplo do Vite (TASK-016)
describe("App", () => {
  it("incrementa o contador ao clicar", async () => {
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /count is 0/i }));

    expect(screen.getByRole("button", { name: /count is 1/i })).toBeInTheDocument();
  });
});
