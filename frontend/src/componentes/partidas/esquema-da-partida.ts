import { z } from "zod";

import type { NovaPartida } from "@/api/partidas";

// REQ-044: a tela confere os dois clubes e que são diferentes (a API também recusa com 400). A
// escalação incompleta não é impedida: a API responde 409 e o message aparece no modal (L04)
export const esquemaDaPartida = z
  .object({
    // O Select devolve o id como texto
    mandante: z.string().min(1, "Escolha o mandante."),
    visitante: z.string().min(1, "Escolha o visitante."),
  })
  // Sem mandante escolhido, o visitante fica só com a mensagem de obrigatório
  .refine((partida) => partida.mandante === "" || partida.mandante !== partida.visitante, {
    path: ["visitante"],
    message: "Escolha um clube diferente do mandante.",
  });

export type FormularioDaPartida = z.infer<typeof esquemaDaPartida>;

export const partidaVazia: FormularioDaPartida = { mandante: "", visitante: "" };

export function montarPartida({ mandante, visitante }: FormularioDaPartida): NovaPartida {
  return { home_club_id: Number(mandante), away_club_id: Number(visitante) };
}
