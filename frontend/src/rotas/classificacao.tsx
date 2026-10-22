import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ListOrdered, Plus } from "lucide-react";
import { useState } from "react";

import { consultaDaClassificacao } from "@/api/partidas";
import { TituloPagina } from "@/componentes/layout/TituloPagina";
import { ModalNovaPartida } from "@/componentes/partidas/ModalNovaPartida";
import { TabelaDaClassificacao } from "@/componentes/partidas/TabelaDaClassificacao";
import { Button } from "@/componentes/ui/button";

export const Route = createFileRoute("/classificacao")({
  component: PaginaClassificacao,
});

// RN21: os critérios de desempate, na ordem em que a API aplica (L05)
const criterios = [
  "Mais pontos",
  "Maior saldo de gols",
  "Mais gols marcados",
  "Nome do clube, de A a Z",
];

// L05: a tabela na ordem da API; Nova partida abre o mesmo modal da tela de partidas
function PaginaClassificacao() {
  const classificacao = useQuery(consultaDaClassificacao());
  const [novaPartidaAberta, setNovaPartidaAberta] = useState(false);

  return (
    <>
      <TituloPagina
        icone={ListOrdered}
        titulo="Classificação"
        descricao="Todos os clubes, com 3 pontos por vitória e 1 por empate."
        acao={
          <Button type="button" variant="outline" onClick={() => setNovaPartidaAberta(true)}>
            <Plus />
            Nova partida
          </Button>
        }
      />
      <ModalNovaPartida aberto={novaPartidaAberta} aoMudarAberto={setNovaPartidaAberta} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <TabelaDaClassificacao consulta={classificacao} />
        <OrdemDaTabela />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Pontos, saldo e posição são calculados pela API a cada consulta, nunca gravados (RN21).
      </p>
    </>
  );
}

function OrdemDaTabela() {
  return (
    <aside className="rounded-xl border">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">Ordem da tabela</h2>
        <p className="text-xs text-muted-foreground">Critérios de classificação, nesta ordem.</p>
      </div>
      <ol className="flex flex-col gap-2 p-4 text-sm">
        {criterios.map((criterio, indice) => (
          <li key={criterio} className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-muted text-xs">
              {indice + 1}
            </span>
            {criterio}
          </li>
        ))}
      </ol>
    </aside>
  );
}
