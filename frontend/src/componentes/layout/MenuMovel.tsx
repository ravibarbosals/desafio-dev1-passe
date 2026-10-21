import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/componentes/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/componentes/ui/sheet";

import { ConteudoDoMenu } from "./MenuLateral";

// F5 (375 px): abaixo de 768 px o menu lateral não cabe ao lado da página e abre por cima dela
export function MenuMovel() {
  const [aberto, setAberto] = useState(false);

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          className="md:hidden"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 gap-6 overflow-y-auto p-4"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <ConteudoDoMenu aoNavegar={() => setAberto(false)} />
      </SheetContent>
    </Sheet>
  );
}
