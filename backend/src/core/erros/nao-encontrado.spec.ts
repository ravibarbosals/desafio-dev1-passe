import { criarErroNaoEncontrado, RECURSOS_NAO_ENCONTRADOS } from '@/core/erros/nao-encontrado';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';

describe('criarErroNaoEncontrado', () => {
  it.each([
    ['jogador', 'JOGADOR_NAO_ENCONTRADO', 'Jogador não encontrado.'],
    ['clube', 'CLUBE_NAO_ENCONTRADO', 'Clube não encontrado.'],
  ] as const)('responde 404 com o código do catálogo para %s', (recurso, codigo, mensagem) => {
    const erro = criarErroNaoEncontrado(recurso);
    expect(erro).toBeInstanceOf(RegraNegocioException);
    expect(erro).toMatchObject({ codigo, message: mensagem, status: 404 });
  });

  it('não repete código entre os recursos (DEC-032)', () => {
    const codigos = Object.values(RECURSOS_NAO_ENCONTRADOS).map((recurso) => recurso.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
  });
});
