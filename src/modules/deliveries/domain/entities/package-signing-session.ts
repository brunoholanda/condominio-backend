import { randomBytes, randomUUID } from 'node:crypto';

import { ResourceExpiredError } from '../../../../shared/domain/domain-error';

/** Remote signing links stay open just long enough for a phone to be fetched and used. */
export const SIGNING_SESSION_TTL_MINUTES = 15;

export interface PackageSigningSessionSnapshot {
  id: string;
  packageId: string;
  token: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

interface IssueProps {
  packageId: string;
  ttlMinutes?: number;
}

/**
 * Bridges a desktop delivery protocol to a phone: the lobby shows a QR Code
 * that opens this token on a mobile browser, where the recipient signs.
 */
export class PackageSigningSession {
  private constructor(private readonly state: PackageSigningSessionSnapshot) {}

  static issue({ packageId, ttlMinutes = SIGNING_SESSION_TTL_MINUTES }: IssueProps): PackageSigningSession {
    const now = new Date();

    return new PackageSigningSession({
      id: randomUUID(),
      packageId,
      token: randomBytes(32).toString('hex'),
      expiresAt: new Date(now.getTime() + ttlMinutes * 60 * 1000),
      consumedAt: null,
      createdAt: now,
    });
  }

  static restore(snapshot: PackageSigningSessionSnapshot): PackageSigningSession {
    return new PackageSigningSession({ ...snapshot });
  }

  /** Recusa o que não tem mais volta, para o cliente saber que deve recomeçar. */
  ensureUsable(): void {
    if (this.state.consumedAt) {
      throw new ResourceExpiredError('Este link de assinatura já foi utilizado.');
    }

    if (this.isExpired) {
      throw new ResourceExpiredError('Este link de assinatura expirou.');
    }
  }

  consume(): PackageSigningSession {
    this.ensureUsable();

    return new PackageSigningSession({ ...this.state, consumedAt: new Date() });
  }

  get id(): string {
    return this.state.id;
  }

  get packageId(): string {
    return this.state.packageId;
  }

  get token(): string {
    return this.state.token;
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

  get isValid(): boolean {
    return !this.isConsumed && !this.isExpired;
  }

  toSnapshot(): PackageSigningSessionSnapshot {
    return { ...this.state };
  }
}
