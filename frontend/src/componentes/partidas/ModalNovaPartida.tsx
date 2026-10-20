import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { consultaDosClubes } from "@/api/clube";
import { consultaDaPartida, jogarPartida, type NovaPartida, type Partida } from "@/api/partidas";
import { CampoFormulario } from "@/componentes/formulario/CampoFormulario";
import { ErroDoEnvio } from "@/componentes/formulario/ErroDoEnvio";
import { ModalFormulario } from "@/componentes/formulario/ModalFormulario";
import { Nota } from "@/componentes/Nota";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select";
import { useEnvio } from "@/hooks/useEnvio";

import { esquemaDaPartida, montarPartida, partidaVazia } from "./esquema-da-partida";

interface PropriedadesModalNovaPartida {
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}

// L02, L04: lista todos os clubes, inclusive os de escalação incompleta; a tela não impede essa
// recusa, envia e mostra o message do 409 (MOD-004 Frontend)
export function ModalNovaPartida({ aberto, aoMudarAberto }: PropriedadesModalNovaPartida) {
  const clienteQuery = useQueryClient();
  const navegar = useNavigate();
  const clubes = useQuery(consultaDosClubes());
  const formulario = useForm({
    resolver: zodResolver(esquemaDaPartida),
    defaultValues: partidaVazia,
  });
  const envio = useEnvio({
    enviar: (dados: NovaPartida) => jogarPartida(dados),
    mensagemSucesso: ({ home, away }) =>
      `Partida jogada: ${home.club_name} ${home.goals} × ${away.goals} ${away.club_name}.`,
    // O histórico e a classificação mudam (RN21)
    invalidar: [["partidas"], ["classificacao"]],
    aoConcluir: abrirPartida,
    avisarErro: false,
  });
  const erros = formulario.formState.errors;

  // Ao fechar, a próxima partida começa do zero
  function fechar() {
    formulario.reset(partidaVazia);
    envio.reset();
    aoMudarAberto(false);
  }

  // L03: a página da partida abre já com o placar e os 6 duelos que o POST devolveu
  function abrirPartida(partida: Partida) {
    clienteQuery.setQueryData(consultaDaPartida(partida.id).queryKey, partida);
    fechar();
    void navegar({ to: "/partidas/$id", params: { id: String(partida.id) } });
  }

  function campoDoClube(nome: "mandante" | "visitante", rotulo: string, dica: string) {
    const id = `${nome}-partida`;
    return (
      <>
        <CampoFormulario id={id} rotulo={rotulo} erro={erros[nome]?.message}>
          <Controller
            control={formulario.control}
            name={nome}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!clubes.data}>
                <SelectTrigger id={id} className="w-full" aria-invalid={erros[nome] !== undefined}>
                  <Shield />
                  <SelectValue
                    placeholder={clubes.data ? "Escolha o clube" : "Carregando clubes…"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {clubes.data?.map((clube) => (
                    <SelectItem key={clube.id} value={String(clube.id)}>
                      {clube.name} ({clube.acronym})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </CampoFormulario>
        <p className="-mt-3 text-xs text-muted-foreground">{dica}</p>
      </>
    );
  }

  return (
    <ModalFormulario
      aberto={aberto}
      aoFechar={fechar}
      titulo="Nova partida"
      descricao="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
      aoEnviar={formulario.handleSubmit((dados) => envio.mutate(montarPartida(dados)))}
      enviando={envio.isPending}
      textoEnviar="Jogar partida"
      textoEnviando="Jogando…"
    >
      {envio.error && (
        <ErroDoEnvio
          erro={envio.error}
          tituloRecusa="Não foi possível jogar a partida"
          textoSemConexao="A partida não foi confirmada. Verifique a conexão e tente de novo."
        />
      )}
      {campoDoClube("mandante", "Mandante", "Faz os 3 primeiros ataques.")}
      {campoDoClube("visitante", "Visitante", "Precisa ser um clube diferente do mandante.")}
      <Nota>
        Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais
        recuado) ao 4º (o mais avançado): o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º
        enfrenta o 2º do adversário. O atacante usa finalização (ATA), passe (MEI) ou drible (ZAG e
        LAT), e quem defende usa defesa. É gol só quando o ataque é maior; mal condicionado joga com
        15% a menos. Os dois clubes precisam ter os 5 titulares escalados.
      </Nota>
    </ModalFormulario>
  );
}
