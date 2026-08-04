/**
 * Port for persisting uploaded files, independent of where they physically live.
 * Declared as an abstract class so it doubles as the Nest injection token.
 */
export abstract class FileStorage {
  abstract save(buffer: Buffer, key: string, mimeType: string): Promise<void>;

  abstract read(key: string): Promise<Buffer>;

  abstract delete(key: string): Promise<void>;
}
