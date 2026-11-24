import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Escudos dos clubes da demo (Série B 2026), em public/escudos/, pela sigla. As marcas são dos
// próprios clubes e estão aqui só para demonstração (README da raiz)
const ESCUDOS: Record<string, string> = {
  ACG: "acg.png",
  AME: "ame.svg",
  ATH: "ath.svg",
  AVA: "ava.svg",
  BOT: "bot.svg",
  CEA: "cea.svg",
  CRB: "crb.svg",
  CRI: "cri.svg",
  CUI: "cui.svg",
  ECJ: "ecj.svg",
  FOR: "for.svg",
  GNV: "gnv.svg",
  GOI: "goi.svg",
  LON: "lon.png",
  NAU: "nau.png",
  OPE: "ope.svg",
  PON: "pon.svg",
  SBF: "sbf.png",
  SPO: "spo.svg",
  VIL: "vil.svg",
};

interface PropriedadesEscudoDoClube {
  // undefined enquanto a lista de clubes carrega (partidas e classificação)
  sigla: string | undefined;
  // Tamanho do escudo (ex.: "size-5")
  className?: string;
  // O que aparece quando o clube não tem escudo: o selo com a sigla de cada tela
  children: ReactNode;
}

// O nome do clube sempre aparece ao lado, então a imagem é decorativa (alt vazio)
export function EscudoDoClube({ sigla, className, children }: PropriedadesEscudoDoClube) {
  const arquivo = sigla === undefined ? undefined : ESCUDOS[sigla];
  if (!arquivo) {
    return children;
  }
  return (
    <img src={`/escudos/${arquivo}`} alt="" className={cn("shrink-0 object-contain", className)} />
  );
}
