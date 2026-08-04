import { Injectable } from '@nestjs/common';

import { BusinessRuleError, ResourceConflictError } from '../../../../shared/domain/domain-error';
import { User } from '../../../auth/domain/entities/user';
import { assertPasswordPolicy } from '../../../auth/domain/password-policy';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { PasswordHasher } from '../../../auth/domain/services/password-hasher';
import { Membership } from '../../domain/entities/membership';
import { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { AddMembershipDto } from '../dto/add-membership.dto';
import type { MembershipMemberDto } from '../dto/membership-member.dto';
import { MembershipPresenter } from '../presenters/membership.presenter';

/**
 * OWNER adds a teammate to the condo.
 * Existing platform accounts are linked; new e-mails get an account created here.
 */
@Injectable()
export class AddMembershipUseCase {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(condominiumId: string, input: AddMembershipDto): Promise<MembershipMemberDto> {
    const email = input.email.trim().toLowerCase();
    let user = await this.users.findByEmail(email);

    if (!user) {
      if (!input.name?.trim() || !input.password) {
        throw new BusinessRuleError(
          'Esta pessoa ainda não tem conta. Informe nome e senha inicial para criá-la.',
        );
      }

      const passwordHash = await this.passwordHasher.hash(assertPasswordPolicy(input.password));
      user = await this.users.save(
        User.create({ name: input.name, email, passwordHash }),
      );
    }

    const existing = await this.memberships.findByUserAndCondo(user.id, condominiumId);

    if (existing) {
      throw new ResourceConflictError('Esta pessoa já faz parte da equipe deste condomínio.');
    }

    const membership = await this.memberships.save(
      Membership.create({
        userId: user.id,
        condominiumId,
        role: input.role,
      }),
    );

    return MembershipPresenter.toResponse(membership, user);
  }
}
