import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';

import type { AuthenticatedRequest } from '../../../auth/infrastructure/http/jwt-auth.guard';
import { CondominiumRepository } from '../../../condominiums/domain/repositories/condominium.repository';
import type { ResidentAccount } from '../../domain/entities/resident-account';
import { ResidentAccountRepository } from '../../domain/repositories/resident-account.repository';

export interface RequestWithResidentAccount extends AuthenticatedRequest {
  residentAccount?: ResidentAccount;
  condominiumId?: string;
}

/**
 * Confirms the authenticated user has a resident account for the condo named
 * by `:slug`, attaching both the condo id and the account to the request.
 */
@Injectable()
export class ResidentAccountAccessGuard implements CanActivate {
  constructor(
    private readonly condominiums: CondominiumRepository,
    private readonly residentAccounts: ResidentAccountRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithResidentAccount>();
    const { slug } = request.params;

    if (!slug || Array.isArray(slug) || !request.user) {
      throw new ForbiddenException('Autenticação necessária.');
    }

    const condominium = await this.condominiums.findBySlug(slug);

    if (!condominium) {
      throw new ForbiddenException('Condomínio não encontrado.');
    }

    const residentAccount = await this.residentAccounts.findByUserAndCondo(
      request.user.sub,
      condominium.id,
    );

    if (!residentAccount) {
      throw new ForbiddenException(
        'Você não tem uma unidade vinculada neste condomínio. Procure a administração.',
      );
    }

    request.condominiumId = condominium.id;
    request.residentAccount = residentAccount;

    return true;
  }
}
