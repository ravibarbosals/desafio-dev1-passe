// DEC-069: o campo continua com o nome do contrato da API (em inglês, DEC-034), mas a mensagem de
// erro fala em português: "potential deve ser…" vira "Potencial deve ser…"
const nomesDosCampos: Record<string, string> = {
  name: 'nome',
  age: 'idade',
  position: 'posição',
  agility: 'agilidade',
  pace: 'velocidade',
  shooting: 'finalização',
  passing: 'passe',
  dribbling: 'drible',
  defending: 'defesa',
  physical: 'físico',
  potential: 'potencial',
  condition: 'condição',
  acronym: 'sigla',
  club_id: 'clube',
  player_id: 'jogador',
  loyalty_until: 'fim da fidelidade',
  formation: 'formação',
  player_ids: 'lista de titulares',
  home_club_id: 'mandante',
  away_club_id: 'visitante',
  search: 'busca',
  free: 'só livres',
  min_age: 'idade mínima',
  max_age: 'idade máxima',
  min_value: 'valor mínimo',
  max_value: 'valor máximo',
  sort: 'ordenação',
  page: 'página',
  type: 'tipo',
};

// Campo fora da lista fica como veio
export function nomeDoCampo(campo: string): string {
  return nomesDosCampos[campo] ?? campo;
}

// A mensagem começa pelo campo ($property do class-validator): troca pelo nome em português, com
// maiúscula no início da frase
export function traduzirCampoDaMensagem(mensagem: string): string {
  const [campo, ...resto] = mensagem.split(' ');
  const nome = nomesDosCampos[campo];
  if (!nome || resto.length === 0) {
    return mensagem;
  }
  return [nome.charAt(0).toUpperCase() + nome.slice(1), ...resto].join(' ');
}
