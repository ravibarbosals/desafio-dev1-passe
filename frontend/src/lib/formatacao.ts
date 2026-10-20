// REQ-046: valores e datas como a API devolve, só formatados; a tela nunca recalcula (REQ-043)

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// 2 casas e vírgula decimal: 1234.5 → "1.234,50"; -0.39 → "-0,39"
export function formatarMoeda(valor: number): string {
  return formatoMoeda.format(valor);
}

// Variação com sinal, como no histórico e no resultado da venda: 7.8 → "+7,80"; -4.8 → "-4,80"
export function formatarMoedaComSinal(valor: number): string {
  return valor > 0 ? `+${formatarMoeda(valor)}` : formatarMoeda(valor);
}

// "2026-11-12T15:00:00-03:00" → "12/11/2026 15:00", sempre no horário de Brasília (RN01)
export function formatarDataHora(dataHora: string): string {
  return formatoDataHora.format(new Date(dataHora)).replace(", ", " ");
}

// Data e hora digitadas na tela ("2027-12-31" e "18:30") no formato que a API aceita (RN01: Brasília, sem horário de verão)
export function montarDataHoraBrasilia(data: string, hora: string): string {
  return `${data}T${hora}-03:00`;
}
