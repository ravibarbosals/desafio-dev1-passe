import { z } from "zod";

// REQ-044: a tela confere só obrigatório e limite de cada campo, com a mensagem junto dele.
// As regras que cruzam campos (soma ≤ 480, potencial ≥ maior atributo, agilidade ≤ 85 aos 35+)
// e o formato do nome (2 palavras, sem número) ficam com a API, que responde 400 com o message (MOD-001).

// Os campos chegam como texto (o que foi digitado) e saem como número
function inteiro(mensagemVazio: string, minimo: number, maximo: number, mensagemFaixa: string) {
  return z
    .string()
    .trim()
    .min(1, mensagemVazio)
    .regex(/^\d+$/, mensagemFaixa)
    .transform(Number)
    .refine((numero) => numero >= minimo && numero <= maximo, mensagemFaixa);
}

function atributo(nome: string) {
  return inteiro(`Informe ${nome}.`, 1, 99, "Use um valor de 1 a 99.");
}

// As chaves são os campos do POST /players (exceção da DEC-034): o formulário monta esse corpo
export const esquemaDoNovoJogador = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Use de 3 a 100 caracteres.")
    .max(100, "Use de 3 a 100 caracteres."),
  position: z.enum(["GOL", "ZAG", "LAT", "MEI", "ATA"], { error: "Escolha a posição." }),
  age: inteiro("Informe a idade.", 16, 45, "Use uma idade de 16 a 45 anos."),
  agility: inteiro("Informe a agilidade.", 1, 100, "Use um valor de 1 a 100."),
  pace: atributo("a velocidade"),
  shooting: atributo("a finalização"),
  passing: atributo("o passe"),
  dribbling: atributo("o drible"),
  defending: atributo("a defesa"),
  physical: atributo("o físico"),
  potential: atributo("o potencial"),
});

export type FormularioDoNovoJogador = z.input<typeof esquemaDoNovoJogador>;

export const formularioVazio: FormularioDoNovoJogador = {
  name: "",
  // A posição começa sem escolha; o zod recusa "" com "Escolha a posição."
  position: "" as FormularioDoNovoJogador["position"],
  age: "",
  agility: "",
  pace: "",
  shooting: "",
  passing: "",
  dribbling: "",
  defending: "",
  physical: "",
  potential: "",
};
