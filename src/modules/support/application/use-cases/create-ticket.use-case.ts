import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import { MailSender } from '../../../../shared/application/ports/mail-sender';
import type { AccessTokenPayload } from '../../../auth/application/ports/access-token-service';
import { SupportTicket } from '../../domain/entities/support-ticket';
import { SupportTicketRepository } from '../../domain/repositories/support-ticket.repository';
import type { CreateTicketDto } from '../dto/create-ticket.dto';
import type { SupportTicketResponseDto } from '../dto/support-ticket-response.dto';
import { buildNewTicketMail } from '../mail/new-ticket.mail';
import { SupportTicketPresenter } from '../presenters/support-ticket.presenter';

@Injectable()
export class CreateTicketUseCase {
  private readonly logger = new Logger(CreateTicketUseCase.name);

  constructor(
    private readonly tickets: SupportTicketRepository,
    private readonly mail: MailSender,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(
    actor: AccessTokenPayload,
    input: CreateTicketDto,
  ): Promise<SupportTicketResponseDto> {
    const ticket = await this.tickets.save(
      SupportTicket.create({
        userId: actor.sub,
        category: input.category,
        subject: input.subject,
        body: input.body,
        condominiumId: input.condominiumId,
      }),
    );

    const notifyTo = this.config.get('SUPPORT_NOTIFY_EMAIL', { infer: true });

    try {
      await this.mail.send(
        buildNewTicketMail({
          to: notifyTo,
          ticketId: ticket.id,
          category: ticket.toSnapshot().category,
          subject: ticket.toSnapshot().subject,
          body: ticket.toSnapshot().body,
          authorName: actor.name,
          authorEmail: actor.email,
        }),
      );
    } catch (error: unknown) {
      this.logger.error(
        `Chamado ${ticket.id} criado, mas o e-mail de aviso falhou`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return SupportTicketPresenter.toResponse(ticket, {
      name: actor.name,
      email: actor.email,
    });
  }
}
