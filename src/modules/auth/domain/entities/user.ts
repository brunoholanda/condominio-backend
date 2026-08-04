import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { requireText } from '../../../../shared/domain/guards';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { EmailAddress } from '../../../../shared/domain/value-objects/email-address';
import { isSystemOwnerRole, PlatformRole } from '../enums/platform-role';
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '../enums/subscription-plan';
import { SubscriptionStatus, SUBSCRIPTION_STATUSES } from '../enums/subscription-status';

export interface UserProps {
  name: string;
  email: string;
  /** Already hashed: the aggregate never sees a plain text password. */
  passwordHash: string;
  /** Empty until the operator identifies themselves in the restricted area. */
  cpf?: string | null;
  platformRole?: PlatformRole | null;
  isActive?: boolean;
  plan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  trialEndsAt?: Date;
  subscriptionUpdatedAt?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface UserSnapshot {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  cpf: string | null;
  platformRole: PlatformRole | null;
  isActive: boolean;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date;
  subscriptionUpdatedAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserState {
  id: string;
  name: string;
  email: EmailAddress;
  passwordHash: string;
  cpf: Cpf | null;
  platformRole: PlatformRole | null;
  isActive: boolean;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date;
  subscriptionUpdatedAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Account allowed to operate in the SaaS (condo memberships and/or platform role). */
export class User {
  private constructor(private readonly state: UserState) {}

  static create(props: UserProps): User {
    const now = new Date();
    const trialEndsAt =
      props.trialEndsAt ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return new User({
      ...User.parse(props),
      id: randomUUID(),
      trialEndsAt,
      subscriptionUpdatedAt: props.subscriptionUpdatedAt ?? now,
      stripeCustomerId: props.stripeCustomerId ?? null,
      stripeSubscriptionId: props.stripeSubscriptionId ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: UserSnapshot): User {
    return new User({
      ...User.parse(snapshot),
      id: snapshot.id,
      trialEndsAt: snapshot.trialEndsAt,
      subscriptionUpdatedAt: snapshot.subscriptionUpdatedAt,
      stripeCustomerId: snapshot.stripeCustomerId,
      stripeSubscriptionId: snapshot.stripeSubscriptionId,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  private static parse(props: UserProps): Omit<
    UserState,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'trialEndsAt'
    | 'subscriptionUpdatedAt'
    | 'stripeCustomerId'
    | 'stripeSubscriptionId'
  > {
    const platformRole = User.parsePlatformRole(props.platformRole);

    return {
      name: requireText('nome', props.name, { min: 3, max: 150 }),
      email: EmailAddress.create(props.email),
      passwordHash: requireText('senha', props.passwordHash, { min: 20, max: 255 }),
      cpf: props.cpf ? Cpf.create(props.cpf, 'CPF do operador') : null,
      platformRole,
      isActive: props.isActive !== false,
      plan: User.parsePlan(props.plan),
      subscriptionStatus: User.parseStatus(props.subscriptionStatus),
    };
  }

  private static parsePlatformRole(raw: PlatformRole | string | null | undefined): PlatformRole | null {
    if (raw === null || raw === undefined || raw === '') {
      return null;
    }

    if (raw === PlatformRole.SystemOwner) {
      return PlatformRole.SystemOwner;
    }

    throw new BusinessRuleError(`Papel de plataforma inválido: ${String(raw)}.`);
  }

  private static parsePlan(raw: SubscriptionPlan | string | null | undefined): SubscriptionPlan {
    if (raw === null || raw === undefined || raw === '') {
      return SubscriptionPlan.Lite;
    }

    if (SUBSCRIPTION_PLANS.includes(raw as SubscriptionPlan)) {
      return raw as SubscriptionPlan;
    }

    throw new BusinessRuleError(`Plano inválido: ${String(raw)}.`);
  }

  private static parseStatus(
    raw: SubscriptionStatus | string | null | undefined,
  ): SubscriptionStatus {
    if (raw === null || raw === undefined || raw === '') {
      return SubscriptionStatus.Trialing;
    }

    if (SUBSCRIPTION_STATUSES.includes(raw as SubscriptionStatus)) {
      return raw as SubscriptionStatus;
    }

    throw new BusinessRuleError(`Status de assinatura inválido: ${String(raw)}.`);
  }

  changePassword(passwordHash: string): User {
    return new User({
      ...this.state,
      passwordHash: requireText('senha', passwordHash, { min: 20, max: 255 }),
      updatedAt: new Date(),
    });
  }

  /**
   * O CPF responde por quem opera os dados dos moradores, então só pode ser
   * informado uma vez: trocá-lo sozinho apagaria a responsabilidade de tudo o
   * que já foi consultado com aquela conta.
   */
  identify(rawCpf: string): User {
    const cpf = Cpf.create(rawCpf, 'CPF do operador');

    if (this.state.cpf && this.state.cpf.value !== cpf.value) {
      throw new BusinessRuleError(
        'O CPF desta conta já foi informado. Procure a administração para corrigi-lo.',
      );
    }

    return new User({ ...this.state, cpf, updatedAt: new Date() });
  }

  activate(): User {
    return new User({ ...this.state, isActive: true, updatedAt: new Date() });
  }

  deactivate(): User {
    return new User({ ...this.state, isActive: false, updatedAt: new Date() });
  }

  withPlatformRole(role: PlatformRole | null): User {
    return new User({
      ...this.state,
      platformRole: User.parsePlatformRole(role),
      updatedAt: new Date(),
    });
  }

  withSubscription(input: {
    plan?: SubscriptionPlan;
    status?: SubscriptionStatus;
    trialEndsAt?: Date;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
  }): User {
    const now = new Date();
    const plan = input.plan !== undefined ? User.parsePlan(input.plan) : this.state.plan;
    const subscriptionStatus =
      input.status !== undefined ? User.parseStatus(input.status) : this.state.subscriptionStatus;

    let trialEndsAt = this.state.trialEndsAt;

    if (input.trialEndsAt) {
      trialEndsAt = input.trialEndsAt;
    } else if (input.status === SubscriptionStatus.Trialing) {
      trialEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    return new User({
      ...this.state,
      plan,
      subscriptionStatus,
      trialEndsAt,
      stripeCustomerId:
        input.stripeCustomerId !== undefined
          ? input.stripeCustomerId
          : this.state.stripeCustomerId,
      stripeSubscriptionId:
        input.stripeSubscriptionId !== undefined
          ? input.stripeSubscriptionId
          : this.state.stripeSubscriptionId,
      subscriptionUpdatedAt: now,
      updatedAt: now,
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

  get cpf(): Cpf | null {
    return this.state.cpf;
  }

  get platformRole(): PlatformRole | null {
    return this.state.platformRole;
  }

  get isActive(): boolean {
    return this.state.isActive;
  }

  get isSystemOwner(): boolean {
    return isSystemOwnerRole(this.state.platformRole);
  }

  get plan(): SubscriptionPlan {
    return this.state.plan;
  }

  get subscriptionStatus(): SubscriptionStatus {
    return this.state.subscriptionStatus;
  }

  get trialEndsAt(): Date {
    return this.state.trialEndsAt;
  }

  get subscriptionUpdatedAt(): Date | null {
    return this.state.subscriptionUpdatedAt;
  }

  get stripeCustomerId(): string | null {
    return this.state.stripeCustomerId;
  }

  get stripeSubscriptionId(): string | null {
    return this.state.stripeSubscriptionId;
  }

  get createdAt(): Date {
    return this.state.createdAt;
  }

  toSnapshot(): UserSnapshot {
    return {
      id: this.state.id,
      name: this.state.name,
      email: this.state.email.value,
      passwordHash: this.state.passwordHash,
      cpf: this.state.cpf?.value ?? null,
      platformRole: this.state.platformRole,
      isActive: this.state.isActive,
      plan: this.state.plan,
      subscriptionStatus: this.state.subscriptionStatus,
      trialEndsAt: this.state.trialEndsAt,
      subscriptionUpdatedAt: this.state.subscriptionUpdatedAt,
      stripeCustomerId: this.state.stripeCustomerId,
      stripeSubscriptionId: this.state.stripeSubscriptionId,
      createdAt: this.state.createdAt,
      updatedAt: this.state.updatedAt,
    };
  }
}
