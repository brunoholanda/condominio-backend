import { haversineDistanceMeters } from '../../../modules/staff/domain/geofence';
import { SecretBox } from './secret-box';

describe('haversineDistanceMeters', () => {
  it('returns ~0 for the same point', () => {
    expect(haversineDistanceMeters(-22.9, -47.06, -22.9, -47.06)).toBe(0);
  });

  it('measures roughly 111 m for ~0.001° latitude', () => {
    const d = haversineDistanceMeters(-22.9, -47.06, -22.901, -47.06);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(130);
  });
});

describe('SecretBox', () => {
  const config = {
    get: (key: string) => {
      if (key === 'JWT_SECRET') return 'test-jwt-secret-at-least-32-chars!!';
      if (key === 'ENCRYPTION_KEY') return undefined;
      return undefined;
    },
  } as never;

  it('encrypts and decrypts round-trip', () => {
    const box = new SecretBox(config);
    const cipher = box.encrypt('$aact_hmlg_secret_key_example');
    expect(cipher.startsWith('enc:v1:')).toBe(true);
    expect(box.decrypt(cipher)).toBe('$aact_hmlg_secret_key_example');
  });

  it('passes through plaintext legacy values on decrypt', () => {
    const box = new SecretBox(config);
    expect(box.decrypt('plain-legacy-key')).toBe('plain-legacy-key');
  });
});
