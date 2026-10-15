import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { CriarJogadorDto } from '@/modulos/jogadores/dto/criar-jogador.dto';

// Corpo do exemplo 2.1.3 do enunciado
const corpoValido = {
  name: 'Meia Lua',
  position: 'MEI',
  agility: 85,
  age: 25,
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
  potential: 86,
};

function validar(corpo: object): Promise<CriarJogadorDto> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: CriarJogadorDto }) as Promise<CriarJogadorDto>;
}

async function listarCamposRecusados(corpo: object): Promise<string[]> {
  const erro = await validar(corpo).catch((excecao: unknown) => excecao);
  expect(erro).toBeInstanceOf(RegraNegocioException);
  return [...new Set((erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.campo))];
}

function com(campos: object): object {
  return { ...corpoValido, ...campos };
}

describe('CriarJogadorDto', () => {
  it('aceita o corpo do exemplo do enunciado', async () => {
    await expect(validar(corpoValido)).resolves.toEqual(corpoValido);
  });

  it('descarta os campos controlados pelo sistema e os desconhecidos (V7)', async () => {
    const dados = await validar(com({ club_id: 3, condition: 'DOENTE', base_value: 999, overall: 99, market_value: 1, Agility: 10 }));
    expect(dados).toEqual(corpoValido);
  });

  it('normaliza o nome antes de validar e de gravar (V4)', async () => {
    await expect(validar(com({ name: '  Meia   Lua ' }))).resolves.toMatchObject({ name: 'Meia Lua' });
  });

  it.each([
    ['nome de 3 caracteres', { name: 'A B' }],
    ['nome de 100 caracteres', { name: `Ana ${'b'.repeat(96)}` }],
    ['pedaço sem letra entre os nomes (AM-003)', { name: 'Zé "Foguete" Lima' }],
    ['soma dos atributos igual a 480', { pace: 80, shooting: 80, passing: 80, dribbling: 80, defending: 80, physical: 80, potential: 80 }],
    ['potential igual ao maior atributo', { potential: 82 }],
    ['33 anos com potential igual ao maior atributo', { age: 33, potential: 82 }],
    ['35 anos com agilidade 85', { age: 35, agility: 85, potential: 82 }],
    ['34 anos com agilidade 100', { age: 34, agility: 100, potential: 82 }],
    ['idade 16', { age: 16 }],
    ['idade 45 com agilidade 85', { age: 45, agility: 85, potential: 82 }],
  ])('aceita %s', async (_caso, campos) => {
    await expect(validar(com(campos))).resolves.toBeInstanceOf(CriarJogadorDto);
  });

  it.each([
    ['número como texto (V2)', { agility: '15' }, 'agility'],
    ['decimal em inteiro (V2)', { agility: 50.5 }, 'agility'],
    ['posição em minúsculas (V5)', { position: 'ata' }, 'position'],
    ['campo null (V6)', { pace: null }, 'pace'],
    ['nome com 1 palavra', { name: 'Ronaldo' }, 'name'],
    ['nome com dígito', { name: 'Zé 10 Lima' }, 'name'],
    ['nome com tabulação', { name: 'Meia\tLua' }, 'name'],
    ['nome só com espaços', { name: '   ' }, 'name'],
    ['nome de 2 caracteres', { name: 'AB' }, 'name'],
    ['nome de 101 caracteres', { name: `Ana ${'b'.repeat(97)}` }, 'name'],
    ['nome com 1 palavra e um pedaço sem letra', { name: 'Ronaldo -' }, 'name'],
    ['soma dos atributos 481', { pace: 81, shooting: 80, passing: 80, dribbling: 80, defending: 80, physical: 80, potential: 81 }, 'physical'],
    ['potential menor que o maior atributo', { potential: 81 }, 'potential'],
    ['33 anos com potential maior que o maior atributo', { age: 33, potential: 86 }, 'potential'],
    ['35 anos com agilidade 86', { age: 35, agility: 86, potential: 82 }, 'agility'],
    ['idade 15', { age: 15 }, 'age'],
    ['idade 46', { age: 46, agility: 80, potential: 82 }, 'age'],
    ['atributo 0', { pace: 0 }, 'pace'],
    ['atributo 100', { pace: 100 }, 'pace'],
  ])('recusa %s', async (_caso, campos, campoRecusado) => {
    await expect(listarCamposRecusados(com(campos))).resolves.toContain(campoRecusado);
  });

  it.each(['name', 'position', 'agility', 'age', 'pace', 'potential'])('recusa o corpo sem %s (V6)', async (campo) => {
    const corpo: Record<string, unknown> = { ...corpoValido };
    delete corpo[campo];
    await expect(validar(corpo)).rejects.toBeInstanceOf(RegraNegocioException);
  });

  it('recusa Agility no lugar de agility: o campo obrigatório fica ausente', async () => {
    const { agility, ...semAgility } = corpoValido;
    await expect(validar({ ...semAgility, Agility: agility })).rejects.toThrow('agility deve ser um inteiro de 1 a 100.');
  });

  it('responde 400 DADOS_INVALIDOS com a regra de cada campo em detalhes', async () => {
    const erro = await validar(com({ age: 35, agility: 86, potential: 81 })).catch((excecao: unknown) => excecao);
    expect(erro).toBeInstanceOf(RegraNegocioException);
    expect(erro).toMatchObject({ codigo: 'DADOS_INVALIDOS', status: 400 });
    expect((erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.campo)).toEqual(['agility', 'potential']);
  });
});