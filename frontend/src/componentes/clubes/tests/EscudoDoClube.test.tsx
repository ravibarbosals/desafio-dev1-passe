import { render, screen } from "@testing-library/react";

import { EscudoDoClube } from "../EscudoDoClube";

describe("EscudoDoClube", () => {
  it("mostra o escudo do clube da demo pela sigla", () => {
    const { container } = render(
      <EscudoDoClube sigla="FOR" className="size-5">
        <span>F</span>
      </EscudoDoClube>,
    );

    const imagem = container.querySelector("img");
    expect(imagem).toHaveAttribute("src", "/escudos/for.svg");
    expect(imagem).toHaveAttribute("alt", "");
    expect(imagem).toHaveClass("size-5");
    expect(screen.queryByText("F")).not.toBeInTheDocument();
  });

  it("mostra o selo da tela quando o clube não tem escudo", () => {
    const { container } = render(
      <EscudoDoClube sigla="AGU">
        <span>A</span>
      </EscudoDoClube>,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
