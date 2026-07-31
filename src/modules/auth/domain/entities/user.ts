import { randomUUID } from 'node:crypto';

import { requireText } from '../../../../shared/domain/guards';
import { EmailAddress } from '../../../../shared/domain/value-objects/email-address';

export interface UserProps {
  name: string;
  email: string;
  /** Already hashed: the aggregate never sees a plain text password. */
  passwordHash: string;
}

export interface UserSnapshot extends UserProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserState {
  id: string;
  name: string;
  email: EmailAddress;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Account allowed to read the resident registrations. */
export class User {
  private constructor(private readonly state: UserState) {}

  static create(props: UserProps): User {
    const now = new Date();

    return new User({ ...User.parse(props), id: randomUUID(), createdAt: now, updatedAt: now });
  }

  static restore(snapshot: UserSnapshot): User {
    return new User({
      ...User.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  private static parse(props: UserProps): Omit<UserState, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: requireText('nome', props.name, { min: 3, max: 150 }),
      email: EmailAddress.create(props.email),
      passwordHash: requireText('senha', props.passwordHash, { min: 20, max: 255 }),
    };
  }

  changePassword(passwordHash: string): User {
    return new User({
      ...this.state,
      passwordHash: requireText('senha', passwordHash, { min: 20, max: 255 }),
      updatedAt: new Date(),
    });
  }

  get id(): string {
    return this.state.id;
  }

  get name(): string {
    return this.state.name;
  }

  get email(): EmailAddress {
    return this.state.email;
  }

  get passwordHash(): string {
    return this.state.passwordHash;
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.state.id,
      name: this.state.name,
      email: this.state.email.value,
      passwordHash: this.state.passwordHash,
      createdAt: this.state.createdAt,
      updatedAt: this.state.updatedAt,
    };
  }
}
