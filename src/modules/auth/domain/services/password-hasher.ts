/**
 * Port for the hashing algorithm. Keeping it abstract lets the domain state
 * *that* passwords are hashed without depending on *how*.
 */
export abstract class PasswordHasher {
  abstract hash(plainPassword: string): Promise<string>;

  abstract compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}
