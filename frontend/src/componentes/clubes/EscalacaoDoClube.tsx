import { useQuery } from "@tanstack/react-query";
import { CloudOff, RotateCw } from "lucide-react";

import { consultaDaEscalacao, type ClubeDetalhado } from "@/api/clube";
import { Aviso } from "@/componentes/Aviso";
import { Button } from "@/componentes/ui/button";
import { Skeleton } from "@/componentes/ui/skeleton";
import { extrairMensagemErro } from "@/lib/erro-api";

import { FormularioDaEscalacao } from "./FormularioDaEscalacao";

interface PropriedadesEscalacaoDoClube {
  clube: ClubeDetalhado;
}

// F12: carrega a escalação salva; o formulário começa com ela
export function EscalacaoDoClube({ clube }: PropriedadesEscalacaoDoClube) {
  const escalacao = useQuery(consultaDaEscalacao(clube.id));

  if (escalacao.isError) {
    return (
      <Aviso
        icone={<CloudOff className="size-5" />}
        titulo="Não foi possível carregar a escalação"
        descricao={extrairMensagemErro(escalacao.error)}
        acao={
          <Button type="button" variant="outline" onClick={() => void escalacao.refetch()}>
            <RotateCw />
            Tentar de novo
          </Button>
        }
      />
    );
  }

  if (escalacao.isPending) {
    return <Skeleton className="h-96" aria-label="Carregando escalação" />;
  }

  return <FormularioDaEscalacao clube={clube} escalacao={escalacao.data} />;
}
