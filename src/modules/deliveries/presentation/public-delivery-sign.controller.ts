import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { DeliverPackageDto } from '../application/dto/deliver-package.dto';
import {
  CompletePublicSigningResponseDto,
  PublicSigningSessionDto,
} from '../application/dto/public-signing-session.dto';
import { CompletePublicSigningUseCase } from '../application/use-cases/complete-public-signing.use-case';
import { GetPublicSigningSessionUseCase } from '../application/use-cases/get-public-signing-session.use-case';

/** Public, unauthenticated flow opened from a QR Code: sign a delivery from a phone. */
@ApiTags('Assinatura de entregas (público)')
@Controller('public/delivery-sign')
export class PublicDeliverySignController {
  constructor(
    private readonly getPublicSigningSession: GetPublicSigningSessionUseCase,
    private readonly completePublicSigning: CompletePublicSigningUseCase,
  ) {}

  @Public()
  @Get(':token')
  @ApiOperation({ summary: 'Consulta os dados da entrega associada a um link de assinatura' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicSigningSessionDto })
  getSession(@Param('token') token: string): Promise<PublicSigningSessionDto> {
    return this.getPublicSigningSession.execute(token);
  }

  @Public()
  @Post(':token')
  @ApiOperation({ summary: 'Confirma a retirada com a assinatura de quem recebeu' })
  @ApiResponse({ status: HttpStatus.OK, type: CompletePublicSigningResponseDto })
  complete(
    @Param('token') token: string,
    @Body() body: DeliverPackageDto,
  ): Promise<CompletePublicSigningResponseDto> {
    return this.completePublicSigning.execute(token, body);
  }
}
