import type { LoginChallenge } from '../entities/login-challenge';

export abstract class LoginChallengeRepository {
  abstract save(challenge: LoginChallenge): Promise<LoginChallenge>;

  abstract findById(id: string): Promise<LoginChallenge | null>;

  /**
   * Apaga o que não serve mais para aquela conta: desafios em aberto (um login
   * novo invalida o código anterior) e os que já venceram.
   */
  abstract discardFor(userId: string): Promise<void>;
}
