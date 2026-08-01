import { randomUUID } from 'node:crypto';

import { ResourceExpiredError } from '../../../../shared/domain/domain-error';

/** Erra cinco vezes e o desafio morre: quem errou tanto assim pede outro código. */
export const MAX_ATTEMPTS = 5;

/** Impede que um desafio vire uma torneira de e-mails para a caixa de outra pessoa. */
export const MAX_RESENDS = 3;

export interface LoginChallengeSnapshot {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  resends: number;
  consumedAt: Date | null;
  createdAt: Date;
}

interface IssueProps {
  userId: string;
  codeHash: string;
  ttlSeconds: number;
}

/**
 * Segunda etapa do login: prova de que quem digitou a senha também alcança a
 * caixa de e-mail da conta. O código só existe aqui como hash, do mesmo jeito
 * que a senha, para que um vazamento do banco não permita concluir logins.
 */
export class LoginChallenge {
  private constructor(private readonly state: LoginChallengeSnapshot) {}

  static issue({ userId, codeHash, ttlSeconds }: IssueProps): LoginChallenge {
    const now = new Date();

    return new LoginChallenge({
      id: randomUUID(),
      userId,
      codeHash,
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
      attempts: 0,
      resends: 0,
      consumedAt: null,
      createdAt: now,
    });
  }

  static restore(snapshot: LoginChallengeSnapshot): LoginChallenge {
    return new LoginChallenge({ ...snapshot });
  }

  /** Recusa o que não tem mais volta, para o cliente saber que deve recomeçar. */
  ensureUsable(): void {
    if (this.state.consumedAt) {
      throw new ResourceExpiredError('Este código já foi utilizado. Faça login novamente.');
    }

    if (this.isExpired) {
      throw new ResourceExpiredError('O código expirou. Faça login novamente para receber outro.');
    }

    if (this.state.attempts >= MAX_ATTEMPTS) {
      throw new ResourceExpiredError(
        'Número de tentativas excedido. Faça login novamente para receber outro código.',
      );
    }
  }

  registerFailure(): LoginChallenge {
    return new LoginChallenge({ ...this.state, attempts: this.state.attempts + 1 });
  }

  consume(): LoginChallenge {
    return new LoginChallenge({ ...this.state, consumedAt: new Date() });
  }

  /** Reenvio troca o código e zera as tentativas: o anterior deixa de valer. */
  renew(codeHash: string, ttlSeconds: number): LoginChallenge {
    if (this.state.resends >= MAX_RESENDS) {
      throw new ResourceExpiredError(
        'Limite de reenvios atingido. Faça login novamente para receber outro código.',
      );
    }

    return new LoginChallenge({
      ...this.state,
      codeHash,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      attempts: 0,
      resends: this.state.resends + 1,
    });
  }

  get id(): string {
    return this.state.id;
  }

  get userId(): string {
    return this.state.userId;
  }

  get codeHash(): string {
    return this.state.codeHash;
  }

  get expiresAt(): Date {
    return this.state.expiresAt;
  }

  get isConsumed(): boolean {
    return this.state.consumedAt !== null;
  }

  get isExpired(): boolean {
    return this.state.expiresAt.getTime() <= Date.now();
  }

  /** Segundos que faltam para o código perder a validade, nunca negativo. */
  get expiresInSeconds(): number {
    return Math.max(0, Math.ceil((this.state.expiresAt.getTime() - Date.now()) / 1000));
  }

  get remainingAttempts(): number {
    return Math.max(0, MAX_ATTEMPTS - this.state.attempts);
  }

  toSnapshot(): LoginChallengeSnapshot {
    return { ...this.state };
  }
}
