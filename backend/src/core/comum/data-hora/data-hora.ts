const tresHorasEmMs = 3 * 60 * 60 * 1000;
const formatoDeEntrada = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;

// RN01: horário de Brasília com offset fixo (sem horário de verão), sem depender do fuso do servidor
export function formatarDataHora(instante: Date): string {
  const horarioDeBrasilia = new Date(instante.getTime() - tresHorasEmMs);
  return `${horarioDeBrasilia.toISOString().slice(0, 19)}-03:00`;
}

function anoBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

// RN01: entrada AAAA-MM-DDTHH:MM-03:00 com data real; devolve o instante ou null se o texto for inválido
export function lerDataHora(texto: string): Date | null {
  const partes = formatoDeEntrada.exec(texto);
  if (!partes) {
    return null;
  }
  const [ano, mes, dia, hora, minuto] = partes.slice(1).map(Number);
  const diasNoMes = new Date(Date.UTC(2000, mes, 0)).getUTCDate();
  const ultimoDia = mes === 2 && !anoBissexto(ano) ? 28 : diasNoMes;
  if (mes < 1 || mes > 12 || dia < 1 || dia > ultimoDia || hora > 23 || minuto > 59) {
    return null;
  }
  // setUTCFullYear evita que anos de 0 a 99 virem 1900 a 1999 (comportamento do Date.UTC)
  const instante = new Date(0);
  instante.setUTCFullYear(ano, mes - 1, dia);
  instante.setUTCHours(hora + 3, minuto, 0, 0);
  return instante;
}
