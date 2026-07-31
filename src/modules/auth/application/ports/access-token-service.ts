export interface AccessTokenPayload {
  /** User id. */
  sub: string;
  email: string;
  name: string;
}

export interface SignedAccessToken {
  token: string;
  expiresInSeconds: number;
}

/** Port for issuing and reading the access token, independent of the JWT library. */
export abstract class AccessTokenService {
  abstract sign(payload: AccessTokenPayload): Promise<SignedAccessToken>;

  abstract verify(token: string): Promise<AccessTokenPayload>;
}
