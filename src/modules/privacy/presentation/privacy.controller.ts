import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { DataInventoryResponseDto } from '../application/dto/data-inventory-response.dto';
import { GetPlatformDataInventoryUseCase } from '../application/use-cases/get-platform-data-inventory.use-case';

@ApiTags('Privacidade (LGPD)')
@ApiBearerAuth()
@Controller('privacy')
export class PrivacyController {
  constructor(private readonly getInventory: GetPlatformDataInventoryUseCase) {}

  @Get('data-inventory')
  @ApiOperation({ summary: 'Inventário de dados pessoais da plataforma' })
  @ApiResponse({ status: 200, type: DataInventoryResponseDto })
  getDataInventory(@CurrentUser() user: AccessTokenPayload): Promise<DataInventoryResponseDto> {
    return this.getInventory.execute(user);
  }
}
