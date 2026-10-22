import type { UseQueryResult } from "@tanstack/react-query";
import { CloudOff, LoaderCircle, RotateCw, SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { Aviso } from "@/componentes/Aviso";
import { Button } from "@/componentes/ui/button";
import { Skeleton } from "@/componentes/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { extrairMensagemErro } from "@/lib/erro-api";

export interface ColunaDaTabela<T> {
  titulo: string;
  celula: (linha: T) => ReactNode;
  // Valores e números à direita, como no mockup
  alinharADireita?: boolean;
  tituloOculto?: boolean;
}

interface PropriedadesTabelaComEstados<T> {
  colunas: ColunaDaTabela<T>[];
  // undefined enquanto a consulta não respondeu
  linhas: T[] | undefined;
  chave: (linha: T) => number | string;
  consulta: Pick<UseQueryResult, "isPending" | "isError" | "error" | "refetch">;
  textos: { carregando: string; erro: string; vazio: string; vazioDescricao?: string };
  // Ex.: "Limpar filtros" no estado vazio (E02)
  acaoVazio?: ReactNode;
  // Ex.: a paginação, abaixo das linhas
  rodape?: ReactNode;
  // Ex.: título e ordenação no alto do quadro (C01, C05); some junto com a tabela no vazio e no erro
  cabecalho?: ReactNode;
  // Ícone do vazio (ex.: o escudo dos clubes, C09); sem ele, a lupa
  iconeVazio?: ReactNode;
}

const linhasEsqueleto = 10;

// REQ-045: carregando (E01), erro com "Tentar de novo" (E03) e vazio (E02) em toda lista
export function TabelaComEstados<T>({
  colunas,
  linhas,
  chave,
  consulta,
  textos,
  acaoVazio,
  rodape,
  cabecalho,
  iconeVazio,
}: PropriedadesTabelaComEstados<T>) {
  if (consulta.isError) {
    return (
      <Aviso
        icone={<CloudOff className="size-5" />}
        titulo={textos.erro}
        descricao={extrairMensagemErro(consulta.error)}
        acao={
          <Button type="button" variant="outline" onClick={() => void consulta.refetch()}>
            <RotateCw />
            Tentar de novo
          </Button>
        }
      />
    );
  }

  if (!consulta.isPending && linhas?.length === 0) {
    return (
      <Aviso
        icone={iconeVazio ?? <SearchX className="size-5" />}
        titulo={textos.vazio}
        descricao={textos.vazioDescricao}
        acao={acaoVazio}
      />
    );
  }

  return (
    <div className="rounded-xl border">
      {cabecalho && <div className="border-b px-4 py-3">{cabecalho}</div>}
      {consulta.isPending && (
        <p className="flex items-center gap-2 border-b px-4 py-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {textos.carregando}
        </p>
      )}
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {colunas.map((coluna) => (
              <TableHead
                key={coluna.titulo}
                className={coluna.alinharADireita ? "text-right" : undefined}
              >
                {coluna.tituloOculto ? (
                  <span className="sr-only">{coluna.titulo}</span>
                ) : (
                  coluna.titulo
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {consulta.isPending || !linhas
            ? Array.from({ length: linhasEsqueleto }, (_, indice) => (
                <TableRow key={indice}>
                  {colunas.map((coluna) => (
                    <TableCell key={coluna.titulo}>
                      <Skeleton className="h-4 w-full max-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : linhas.map((linha) => (
                <TableRow key={chave(linha)}>
                  {colunas.map((coluna) => (
                    <TableCell
                      key={coluna.titulo}
                      className={coluna.alinharADireita ? "text-right" : undefined}
                    >
                      {coluna.celula(linha)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {rodape}
    </div>
  );
}
