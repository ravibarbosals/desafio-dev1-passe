import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/componentes/ui/popover";

import { lerFaixa, type RegrasDaFaixa } from "./faixa";

interface PropriedadesFiltroDeFaixa {
  id: string;
  rotulo: string;
  icone: LucideIcon;
  minimo: number | undefined;
  maximo: number | undefined;
  regras: RegrasDaFaixa;
  // Texto do botão com a faixa aplicada: "Idade: 18 a 30"
  resumo: string | undefined;
  aoAplicar: (minimo: number | undefined, maximo: number | undefined) => void;
}

// O número na tela usa vírgula: 10.5 → "10,5"
function paraTexto(valor: number | undefined): string {
  return valor === undefined ? "" : String(valor).replace(".", ",");
}

export function FiltroDeFaixa({
  id,
  rotulo,
  icone: Icone,
  minimo,
  maximo,
  regras,
  resumo,
  aoAplicar,
}: PropriedadesFiltroDeFaixa) {
  const [aberto, setAberto] = useState(false);
  const [minimoDigitado, setMinimoDigitado] = useState("");
  const [maximoDigitado, setMaximoDigitado] = useState("");
  const [erro, setErro] = useState<string>();

  // Ao abrir, os campos começam com a faixa que está na URL
  function mudarAberto(valor: boolean) {
    if (valor) {
      setMinimoDigitado(paraTexto(minimo));
      setMaximoDigitado(paraTexto(maximo));
      setErro(undefined);
    }
    setAberto(valor);
  }

  function aplicar(evento: FormEvent) {
    evento.preventDefault();
    const faixa = lerFaixa(minimoDigitado, maximoDigitado, regras);
    if (!faixa.valida) {
      setErro(faixa.erro);
      return;
    }
    aoAplicar(faixa.minimo, faixa.maximo);
    setAberto(false);
  }

  function limpar() {
    aoAplicar(undefined, undefined);
    setAberto(false);
  }

  return (
    <Popover open={aberto} onOpenChange={mudarAberto}>
      {/* Sem asChild: o Button do shadcn não repassa a ref no React 18, e o popover perderia a âncora */}
      <PopoverTrigger asChild>
        <Button type="button" variant="outline">
          <Icone />
          {resumo ? `${rotulo}: ${resumo}` : rotulo}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <form onSubmit={aplicar} className="flex flex-col gap-3" noValidate>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${id}-minimo`}>{regras.rotulos.minimo}</Label>
              <Input
                id={`${id}-minimo`}
                inputMode={regras.casas === 0 ? "numeric" : "decimal"}
                placeholder={String(regras.piso)}
                value={minimoDigitado}
                aria-invalid={erro !== undefined}
                onChange={(evento) => setMinimoDigitado(evento.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${id}-maximo`}>{regras.rotulos.maximo}</Label>
              <Input
                id={`${id}-maximo`}
                inputMode={regras.casas === 0 ? "numeric" : "decimal"}
                placeholder={String(regras.teto)}
                value={maximoDigitado}
                aria-invalid={erro !== undefined}
                onChange={(evento) => setMaximoDigitado(evento.target.value)}
              />
            </div>
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={limpar}>
              Limpar
            </Button>
            <Button type="submit" size="sm">
              Aplicar
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
