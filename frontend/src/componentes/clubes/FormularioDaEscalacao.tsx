import { useQueryClient } from "@tanstack/react-query";
import { Check, CircleCheck, Lock, TriangleAlert } from "lucide-react";
import { useState } from "react";

import {
  consultaDaEscalacao,
  salvarEscalacao,
  type ClubeDetalhado,
  type EscalacaoDoClube,
  type Formacao,
  type NovaEscalacao,
} from "@/api/clube";
import type { Jogador } from "@/api/jogadores";
import { Alerta } from "@/componentes/Alerta";
import { EmCampo } from "@/componentes/clubes/EmCampo";
import { ErroDoEnvio } from "@/componentes/formulario/ErroDoEnvio";
import { AvatarDoJogador } from "@/componentes/jogadores/AvatarDoJogador";
import { SeloDeCondicao } from "@/componentes/jogadores/SeloDeCondicao";
import { Badge } from "@/componentes/ui/badge";
import { Button } from "@/componentes/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/componentes/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { useEnvio } from "@/hooks/useEnvio";
import { recusadoPelaApi } from "@/lib/erro-api";
import { nomesDasPosicoes } from "@/lib/rotulos";

import {
  descricoesDasFormacoes,
  distribuirTitulares,
  formacaoInicial,
  formacoes,
  listarAtributosUsados,
  listarOpcoesDaVaga,
  montarEscalacao,
  nomesDosSetores,
  posicoesDoSetor,
  setoresDaFormacao,
  type Titulares,
} from "./escalacao";

interface PropriedadesReservas {
  reservas: Jogador[];
  tamanhoDoElenco: number;
}

const formatoLista = new Intl.ListFormat("pt-BR", { type: "conjunction" });

interface PropriedadesFormularioDaEscalacao {
  clube: ClubeDetalhado;
  // A escalação salva, como a API devolve
  escalacao: EscalacaoDoClube;
}

