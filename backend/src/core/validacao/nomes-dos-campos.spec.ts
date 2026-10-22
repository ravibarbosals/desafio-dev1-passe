import { nomeDoCampo, traduzirCampoDaMensagem } from '@/core/validacao/nomes-dos-campos';

describe('traduzirCampoDaMensagem', () => {
  it('troca o campo do início da frase pelo nome em português, com maiúscula', () => {
    expect(traduzirCampoDaMensagem('potential deve ser maior ou igual ao maior dos seis atributos.')).toBe('Potencial deve ser maior ou igual ao maior dos seis atributos.');
    expect(traduzirCampoDaMensagem('loyalty_until deve ser uma data e hora válida.')).toBe('Fim da fidelidade deve ser uma data e hora válida.');
  });

  it('deixa como veio a frase que não começa por um campo conhecido', () => {
    expect(traduzirCampoDaMensagem('away deve ser diferente de home.')).toBe('away deve ser diferente de home.');
    expect(traduzirCampoDaMensagem('name')).toBe('name');
  });
});

describe('nomeDoCampo', () => {
  it('devolve o nome em português ou o próprio campo', () => {
    expect(nomeDoCampo('max_age')).toBe('idade máxima');
    expect(nomeDoCampo('outro')).toBe('outro');
  });
});
