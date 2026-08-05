import { randomUUID } from 'node:crypto';

import { ResourceExpiredError } from '../../../../shared/domain/domain-error';

export const BOOKING_AUTH_MAX_ATTEMPTS = 5;
export const BOOKING_AUTH_MAX_RESENDS = 3;

export interface BookingAuthChallengeSnapshot {
  id: string;
  condominiumId: string;
  residentId: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  resends: number;
  consumedAt: Date | null;
  createdAt: Date;
}

interface IssueProps {
  condominiumId: string;
  residentId: string;
  codeHash: string;
  ttlSeconds: number;
}

export class BookingAuthChallenge {
  private constructor(private readonly state: BookingAuthChallengeSnapshot) {}

  static issue(props: IssueProps): BookingAuthChallenge {
    const now = new Date();

    return new BookingAuthChallenge({
      id: randomUUID(),
      condominiumId: props.condominiumId,
      residentId: props.residentId,
      codeHash: props.codeHash,
      expiresAt: new Date(now.getTime() + props.ttlSeconds * 1000),
      attempts: 0,
      resends: 0,
      consumedAt: null,
      createdAt: now,
    });
  }

  static restore(snapshot: BookingAuthChallengeSnapshot): BookingAuthChallenge {
    return new BookingAuthChallenge({ ...snapshot });
  }

  ensureUsable(): void {
    if (this.state.consumedAt) {
      throw new ResourceExpiredError('Este código já foi utilizado. Solicite outro com o CPF.');
    }

    if (this.isExpired) {
      throw new ResourceExpiredError('O código expirou. Solicite outro com o CPF.');
    }

    if (this.state.attempts >= BOOKING_AUTH_MAX_ATTEMPTS) {
      throw new ResourceExpiredError(
        'Número de tentativas excedido. Solicite outro código com o CPF.',
      );
    }
  }

  registerFailure(): BookingAuthChallenge {
    return new BookingAuthChallenge({ ...this.state, attempts: this.state.attempts + 1 });
  }

  consume(): BookingAuthChallenge {
    return new BookingAuthChallenge({ ...this.state, consumedAt: new Date() });
  }

  renew(codeHash: string, ttlSeconds: number): BookingAuthChallenge {
    if (this.state.resends >= BOOKING_AUTH_MAX_RESENDS) {
      throw new ResourceExpiredError(
        'Limite de reenvios atingido. Informe o CPF novamente para receber outro código.',
      );
    }

    return new BookingAuthChallenge({
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

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get residentId(): string {
    return this.state.residentId;
  }

  get codeHash(): string {
    return this.state.codeHash;
  }

  get isExpired(): boolean {
    return this.state.expiresAt.getTime() <= Date.now();
  }

  get expiresAt(): Date {
    return this.state.expiresAt;
  }

  toSnapshot(): BookingAuthChallengeSnapshot {
    return { ...this.state };
  }
}
