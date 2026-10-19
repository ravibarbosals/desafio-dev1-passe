import type { UseQueryResult } from "@tanstack/react-query";
import { CloudOff, LoaderCircle, RotateCw, SearchX } from "lucide-react";
import type { ReactNode } from "react";

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
        icone={<SearchX className="size-5" />}
        titulo={textos.vazio}
        descricao={textos.vazioDescricao}
        acao={acaoVazio}
      />
    );
  }

  return (
    <div className="rounded-xl border">
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
                {coluna.titulo}
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

interface PropriedadesAviso {
  icone: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

function Aviso({ icone, titulo, descricao, acao }: PropriedadesAviso) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icone}
      </span>
      <p className="font-semibold">{titulo}</p>
      {descricao && <p className="max-w-md text-sm text-muted-foreground">{descricao}</p>}
      {acao}
    </div>
  );
}
