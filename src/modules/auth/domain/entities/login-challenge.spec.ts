import { ResourceExpiredError } from '../../../../shared/domain/domain-error';
import { LoginChallenge, MAX_ATTEMPTS, MAX_RESENDS } from './login-challenge';

const USER_ID = '5f2c1f0e-6d8e-4a37-9e26-0d7c2e3b9f11';

function issue(ttlSeconds = 600): LoginChallenge {
  return LoginChallenge.issue({ userId: USER_ID, codeHash: 'hash', ttlSeconds });
}

describe('LoginChallenge', () => {
  it('nasce válido, sem tentativas e com o prazo pedido', () => {
    const challenge = issue(600);

    expect(() => challenge.ensureUsable()).not.toThrow();
    expect(challenge.remainingAttempts).toBe(MAX_ATTEMPTS);
    expect(challenge.expiresInSeconds).toBeGreaterThan(595);
    expect(challenge.isConsumed).toBe(false);
  });

  it('recusa código já utilizado', () => {
    const consumed = issue().consume();

    expect(consumed.isConsumed).toBe(true);
    expect(() => consumed.ensureUsable()).toThrow(ResourceExpiredError);
  });

  it('recusa código vencido', () => {
    const expired = LoginChallenge.restore({
      ...issue().toSnapshot(),
      expiresAt: new Date(Date.now() - 1000),
    });

    expect(expired.isExpired).toBe(true);
    expect(expired.expiresInSeconds).toBe(0);
    expect(() => expired.ensureUsable()).toThrow(ResourceExpiredError);
  });

  it('encerra o desafio depois das tentativas permitidas', () => {
    let challenge = issue();

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      expect(() => challenge.ensureUsable()).not.toThrow();
      challenge = challenge.registerFailure();
    }

    expect(challenge.remainingAttempts).toBe(0);
    expect(() => challenge.ensureUsable()).toThrow(ResourceExpiredError);
  });

  it('reenvio troca o código, zera as tentativas e estende o prazo', () => {
    const renewed = issue(600).registerFailure().renew('outro-hash', 900);

    expect(renewed.codeHash).toBe('outro-hash');
    expect(renewed.remainingAttempts).toBe(MAX_ATTEMPTS);
    expect(renewed.expiresInSeconds).toBeGreaterThan(895);
  });

  it('limita a quantidade de reenvios', () => {
    let challenge = issue();

    for (let resend = 0; resend < MAX_RESENDS; resend += 1) {
      challenge = challenge.renew(`hash-${resend}`, 600);
    }

    expect(() => challenge.renew('mais-um', 600)).toThrow(ResourceExpiredError);
  });
});
