import { Injectable } from '@nestjs/common';

// O "agora" das regras (fidelidade, dias restantes, data das transações) vem daqui, para os testes fixarem a data
export abstract class Relogio {
  abstract agora(): Date;
}

@Injectable()
export class RelogioDoSistema extends Relogio {
  agora(): Date {
    return new Date();
  }
}
