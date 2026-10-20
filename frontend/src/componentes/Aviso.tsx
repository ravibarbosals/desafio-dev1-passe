import type { ReactNode } from "react";

interface PropriedadesAviso {
  icone: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

// Quadro de estado (vazio, erro, não encontrado) das listas e páginas (E02 a E04)
export function Aviso({ icone, titulo, descricao, acao }: PropriedadesAviso) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icone}
      </span>
      <p className="font-semibold">{titulo}</p>
      {descricao && <p className="max-w-md text-sm text-muted-foreground">{descricao}</p>}
      {acao}
    </div>
  );
}
