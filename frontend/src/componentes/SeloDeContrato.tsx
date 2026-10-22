import { Badge } from "@/componentes/ui/badge";

type StatusDoContrato = "ATIVO" | "RESCINDIDO" | "ENCERRADO";

// M05, V02, V03: ativo em verde, rescindido (vendido com multa) em amarelo, encerrado em cinza
const cores: Record<StatusDoContrato, string> = {
  ATIVO: "border-green-200 bg-green-50 text-green-700",
  RESCINDIDO: "border-amber-200 bg-amber-50 text-amber-700",
  ENCERRADO: "bg-muted text-muted-foreground",
};

interface PropriedadesSeloDoContrato {
  status: StatusDoContrato;
}

// O status do contrato no resultado da compra e da venda, como a API devolve
export function SeloDoContrato({ status }: PropriedadesSeloDoContrato) {
  return (
    <Badge variant="outline" className={cores[status]}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}
