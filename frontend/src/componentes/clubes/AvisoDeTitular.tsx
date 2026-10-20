import { Alerta } from "@/componentes/Alerta";

interface PropriedadesAvisoDeTitular {
  nomeDoJogador: string;
  nomeDoClube?: string;
  // O que tira o jogador da escalação: "Ao vender" (V01) ou "Ao passar a Doente" (J16)
  acao: string;
}

// RN19.5: o titular vendido ou que fica Doente sai da escalação, e o clube não joga até escalar de novo
export function AvisoDeTitular({ nomeDoJogador, nomeDoClube, acao }: PropriedadesAvisoDeTitular) {
  return (
    <Alerta
      tom="atencao"
      titulo={`${nomeDoJogador} é titular${nomeDoClube ? ` do ${nomeDoClube}` : ""}`}
    >
      <p>
        {acao}, o jogador sai da escalação, e o clube só volta a jogar partidas depois de escalar de
        novo os 5 titulares.
      </p>
    </Alerta>
  );
}
