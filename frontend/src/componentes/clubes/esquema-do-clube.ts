import { z } from "zod";

// REQ-044: a tela confere só obrigatório, tamanho do nome e sigla com 3 letras maiúsculas.
// Formato do nome (2 a 5 palavras), sigla tirada do nome e unicidade ficam com a API (MOD-002).
export const esquemaDoNovoClube = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .min(3, "Use de 3 a 60 caracteres.")
    .max(60, "Use de 3 a 60 caracteres."),
  acronym: z
    .string()
    .trim()
    .min(1, "Informe a sigla.")
    .regex(/^[A-Z]{3}$/, "Use 3 letras maiúsculas, de A a Z."),
});

export type FormularioDoNovoClube = z.input<typeof esquemaDoNovoClube>;

export const clubeVazio: FormularioDoNovoClube = { name: "", acronym: "" };
