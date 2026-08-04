import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import {
  ListNotificationsQueryDto,
  MarkAllReadResponseDto,
  NotificationResponseDto,
  UnreadCountResponseDto,
} from '../application/dto/notification.dto';
import {
  CountUnreadNotificationsUseCase,
  ListMyNotificationsUseCase,
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from '../application/use-cases/notification.use-case';

@ApiTags('Notificações')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listMine: ListMyNotificationsUseCase,
    private readonly markRead: MarkNotificationReadUseCase,
    private readonly markAllRead: MarkAllNotificationsReadUseCase,
    private readonly countUnread: CountUnreadNotificationsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista notificações do usuário autenticado' })
  @ApiResponse({ status: HttpStatus.OK, type: [NotificationResponseDto] })
  list(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<NotificationResponseDto[]> {
    return this.listMine.execute(user.sub, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Conta notificações não lidas' })
  @ApiResponse({ status: HttpStatus.OK, type: UnreadCountResponseDto })
  unreadCount(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<UnreadCountResponseDto> {
    return this.countUnread.execute(user.sub, query.condominiumId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationResponseDto })
  readOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    return this.markRead.execute(user.sub, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marca todas as notificações como lidas' })
  @ApiResponse({ status: HttpStatus.OK, type: MarkAllReadResponseDto })
  readAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<MarkAllReadResponseDto> {
    return this.markAllRead.execute(user.sub, query.condominiumId);
  }
}
