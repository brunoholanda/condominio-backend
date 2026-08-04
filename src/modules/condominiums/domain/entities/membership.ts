import { randomUUID } from 'node:crypto';

import { requireEnum, requireText } from '../../../../shared/domain/guards';
import { MembershipRole } from '../enums/membership-role';

export interface MembershipProps {
  userId: string;
  condominiumId: string;
  role: MembershipRole | string;
}

export interface MembershipSnapshot extends MembershipProps {
  id: string;
  role: MembershipRole;
  createdAt: Date;
}

interface MembershipState {
  id: string;
  userId: string;
  condominiumId: string;
  role: MembershipRole;
  createdAt: Date;
}

/** Links an account to a condo with a role, the unit of access control of the SaaS. */
export class Membership {
  private constructor(private readonly state: MembershipState) {}

  static create(props: MembershipProps): Membership {
    return new Membership({ ...Membership.parse(props), id: randomUUID(), createdAt: new Date() });
  }

  static restore(snapshot: MembershipSnapshot): Membership {
    return new Membership({
      ...Membership.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
    });
  }

  private static parse(props: MembershipProps): Omit<MembershipState, 'id' | 'createdAt'> {
    return {
      userId: requireText('usuário', props.userId, { min: 1, max: 64 }),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      role: requireEnum('papel', props.role, MembershipRole),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get userId(): string {
    return this.state.userId;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get role(): MembershipRole {
    return this.state.role;
  }

  withRole(role: MembershipRole | string): Membership {
    return new Membership({
      ...this.state,
      role: requireEnum('papel', role, MembershipRole),
    });
  }

  /**
   * Acesso sintético do dono do sistema: nível máximo em qualquer condomínio,
   * sem gravar vínculo na tabela de memberships.
   */
  static forSystemOwner(userId: string, condominiumId: string): Membership {
    return Membership.restore({
      id: `system-owner:${userId}:${condominiumId}`,
      userId,
      condominiumId,
      role: MembershipRole.Owner,
      createdAt: new Date(0),
    });
  }

  hasAnyRole(roles: MembershipRole[]): boolean {
    return roles.includes(this.state.role);
  }

  toSnapshot(): MembershipSnapshot {
    return {
      id: this.state.id,
      userId: this.state.userId,
      condominiumId: this.state.condominiumId,
      role: this.state.role,
      createdAt: this.state.createdAt,
    };
  }
}
