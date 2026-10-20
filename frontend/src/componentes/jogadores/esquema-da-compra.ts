import { z } from "zod";

import type { NovaCompra } from "@/api/mercado";
import { montarDataHoraBrasilia } from "@/lib/formatacao";

// REQ-044: a tela confere só os obrigatórios. O prazo da fidelidade (depois de agora e até
// 1.095 dias) depende do momento atual e fica com a API, que responde 400 com o message.
export const esquemaDaCompra = z.object({
  // O Select devolve o id como texto
  clube: z.string().min(1, "Escolha o clube comprador."),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data."),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Informe a hora."),
});

export type FormularioDaCompra = z.infer<typeof esquemaDaCompra>;

export const compraVazia: FormularioDaCompra = { clube: "", data: "", hora: "" };

// Data e hora digitadas no horário de Brasília → corpo do POST /players/{id}/buy
export function montarCompra({ clube, data, hora }: FormularioDaCompra): NovaCompra {
  return { club_id: Number(clube), loyalty_until: montarDataHoraBrasilia(data, hora) };
}