// C06 a C11: formação, um titular por vaga e Salvar; a tela mostra sempre a escalação devolvida
export function FormularioDaEscalacao({ clube, escalacao }: PropriedadesFormularioDaEscalacao) {
  const clienteQuery = useQueryClient();
  const [formacao, setFormacao] = useState<Formacao>(escalacao.formation ?? formacaoInicial);
  const [titulares, setTitulares] = useState<Titulares>(() =>
    distribuirTitulares(escalacao.formation ?? formacaoInicial, escalacao.players),
  );
  const salvar = useEnvio({
    enviar: (dados: NovaEscalacao) => salvarEscalacao(clube.id, dados),
    mensagemSucesso: (salva) => ({
      titulo: "Escalação salva",
      descricao: `${clube.name} na ${salva.formation}, com os 5 titulares devolvidos pela API.`,
    }),
    invalidar: [["escalacao", clube.id]],
    aoConcluir: redefinir,
    avisarErro: false,
  });
  const novaEscalacao = montarEscalacao(formacao, titulares);
  const escolhidos = clube.players.filter((jogador) => titulares.includes(jogador.id));
  const reservas = clube.players.filter((jogador) => !titulares.includes(jogador.id));
  const tamanhoDoElenco = clube.players.length;
  const malCondicionados = escolhidos
    .filter((jogador) => jogador.condition === "MAL_CONDICIONADO")
    .map((jogador) => jogador.name);

  // Volta o formulário para uma escalação da API (a salva agora ou a recarregada)
  function redefinir(salva: EscalacaoDoClube) {
    const novaFormacao = salva.formation ?? formacaoInicial;
    setFormacao(novaFormacao);
    setTitulares(distribuirTitulares(novaFormacao, salva.players));
  }

  // C10: recusada (ex.: titular ficou DOENTE depois de a tela abrir), nada foi gravado; a tela
  // recarrega o elenco e a escalação, que continua a salva
  async function recarregar(erro: unknown) {
    if (!recusadoPelaApi(erro)) {
      return;
    }
    await clienteQuery.invalidateQueries({ queryKey: ["clubes", clube.id] });
    redefinir(await clienteQuery.fetchQuery(consultaDaEscalacao(clube.id)));
  }

  function trocarFormacao(nova: Formacao) {
    setFormacao(nova);
    setTitulares(distribuirTitulares(nova, escolhidos));
  }

  function escolherTitular(indice: number, id: string) {
    setTitulares(titulares.map((atual, vaga) => (vaga === indice ? Number(id) : atual)));
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Titulares</h2>
            <p className="text-xs text-muted-foreground">
              1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.
            </p>
          </div>
          {escalacao.complete ? (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
              <CircleCheck />
              Completa
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              <TriangleAlert />
              Incompleta
            </Badge>
          )}
        </div>

        {!escalacao.complete && (
          <Alerta
            tom="atencao"
            titulo={`Escalação incompleta: o ${clube.name} não pode jogar partidas`}
          >
            {/* C07: com menos de 5 no elenco, nenhuma formação fecha */}
            <p>
              {tamanhoDoElenco < 5
                ? `O elenco tem ${tamanhoDoElenco} ${tamanhoDoElenco === 1 ? "jogador" : "jogadores"}, e a escalação precisa de 5: 1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação com os 5 titulares.`
                : "Escolha a formação e um titular para cada uma das 5 vagas, entre os jogadores do elenco que não estão doentes, e salve."}
            </p>
          </Alerta>
        )}
        {salvar.error && (
          <ErroDoEnvio
            erro={salvar.error}
            tituloRecusa="A escalação foi recusada"
            textoSemConexao="A escalação não foi salva. Verifique a conexão e tente de novo."
          />
        )}

        <fieldset>
          <legend className="text-sm font-medium">Formação</legend>
          <p className="mb-2 text-xs text-muted-foreground">
            Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da
            conta.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {formacoes.map((opcao) => (
              <label
                key={opcao}
                className="flex items-start gap-2 rounded-lg border p-3 text-sm has-checked:border-primary has-checked:bg-primary/5"
              >
                <input
                  type="radio"
                  name="formacao"
                  className="mt-0.5 size-4 accent-primary"
                  checked={formacao === opcao}
                  onChange={() => trocarFormacao(opcao)}
                />
                <span>
                  <span className="block font-semibold">{opcao}</span>
                  <span className="text-xs text-muted-foreground">
                    {descricoesDasFormacoes[opcao]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="rounded-xl border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Vaga</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead className="text-right">Overall</TableHead>
                <TableHead>Atributos usados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setoresDaFormacao[formacao].map((setor, indice) => {
                const posicoes = posicoesDoSetor[setor].join(" ou ");
                const opcoes = listarOpcoesDaVaga(clube.players, titulares, indice, formacao);
                const titular = clube.players.find((jogador) => jogador.id === titulares[indice]);
                return (
                  // A vaga é a posição na formação: trocar a formação remonta as linhas
                  <TableRow key={`${formacao}-${indice}`}>
                    <TableCell>
                      <p className="font-medium">{nomesDosSetores[setor]}</p>
                      <p className="text-xs text-muted-foreground">{posicoes}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={titular ? String(titular.id) : ""}
                        onValueChange={(id) => escolherTitular(indice, id)}
                        disabled={opcoes.length === 0}
                      >
                        <SelectTrigger
                          className="w-52"
                          aria-label={`Vaga ${indice + 1}: ${nomesDosSetores[setor]}`}
                        >
                          <SelectValue
                            placeholder={
                              opcoes.length === 0
                                ? `Sem ${posicoes} disponível`
                                : "Escolha o titular"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {opcoes.map((jogador) => (
                            <SelectItem key={jogador.id} value={String(jogador.id)}>
                              {jogador.name} ({jogador.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {titular && <SeloDeCondicao condicao={titular.condition} />}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{titular?.overall}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {titular &&
                        listarAtributosUsados(titular).map(({ nome, valor }) => (
                          <span key={nome} className="mr-3">
                            {nome} <span className="font-semibold text-foreground">{valor}</span>
                          </span>
                        ))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {malCondicionados.length > 0 && (
          <Alerta
            tom="atencao"
            titulo={`${formatoLista.format(malCondicionados)} ${
              malCondicionados.length > 1 ? "estão mal condicionados" : "está mal condicionado"
            }`}
          >
            <p>Podem jogar, mas cada atributo vale 15% a menos durante a partida.</p>
          </Alerta>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-xs text-muted-foreground">
            {novaEscalacao
              ? "A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar depois de escalar de novo."
              : "Escolha a formação e um titular para cada vaga para salvar."}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={salvar.isPending}
              onClick={() => redefinir(escalacao)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              // C07: só com a formação e um titular em cada uma das 5 vagas
              disabled={!novaEscalacao || salvar.isPending}
              onClick={() =>
                novaEscalacao &&
                salvar.mutate(novaEscalacao, { onError: (erro) => void recarregar(erro) })
              }
            >
              <Check />
              {salvar.isPending ? "Salvando…" : "Salvar escalação"}
            </Button>
          </div>
        </div>
      </section>
      <div className="flex flex-col gap-4">
        <EmCampo formacao={formacao} titulares={titulares} elenco={clube.players} />
        <Reservas reservas={reservas} tamanhoDoElenco={tamanhoDoElenco} />
      </div>
    </div>
  );
}

// C06 (REQ-041): quem do elenco está fora das 5 vagas escolhidas na tela; Doente não entra (RN19)
function Reservas({ reservas, tamanhoDoElenco }: PropriedadesReservas) {
  return (
    <aside className="flex flex-col gap-3 rounded-xl border p-4">
      <div>
        <h2 className="font-semibold">Reservas</h2>
        <p className="text-xs text-muted-foreground">Jogadores do elenco fora da escalação.</p>
      </div>
      {reservas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tamanhoDoElenco === 0
            ? "O elenco ainda não tem jogadores."
            : `Nenhum reserva: ${tamanhoDoElenco === 1 ? "o jogador do elenco está escolhido" : `os ${tamanhoDoElenco} jogadores do elenco estão escolhidos`}.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {reservas.map((jogador) => (
            <li key={jogador.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-3">
                  <AvatarDoJogador id={jogador.id} nome={jogador.name} />
                  <span>
                    <span className="block text-sm font-medium">{jogador.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {nomesDasPosicoes[jogador.position]}
                    </span>
                  </span>
                </span>
                <SeloDeCondicao condicao={jogador.condition} />
              </div>
              {jogador.condition === "DOENTE" && (
                <p className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  <Lock className="size-3" />
                  Doente não pode ser escalado.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
