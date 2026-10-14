import { rotaTemCorpo } from '@/core/http/corpo-json.middleware';

describe('rotaTemCorpo', () => {
  it.each([
    ['POST', '/api/v1/players'],
    ['PUT', '/api/v1/players/1'],
    ['PATCH', '/api/v1/players/1/condition'],
    ['POST', '/api/v1/players/1/buy'],
  ])('lê o corpo em %s %s', (metodo, caminho) => {
    expect(rotaTemCorpo(metodo, caminho)).toBe(true);
  });

  it.each([
    ['GET', '/api/v1/players'],
    ['DELETE', '/api/v1/players/1'],
    ['POST', '/api/v1/players/1/sell'],
    ['POST', '/api/v1/players/abc/sell/'],
  ])('ignora o corpo em %s %s (AM-005)', (metodo, caminho) => {
    expect(rotaTemCorpo(metodo, caminho)).toBe(false);
  });
});
