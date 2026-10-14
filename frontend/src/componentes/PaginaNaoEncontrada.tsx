import { Link } from "@tanstack/react-router";

export function PaginaNaoEncontrada() {
  return (
    <section>
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe.</p>
      <Link to="/">Voltar ao início</Link>
    </section>
  );
}
