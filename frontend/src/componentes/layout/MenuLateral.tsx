import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { consultaDosClubes } from "@/api/clube";

import { secoesDoMenu } from "./navegacao";

interface PropriedadesConteudoDoMenu {
  // O menu móvel fecha ao escolher um destino
  aoNavegar?: () => void;
}

// Menu fixo à esquerda a partir de 768 px; abaixo disso, o mesmo conteúdo abre pelo MenuMovel
export function MenuLateral() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 p-4 md:flex">
      <ConteudoDoMenu />
    </aside>
  );
}

export function ConteudoDoMenu({ aoNavegar }: PropriedadesConteudoDoMenu) {
  // DEC-055: os clubes no menu levam à página de cada um; mesma consulta da tela de clubes
  const clubes = useQuery(consultaDosClubes());

  return (
    <>
      <Link to="/" className="flex items-center gap-2 px-2" onClick={aoNavegar}>
        <span className="flex size-8 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
          P
        </span>
        <span className="leading-tight">
          <span className="block font-semibold">Passe</span>
          <span className="block text-xs text-muted-foreground">Gestão da liga</span>
        </span>
      </Link>

      <nav aria-label="Menu principal" className="flex flex-col gap-5">
        {secoesDoMenu.map((secao) => (
          <div key={secao.titulo}>
            <p className="mb-1 px-2 text-xs text-muted-foreground">{secao.titulo}</p>
            <ul className="flex flex-col gap-0.5">
              {secao.itens.map(({ caminho, rotulo, icone: Icone }) => (
                <li key={caminho}>
                  <Link
                    to={caminho}
                    onClick={aoNavegar}
                    className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:bg-accent"
                    activeProps={{ className: "border-border bg-background font-medium shadow-xs" }}
                  >
                    <Icone className="size-4" />
                    {rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {clubes.data && (
          <div>
            <p className="mb-1 px-2 text-xs text-muted-foreground">Clubes</p>
            {clubes.data.length === 0 && (
              <p className="px-2 text-xs text-muted-foreground">Nenhum clube ainda.</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {clubes.data.map((clube) => (
                <li key={clube.id}>
                  <Link
                    to="/clubes/$id"
                    params={{ id: String(clube.id) }}
                    onClick={aoNavegar}
                    className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:bg-accent"
                    activeProps={{ className: "border-border bg-background font-medium shadow-xs" }}
                  >
                    <span className="flex size-5 items-center justify-center rounded border bg-muted text-xs">
                      {clube.acronym[0]}
                    </span>
                    {clube.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <p className="mt-auto flex items-center gap-2 px-2 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        Horário de Brasília (UTC−3)
      </p>
    </>
  );
}
