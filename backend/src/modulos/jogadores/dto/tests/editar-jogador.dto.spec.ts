import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';
import { EditarJogadorDto } from '@/modulos/jogadores/dto/editar-jogador.dto';

// Corpo do exemplo de API.md (Jogadores §5.4)
const corpoValido = { name: 'Davi Melo', position: 'MEI', agility: 70, age: 23 };

function validar(corpo: object): Promise<EditarJogadorDto> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: EditarJogadorDto }) as Promise<EditarJogadorDto>;
}

async function listarCamposRecusados(corpo: object): Promise<string[]> {
  const erro = await validar(corpo).catch((excecao: unknown) => excecao);
  expect(erro).toBeInstanceOf(RegraNegocioException);
  return [...new Set((erro as RegraNegocioException).detalhes?.map((detalhe) => detalhe.campo))];
}

function com(campos: object): object {
  return { ...corpoValido, ...campos };
}

describe('EditarJogadorDto', () => {
  it('aceita o corpo do exemplo', async () => {
    await expect(validar(corpoValido)).resolves.toEqual(corpoValido);
  });

  it('descarta atributos, potencial e campos controlados pelo sistema (RN08, V7)', async () => {
    const dados = await validar(com({ pace: 99, potential: 99, base_value: 999, club_id: 3, condition: 'DOENTE' }));
    expect(dados).toEqual(corpoValido);
  });

  it('exige os quatro campos', async () => {
    await expect(listarCamposRecusados({})).resolves.toEqual(['name', 'position', 'agility', 'age']);
  });

  it('normaliza o nome como no cadastro (V4)', async () => {
    await expect(validar(com({ name: '  Davi   Melo ' }))).resolves.toMatchObject({ name: 'Davi Melo' });
  });

  it.each([
    ['35 anos com agilidade 85', { age: 35, agility: 85 }],
    ['33 anos, sem a regra do potencial do cadastro', { age: 33 }],
    ['idade 45', { age: 45 }],
  ])('aceita %s', async (_caso, campos) => {
    await expect(validar(com(campos))).resolves.toBeInstanceOf(EditarJogadorDto);
  });

  it.each([
    ['nome com uma palavra', { name: 'Davi' }, 'name'],
    ['nome com dígito', { name: 'Davi Melo 2' }, 'name'],
    ['posição fora da lista', { position: 'MEIA' }, 'position'],
    ['agilidade 86 aos 35 anos (PR-004)', { age: 35, agility: 86 }, 'agility'],
    ['agilidade 0', { agility: 0 }, 'agility'],
    ['idade como texto (V2)', { age: '23' }, 'age'],
    ['idade 46', { age: 46 }, 'age'],
  ])('recusa %s', async (_caso, campos, campo) => {
    await expect(listarCamposRecusados(com(campos))).resolves.toEqual([campo]);
  });
});
