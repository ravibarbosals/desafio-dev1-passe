const ARTE = [
  '██████╗  █████╗ ███████╗███████╗███████╗',
  '██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝',
  '██████╔╝███████║███████╗███████╗█████╗  ',
  '██╔═══╝ ██╔══██║╚════██║╚════██║██╔══╝  ',
  '██║     ██║  ██║███████║███████║███████╗',
  '╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝',
];

const CIANO = '\x1b[36m';
const NORMAL = '\x1b[0m';

export function montarBanner(porta: number): string {
  const origem = `http://localhost:${porta}`;
  const linhas = ['', ...ARTE.map((linha) => `${CIANO}  ${linha}${NORMAL}`), '', `  API rodando em ${origem}/api/v1`, `  Documentação (Swagger) em ${origem}/api-docs`, ''];
  return linhas.map((linha) => `${linha}\n`).join('');
}
