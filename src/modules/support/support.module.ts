import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailModule } from '../../shared/infrastructure/mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { PlatformAdminModule } from '../platform-admin/platform-admin.module';
import { CreateTicketUseCase } from './application/use-cases/create-ticket.use-case';
import { ListAllTicketsUseCase } from './application/use-cases/list-all-tickets.use-case';
import { ListMyTicketsUseCase } from './application/use-cases/list-my-tickets.use-case';
import { UpdateTicketStatusUseCase } from './application/use-cases/update-ticket-status.use-case';
import { SupportTicketRepository } from './domain/repositories/support-ticket.repository';
import { SupportTicketOrmEntity } from './infrastructure/persistence/typeorm/entities/support-ticket.orm-entity';
import { TypeormSupportTicketRepository } from './infrastructure/persistence/typeorm/typeorm-support-ticket.repository';
import { AdminSupportTicketsController } from './presentation/admin-support-tickets.controller';
import { SupportTicketsController } from './presentation/support-tickets.controller';

@Module({
  imports: [
    AuthModule,
    MailModule,
    PlatformAdminModule,
    TypeOrmModule.forFeature([SupportTicketOrmEntity]),
  ],
  controllers: [SupportTicketsController, AdminSupportTicketsController],
  providers: [
    { provide: SupportTicketRepository, useClass: TypeormSupportTicketRepository },
    CreateTicketUseCase,
    ListMyTicketsUseCase,
    ListAllTicketsUseCase,
    UpdateTicketStatusUseCase,
  ],
})
export class SupportModule {}
