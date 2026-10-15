import { HttpStatus } from '@nestjs/common';
import { IdDaUrlPipe } from '@/core/http/id-da-url.pipe';
import { criarValidationPipe } from '@/core/validacao/criar-validation-pipe';

describe('criarValidationPipe', () => {
  it.each(['01', '1e0', '+1', '0x1'])('não converte o id %j da URL em número, para o IdDaUrlPipe responder 404 (V8)', async (id) => {
    const valor = await criarValidationPipe().transform(id, { type: 'param', metatype: Number, data: 'id' });
    expect(valor).toBe(id);
    expect(() => new IdDaUrlPipe('JOGADOR_NAO_ENCONTRADO', 'Jogador não encontrado.').transform(valor as string)).toThrow(expect.objectContaining({ status: HttpStatus.NOT_FOUND }));
  });
});