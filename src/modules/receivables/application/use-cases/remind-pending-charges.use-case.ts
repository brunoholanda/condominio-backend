import { Injectable } from '@nestjs/common';

import { MembershipRole } from '../../../condominiums/domain/enums/membership-role';
import { MembershipRepository } from '../../../condominiums/domain/repositories/membership.repository';
import { CreateNotificationUseCase } from '../../../notifications/application/use-cases/notification.use-case';
import { NotificationCategory } from '../../../notifications/domain/enums/notification-category';
import { ChargeStatus } from '../../domain/enums/charge-status';
import { ChargeRepository } from '../../domain/repositories/charge.repository';

@Injectable()
export class RemindPendingChargesUseCase {
  constructor(
    private readonly charges: ChargeRepository,
    private readonly memberships: MembershipRepository,
    private readonly createNotification: CreateNotificationUseCase,
  ) {}

  async execute(
    condominiumId: string,
  ): Promise<{ notifiedUsers: number; pendingCharges: number }> {
    const result = await this.charges.findMany({
      condominiumId,
      status: ChargeStatus.Pending,
      page: 1,
      limit: 200,
    });

    const pending = result.items;
    const horizonMs = Date.now() + 3 * 24 * 60 * 60 * 1000;
    const overdueOrDue = pending.filter(
      (charge) => charge.toSnapshot().dueDate.getTime() <= horizonMs,
    );

    if (overdueOrDue.length === 0) {
      return { notifiedUsers: 0, pendingCharges: 0 };
    }

    const managers = (await this.memberships.findManyByCondo(condominiumId)).filter((m) =>
      m.hasAnyRole([MembershipRole.Owner, MembershipRole.Manager]),
    );

    const overdueCount = overdueOrDue.filter(
      (c) => c.toSnapshot().dueDate.getTime() < Date.now(),
    ).length;

    const title =
      overdueCount > 0
        ? `${overdueCount} cobrança(s) em atraso`
        : `${overdueOrDue.length} cobrança(s) próximas do vencimento`;

    const body = `Há ${overdueOrDue.length} cobrança(s) PIX pendentes (vencidas ou a vencer em até 3 dias) neste condomínio.`;

    await this.createNotification.executeMany(
      managers.map((m) => ({
        condominiumId,
        userId: m.userId,
        title,
        body,
        category: NotificationCategory.Charge,
        linkPath: `/condominiums/${condominiumId}/charges`,
      })),
    );

    return {
      notifiedUsers: managers.length,
      pendingCharges: overdueOrDue.length,
    };
  }
}
