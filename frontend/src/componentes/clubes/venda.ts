import type { ResultadoDaVenda } from "@/api/mercado";

// V02, V03: a frase do resultado; ENCERRADO quer dizer fidelidade cumprida, sem multa (RN15)
export function descreverVenda(venda: ResultadoDaVenda, saiuDaEscalacao: boolean): string {
  const escalacao = saiuDaEscalacao ? " e saiu da escalação" : "";
  const multa =
    venda.contract_status === "ENCERRADO"
      ? " A fidelidade já tinha terminado, então não houve multa."
      : "";
  return `${venda.player_name} voltou a ficar livre${escalacao}.${multa}`;
}

// RN15: percentual pelos dias restantes, com teto de 10,00
export function explicarMulta(venda: ResultadoDaVenda): string {
  return venda.penalty_rate === 0
    ? "Fidelidade cumprida: sem multa"
    : `${venda.penalty_rate}% do valor de venda, com teto de 10,00`;
}

// RN16: comissão só sobre lucro
export function explicarComissao(venda: ResultadoDaVenda): string {
  return (venda.profit ?? 0) > 0
    ? "10% do lucro até 10,00 + 20% do que passar"
    : "Sem lucro: sem comissão";
}
