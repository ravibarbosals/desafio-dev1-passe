import type { Condicao, Jogador } from "@/api/jogadores";

// Textos do J10; os percentuais são os da RN02 a RN05 (o cálculo fica com a API)
export const descricoesDasCondicoes: Record<Condicao, string> = {
  APTO: "Sem desconto por condição.",
  MAL_CONDICIONADO:
    "Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.",
  DOENTE: "Desconto de 30%, com o mesmo ajuste de agilidade.",
};

// Limites (condition): de DOENTE não vai direto para APTO, a API responderia 409; o J10 trava a opção
export function podeMudarDeCondicao(atual: Condicao, nova: Condicao): boolean {
  return !(atual === "DOENTE" && nova === "APTO");
}

// J16: passar a DOENTE tira o titular da escalação (RN19.5); sem os titulares carregados, não avisa
export function saiDaEscalacao(
  jogador: Pick<Jogador, "id" | "condition">,
  nova: Condicao,
  titulares: Pick<Jogador, "id">[] | undefined,
): boolean {
  if (nova !== "DOENTE" || jogador.condition === "DOENTE" || !titulares) {
    return false;
  }
  return titulares.some((titular) => titular.id === jogador.id);
}
