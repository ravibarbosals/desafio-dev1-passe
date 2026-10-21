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

      <TabelaDaClassificacao consulta={classificacao} />
      <p className="mt-3 text-xs text-muted-foreground">
        Ordem: mais pontos, maior saldo de gols, mais gols marcados e nome do clube, de A a Z.
        Pontos, saldo e posição são calculados pela API a cada consulta, nunca gravados (RN21).
      </p>
    </>
  );
}
