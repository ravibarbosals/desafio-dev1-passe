import { TriangleAlert } from "lucide-react";

interface PropriedadesAvisoDeTitular {
  nomeDoJogador: string;
  nomeDoClube?: string;
  // O que tira o jogador da escalação: "Ao vender" (V01) ou "Ao passar a Doente" (J16)
  acao: string;
}

// RN19.5: o titular vendido ou que fica Doente sai da escalação, e o clube não joga até escalar de novo
export function AvisoDeTitular({ nomeDoJogador, nomeDoClube, acao }: PropriedadesAvisoDeTitular) {
  return (
    <div
      role="alert"
      className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">
          {nomeDoJogador} é titular{nomeDoClube && ` do ${nomeDoClube}`}
        </p>
        <p>
          {acao}, o jogador sai da escalação, e o clube só volta a jogar partidas depois de escalar
          de novo os 5 titulares.
        </p>
      </div>
    </div>
  );
}
