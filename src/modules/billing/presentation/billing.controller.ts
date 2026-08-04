import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { Public } from '../../auth/infrastructure/http/public.decorator';
import { BillingRedirectDto, CreateCheckoutSessionDto } from '../application/dto/billing.dto';
import { CreateBillingPortalSessionUseCase } from '../application/use-cases/create-billing-portal-session.use-case';
import { CreateCheckoutSessionUseCase } from '../application/use-cases/create-checkout-session.use-case';
import { HandleStripeWebhookUseCase } from '../application/use-cases/handle-stripe-webhook.use-case';
import { BusinessRuleError } from '../../../shared/domain/domain-error';

@ApiTags('Assinatura / Stripe')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly createCheckout: CreateCheckoutSessionUseCase,
    private readonly createPortal: CreateBillingPortalSessionUseCase,
    private readonly handleWebhook: HandleStripeWebhookUseCase,
  ) {}

  @Post('checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inicia checkout Stripe para adesão ou troca de plano' })
  @ApiResponse({ status: 201, type: BillingRedirectDto })
  checkout(
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: CreateCheckoutSessionDto,
  ): Promise<BillingRedirectDto> {
    return this.createCheckout.execute(user, body.plan);
  }

  @Post('portal')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Abre o portal do cliente Stripe (cartão, cancelamento, troca)' })
  @ApiResponse({ status: 201, type: BillingRedirectDto })
  portal(@CurrentUser() user: AccessTokenPayload): Promise<BillingRedirectDto> {
    return this.createPortal.execute(user);
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook Stripe (raw body)' })
  async webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: true }> {
    if (!signature) {
      throw new BusinessRuleError('Cabeçalho stripe-signature ausente.');
    }

    const rawBody = request.rawBody;

    if (!rawBody) {
      throw new BusinessRuleError(
        'Corpo bruto do webhook indisponível. Habilite rawBody no bootstrap Nest.',
      );
    }

    await this.handleWebhook.execute(rawBody, signature);

    return { received: true };
  }
}
