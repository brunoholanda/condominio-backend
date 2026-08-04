import type { User } from '../../domain/entities/user';
import type { AuthenticatedUserDto } from '../dto/auth-response.dto';

/** Never exposes the password hash outside the application layer. */
export class UserPresenter {
  static toResponse(user: User): AuthenticatedUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      cpf: user.cpf?.value ?? null,
      platformRole: user.platformRole,
      isActive: user.isActive,
      isSystemOwner: user.isSystemOwner,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt.toISOString(),
      subscriptionUpdatedAt: user.subscriptionUpdatedAt?.toISOString() ?? null,
    };
  }
}
