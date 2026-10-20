import { CircleAlert } from "lucide-react";

import { extrairMensagemErro, semResposta } from "@/lib/erro-api";

interface PropriedadesErroDoEnvio {
  erro: unknown;
  // Título da recusa da API: "Compra recusada", "A venda foi recusada", "O filtro foi recusado"
  tituloRecusa: string;
  // Texto sem conexão: "A compra não foi confirmada. Verifique a conexão e tente de novo."
  textoSemConexao?: string;
}

// Erro da API dentro do quadro (M03, M04, V04, H05): o message da API ou "Sem conexão"
export function ErroDoEnvio({ erro, tituloRecusa, textoSemConexao }: PropriedadesErroDoEnvio) {
  const semConexao = semResposta(erro);

  return (
    <div
      role="alert"
      className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">{semConexao ? "Sem conexão" : tituloRecusa}</p>
        <p>{semConexao && textoSemConexao ? textoSemConexao : extrairMensagemErro(erro)}</p>
      </div>
    </div>
  );
}
