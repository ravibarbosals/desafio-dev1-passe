import { Alerta } from "@/componentes/Alerta";
import { extrairMensagemErro, semResposta } from "@/lib/erro-api";

interface PropriedadesErroDoEnvio {
  erro: unknown;
  // Título da recusa da API: "Compra recusada", "A venda foi recusada", "O filtro foi recusado"
  tituloRecusa: string;
  // Texto sem conexão: "A compra não foi confirmada. Verifique a conexão e tente de novo."
  textoSemConexao?: string;
}

// Erro da API dentro do quadro (M03, M04, V04, H05, C10): o message da API ou "Sem conexão"
export function ErroDoEnvio({ erro, tituloRecusa, textoSemConexao }: PropriedadesErroDoEnvio) {
  const semConexao = semResposta(erro);

  return (
    <Alerta tom="erro" titulo={semConexao ? "Sem conexão" : tituloRecusa}>
      <p>{semConexao && textoSemConexao ? textoSemConexao : extrairMensagemErro(erro)}</p>
    </Alerta>
  );
}
