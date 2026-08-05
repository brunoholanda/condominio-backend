import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { MembershipRole } from '../../../condominiums/domain/enums/membership-role';
import { MembershipRepository } from '../../../condominiums/domain/repositories/membership.repository';
import { CreateNotificationUseCase } from '../../../notifications/application/use-cases/notification.use-case';
import { NotificationCategory } from '../../../notifications/domain/enums/notification-category';
import { VisitorPass } from '../../domain/entities/visitor-pass';
import { VisitorPassRepository } from '../../domain/repositories/visitor-pass.repository';
import type {
  CreateVisitorPassDto,
  ListVisitorPassesQueryDto,
  VisitorPassResponseDto,
} from '../dto/visitor-pass.dto';
import { VisitorPassPresenter } from '../presenters/visitor-pass.presenter';

@Injectable()
export class CreateVisitorPassUseCase {
  constructor(
    private readonly passes: VisitorPassRepository,
    private readonly memberships: MembershipRepository,
    private readonly createNotification: CreateNotificationUseCase,
  ) {}

  async execute(
    condominiumId: string,
    createdByUserId: string,
    input: CreateVisitorPassDto,
  ): Promise<VisitorPassResponseDto> {
    const pass = await this.passes.save(
      VisitorPass.create({
        condominiumId,
        visitorName: input.visitorName,
        visitorDocument: input.visitorDocument,
        hostName: input.hostName,
        unitNumber: input.unitNumber,
        expectedAt: input.expectedAt,
        expiresAt: input.expiresAt,
        notes: input.notes,
        createdByUserId,
      }),
    );

    const managers = (await this.memberships.findManyByCondo(condominiumId)).filter((m) =>
      m.hasAnyRole([MembershipRole.Owner, MembershipRole.Manager]),
    );

    await this.createNotification.executeMany(
      managers.map((m) => ({
        condominiumId,
        userId: m.userId,
        title: 'Novo visitante esperado',
        body: `${input.visitorName} visita ${input.hostName}${input.unitNumber ? ` (unid. ${input.unitNumber})` : ''}.`,
        category: NotificationCategory.Visitor,
        linkPath: `/condominiums/${condominiumId}/visitors`,
      })),
    );

    return VisitorPassPresenter.toResponse(pass);
  }

  async executeAsEmployee(
    condominiumId: string,
    createdByEmployeeId: string,
    input: CreateVisitorPassDto,
  ): Promise<VisitorPassResponseDto> {
    const pass = await this.passes.save(
      VisitorPass.create({
        condominiumId,
        visitorName: input.visitorName,
        visitorDocument: input.visitorDocument,
        hostName: input.hostName,
        unitNumber: input.unitNumber,
        expectedAt: input.expectedAt,
        expiresAt: input.expiresAt,
        notes: input.notes,
        createdByEmployeeId,
      }),
    );

    const managers = (await this.memberships.findManyByCondo(condominiumId)).filter((m) =>
      m.hasAnyRole([MembershipRole.Owner, MembershipRole.Manager]),
    );

    await this.createNotification.executeMany(
      managers.map((m) => ({
        condominiumId,
        userId: m.userId,
        title: 'Novo visitante esperado',
        body: `${input.visitorName} visita ${input.hostName}${input.unitNumber ? ` (unid. ${input.unitNumber})` : ''}.`,
        category: NotificationCategory.Visitor,
        linkPath: `/condominiums/${condominiumId}/visitors`,
      })),
    );

    return VisitorPassPresenter.toResponse(pass);
  }
}

@Injectable()
export class ListVisitorPassesUseCase {
  constructor(private readonly passes: VisitorPassRepository) {}

  async execute(
    condominiumId: string,
    query: ListVisitorPassesQueryDto,
  ): Promise<VisitorPassResponseDto[]> {
    const list = await this.passes.list({
      condominiumId,
      status: query.status,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });

    return list.map((pass) => VisitorPassPresenter.toResponse(pass));
  }
}

@Injectable()
export class CheckInVisitorPassUseCase {
  constructor(private readonly passes: VisitorPassRepository) {}

  async execute(
    condominiumId: string,
    passId: string,
    checkedInByUserId: string,
  ): Promise<VisitorPassResponseDto> {
    const current = await this.passes.findById(passId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Passe de visitante não encontrado.');
    }

    const updated = await this.passes.save(current.checkIn({ userId: checkedInByUserId }));

    return VisitorPassPresenter.toResponse(updated);
  }

  async executeAsEmployee(
    condominiumId: string,
    passId: string,
    checkedInByEmployeeId: string,
  ): Promise<VisitorPassResponseDto> {
    const current = await this.passes.findById(passId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Passe de visitante não encontrado.');
    }

    const updated = await this.passes.save(current.checkIn({ employeeId: checkedInByEmployeeId }));

    return VisitorPassPresenter.toResponse(updated);
  }
}

@Injectable()
export class CancelVisitorPassUseCase {
  constructor(private readonly passes: VisitorPassRepository) {}

  async execute(condominiumId: string, passId: string): Promise<VisitorPassResponseDto> {
    const current = await this.passes.findById(passId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Passe de visitante não encontrado.');
    }

    const updated = await this.passes.save(current.cancel());

    return VisitorPassPresenter.toResponse(updated);
  }
}
