/**
 * Immutable wrapper around a primitive whose validity is guaranteed by construction:
 * if an instance exists, its value already satisfies the format rules.
 */
export abstract class ValueObject<TValue extends string | number> {
  protected constructor(readonly value: TValue) {}

  equals(other?: ValueObject<TValue>): boolean {
    if (!other) {
      return false;
    }

    return other.constructor === this.constructor && other.value === this.value;
  }

  toString(): string {
    return String(this.value);
  }

  toJSON(): TValue {
    return this.value;
  }
}
