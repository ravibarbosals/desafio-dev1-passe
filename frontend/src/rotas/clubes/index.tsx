import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpDown, Plus, Shield } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { consultaDosClubes, type OrdemDosClubes } from "@/api/clube";
import { ModalNovoClube } from "@/componentes/clubes/ModalNovoClube";
import { TabelaDeClubes } from "@/componentes/clubes/TabelaDeClubes";
import { TituloPagina } from "@/componentes/layout/TituloPagina";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select";
import { nomesDasOrdensDosClubes } from "@/lib/rotulos";

// RN10: a liga aceita no máximo 20 clubes
const limiteDeClubes = 20;

// A ordem fica na URL (?ordem=net_worth_desc), como os filtros dos jogadores
const esquemaDaOrdem = z.object({
  ordem: z.enum(["name", "net_worth_asc", "net_worth_desc"]).optional().catch(undefined),
});

export const Route = createFileRoute("/clubes/")({
  validateSearch: esquemaDaOrdem,
  component: PaginaClubes,
});

function PaginaClubes() {
  const { ordem } = Route.useSearch();
  const navegar = Route.useNavigate();
  const clubes = useQuery(consultaDosClubes(ordem));
  const [novoClubeAberto, setNovoClubeAberto] = useState(false);
  const quantidade = clubes.data?.length;

  const botaoNovoClube = (
    <Button type="button" onClick={() => setNovoClubeAberto(true)}>
      <Plus />
      Novo clube
    </Button>
  );

  return (
    <>
      <TituloPagina
        icone={Shield}
        titulo="Clubes"
        descricao="Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes."
        acao={botaoNovoClube}
      />
      <ModalNovoClube aberto={novoClubeAberto} aoMudarAberto={setNovoClubeAberto} />

      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          {quantidade === undefined ? "Clubes" : `${quantidade} clubes`}
          {quantidade !== undefined && (
            <Badge variant="secondary">
              {quantidade} de {limiteDeClubes}
            </Badge>
          )}
        </p>

        <Select
          value={ordem ?? "name"}
          onValueChange={(valor) =>
            void navegar({
              search: { ordem: valor === "name" ? undefined : (valor as OrdemDosClubes) },
            })
          }
        >
          <SelectTrigger aria-label="Ordenar">
            <ArrowUpDown />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(nomesDasOrdensDosClubes).map(([valor, nome]) => (
              <SelectItem key={valor} value={valor}>
                {nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabelaDeClubes consulta={clubes} acaoVazio={botaoNovoClube} />

      <p className="mt-3 text-xs text-muted-foreground">
        Clubes pelo nome por padrão ou pelo patrimônio, com empate desfeito pelo nome. Caixa, valor
        do elenco e patrimônio são calculados pela API.
      </p>
    </>
  );
}
