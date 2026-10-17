const PRAZO_MAXIMO_EM_DIAS = 1095;
const umDiaEmMs = 24 * 60 * 60 * 1000;

// Limites (loyalty_until) e PR-005: estritamente depois de agora e até agora + 1.095 dias, inclusivo, no instante exato
export function fidelidadeDentroDoPrazo(fim: Date, agora: Date): boolean {
  return fim.getTime() > agora.getTime() && fim.getTime() <= agora.getTime() + PRAZO_MAXIMO_EM_DIAS * umDiaEmMs;
}
