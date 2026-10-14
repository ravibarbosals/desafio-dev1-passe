import { ValidationError } from '@nestjs/common';
import { criarErroValidacao } from '@/core/erros/erro-validacao';

describe('criarErroValidacao', () => {
  it('junta as mensagens no message e lista cada campo em detalhes, inclusive os aninhados', () => {
    const erros = [
      { property: 'agility', constraints: { max: 'agility deve ser um inteiro de 1 a 100.' }, children: [] },
      { property: 'player_ids', children: [{ property: '0', constraints: { min: 'player_ids deve ter ids positivos.' }, children: [] }] },
    ] as ValidationError[];

    const excecao = criarErroValidacao(erros);

    expect(excecao.getStatus()).toBe(400);
    expect(excecao.codigo).toBe('DADOS_INVALIDOS');
    expect(excecao.message).toBe('Dados inválidos: agility deve ser um inteiro de 1 a 100. player_ids deve ter ids positivos.');
    expect(excecao.detalhes).toEqual([
      { campo: 'agility', mensagem: 'agility deve ser um inteiro de 1 a 100.' },
      { campo: 'player_ids.0', mensagem: 'player_ids deve ter ids positivos.' },
    ]);
  });
});
