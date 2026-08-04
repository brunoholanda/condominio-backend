import type { PackageSigningSession } from '../entities/package-signing-session';

export abstract class PackageSigningSessionRepository {
  abstract save(session: PackageSigningSession): Promise<PackageSigningSession>;

  abstract findByToken(token: string): Promise<PackageSigningSession | null>;

  /** Most recent session for the package that is neither consumed nor expired. */
  abstract findValidByPackageId(packageId: string): Promise<PackageSigningSession | null>;
}
