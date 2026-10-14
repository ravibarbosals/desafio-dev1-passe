const tresHorasEmMs = 3 * 60 * 60 * 1000;

// RN01: horário de Brasília com offset fixo (sem horário de verão), sem depender do fuso do servidor
export function formatarDataHora(instante: Date): string {
  const horarioDeBrasilia = new Date(instante.getTime() - tresHorasEmMs);
  return `${horarioDeBrasilia.toISOString().slice(0, 19)}-03:00`;
}
