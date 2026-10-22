import { CircleCheck } from "lucide-react";
import { Fragment } from "react";

import type { JogadorDoDuelo, Partida } from "@/api/partidas";
import { AvatarDoJogador } from "@/componentes/jogadores/AvatarDoJogador";
import { Badge } from "@/componentes/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { useSiglasDosClubes } from "@/hooks/useSiglasDosClubes";
import { nomesDosAtributos } from "@/lib/rotulos";

interface PropriedadesTabelaDosDuelos {
  partida: Partida;
}

interface PropriedadesJogador {
  jogador: JogadorDoDuelo;
  clube: string;
}

function JogadorDoDueloNaTabela({ jogador, clube }: PropriedadesJogador) {
  return (
    <div className="flex items-center gap-3">
      <AvatarDoJogador id={jogador.player_id} nome={jogador.player_name} />
      <div>
        <p className="font-medium">
          {jogador.player_name}
          {jogador.condition === "MAL_CONDICIONADO" && (
            <Badge variant="outline" className="ml-2 border-amber-200 bg-amber-50 text-amber-700">
              Mal condicionado
            </Badge>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {jogador.position} · {clube}
        </p>
      </div>
    </div>
  );
}

// F13, L03: os 6 duelos como a API gravou (nomes, condições, atributos e valores do momento)
export function TabelaDosDuelos({ partida }: PropriedadesTabelaDosDuelos) {
  const { home, away } = partida;
  const siglas = useSiglasDosClubes();
  // Duelos 1 a 3: ataques do mandante; 4 a 6: do visitante (RN20)
  const grupos = [
    { atacante: home, defensor: away, papel: "mandante" },
    { atacante: away, defensor: home, papel: "visitante" },
  ];

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Duelo</TableHead>
            <TableHead>Atacante</TableHead>
            <TableHead>Ataque</TableHead>
            <TableHead>Defensor</TableHead>
            <TableHead>Defesa</TableHead>
            <TableHead>Resultado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grupos.map(({ atacante, defensor, papel }) => (
            <Fragment key={papel}>
              <TableRow className="bg-muted/30">
                <TableCell colSpan={5} className="text-xs font-medium">
                  <span className="mr-2 text-muted-foreground">{siglas.get(atacante.club_id)}</span>
                  Ataques do {atacante.club_name} ({papel})
                </TableCell>
                {/* L03: os gols do lado, à direita da faixa */}
                <TableCell className="text-right text-xs text-muted-foreground">
                  {atacante.goals === 1 ? "1 gol" : `${atacante.goals} gols`}
                </TableCell>
              </TableRow>
              {partida.duels
                .filter((duelo) => duelo.attacking_club_id === atacante.club_id)
                .map((duelo) => (
                  <TableRow key={duelo.order}>
                    <TableCell>{duelo.order}</TableCell>
                    <TableCell>
                      <JogadorDoDueloNaTabela jogador={duelo.attacker} clube={atacante.club_name} />
                    </TableCell>
                    <TableCell>
                      {nomesDosAtributos[duelo.attacker.attribute]}{" "}
                      <span className="font-semibold">{duelo.attacker.value}</span>
                    </TableCell>
                    <TableCell>
                      <JogadorDoDueloNaTabela jogador={duelo.defender} clube={defensor.club_name} />
                    </TableCell>
                    <TableCell>
                      {nomesDosAtributos[duelo.defender.attribute]}{" "}
                      <span className="font-semibold">{duelo.defender.value}</span>
                    </TableCell>
                    <TableCell>
                      {duelo.goal ? (
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-green-50 text-green-700"
                        >
                          <CircleCheck />
                          Gol
                        </Badge>
                      ) : (
                        <Badge variant="outline">Sem gol</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
