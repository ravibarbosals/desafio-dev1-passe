import { DataHoraBrasilia } from '@/core/validacao/data-hora/data-hora-brasilia.decorator';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';

class DtoComData {
  @DataHoraBrasilia()
  loyalty_until!: Date;
}

function validar(corpo: object): Promise<DtoComData> {
  return criarValidationPipe().transform(corpo, { type: 'body', metatype: DtoComData }) as Promise<DtoComData>;
}

describe('DataHoraBrasilia', () => {
  it('entrega o instante da data e hora de Brasília (RN01)', async () => {
    const dto = await validar({ loyalty_until: '2027-03-02T10:15-03:00' });

    expect(dto.loyalty_until.toISOString()).toBe('2027-03-02T13:15:00.000Z');
  });

  it.each(['2027-03-02T10:15', '2027-02-30T10:15-03:00', '2027-03-02T24:00-03:00', 1803986100000])('recusa %j', async (valor) => {
    await expect(validar({ loyalty_until: valor })).rejects.toThrow('loyalty_until deve ser uma data e hora válida no formato AAAA-MM-DDTHH:MM-03:00.');
  });

  it('recusa ausente', async () => {
    await expect(validar({})).rejects.toThrow('loyalty_until deve ser uma data e hora válida');
  });
});
