import { cn } from "@/lib/utils";

// Tons claros do mockup (J01); o id escolhe o tom, então o mesmo jogador tem sempre a mesma cor
const tons = [
  "bg-muted text-muted-foreground",
  "bg-pink-50 text-pink-600",
  "bg-cyan-50 text-cyan-700",
  "bg-violet-50 text-violet-600",
  "bg-emerald-50 text-emerald-700",
];

// Primeira letra do primeiro e do último nome: "Énio Carvalho" → "ÉC"
export function iniciaisDoNome(nome: string): string {
  const palavras = nome.trim().split(" ").filter(Boolean);
  const primeira = palavras[0] ?? "";
  const ultima = palavras.length > 1 ? palavras[palavras.length - 1] : "";
  return `${[...primeira][0] ?? ""}${[...ultima][0] ?? ""}`.toUpperCase();
}

interface PropriedadesAvatarDoJogador {
  id: number;
  nome: string;
}

export function AvatarDoJogador({ id, nome }: PropriedadesAvatarDoJogador) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
        tons[id % tons.length],
      )}
    >
      {iniciaisDoNome(nome)}
    </span>
  );
}
