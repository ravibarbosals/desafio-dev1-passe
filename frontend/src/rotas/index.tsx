import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  Clock,
  HandCoins,
  History,
  Shield,
  ShoppingCart,
  Swords,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";

import { consultaDosClubes } from "@/api/clube";
import { consultaDosJogadores } from "@/api/jogadores";
import { consultaDasPartidas } from "@/api/partidas";
import { Button } from "@/componentes/ui/button";

export const Route = createFileRoute("/")({
  component: PaginaInicial,
});

interface Etapa {
  titulo: string;
  texto: string;
  icone: LucideIcon;
}

interface PropriedadesContador {
  icone: LucideIcon;
  valor: number | undefined;
  rotulo: string;
}

// O fluxo do sistema na ordem do enunciado, com os textos do mockup (tela inicial)
const etapas: Etapa[] = [
  {
    titulo: "Jogadores",
    texto: "Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.",
    icone: Users,
  },
  { titulo: "Clubes", texto: "Começam com 300,00 em caixa e sem jogadores.", icone: Shield },
  {
    titulo: "Compra",
    texto: "Valor + taxa, até 50% do caixa, com contrato de fidelidade.",
    icone: ShoppingCart,
  },
  {
    titulo: "Venda",
    texto: "Multa antes do fim da fidelidade e comissão sobre o lucro.",
    icone: HandCoins,
  },
  {
    titulo: "Histórico",
    texto: "Toda compra e venda fica registrada, com totais e CSV.",
    icone: History,
  },
  {
    titulo: "Liga",
    texto: "Escale 5 titulares e jogue partidas que entram na classificação.",
    icone: Trophy,
  },
];

// Tela de entrada do mockup, fora do layout com o menu (__root.tsx); os números vêm da API
function PaginaInicial() {
  const navegar = useNavigate();
  const jogadores = useQuery(consultaDosJogadores({}));
  const livres = useQuery(consultaDosJogadores({ situacao: "livres" }));
  const clubes = useQuery(consultaDosClubes());
  const partidas = useQuery(consultaDasPartidas());

  // "ou tecle Enter": só quando nenhum campo ou botão está em foco, para não disparar duas vezes
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Enter" && evento.target === document.body) {
        void navegar({ to: "/jogadores" });
      }
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [navegar]);

  const totalDePartidas = partidas.data?.length;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground md:p-8">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border px-4 py-10 md:px-8">
        <Campo />

        <div className="relative flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
              P
            </span>
            <span className="text-3xl font-semibold">Passe</span>
          </div>

          <p className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs">
            <span className="size-2 rounded-full bg-green-600" />
            <span className="font-medium">Liga Fictícia 2026</span>
            {totalDePartidas !== undefined && (
              <span className="text-muted-foreground">
                ·{" "}
                {totalDePartidas === 0
                  ? "nenhuma partida ainda"
                  : `${totalDePartidas} ${totalDePartidas === 1 ? "partida" : "partidas"}`}
              </span>
            )}
          </p>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Gestão da liga, do mercado à classificação
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Cadastre jogadores, monte os clubes e negocie com contrato de fidelidade. Depois, escale
            os titulares e jogue partidas com placar calculado pelos atributos.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="px-12">
              <Link to="/jogadores">
                Iniciar
                <ArrowRight />
              </Link>
            </Button>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              ou tecle <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">Enter</kbd>
            </span>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <Contador icone={Users} valor={jogadores.data?.meta.total_items} rotulo="jogadores" />
            <Contador icone={User} valor={livres.data?.meta.total_items} rotulo="livres" />
            <Contador icone={Shield} valor={clubes.data?.length} rotulo="clubes" />
            <Contador icone={Swords} valor={totalDePartidas} rotulo="partidas" />
            <li className="flex items-center gap-1.5 before:text-border not-first:before:mr-1.5 not-first:before:content-['•']">
              <CircleCheck className="size-4" />
              Não precisa de login
            </li>
          </ul>
        </div>

        <ol className="relative mt-10 grid gap-3 sm:grid-cols-2 lg:gap-6 lg:grid-cols-[repeat(6,minmax(0,1fr))]">
          {etapas.map(({ titulo, texto, icone: Icone }, indice) => (
            <li
              key={titulo}
              className="relative flex flex-col gap-2 rounded-xl border bg-background p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icone className="size-4" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(indice + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-sm font-medium">{titulo}</p>
              <p className="text-xs text-muted-foreground">{texto}</p>
              {indice < etapas.length - 1 && (
                <ChevronRight
                  aria-hidden
                  className="absolute top-1/2 -right-5 hidden size-4 -translate-y-1/2 text-muted-foreground lg:block"
                />
              )}
            </li>
          ))}
        </ol>

        <p className="relative mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Liga Fictícia 2026 · Horário de Brasília (UTC−3)
        </p>
      </div>
    </div>
  );
}

// Enquanto a API não responde (ou se falhar), o número fica como "–"
function Contador({ icone: Icone, valor, rotulo }: PropriedadesContador) {
  return (
    <li className="flex items-center gap-1.5 before:text-border not-first:before:mr-1.5 not-first:before:content-['•']">
      <Icone className="size-4" />
      <span className="font-semibold text-foreground">{valor ?? "–"}</span>
      {rotulo}
    </li>
  );
}

// Linhas do campo ao fundo, só a partir de 768 px, como no mockup
function Campo() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden size-full text-border md:block"
      viewBox="0 0 1000 560"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
    >
      <line x1="500" y1="0" x2="500" y2="560" />
      <circle cx="500" cy="280" r="90" />
      <rect x="0" y="120" width="130" height="320" />
      <rect x="0" y="200" width="50" height="160" />
      <rect x="870" y="120" width="130" height="320" />
      <rect x="950" y="200" width="50" height="160" />
      <path d="M 130 225 A 65 65 0 0 1 130 335" />
      <path d="M 870 225 A 65 65 0 0 0 870 335" />
      <g fill="currentColor" stroke="none">
        <circle cx="500" cy="280" r="3" />
        <circle cx="95" cy="280" r="3" />
        <circle cx="905" cy="280" r="3" />
      </g>
    </svg>
  );
}
