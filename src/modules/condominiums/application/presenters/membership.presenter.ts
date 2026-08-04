import type { User } from '../../../auth/domain/entities/user';
import type { Membership } from '../../domain/entities/membership';
import type { MembershipMemberDto } from '../dto/membership-member.dto';

export class MembershipPresenter {
  static toResponse(membership: Membership, user: User): MembershipMemberDto {
    return {
      id: membership.id,
      userId: user.id,
      name: user.name,
      email: user.email.value,
      role: membership.role,
      createdAt: membership.toSnapshot().createdAt.toISOString(),
    };
  }
}
