import { Link } from "@tanstack/react-router";

import { Button } from "@/componentes/ui/button";

export function PaginaNaoEncontrada() {
  return (
    <section className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground">O endereço acessado não existe.</p>
      <Button asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </section>
  );
}
