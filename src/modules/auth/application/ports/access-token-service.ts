export interface AccessTokenPayload {
  /** User id. */
  sub: string;
  email: string;
  name: string;
  /** Dono da plataforma: acesso a todos os condomínios com nível máximo. */
  isSystemOwner: boolean;
  /** Distingue token de gestor/usuário do token de funcionário (ponto). */
  typ: 'user';
}

export interface SignedAccessToken {
  token: string;
  expiresInSeconds: number;
}

/** Port for issuing and reading the access token, independent of the JWT library. */
export abstract class AccessTokenService {
  abstract sign(payload: Omit<AccessTokenPayload, 'typ'>): Promise<SignedAccessToken>;

  abstract verify(token: string): Promise<AccessTokenPayload>;
}
