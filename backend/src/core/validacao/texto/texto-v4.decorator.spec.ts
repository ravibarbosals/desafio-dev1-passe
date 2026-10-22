import { IsDefined } from 'class-validator';
import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { TextoV4 } from '@/core/validacao/texto/texto-v4.decorator';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';

class DtoComNome {
  @IsDefined({ message: '$property é obrigatório.' })
  @TextoV4(3, 10)
  name!: string;
}

function validar(corpo: object): Promise<DtoComNome> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: DtoComNome }) as Promise<DtoComNome>;
}

describe('TextoV4', () => {
  it('normaliza os espaços antes de validar e entrega o texto normalizado', async () => {
    await expect(validar({ name: '  Meia   Zeta ' })).resolves.toEqual({ name: 'Meia Zeta' });
  });

  it('mede o tamanho depois da normalização', async () => {
    await expect(validar({ name: '  Ana  ' })).resolves.toEqual({ name: 'Ana' });
    await expect(validar({ name: '  Al  ' })).rejects.toThrow('Nome deve ter de 3 a 10 caracteres.');
  });

  it('conta emoji como um caractere', async () => {
    await expect(validar({ name: 'Lua 😀😀😀😀😀😀' })).resolves.toEqual({ name: 'Lua 😀😀😀😀😀😀' });
  });

  it.each(['Meia\tZeta', 'Meia\nZeta'])('recusa caractere de controle em %j', async (nome) => {
    await expect(validar({ name: nome })).rejects.toThrow('Nome não pode ter caracteres de controle');
  });

  it.each([{ name: '   ' }, {}, { name: null }])('recusa nome vazio ou ausente: %j', async (corpo) => {
    await expect(validar(corpo)).rejects.toBeInstanceOf(RegraNegocioException);
  });

  it('recusa número no lugar de texto (V2)', async () => {
    await expect(validar({ name: 123 })).rejects.toThrow('Nome deve ser um texto.');
  });
});
