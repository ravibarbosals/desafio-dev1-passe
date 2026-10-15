import { RegraNegocioException } from '@/core/erros/regra-negocio.exception';
import { InteiroEntre } from '@/core/validacao/numero/inteiro-entre.decorator';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';

class DtoComIdade {
  @InteiroEntre(16, 45)
  age!: number;
}

function validar(corpo: object): Promise<DtoComIdade> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: DtoComIdade }) as Promise<DtoComIdade>;
}

describe('InteiroEntre', () => {
  it.each([16, 30, 45])('aceita %d (limites inclusivos)', async (idade) => {
    await expect(validar({ age: idade })).resolves.toEqual({ age: idade });
  });

  it.each([15, 46])('recusa %d, fora dos limites', async (idade) => {
    await expect(validar({ age: idade })).rejects.toThrow('age deve ser um inteiro de 16 a 45.');
  });

  it.each([['15'], [20.5], [null], [true]])('recusa %j, que não é inteiro (V2)', async (idade) => {
    await expect(validar({ age: idade })).rejects.toBeInstanceOf(RegraNegocioException);
  });

  it('recusa o campo ausente (V6)', async () => {
    await expect(validar({})).rejects.toThrow('age deve ser um inteiro de 16 a 45.');
  });
});