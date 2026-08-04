import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { HandleAsaasWebhookUseCase } from '../application/use-cases/handle-asaas-webhook.use-case';

@ApiTags('Webhooks')
@Controller('webhooks')
export class AsaasWebhookController {
  constructor(private readonly handleWebhook: HandleAsaasWebhookUseCase) {}

  @Public()
  @Post('asaas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Asaas para confirmação de pagamentos PIX' })
  handle(
    @Headers('asaas-access-token') accessToken: string | undefined,
    @Body() body: Record<string, unknown>,
  ): Promise<void> {
    return this.handleWebhook.execute(accessToken, body);
  }
}
